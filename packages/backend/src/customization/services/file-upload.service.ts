import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as path from "path";
import * as fs from "fs";
import * as sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { FileUpload } from "../../entities/file-upload.entity";
import { AuditLogService } from "./audit-log.service";
import { AuditAction } from "../../entities/audit-log.entity";

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface FileUploadResult {
  id: string;
  url: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly storageConfig: any;
  private readonly uploadDir: string;

  constructor(
    @InjectRepository(FileUpload)
    private readonly fileUploadRepository: Repository<FileUpload>,
    private readonly configService: ConfigService,
    private readonly auditLogService: AuditLogService,
  ) {
    this.storageConfig = this.configService.get("storage");
    this.uploadDir = this.storageConfig.local.uploadDir;

    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Upload a file and store metadata
   * @param file The uploaded file
   * @param organizationId Organization ID
   * @param uploadedBy User ID who uploaded the file
   * @param fileType Type of file being uploaded
   * @param metadata Additional metadata
   */
  async uploadFile(
    file: UploadedFile,
    organizationId: string,
    uploadedBy: string,
    fileType: "logo" | "favicon" | "image" | "document" | "other",
    metadata?: Record<string, any>,
  ): Promise<FileUploadResult> {
    try {
      // Validate file
      this.validateFile(file, fileType);

      // Generate unique filename
      const fileExtension = path.extname(file.originalname).toLowerCase();
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(this.uploadDir, organizationId);

      // Ensure organization directory exists
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }

      const fullPath = path.join(filePath, fileName);

      // Process and save file
      let processedBuffer = file.buffer;
      let imageMetadata = {};

      if (this.isImageFile(file.mimetype)) {
        const result = await this.processImage(file.buffer, fileType);
        processedBuffer = result.buffer;
        imageMetadata = result.metadata;
      }

      // Save file to disk
      fs.writeFileSync(fullPath, processedBuffer);

      // Create public URL
      const publicUrl = this.generatePublicUrl(organizationId, fileName);

      // Save file metadata to database
      const fileUpload = this.fileUploadRepository.create({
        organizationId,
        uploadedBy,
        originalName: file.originalname,
        fileName,
        mimeType: file.mimetype,
        fileSize: processedBuffer.length,
        fileType,
        filePath: fullPath,
        publicUrl,
        storageProvider: this.storageConfig.type,
        metadata: { ...metadata, ...imageMetadata },
      });

      const savedFile = await this.fileUploadRepository.save(fileUpload);

      // Log the upload
      await this.auditLogService.logSuccess({
        organizationId,
        userId: uploadedBy,
        userEmail: "system", // This should be passed from the request context
        action: AuditAction.FILE_UPLOAD,
        resource: "file",
        resourceId: savedFile.id,
        metadata: {
          fileName: file.originalname,
          fileType,
          fileSize: file.size,
          mimeType: file.mimetype,
        },
      });

      return {
        id: savedFile.id,
        url: publicUrl,
        originalName: file.originalname,
        fileName,
        mimeType: file.mimetype,
        fileSize: processedBuffer.length,
        metadata: savedFile.metadata,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.stack : 'Unknown error';
      this.logger.error("File upload failed", errorMessage);

      // Log the failure
      await this.auditLogService.logFailure({
        organizationId,
        userId: uploadedBy,
        userEmail: "system",
        action: AuditAction.FILE_UPLOAD,
        resource: "file",
        metadata: {
          fileName: file.originalname,
          fileType,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  /**
   * Delete a file
   * @param fileId File ID to delete
   * @param organizationId Organization ID
   * @param deletedBy User ID who deleted the file
   */
  async deleteFile(
    fileId: string,
    organizationId: string,
    deletedBy: string,
  ): Promise<void> {
    try {
      const fileUpload = await this.fileUploadRepository.findOne({
        where: { id: fileId, organizationId },
      });

      if (!fileUpload) {
        throw new BadRequestException("File not found");
      }

      // Delete physical file
      if (fs.existsSync(fileUpload.filePath)) {
        fs.unlinkSync(fileUpload.filePath);
      }

      // Soft delete from database
      fileUpload.isActive = false;
      await this.fileUploadRepository.save(fileUpload);

      // Log the deletion
      await this.auditLogService.logSuccess({
        organizationId,
        userId: deletedBy,
        userEmail: "system",
        action: AuditAction.FILE_DELETE,
        resource: "file",
        resourceId: fileId,
        metadata: {
          fileName: fileUpload.originalName,
          fileType: fileUpload.fileType,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.stack : 'Unknown error';
      this.logger.error("File deletion failed", errorMessage);
      throw error;
    }
  }

  /**
   * Get file by ID
   * @param fileId File ID
   * @param organizationId Organization ID
   */
  async getFile(
    fileId: string,
    organizationId: string,
  ): Promise<FileUpload | null> {
    return this.fileUploadRepository.findOne({
      where: { id: fileId, organizationId, isActive: true },
    });
  }

  /**
   * Get files for an organization
   * @param organizationId Organization ID
   * @param fileType Optional file type filter
   * @param limit Number of files to retrieve
   * @param offset Offset for pagination
   */
  async getOrganizationFiles(
    organizationId: string,
    fileType?: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ files: FileUpload[]; total: number }> {
    const queryBuilder = this.fileUploadRepository
      .createQueryBuilder("file")
      .where("file.organizationId = :organizationId", { organizationId })
      .andWhere("file.isActive = :isActive", { isActive: true })
      .orderBy("file.createdAt", "DESC")
      .skip(offset)
      .take(limit);

    if (fileType) {
      queryBuilder.andWhere("file.fileType = :fileType", { fileType });
    }

    const [files, total] = await queryBuilder.getManyAndCount();
    return { files, total };
  }

  private validateFile(file: UploadedFile, fileType: string): void {
    const maxSize = this.storageConfig.maxFileSize;
    const allowedMimeTypes = this.storageConfig.allowedMimeTypes;

    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum limit of ${maxSize} bytes`,
      );
    }

    if (fileType === "logo" || fileType === "favicon" || fileType === "image") {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `File type ${file.mimetype} is not allowed`,
        );
      }
    }
  }

  private isImageFile(mimeType: string): boolean {
    return mimeType.startsWith("image/");
  }

  private async processImage(
    buffer: Buffer,
    fileType: string,
  ): Promise<{ buffer: Buffer; metadata: Record<string, any> }> {
    try {
      let sharpInstance = sharp(buffer);
      const imageMetadata = await sharpInstance.metadata();

      // Resize based on file type
      switch (fileType) {
        case "logo":
          sharpInstance = sharpInstance.resize(400, 200, {
            fit: "inside",
            withoutEnlargement: true,
          });
          break;
        case "favicon":
          sharpInstance = sharpInstance.resize(32, 32, {
            fit: "cover",
          });
          break;
        case "image":
          if (imageMetadata.width && imageMetadata.width > 1200) {
            sharpInstance = sharpInstance.resize(1200, undefined, {
              withoutEnlargement: true,
            });
          }
          break;
      }

      // Optimize image
      const processedBuffer = await sharpInstance
        .jpeg({ quality: 85, progressive: true })
        .png({ compressionLevel: 8 })
        .webp({ quality: 85 })
        .toBuffer();

      return {
        buffer: processedBuffer,
        metadata: {
          width: imageMetadata.width,
          height: imageMetadata.height,
          format: imageMetadata.format,
          channels: imageMetadata.channels,
          density: imageMetadata.density,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.stack : 'Unknown error';
      this.logger.error("Image processing failed", errorMessage);
      // Return original buffer if processing fails
      return { buffer, metadata: {} };
    }
  }

  private generatePublicUrl(organizationId: string, fileName: string): string {
    const baseUrl = this.storageConfig.local.baseUrl;
    return `${baseUrl}/uploads/${organizationId}/${fileName}`;
  }
}

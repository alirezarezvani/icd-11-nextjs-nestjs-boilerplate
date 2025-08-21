import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import * as multer from 'multer';
import * as path from 'path';

// Entities
import {
  Organization,
  OrganizationBranding,
  OrganizationUser,
  AuditLog,
  FileUpload,
} from '../entities';

// Services
import { EncryptionService } from './services/encryption.service';
import { AuditLogService } from './services/audit-log.service';
import { FileUploadService } from './services/file-upload.service';
import { OrganizationBrandingService } from './services/organization-branding.service';
import { OrganizationService } from './services/organization.service';

// Controllers
import { BrandingController } from './controllers/branding.controller';
import { OrganizationController } from './controllers/organization.controller';

@Module({
  imports: [
    // TypeORM entities
    TypeOrmModule.forFeature([
      Organization,
      OrganizationBranding,
      OrganizationUser,
      AuditLog,
      FileUpload,
    ]),
    
    // Multer for file uploads
    MulterModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const storageConfig = configService.get('storage');
        
        return {
          storage: multer.memoryStorage(),
          limits: {
            fileSize: storageConfig.maxFileSize,
            files: 1,
          },
          fileFilter: (req, file, cb) => {
            // Basic file type validation
            const allowedMimeTypes = storageConfig.allowedMimeTypes;
            if (allowedMimeTypes.includes(file.mimetype)) {
              cb(null, true);
            } else {
              cb(new Error(`File type ${file.mimetype} is not allowed`), false);
            }
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [
    BrandingController,
    OrganizationController,
  ],
  providers: [
    EncryptionService,
    AuditLogService,
    FileUploadService,
    OrganizationBrandingService,
    OrganizationService,
  ],
  exports: [
    EncryptionService,
    AuditLogService,
    FileUploadService,
    OrganizationBrandingService,
    OrganizationService,
  ],
})
export class CustomizationModule {}
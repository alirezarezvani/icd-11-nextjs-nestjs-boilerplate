import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('file_uploads')
@Index(['organizationId', 'createdAt'])
@Index(['fileType', 'createdAt'])
export class FileUpload {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid', nullable: true })
  uploadedBy: string;

  @Column({ type: 'varchar', length: 255 })
  originalName: string;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column({ type: 'varchar', length: 50 })
  fileType: 'logo' | 'favicon' | 'image' | 'document' | 'other';

  @Column({ type: 'text' })
  filePath: string;

  @Column({ type: 'text', nullable: true })
  publicUrl: string;

  @Column({ type: 'varchar', length: 100, default: 'local' })
  storageProvider: 'local' | 'aws-s3' | 'gcp-storage' | 'azure-blob';

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    width?: number;
    height?: number;
    altText?: string;
    description?: string;
    tags?: string[];
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
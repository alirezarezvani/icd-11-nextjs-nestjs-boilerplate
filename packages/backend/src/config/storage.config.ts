import { registerAs } from "@nestjs/config";

export default registerAs("storage", () => ({
  type: process.env.STORAGE_TYPE || "local", // 'local', 'aws-s3', 'gcp-storage', 'azure-blob'
  local: {
    uploadDir: process.env.UPLOAD_DIR || "./uploads",
    baseUrl: process.env.BASE_URL || "http://localhost:3003",
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "us-east-1",
    bucket: process.env.AWS_S3_BUCKET,
  },
  gcp: {
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    bucket: process.env.GCP_STORAGE_BUCKET,
  },
  azure: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    containerName: process.env.AZURE_CONTAINER_NAME,
  },
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB default
  allowedMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/svg+xml",
    "image/webp",
  ],
}));

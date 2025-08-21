import { registerAs } from "@nestjs/config";

export default registerAs("encryption", () => ({
  key:
    process.env.ENCRYPTION_KEY ||
    "default-key-for-development-only-change-in-production",
  algorithm: "aes-256-gcm" as const,
  ivLength: 12,
  tagLength: 16,
  saltLength: 32,
}));

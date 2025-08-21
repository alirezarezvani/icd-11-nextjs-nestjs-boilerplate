import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsObject,
  ValidateNested,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class OrganizationFeaturesDto {
  @ApiProperty({ description: "Custom branding feature enabled" })
  @IsBoolean()
  customBranding: boolean;

  @ApiProperty({ description: "White label feature enabled" })
  @IsBoolean()
  whiteLabel: boolean;

  @ApiProperty({ description: "API access feature enabled" })
  @IsBoolean()
  apiAccess: boolean;

  @ApiProperty({ description: "Audit logs feature enabled" })
  @IsBoolean()
  auditLogs: boolean;

  @ApiProperty({ description: "SSO integration feature enabled" })
  @IsBoolean()
  ssoIntegration: boolean;

  @ApiProperty({ description: "Custom domain feature enabled" })
  @IsBoolean()
  customDomain: boolean;
}

export class CreateOrganizationDto {
  @ApiProperty({ description: "Organization name" })
  @IsString()
  name: string;

  @ApiProperty({ description: "Organization slug (unique identifier)" })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: "Organization domain" })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({ description: "Organization description" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "Organization plan",
    enum: ["basic", "professional", "enterprise"],
    default: "basic",
  })
  @IsOptional()
  @IsEnum(["basic", "professional", "enterprise"])
  plan?: "basic" | "professional" | "enterprise";

  @ApiPropertyOptional({ description: "Contact email" })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ description: "Contact phone" })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ description: "Organization address" })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: "Organization settings" })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @ApiPropertyOptional({ type: OrganizationFeaturesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => OrganizationFeaturesDto)
  features?: OrganizationFeaturesDto;
}

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ description: "Organization name" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: "Organization slug (unique identifier)" })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: "Organization domain" })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({ description: "Organization description" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "Organization status",
    enum: ["active", "inactive", "suspended"],
  })
  @IsOptional()
  @IsEnum(["active", "inactive", "suspended"])
  status?: "active" | "inactive" | "suspended";

  @ApiPropertyOptional({
    description: "Organization plan",
    enum: ["basic", "professional", "enterprise"],
  })
  @IsOptional()
  @IsEnum(["basic", "professional", "enterprise"])
  plan?: "basic" | "professional" | "enterprise";

  @ApiPropertyOptional({ description: "Contact email" })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ description: "Contact phone" })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ description: "Organization address" })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: "Organization settings" })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @ApiPropertyOptional({ type: OrganizationFeaturesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => OrganizationFeaturesDto)
  features?: OrganizationFeaturesDto;
}

export class UserPermissionsDto {
  @ApiProperty({ description: "Can manage users" })
  @IsBoolean()
  manageUsers: boolean;

  @ApiProperty({ description: "Can manage branding" })
  @IsBoolean()
  manageBranding: boolean;

  @ApiProperty({ description: "Can manage settings" })
  @IsBoolean()
  manageSettings: boolean;

  @ApiProperty({ description: "Can view audit logs" })
  @IsBoolean()
  viewAuditLogs: boolean;

  @ApiProperty({ description: "Can export data" })
  @IsBoolean()
  exportData: boolean;
}

export class CreateOrganizationUserDto {
  @ApiProperty({ description: "User email" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "First name" })
  @IsString()
  firstName: string;

  @ApiProperty({ description: "Last name" })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({
    description: "User role",
    enum: ["admin", "editor", "viewer"],
    default: "viewer",
  })
  @IsOptional()
  @IsEnum(["admin", "editor", "viewer"])
  role?: "admin" | "editor" | "viewer";

  @ApiPropertyOptional({ type: UserPermissionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserPermissionsDto)
  permissions?: UserPermissionsDto;
}

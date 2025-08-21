import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Organization } from "../../entities/organization.entity";
import { OrganizationUser } from "../../entities/organization-user.entity";
import { AuditLogService } from "./audit-log.service";

export interface CreateOrganizationDto {
  name: string;
  slug: string;
  domain?: string;
  description?: string;
  plan?: "basic" | "professional" | "enterprise";
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  settings?: Record<string, any>;
  features?: {
    customBranding: boolean;
    whiteLabel: boolean;
    apiAccess: boolean;
    auditLogs: boolean;
    ssoIntegration: boolean;
    customDomain: boolean;
  };
}

export interface UpdateOrganizationDto extends Partial<CreateOrganizationDto> {
  status?: "active" | "inactive" | "suspended";
}

export interface CreateOrganizationUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role?: "admin" | "editor" | "viewer";
  permissions?: {
    manageUsers: boolean;
    manageBranding: boolean;
    manageSettings: boolean;
    viewAuditLogs: boolean;
    exportData: boolean;
  };
}

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(OrganizationUser)
    private readonly organizationUserRepository: Repository<OrganizationUser>,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Create a new organization
   * @param organizationData Organization data
   * @param createdBy User ID who created the organization
   * @param userEmail User email
   */
  async createOrganization(
    organizationData: CreateOrganizationDto,
    createdBy: string,
    userEmail: string,
  ): Promise<Organization> {
    try {
      // Check if slug or domain already exists
      const existingOrg = await this.organizationRepository.findOne({
        where: [
          { slug: organizationData.slug },
          ...(organizationData.domain
            ? [{ domain: organizationData.domain }]
            : []),
        ],
      });

      if (existingOrg) {
        if (existingOrg.slug === organizationData.slug) {
          throw new ConflictException("Organization slug already exists");
        }
        if (existingOrg.domain === organizationData.domain) {
          throw new ConflictException("Organization domain already exists");
        }
      }

      // Set default features based on plan
      const defaultFeatures = this.getDefaultFeatures(
        organizationData.plan || "basic",
      );
      const features = { ...defaultFeatures, ...organizationData.features };

      // Create organization
      const organization = this.organizationRepository.create({
        ...organizationData,
        features,
        status: "active",
      });

      const savedOrganization =
        await this.organizationRepository.save(organization);

      // Log the creation
      await this.auditLogService.logSuccess({
        organizationId: savedOrganization.id,
        userId: createdBy,
        userEmail,
        action: "create_organization",
        resource: "organization",
        resourceId: savedOrganization.id,
        metadata: {
          name: savedOrganization.name,
          slug: savedOrganization.slug,
          plan: savedOrganization.plan,
          features,
        },
      });

      return savedOrganization;
    } catch (error) {
      this.logger.error("Failed to create organization", error.stack);
      throw error;
    }
  }

  /**
   * Get organization by ID
   * @param organizationId Organization ID
   */
  async getOrganizationById(organizationId: string): Promise<Organization> {
    try {
      const organization = await this.organizationRepository.findOne({
        where: { id: organizationId, deletedAt: null },
        relations: ["branding", "users"],
      });

      if (!organization) {
        throw new NotFoundException("Organization not found");
      }

      return organization;
    } catch (error) {
      this.logger.error("Failed to get organization by ID", error.stack);
      throw error;
    }
  }

  /**
   * Get organization by slug
   * @param slug Organization slug
   */
  async getOrganizationBySlug(slug: string): Promise<Organization> {
    try {
      const organization = await this.organizationRepository.findOne({
        where: { slug, status: "active", deletedAt: null },
        relations: ["branding"],
      });

      if (!organization) {
        throw new NotFoundException("Organization not found");
      }

      return organization;
    } catch (error) {
      this.logger.error("Failed to get organization by slug", error.stack);
      throw error;
    }
  }

  /**
   * Get organization by domain
   * @param domain Organization domain
   */
  async getOrganizationByDomain(domain: string): Promise<Organization> {
    try {
      const organization = await this.organizationRepository.findOne({
        where: { domain, status: "active", deletedAt: null },
        relations: ["branding"],
      });

      if (!organization) {
        throw new NotFoundException("Organization not found");
      }

      return organization;
    } catch (error) {
      this.logger.error("Failed to get organization by domain", error.stack);
      throw error;
    }
  }

  /**
   * Update organization
   * @param organizationId Organization ID
   * @param updateData Update data
   * @param updatedBy User ID who updated the organization
   * @param userEmail User email
   */
  async updateOrganization(
    organizationId: string,
    updateData: UpdateOrganizationDto,
    updatedBy: string,
    userEmail: string,
  ): Promise<Organization> {
    try {
      const organization = await this.getOrganizationById(organizationId);
      const oldValues = { ...organization };

      // Check if slug or domain conflicts exist
      if (updateData.slug || updateData.domain) {
        const existingOrg = await this.organizationRepository.findOne({
          where: [
            ...(updateData.slug ? [{ slug: updateData.slug }] : []),
            ...(updateData.domain ? [{ domain: updateData.domain }] : []),
          ],
        });

        if (existingOrg && existingOrg.id !== organizationId) {
          if (existingOrg.slug === updateData.slug) {
            throw new ConflictException("Organization slug already exists");
          }
          if (existingOrg.domain === updateData.domain) {
            throw new ConflictException("Organization domain already exists");
          }
        }
      }

      // Update organization
      Object.assign(organization, updateData);
      const savedOrganization =
        await this.organizationRepository.save(organization);

      // Log the update
      await this.auditLogService.logSuccess({
        organizationId,
        userId: updatedBy,
        userEmail,
        action: "update_organization",
        resource: "organization",
        resourceId: organizationId,
        changes: {
          before: {
            name: oldValues.name,
            slug: oldValues.slug,
            domain: oldValues.domain,
            plan: oldValues.plan,
            status: oldValues.status,
            features: oldValues.features,
          },
          after: {
            name: savedOrganization.name,
            slug: savedOrganization.slug,
            domain: savedOrganization.domain,
            plan: savedOrganization.plan,
            status: savedOrganization.status,
            features: savedOrganization.features,
          },
        },
      });

      return savedOrganization;
    } catch (error) {
      this.logger.error("Failed to update organization", error.stack);
      throw error;
    }
  }

  /**
   * Add user to organization
   * @param organizationId Organization ID
   * @param userData User data
   * @param invitedBy User ID who invited the user
   * @param userEmail User email
   */
  async addUser(
    organizationId: string,
    userData: CreateOrganizationUserDto,
    invitedBy: string,
    userEmail: string,
  ): Promise<OrganizationUser> {
    try {
      // Verify organization exists
      await this.getOrganizationById(organizationId);

      // Check if user already exists in organization
      const existingUser = await this.organizationUserRepository.findOne({
        where: { organizationId, email: userData.email },
      });

      if (existingUser) {
        throw new ConflictException("User already exists in organization");
      }

      // Set default permissions based on role
      const defaultPermissions = this.getDefaultPermissions(
        userData.role || "viewer",
      );
      const permissions = { ...defaultPermissions, ...userData.permissions };

      // Create user
      const organizationUser = this.organizationUserRepository.create({
        organizationId,
        ...userData,
        permissions,
        invitedBy,
        invitedAt: new Date(),
        status: "pending",
      });

      const savedUser =
        await this.organizationUserRepository.save(organizationUser);

      // Log the user addition
      await this.auditLogService.logSuccess({
        organizationId,
        userId: invitedBy,
        userEmail,
        action: "add_user",
        resource: "organization_user",
        resourceId: savedUser.id,
        metadata: {
          invitedUserEmail: userData.email,
          role: userData.role,
          permissions,
        },
      });

      return savedUser;
    } catch (error) {
      this.logger.error("Failed to add user to organization", error.stack);
      throw error;
    }
  }

  /**
   * Get organization users
   * @param organizationId Organization ID
   * @param status Optional status filter
   */
  async getOrganizationUsers(
    organizationId: string,
    status?: "active" | "inactive" | "pending",
  ): Promise<OrganizationUser[]> {
    try {
      const where: any = { organizationId };
      if (status) {
        where.status = status;
      }

      return this.organizationUserRepository.find({
        where,
        order: { createdAt: "ASC" },
      });
    } catch (error) {
      this.logger.error("Failed to get organization users", error.stack);
      throw error;
    }
  }

  /**
   * Update organization plan and features
   * @param organizationId Organization ID
   * @param plan New plan
   * @param updatedBy User ID who updated the plan
   * @param userEmail User email
   */
  async updatePlan(
    organizationId: string,
    plan: "basic" | "professional" | "enterprise",
    updatedBy: string,
    userEmail: string,
  ): Promise<Organization> {
    try {
      const organization = await this.getOrganizationById(organizationId);
      const oldPlan = organization.plan;
      const oldFeatures = organization.features;

      // Update plan and features
      organization.plan = plan;
      organization.features = {
        ...organization.features,
        ...this.getDefaultFeatures(plan),
      };

      const savedOrganization =
        await this.organizationRepository.save(organization);

      // Log the plan update
      await this.auditLogService.logSuccess({
        organizationId,
        userId: updatedBy,
        userEmail,
        action: "update_plan",
        resource: "organization",
        resourceId: organizationId,
        changes: {
          before: { plan: oldPlan, features: oldFeatures },
          after: { plan, features: savedOrganization.features },
        },
      });

      return savedOrganization;
    } catch (error) {
      this.logger.error("Failed to update organization plan", error.stack);
      throw error;
    }
  }

  private getDefaultFeatures(plan: string) {
    const features = {
      customBranding: false,
      whiteLabel: false,
      apiAccess: false,
      auditLogs: false,
      ssoIntegration: false,
      customDomain: false,
    };

    switch (plan) {
      case "professional":
        features.customBranding = true;
        features.apiAccess = true;
        features.auditLogs = true;
        break;
      case "enterprise":
        features.customBranding = true;
        features.whiteLabel = true;
        features.apiAccess = true;
        features.auditLogs = true;
        features.ssoIntegration = true;
        features.customDomain = true;
        break;
    }

    return features;
  }

  private getDefaultPermissions(role: string) {
    const permissions = {
      manageUsers: false,
      manageBranding: false,
      manageSettings: false,
      viewAuditLogs: false,
      exportData: false,
    };

    switch (role) {
      case "admin":
        permissions.manageUsers = true;
        permissions.manageBranding = true;
        permissions.manageSettings = true;
        permissions.viewAuditLogs = true;
        permissions.exportData = true;
        break;
      case "editor":
        permissions.manageBranding = true;
        permissions.exportData = true;
        break;
    }

    return permissions;
  }
}

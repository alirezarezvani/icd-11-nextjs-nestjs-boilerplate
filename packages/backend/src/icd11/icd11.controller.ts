import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { ICD11Service } from "./icd11.service";
import { SearchDto } from "./dto/search.dto";
import { ApiSuccessResponse, PaginatedResponse } from "@shared/types/api";
import {
  ICD11Entity,
  ICD11SearchResult,
  ICD11EntityDetails,
  ICD11NavigationContext,
  ICD11BreadcrumbItem,
} from "@shared/types/icd11";

@ApiTags("icd11")
@Controller("icd11")
export class ICD11Controller {
  constructor(private readonly icd11Service: ICD11Service) {}

  @Post("search")
  @ApiOperation({ summary: "Search ICD-11 entities" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Search results",
    type: Object,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid search parameters",
    type: Object,
  })
  async search(
    @Body() searchDto: SearchDto,
  ): Promise<ApiSuccessResponse<PaginatedResponse<ICD11SearchResult>>> {
    const {
      term,
      language,
      page = 1,
      limit = 20,
      flexisearch = true,
    } = searchDto;
    const results = await this.icd11Service.search(
      term,
      language || "en",
      page,
      limit,
      flexisearch,
    );

    return {
      statusCode: HttpStatus.OK,
      data: results,
    };
  }

  @Get("entity/:id")
  @ApiOperation({ summary: "Get ICD-11 entity by ID" })
  @ApiParam({ name: "id", description: "Entity ID" })
  @ApiQuery({
    name: "language",
    description: "Language code",
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Entity details",
    type: Object,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Entity not found",
    type: Object,
  })
  async getEntity(
    @Param("id") id: string,
    @Query("language") language?: string,
  ): Promise<ApiSuccessResponse<ICD11Entity>> {
    const entity = await this.icd11Service.getEntityById(id, language);

    return {
      statusCode: HttpStatus.OK,
      data: entity,
    };
  }

  @Get("entity/:id/children")
  @ApiOperation({ summary: "Get children of ICD-11 entity" })
  @ApiParam({ name: "id", description: "Entity ID" })
  @ApiQuery({
    name: "language",
    description: "Language code",
    required: false,
  })
  @ApiQuery({
    name: "page",
    description: "Page number",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "limit",
    description: "Results per page",
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Child entities",
    type: Object,
  })
  async getChildren(
    @Param("id") id: string,
    @Query("language") language?: string,
    @Query("page") page = 1,
    @Query("limit") limit = 20,
  ): Promise<ApiSuccessResponse<PaginatedResponse<ICD11Entity>>> {
    const children = await this.icd11Service.getChildren(
      id,
      language,
      page,
      limit,
    );

    return {
      statusCode: HttpStatus.OK,
      data: children,
    };
  }

  @Get("entity/:id/parent")
  @ApiOperation({ summary: "Get parent of ICD-11 entity" })
  @ApiParam({ name: "id", description: "Entity ID" })
  @ApiQuery({
    name: "language",
    description: "Language code",
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Parent entity",
    type: Object,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Parent not found",
    type: Object,
  })
  async getParent(
    @Param("id") id: string,
    @Query("language") language?: string,
  ): Promise<ApiSuccessResponse<ICD11Entity>> {
    const parent = await this.icd11Service.getParent(id, language);

    return {
      statusCode: HttpStatus.OK,
      data: parent,
    };
  }

  @Get("entity/:id/ancestors")
  @ApiOperation({ summary: "Get ancestors of ICD-11 entity" })
  @ApiParam({ name: "id", description: "Entity ID" })
  @ApiQuery({
    name: "language",
    description: "Language code",
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Ancestor entities",
    type: Object,
  })
  async getAncestors(
    @Param("id") id: string,
    @Query("language") language?: string,
  ): Promise<ApiSuccessResponse<ICD11Entity[]>> {
    const ancestors = await this.icd11Service.getAncestors(id, language);

    return {
      statusCode: HttpStatus.OK,
      data: ancestors,
    };
  }

  @Get("entity/:id/breadcrumbs")
  @ApiOperation({ summary: "Get breadcrumbs for ICD-11 entity" })
  @ApiParam({ name: "id", description: "Entity ID" })
  @ApiQuery({
    name: "language",
    description: "Language code",
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Breadcrumb items",
    type: Object,
  })
  async getBreadcrumbs(
    @Param("id") id: string,
    @Query("language") language?: string,
  ): Promise<ApiSuccessResponse<ICD11BreadcrumbItem[]>> {
    const breadcrumbs = await this.icd11Service.getBreadcrumbs(id, language);

    return {
      statusCode: HttpStatus.OK,
      data: breadcrumbs,
    };
  }

  @Get("entity/:id/navigation")
  @ApiOperation({ summary: "Get navigation context for ICD-11 entity" })
  @ApiParam({ name: "id", description: "Entity ID" })
  @ApiQuery({
    name: "language",
    description: "Language code",
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Navigation context",
    type: Object,
  })
  async getNavigationContext(
    @Param("id") id: string,
    @Query("language") language?: string,
  ): Promise<ApiSuccessResponse<ICD11NavigationContext>> {
    const context = await this.icd11Service.getNavigationContext(id, language);

    return {
      statusCode: HttpStatus.OK,
      data: context,
    };
  }

  @Get("entity/:id/details")
  @ApiOperation({ summary: "Get detailed information for ICD-11 entity" })
  @ApiParam({ name: "id", description: "Entity ID" })
  @ApiQuery({
    name: "language",
    description: "Language code",
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Entity details",
    type: Object,
  })
  async getEntityDetails(
    @Param("id") id: string,
    @Query("language") language?: string,
  ): Promise<ApiSuccessResponse<ICD11EntityDetails>> {
    const details = await this.icd11Service.getEntityDetails(id, language);

    return {
      statusCode: HttpStatus.OK,
      data: details,
    };
  }
}

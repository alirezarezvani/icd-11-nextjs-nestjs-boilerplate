# API Reference Documentation

This comprehensive API reference covers all endpoints, data structures, and integration patterns for the ICD-11 Healthcare Boilerplate Platform. The API provides seamless access to WHO ICD-11 data with enterprise-grade caching, validation, and error handling.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URLs and Versioning](#base-urls-and-versioning)
4. [Core Endpoints](#core-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Caching Strategy](#caching-strategy)
9. [Code Examples](#code-examples)
10. [SDKs and Libraries](#sdks-and-libraries)

## Overview

The ICD-11 Healthcare API is a RESTful service that provides access to the World Health Organization's ICD-11 medical classification system. Built on NestJS with TypeScript, it offers:

- **Complete ICD-11 Access**: Full integration with WHO ICD-11 API
- **Enterprise Authentication**: JWT-based authentication with role-based access control
- **High Performance**: Redis-based caching with intelligent TTL strategies
- **Type Safety**: Full TypeScript definitions for all data structures
- **Enterprise Ready**: Comprehensive error handling, logging, and monitoring
- **Healthcare Compliant**: HIPAA-compliant audit trails and security features

### API Features

- 🔍 **Advanced Search**: Flexible search with filters, pagination, and sorting
- 🌳 **Hierarchical Navigation**: Browse ICD-11 structure and relationships
- 📋 **Entity Details**: Complete entity information with definitions and metadata
- 🔐 **Authentication**: JWT-based authentication with role-based access control
- 👥 **User Management**: Complete user registration, login, and profile management
- ⚡ **Performance Optimized**: Sub-200ms response times with caching
- 🔒 **Secure**: Input validation, rate limiting, account security, and audit logging
- 📊 **Observable**: Health checks, metrics, and comprehensive logging

## Authentication

The ICD-11 Healthcare API includes a comprehensive JWT-based authentication system with role-based access control. While ICD-11 search endpoints remain publicly accessible, administrative features require authentication.

### Authentication Methods

#### JWT Bearer Token
```http
Authorization: Bearer <access_token>
```

#### Authentication Flow
1. **Register/Login**: Obtain access and refresh tokens
2. **API Requests**: Include access token in Authorization header
3. **Token Refresh**: Use refresh token when access token expires
4. **Logout**: Invalidate tokens server-side

### Public vs Protected Endpoints

#### Public Endpoints (No Authentication Required)
- All ICD-11 search and entity endpoints
- Health check and API information
- WHO ICD-11 data access

#### Protected Endpoints (Authentication Required)
- User profile and management
- Administrative functions
- Audit logs and metrics
- Organization management

### Role-Based Access Control

#### User Roles
```typescript
enum UserRole {
  USER = 'USER',                           // Basic user access
  HEALTHCARE_PROVIDER = 'HEALTHCARE_PROVIDER', // Healthcare professional
  ORG_ADMIN = 'ORG_ADMIN',                // Organization administrator  
  SUPER_ADMIN = 'SUPER_ADMIN'             // Platform administrator
}
```

#### Permission Matrix
| Endpoint Type | USER | HEALTHCARE_PROVIDER | ORG_ADMIN | SUPER_ADMIN |
|---------------|------|-------------------|-----------|-------------|
| ICD-11 Search | ✅ | ✅ | ✅ | ✅ |
| User Profile | ✅ | ✅ | ✅ | ✅ |
| User Management | ❌ | ❌ | ✅ | ✅ |
| Audit Logs | ❌ | ❌ | ✅ | ✅ |
| System Metrics | ❌ | ❌ | ❌ | ✅ |

### Security Features

- **Password Security**: bcrypt hashing with configurable rounds
- **Token Expiration**: Access tokens (15 minutes), refresh tokens (7 days)
- **Account Lockout**: 5 failed attempts = 30-minute lockout
- **Audit Logging**: HIPAA-compliant trails for all authentication events
- **Session Management**: Single device logout or logout from all devices

## Base URLs and Versioning

### Base URLs
```
Development:  http://localhost:3003/api
Production:   https://yourdomain.com/api
```

### API Versioning
```
Current Version: v1
Base Path: /api/v1
```

### Interactive Documentation
```
Development:  http://localhost:3003/api/docs
Production:   https://yourdomain.com/api/docs
```

## Core Endpoints

### Authentication Endpoints

#### Register User

Register a new user account with role assignment.

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Login User

Authenticate user and receive access/refresh tokens.

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "rememberMe": true
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

#### Refresh Token

Get new access token using refresh token.

```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

#### Logout User

Logout from current device.

```http
POST /api/auth/logout
```

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### Logout All Devices

Logout from all devices by invalidating all refresh tokens.

```http
POST /api/auth/logout-all
```

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Logged out from all devices successfully"
}
```

#### Get User Profile

Get current user profile and permissions.

```http
GET /api/auth/profile
```

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER",
  "isActive": true,
  "lastLoginAt": "2024-01-15T10:30:00Z",
  "createdAt": "2024-01-15T09:00:00Z",
  "permissions": ["read:profile", "update:profile"]
}
```

#### Validate Token

Validate current access token.

```http
POST /api/auth/validate
```

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "role": "USER"
  },
  "expiresIn": 750
}
```

### Search Endpoints

#### Search ICD-11 Entities

Search for ICD-11 entities using text queries with advanced filtering options.

```http
GET /api/icd11/search
```

**Parameters:**

| Parameter | Type | Required | Description | Default | Example |
|-----------|------|----------|-------------|---------|---------|
| `q` | string | Yes | Search query | - | `diabetes` |
| `limit` | number | No | Number of results | 10 | `20` |
| `offset` | number | No | Results offset | 0 | `10` |
| `includeDefinitions` | boolean | No | Include entity definitions | false | `true` |
| `language` | string | No | Language code | en | `es` |
| `chapter` | string | No | ICD-11 chapter filter | - | `04` |

**Example Request:**
```bash
curl -X GET "http://localhost:3003/api/icd11/search?q=diabetes&limit=5&includeDefinitions=true" \
  -H "Accept: application/json"
```

**Example Response:**
```json
{
  "results": [
    {
      "id": "142052508",
      "uri": "http://id.who.int/icd/entity/142052508",
      "title": "Diabetes mellitus",
      "code": "E10-E14",
      "definition": "A group of metabolic disorders characterized by hyperglycemia resulting from defects in insulin secretion, insulin action, or both.",
      "chapter": "04",
      "chapterTitle": "Endocrine, nutritional or metabolic diseases",
      "isLeaf": false,
      "hasChildren": true,
      "parents": ["455013390"],
      "score": 0.95
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 5,
    "offset": 0,
    "hasNext": false,
    "hasPrevious": false
  },
  "metadata": {
    "query": "diabetes",
    "searchTime": 45,
    "cached": false,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### Search Autocomplete

Get search suggestions for partial queries.

```http
GET /api/icd11/autocomplete
```

**Parameters:**

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `q` | string | Yes | Partial search query | - |
| `limit` | number | No | Number of suggestions | 5 |

**Example Request:**
```bash
curl -X GET "http://localhost:3003/api/icd11/autocomplete?q=diab&limit=10"
```

**Example Response:**
```json
{
  "suggestions": [
    {
      "text": "diabetes",
      "count": 25,
      "category": "endocrine"
    },
    {
      "text": "diabetic",
      "count": 18,
      "category": "complications"
    },
    {
      "text": "diabetic nephropathy",
      "count": 8,
      "category": "complications"
    }
  ]
}
```

### Entity Endpoints

#### Get Entity Details

Retrieve complete information for a specific ICD-11 entity.

```http
GET /api/icd11/entity/{id}
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Entity ID |

**Query Parameters:**

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `includeChildren` | boolean | No | Include child entities | false |
| `includeParents` | boolean | No | Include parent entities | false |
| `language` | string | No | Language code | en |

**Example Request:**
```bash
curl -X GET "http://localhost:3003/api/icd11/entity/142052508?includeChildren=true" \
  -H "Accept: application/json"
```

**Example Response:**
```json
{
  "id": "142052508",
  "uri": "http://id.who.int/icd/entity/142052508",
  "title": "Diabetes mellitus",
  "code": "E10-E14",
  "definition": "A group of metabolic disorders characterized by hyperglycemia resulting from defects in insulin secretion, insulin action, or both.",
  "longDefinition": "Diabetes mellitus is a group of metabolic disorders characterized by hyperglycemia resulting from defects in insulin secretion, insulin action, or both. The chronic hyperglycemia of diabetes is associated with long-term damage, dysfunction, and failure of different organs, especially the eyes, kidneys, nerves, heart, and blood vessels.",
  "synonyms": [
    "Diabetes",
    "DM"
  ],
  "inclusions": [
    "Type 1 diabetes mellitus",
    "Type 2 diabetes mellitus",
    "Gestational diabetes"
  ],
  "exclusions": [
    "Diabetes insipidus",
    "Neonatal diabetes mellitus"
  ],
  "chapter": "04",
  "chapterTitle": "Endocrine, nutritional or metabolic diseases",
  "parents": [
    {
      "id": "455013390",
      "title": "Endocrine, nutritional or metabolic diseases",
      "code": "04"
    }
  ],
  "children": [
    {
      "id": "826510848",
      "title": "Type 1 diabetes mellitus",
      "code": "E10",
      "isLeaf": false
    },
    {
      "id": "481951975",
      "title": "Type 2 diabetes mellitus",
      "code": "E11",
      "isLeaf": false
    }
  ],
  "isLeaf": false,
  "hasChildren": true,
  "breadcrumbs": [
    {
      "id": "root",
      "title": "ICD-11 for Mortality and Morbidity Statistics",
      "level": 0
    },
    {
      "id": "455013390",
      "title": "Endocrine, nutritional or metabolic diseases",
      "level": 1
    },
    {
      "id": "142052508",
      "title": "Diabetes mellitus",
      "level": 2
    }
  ],
  "metadata": {
    "lastModified": "2023-12-01T00:00:00Z",
    "version": "2023-01",
    "language": "en"
  }
}
```

#### Get Entity Children

Retrieve child entities for a specific ICD-11 entity.

```http
GET /api/icd11/entity/{id}/children
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Parent entity ID |

**Query Parameters:**

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `limit` | number | No | Number of children | 50 |
| `offset` | number | No | Children offset | 0 |

**Example Request:**
```bash
curl -X GET "http://localhost:3003/api/icd11/entity/142052508/children"
```

**Example Response:**
```json
{
  "children": [
    {
      "id": "826510848",
      "title": "Type 1 diabetes mellitus",
      "code": "E10",
      "definition": "A form of diabetes that develops when the body's immune system attacks and destroys the insulin-producing beta cells of the pancreas.",
      "isLeaf": false,
      "hasChildren": true
    },
    {
      "id": "481951975",
      "title": "Type 2 diabetes mellitus",
      "code": "E11",
      "definition": "A form of diabetes that occurs when the body becomes resistant to insulin or doesn't make enough insulin.",
      "isLeaf": false,
      "hasChildren": true
    }
  ],
  "pagination": {
    "total": 8,
    "limit": 50,
    "offset": 0,
    "hasNext": false,
    "hasPrevious": false
  },
  "parent": {
    "id": "142052508",
    "title": "Diabetes mellitus",
    "code": "E10-E14"
  }
}
```

#### Get Entity Parents

Retrieve parent entities for a specific ICD-11 entity.

```http
GET /api/icd11/entity/{id}/parents
```

**Example Response:**
```json
{
  "parents": [
    {
      "id": "455013390",
      "title": "Endocrine, nutritional or metabolic diseases",
      "code": "04",
      "level": 1
    }
  ],
  "child": {
    "id": "142052508",
    "title": "Diabetes mellitus",
    "code": "E10-E14"
  }
}
```

### Hierarchy Endpoints

#### Browse ICD-11 Chapters

Get all top-level ICD-11 chapters.

```http
GET /api/icd11/chapters
```

**Example Response:**
```json
{
  "chapters": [
    {
      "id": "1435254666",
      "title": "Certain infectious or parasitic diseases",
      "code": "01",
      "range": "1A00-1G9Z",
      "childCount": 145
    },
    {
      "id": "1630407678",
      "title": "Neoplasms",
      "code": "02", 
      "range": "2A00-2F9Z",
      "childCount": 298
    },
    {
      "id": "455013390",
      "title": "Endocrine, nutritional or metabolic diseases",
      "code": "04",
      "range": "5A00-5D9Z",
      "childCount": 87
    }
  ]
}
```

#### Get Chapter Details

Get detailed information about a specific ICD-11 chapter.

```http
GET /api/icd11/chapter/{chapterCode}
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chapterCode` | string | Yes | Chapter code (e.g., "04") |

**Example Response:**
```json
{
  "id": "455013390",
  "title": "Endocrine, nutritional or metabolic diseases",
  "code": "04",
  "range": "5A00-5D9Z",
  "description": "This chapter includes diseases of the endocrine system, nutritional disorders, and metabolic diseases.",
  "topLevelCategories": [
    {
      "id": "142052508",
      "title": "Diabetes mellitus",
      "code": "E10-E14"
    },
    {
      "id": "334423054",
      "title": "Disorders of thyroid gland", 
      "code": "E00-E07"
    }
  ],
  "statistics": {
    "totalEntities": 1247,
    "leafEntities": 892,
    "averageDepth": 3.2
  }
}
```

### Utility Endpoints

#### Health Check

Check API health and status.

```http
GET /api/health
```

**Example Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "uptime": 3600,
  "environment": "development",
  "checks": {
    "redis": {
      "status": "ok",
      "responseTime": 2,
      "message": "Redis is accessible"
    },
    "whoapi": {
      "status": "ok",
      "responseTime": 156,
      "message": "WHO API is accessible"
    },
    "memory": {
      "status": "ok",
      "totalMB": 512,
      "usedMB": 245,
      "usagePercent": 48,
      "message": "Memory usage: 245/512MB (48%)"
    }
  }
}
```

#### API Metrics

Get API performance metrics (requires authentication in production).

```http
GET /api/metrics
```

**Example Response:**
```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/icd11/search",status_code="200"} 1247

# HELP http_request_duration_seconds HTTP request duration in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="GET",route="/icd11/search",le="0.1"} 892
```

#### API Information

Get API version and configuration information.

```http
GET /api/info
```

**Example Response:**
```json
{
  "name": "ICD-11 Healthcare API",
  "version": "1.0.0",
  "description": "WHO ICD-11 medical classification API",
  "environment": "development",
  "nodeVersion": "18.17.0",
  "dependencies": {
    "@nestjs/core": "10.2.10",
    "redis": "4.6.11"
  },
  "features": {
    "caching": true,
    "metrics": true,
    "authentication": false
  },
  "limits": {
    "searchResultLimit": 1000,
    "requestsPerMinute": 100,
    "maxQueryLength": 200
  }
}
```

## Data Models

### Core Types

#### SearchResult
```typescript
interface SearchResult {
  /** Unique entity identifier */
  id: string;
  
  /** Full WHO URI for the entity */
  uri: string;
  
  /** Entity title/name */
  title: string;
  
  /** ICD-11 code or code range */
  code?: string;
  
  /** Short definition */
  definition?: string;
  
  /** ICD-11 chapter number */
  chapter?: string;
  
  /** Chapter title */
  chapterTitle?: string;
  
  /** Whether this is a leaf node */
  isLeaf: boolean;
  
  /** Whether entity has children */
  hasChildren: boolean;
  
  /** Parent entity IDs */
  parents: string[];
  
  /** Search relevance score (0-1) */
  score: number;
}
```

#### EntityDetails
```typescript
interface EntityDetails {
  /** Unique entity identifier */
  id: string;
  
  /** Full WHO URI */
  uri: string;
  
  /** Entity title */
  title: string;
  
  /** ICD-11 code */
  code?: string;
  
  /** Short definition */
  definition?: string;
  
  /** Detailed definition */
  longDefinition?: string;
  
  /** Alternative names */
  synonyms: string[];
  
  /** Included conditions */
  inclusions: string[];
  
  /** Excluded conditions */
  exclusions: string[];
  
  /** Chapter information */
  chapter?: string;
  chapterTitle?: string;
  
  /** Parent entities */
  parents: EntityReference[];
  
  /** Child entities */
  children: EntityReference[];
  
  /** Navigation breadcrumbs */
  breadcrumbs: BreadcrumbItem[];
  
  /** Entity flags */
  isLeaf: boolean;
  hasChildren: boolean;
  
  /** Metadata */
  metadata: EntityMetadata;
}
```

#### EntityReference
```typescript
interface EntityReference {
  /** Entity ID */
  id: string;
  
  /** Entity title */
  title: string;
  
  /** Entity code */
  code?: string;
  
  /** Whether entity is a leaf */
  isLeaf?: boolean;
  
  /** Hierarchy level */
  level?: number;
}
```

#### BreadcrumbItem
```typescript
interface BreadcrumbItem {
  /** Entity ID */
  id: string;
  
  /** Display title */
  title: string;
  
  /** Hierarchy level */
  level: number;
}
```

#### Pagination
```typescript
interface Pagination {
  /** Total number of results */
  total: number;
  
  /** Results per page */
  limit: number;
  
  /** Current offset */
  offset: number;
  
  /** Whether more results exist */
  hasNext: boolean;
  
  /** Whether previous results exist */
  hasPrevious: boolean;
}
```

#### SearchMetadata
```typescript
interface SearchMetadata {
  /** Original search query */
  query: string;
  
  /** Search execution time (ms) */
  searchTime: number;
  
  /** Whether result was cached */
  cached: boolean;
  
  /** Response timestamp */
  timestamp: string;
}
```

#### EntityMetadata
```typescript
interface EntityMetadata {
  /** Last modification date */
  lastModified: string;
  
  /** ICD-11 version */
  version: string;
  
  /** Content language */
  language: string;
}
```

### Authentication Types

#### User
```typescript
interface User {
  /** Unique user identifier */
  id: string;
  
  /** User email address */
  email: string;
  
  /** User's first name */
  firstName: string;
  
  /** User's last name */
  lastName: string;
  
  /** User role */
  role: UserRole;
  
  /** Account status */
  isActive: boolean;
  
  /** Failed login attempts */
  failedLoginAttempts: number;
  
  /** Account locked until */
  lockedUntil?: string;
  
  /** Last login timestamp */
  lastLoginAt?: string;
  
  /** Account creation timestamp */
  createdAt: string;
  
  /** Last update timestamp */
  updatedAt: string;
}
```

#### AuthTokens
```typescript
interface AuthTokens {
  /** JWT access token */
  accessToken: string;
  
  /** JWT refresh token */
  refreshToken: string;
  
  /** Access token expiration in seconds */
  expiresIn: number;
}
```

#### LoginResponse
```typescript
interface LoginResponse {
  /** Success message */
  message: string;
  
  /** User information */
  user: Omit<User, 'failedLoginAttempts' | 'lockedUntil'>;
  
  /** Authentication tokens */
  tokens: AuthTokens;
}
```

#### UserRole
```typescript
enum UserRole {
  USER = 'USER',
  HEALTHCARE_PROVIDER = 'HEALTHCARE_PROVIDER',
  ORG_ADMIN = 'ORG_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}
```

### Request/Response DTOs

#### RegisterRequestDto
```typescript
interface RegisterRequestDto {
  /** Email address (valid email format) */
  email: string;
  
  /** Password (minimum 8 characters) */
  password: string;
  
  /** First name (2-50 characters) */
  firstName: string;
  
  /** Last name (2-50 characters) */
  lastName: string;
  
  /** User role */
  role?: UserRole;
}
```

#### LoginRequestDto
```typescript
interface LoginRequestDto {
  /** Email address */
  email: string;
  
  /** Password */
  password: string;
  
  /** Remember me option for extended refresh token */
  rememberMe?: boolean;
}
```

#### RefreshTokenRequestDto
```typescript
interface RefreshTokenRequestDto {
  /** Refresh token */
  refreshToken: string;
}
```

#### SearchRequestDto
```typescript
interface SearchRequestDto {
  /** Search query (2-200 characters) */
  q: string;
  
  /** Results limit (1-1000) */
  limit?: number;
  
  /** Results offset (0+) */
  offset?: number;
  
  /** Include definitions in results */
  includeDefinitions?: boolean;
  
  /** Language code (en, es, fr, etc.) */
  language?: string;
  
  /** Filter by chapter */
  chapter?: string;
}
```

#### AutocompleteRequestDto
```typescript
interface AutocompleteRequestDto {
  /** Partial search query (1-50 characters) */
  q: string;
  
  /** Number of suggestions (1-20) */
  limit?: number;
}
```

#### EntityRequestDto
```typescript
interface EntityRequestDto {
  /** Include child entities */
  includeChildren?: boolean;
  
  /** Include parent entities */
  includeParents?: boolean;
  
  /** Language code */
  language?: string;
}
```

### Error Response Types

#### ApiError
```typescript
interface ApiError {
  /** HTTP status code */
  statusCode: number;
  
  /** Error message */
  message: string;
  
  /** Error code */
  error: string;
  
  /** Request timestamp */
  timestamp: string;
  
  /** Request path */
  path: string;
  
  /** Additional error details */
  details?: Record<string, any>;
}
```

#### ValidationError
```typescript
interface ValidationError extends ApiError {
  /** Validation error details */
  details: {
    /** Invalid fields */
    fields: Array<{
      field: string;
      value: any;
      message: string;
    }>;
  };
}
```

## Error Handling

### HTTP Status Codes

| Status Code | Description | Common Causes |
|-------------|-------------|---------------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid parameters, validation errors |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Entity or endpoint not found |
| 422 | Unprocessable Entity | Invalid entity data |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 502 | Bad Gateway | WHO API unavailable |
| 503 | Service Unavailable | Redis or other services unavailable |

### Error Response Format

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/icd11/search",
  "details": {
    "fields": [
      {
        "field": "q",
        "value": "",
        "message": "Search query must be at least 2 characters long"
      }
    ]
  }
}
```

### Common Error Scenarios

#### Validation Errors
```bash
# Missing required parameter
curl "http://localhost:3003/api/icd11/search"

# Response:
{
  "statusCode": 400,
  "message": "Query parameter 'q' is required",
  "error": "Bad Request"
}
```

#### Entity Not Found
```bash
# Non-existent entity
curl "http://localhost:3003/api/icd11/entity/nonexistent"

# Response:
{
  "statusCode": 404,
  "message": "Entity not found: nonexistent",
  "error": "Not Found"
}
```

#### Rate Limiting
```bash
# Too many requests
curl "http://localhost:3003/api/icd11/search?q=test"

# Response:
{
  "statusCode": 429,
  "message": "Rate limit exceeded. Try again in 60 seconds.",
  "error": "Too Many Requests",
  "details": {
    "retryAfter": 60,
    "limit": 100,
    "remaining": 0
  }
}
```

## Rate Limiting

### Default Limits

| Endpoint Type | Requests per Minute | Burst Limit |
|---------------|---------------------|-------------|
| Search | 100 | 20 |
| Entity Details | 200 | 50 |
| Autocomplete | 50 | 10 |
| Health Check | Unlimited | - |

### Rate Limit Headers

All responses include rate limiting headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248600
X-RateLimit-RetryAfter: 60
```

### Rate Limit Configuration

Rate limits can be configured per environment:

```typescript
// Development: More permissive
const rateLimits = {
  search: { windowMs: 60000, max: 1000 },
  entity: { windowMs: 60000, max: 2000 }
};

// Production: More restrictive  
const rateLimits = {
  search: { windowMs: 60000, max: 100 },
  entity: { windowMs: 60000, max: 200 }
};
```

## Caching Strategy

### Cache Levels

#### 1. Application Cache (Redis)
- **Search Results**: 30 minutes TTL
- **Entity Details**: 1 hour TTL
- **Chapter Data**: 24 hours TTL
- **WHO API Tokens**: Token expiration time

#### 2. HTTP Cache Headers
```http
Cache-Control: public, max-age=1800
ETag: "abc123"
Last-Modified: Mon, 15 Jan 2024 10:30:00 GMT
```

#### 3. CDN/Proxy Cache
- Static content: 1 year
- API responses: 5 minutes

### Cache Keys

Cache keys follow a consistent pattern:

```typescript
// Search results
`search:${query}:${JSON.stringify(options)}`

// Entity details
`entity:${entityId}:${language}`

// Entity children
`entity:${entityId}:children:${offset}:${limit}`

// WHO API tokens
`who:token:${clientId}`
```

### Cache Headers

Responses include cache information:

```http
X-Cache-Status: HIT|MISS|STALE
X-Cache-Key: search:diabetes:{}
X-Cache-TTL: 1800
```

## Code Examples

### JavaScript/TypeScript

#### Basic Search
```typescript
import axios from 'axios';

const API_BASE = 'http://localhost:3003/api';

// Search for diabetes-related entities
async function searchDiabetes() {
  try {
    const response = await axios.get(`${API_BASE}/icd11/search`, {
      params: {
        q: 'diabetes',
        limit: 10,
        includeDefinitions: true
      }
    });
    
    console.log('Search results:', response.data.results);
    return response.data;
  } catch (error) {
    console.error('Search failed:', error.response?.data || error.message);
    throw error;
  }
}
```

#### Get Entity with Children
```typescript
// Get entity details with children
async function getEntityWithChildren(entityId: string) {
  try {
    const response = await axios.get(
      `${API_BASE}/icd11/entity/${entityId}`,
      {
        params: {
          includeChildren: true,
          includeParents: true
        }
      }
    );
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.error(`Entity not found: ${entityId}`);
      return null;
    }
    throw error;
  }
}
```

#### Search with Pagination
```typescript
// Paginated search
async function searchWithPagination(query: string, page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;
  
  const response = await axios.get(`${API_BASE}/icd11/search`, {
    params: { q: query, limit, offset }
  });
  
  const { results, pagination } = response.data;
  
  return {
    results,
    currentPage: page,
    totalPages: Math.ceil(pagination.total / limit),
    hasNext: pagination.hasNext,
    hasPrevious: pagination.hasPrevious
  };
}
```

#### API Client Class
```typescript
class ICD11ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = 'http://localhost:3003/api', timeout: number = 10000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        params,
        timeout: this.timeout,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ICD11-Client/1.0.0'
        }
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async search(query: string, options: {
    limit?: number;
    offset?: number;
    includeDefinitions?: boolean;
    language?: string;
    chapter?: string;
  } = {}) {
    return this.request('/icd11/search', { q: query, ...options });
  }

  async getEntity(id: string, options: {
    includeChildren?: boolean;
    includeParents?: boolean;
    language?: string;
  } = {}) {
    return this.request(`/icd11/entity/${id}`, options);
  }

  async getChildren(id: string, options: {
    limit?: number;
    offset?: number;
  } = {}) {
    return this.request(`/icd11/entity/${id}/children`, options);
  }

  async autocomplete(query: string, limit: number = 5) {
    return this.request('/icd11/autocomplete', { q: query, limit });
  }

  async getChapters() {
    return this.request('/icd11/chapters');
  }

  async getChapter(chapterCode: string) {
    return this.request(`/icd11/chapter/${chapterCode}`);
  }

  async health() {
    return this.request('/health');
  }
}

// Usage
const client = new ICD11ApiClient();

// Search for diabetes
const searchResults = await client.search('diabetes', {
  limit: 10,
  includeDefinitions: true
});

// Get entity details
const entity = await client.getEntity('142052508', {
  includeChildren: true
});
```

### Python

#### Basic API Client
```python
import requests
import json
from typing import Optional, Dict, Any, List

class ICD11ApiClient:
    def __init__(self, base_url: str = "http://localhost:3003/api", timeout: int = 10):
        self.base_url = base_url
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'application/json',
            'User-Agent': 'ICD11-Python-Client/1.0.0'
        })

    def _request(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Make HTTP request to API endpoint."""
        try:
            response = self.session.get(
                f"{self.base_url}{endpoint}",
                params=params,
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"API request failed: {e}")

    def search(self, query: str, **kwargs) -> Dict[str, Any]:
        """Search ICD-11 entities."""
        params = {'q': query, **kwargs}
        return self._request('/icd11/search', params)

    def get_entity(self, entity_id: str, **kwargs) -> Dict[str, Any]:
        """Get entity details."""
        return self._request(f'/icd11/entity/{entity_id}', kwargs)

    def get_children(self, entity_id: str, **kwargs) -> Dict[str, Any]:
        """Get entity children."""
        return self._request(f'/icd11/entity/{entity_id}/children', kwargs)

    def autocomplete(self, query: str, limit: int = 5) -> Dict[str, Any]:
        """Get search suggestions."""
        return self._request('/icd11/autocomplete', {'q': query, 'limit': limit})

# Usage example
client = ICD11ApiClient()

# Search for diabetes
results = client.search('diabetes', limit=10, includeDefinitions=True)
print(f"Found {len(results['results'])} results")

# Get entity details
entity = client.get_entity('142052508', includeChildren=True)
print(f"Entity: {entity['title']} ({entity['code']})")
```

### PHP

#### Basic API Client
```php
<?php

class ICD11ApiClient {
    private string $baseUrl;
    private int $timeout;

    public function __construct(string $baseUrl = 'http://localhost:3003/api', int $timeout = 10) {
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->timeout = $timeout;
    }

    private function request(string $endpoint, array $params = []): array {
        $url = $this->baseUrl . $endpoint;
        if (!empty($params)) {
            $url .= '?' . http_build_query($params);
        }

        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => $this->timeout,
                'header' => [
                    'Accept: application/json',
                    'User-Agent: ICD11-PHP-Client/1.0.0'
                ]
            ]
        ]);

        $response = file_get_contents($url, false, $context);
        
        if ($response === false) {
            throw new Exception("API request failed");
        }

        $data = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON response");
        }

        return $data;
    }

    public function search(string $query, array $options = []): array {
        $params = array_merge(['q' => $query], $options);
        return $this->request('/icd11/search', $params);
    }

    public function getEntity(string $entityId, array $options = []): array {
        return $this->request("/icd11/entity/{$entityId}", $options);
    }

    public function getChildren(string $entityId, array $options = []): array {
        return $this->request("/icd11/entity/{$entityId}/children", $options);
    }

    public function autocomplete(string $query, int $limit = 5): array {
        return $this->request('/icd11/autocomplete', ['q' => $query, 'limit' => $limit]);
    }
}

// Usage
$client = new ICD11ApiClient();

// Search for diabetes
$results = $client->search('diabetes', ['limit' => 10, 'includeDefinitions' => true]);
echo "Found " . count($results['results']) . " results\n";

// Get entity details
$entity = $client->getEntity('142052508', ['includeChildren' => true]);
echo "Entity: " . $entity['title'] . " (" . $entity['code'] . ")\n";
?>
```

### React Hooks

#### Custom Hook for ICD-11 Search
```typescript
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface UseICD11SearchOptions {
  limit?: number;
  includeDefinitions?: boolean;
  debounceMs?: number;
}

interface UseICD11SearchResult {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[] | undefined;
  isLoading: boolean;
  error: Error | null;
  pagination: Pagination | undefined;
  refetch: () => void;
}

export function useICD11Search(options: UseICD11SearchOptions = {}): UseICD11SearchResult {
  const { limit = 10, includeDefinitions = false, debounceMs = 300 } = options;
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce query input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Search query
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['icd11-search', debouncedQuery, { limit, includeDefinitions }],
    queryFn: async () => {
      if (debouncedQuery.length < 2) return null;
      
      const response = await fetch(
        `/api/icd11/search?${new URLSearchParams({
          q: debouncedQuery,
          limit: limit.toString(),
          includeDefinitions: includeDefinitions.toString()
        })}`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      return response.json();
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });

  return {
    query,
    setQuery,
    results: data?.results,
    isLoading,
    error,
    pagination: data?.pagination,
    refetch
  };
}

// Usage in component
function SearchComponent() {
  const { 
    query, 
    setQuery, 
    results, 
    isLoading, 
    error 
  } = useICD11Search({
    limit: 20,
    includeDefinitions: true
  });

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search ICD-11..."
      />
      
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      
      {results && (
        <div>
          {results.map(result => (
            <div key={result.id}>
              <h3>{result.title}</h3>
              <p>{result.definition}</p>
              <small>{result.code}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### Entity Details Hook
```typescript
interface UseEntityDetailsOptions {
  includeChildren?: boolean;
  includeParents?: boolean;
}

export function useEntityDetails(entityId: string | null, options: UseEntityDetailsOptions = {}) {
  return useQuery({
    queryKey: ['icd11-entity', entityId, options],
    queryFn: async () => {
      if (!entityId) return null;
      
      const params = new URLSearchParams();
      if (options.includeChildren) params.set('includeChildren', 'true');
      if (options.includeParents) params.set('includeParents', 'true');
      
      const response = await fetch(`/api/icd11/entity/${entityId}?${params}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Entity not found');
        }
        throw new Error('Failed to fetch entity');
      }
      
      return response.json();
    },
    enabled: !!entityId,
    staleTime: 30 * 60 * 1000 // 30 minutes
  });
}
```

### Error Handling Patterns

#### Comprehensive Error Handling
```typescript
class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(statusCode: number, message: string, code: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
  }
}

async function handleApiRequest<T>(requestFn: () => Promise<T>): Promise<T> {
  try {
    return await requestFn();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const { response } = error;
      
      if (response) {
        const { status, data } = response;
        throw new ApiError(
          status,
          data.message || 'API request failed',
          data.error || 'Unknown Error',
          data.details
        );
      } else if (error.request) {
        throw new ApiError(0, 'Network error - no response received', 'NETWORK_ERROR');
      }
    }
    
    throw error;
  }
}

// Usage with retry logic
async function searchWithRetry(query: string, maxRetries: number = 3): Promise<SearchResult[]> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await handleApiRequest(() => 
        axios.get('/api/icd11/search', { params: { q: query } })
      );
    } catch (error) {
      lastError = error as Error;
      
      if (error instanceof ApiError) {
        // Don't retry client errors (4xx)
        if (error.statusCode >= 400 && error.statusCode < 500) {
          throw error;
        }
        
        // Don't retry rate limiting immediately
        if (error.statusCode === 429) {
          const retryAfter = error.details?.retryAfter || 60;
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        }
      }
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}
```

## SDKs and Libraries

### Official SDKs

#### TypeScript/JavaScript SDK
```bash
npm install @icd11-platform/client
```

```typescript
import { ICD11Client } from '@icd11-platform/client';

const client = new ICD11Client({
  baseURL: 'http://localhost:3003/api',
  timeout: 10000,
  retryAttempts: 3
});

// Type-safe API calls
const results = await client.search('diabetes', {
  limit: 10,
  includeDefinitions: true
});
```

#### React SDK
```bash
npm install @icd11-platform/react
```

```typescript
import { ICD11Provider, useICD11Search } from '@icd11-platform/react';

function App() {
  return (
    <ICD11Provider apiUrl="http://localhost:3003/api">
      <SearchComponent />
    </ICD11Provider>
  );
}

function SearchComponent() {
  const { search, results, loading } = useICD11Search();
  
  return (
    <div>
      <input onChange={(e) => search(e.target.value)} />
      {loading && <div>Loading...</div>}
      {results?.map(result => <div key={result.id}>{result.title}</div>)}
    </div>
  );
}
```

### Community Libraries

#### Python Package
```bash
pip install icd11-client
```

```python
from icd11_client import ICD11Client

client = ICD11Client(base_url='http://localhost:3003/api')
results = client.search('diabetes', limit=10)
```

#### PHP Composer Package
```bash
composer require icd11/api-client
```

```php
use ICD11\ApiClient\Client;

$client = new Client('http://localhost:3003/api');
$results = $client->search('diabetes', ['limit' => 10]);
```

### OpenAPI/Swagger Client Generation

Generate clients for any language using the OpenAPI specification:

```bash
# Generate TypeScript client
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:3003/api/docs-json \
  -g typescript-axios \
  -o ./generated-client

# Generate Python client
openapi-generator generate \
  -i http://localhost:3003/api/docs-json \
  -g python \
  -o ./python-client

# Generate Java client
openapi-generator generate \
  -i http://localhost:3003/api/docs-json \
  -g java \
  -o ./java-client
```

This comprehensive API documentation provides healthcare developers with everything needed to integrate the ICD-11 Healthcare Platform into their applications, ensuring reliable, performant, and compliant access to WHO ICD-11 medical classification data.
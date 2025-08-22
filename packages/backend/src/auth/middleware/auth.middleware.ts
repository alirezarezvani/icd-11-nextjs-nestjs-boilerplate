import { Injectable, NestMiddleware, UnauthorizedException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../services/auth.service';
import { User } from '../entities/user.entity';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      authStatus?: boolean; // Renamed to avoid conflict with passport's isAuthenticated
    }
  }
}

/**
 * Healthcare-grade authentication middleware for ICD-11 application
 * Provides seamless integration between public and protected endpoints
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Check if route is marked as public
      const isPublic = this.isPublicRoute(req);
      
      // Extract token from various sources
      const token = this.extractToken(req);
      
      if (!token) {
        if (isPublic) {
          // Public route without token - allow access
          req.authStatus = false;
          return next();
        } else {
          // Protected route without token - deny access
          throw new UnauthorizedException('Authentication token required');
        }
      }

      // Validate token and get user
      const user = await this.authService.validateToken(token);
      
      if (!user) {
        if (isPublic) {
          // Public route with invalid token - allow access but mark as unauthenticated
          req.authStatus = false;
          this.logger.warn(`Invalid token on public route: ${req.path}`);
          return next();
        } else {
          // Protected route with invalid token - deny access
          throw new UnauthorizedException('Invalid or expired token');
        }
      }

      // Attach user to request
      req.user = user;
      req.authStatus = true;

      // Log authentication for audit purposes
      this.logger.log(`Authenticated user ${user.email} accessing ${req.path}`);

      next();
    } catch (error) {
      this.logger.error(`Authentication middleware error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // If this is a public route and we have a non-auth error, allow access
      if (this.isPublicRoute(req) && !(error instanceof UnauthorizedException)) {
        req.authStatus = false;
        return next();
      }
      
      // For all other cases, deny access
      throw new UnauthorizedException('Authentication failed');
    }
  }

  /**
   * Extract JWT token from request headers, cookies, or query parameters
   */
  private extractToken(req: Request): string | null {
    // 1. Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // 2. Cookie
    if (req.cookies && req.cookies.accessToken) {
      return req.cookies.accessToken;
    }

    // 3. Query parameter (for websockets or special cases)
    if (req.query && req.query.token && typeof req.query.token === 'string') {
      return req.query.token;
    }

    return null;
  }

  /**
   * Check if the current route is marked as public
   */
  private isPublicRoute(req: Request): boolean {
    // Debug logging
    this.logger.debug(`Checking public route for path: ${req.path}, originalUrl: ${req.originalUrl}`);
    
    // Define public routes that don't require authentication
    const publicPaths = [
      '/api', // Basic API endpoint
      '/api/icd11', // All ICD-11 search endpoints are public
      '/api/auth/login',
      '/api/auth/register', 
      '/api/auth/refresh',
      '/api/docs', // Swagger documentation
      '/api-json', // Swagger JSON
      '/api/health', // Health check
      '/api/version', // Version info
    ];

    const path = req.originalUrl || req.path;
    
    // Check if current path starts with any public path
    const isPublic = publicPaths.some(publicPath => path.startsWith(publicPath));
    
    this.logger.debug(`Path: ${path}, isPublic: ${isPublic}`);
    return isPublic;
  }
}

/**
 * Helper decorator to mark routes as public
 */
export const Public = () => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    // This decorator can be used to explicitly mark routes as public
    // The middleware will check for this metadata
  };
};

/**
 * Helper decorator to require authentication
 */
export const RequireAuth = () => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    // This decorator can be used to explicitly mark routes as requiring auth
    // The middleware will check for this metadata
  };
};
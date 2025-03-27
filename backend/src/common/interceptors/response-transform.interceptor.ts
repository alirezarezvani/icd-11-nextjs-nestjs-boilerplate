import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interceptor that transforms the response to a standardized format
 */
@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Get the HTTP response
    const response = context.switchToHttp().getResponse();
    
    // Get the HTTP request
    const request = context.switchToHttp().getRequest();
    
    // Continue with the handler execution
    return next.handle().pipe(
      map(data => {
        // If the response is already standardized or contains specific metadata, return as is
        if (data && (data.statusCode !== undefined || data.meta !== undefined)) {
          return data;
        }
        
        // Default status code
        const statusCode = response.statusCode || 200;
        
        // Determine if the response is paginated
        const isPaginated = data && 
          typeof data === 'object' &&
          data.data !== undefined && 
          data.meta !== undefined;
        
        // Format the response
        if (isPaginated) {
          // Already in paginated format, just add statusCode
          return {
            statusCode,
            ...data,
          };
        } else {
          // Standard response format
          return {
            statusCode,
            data,
            message: 'Success',
          };
        }
      }),
    );
  }
} 
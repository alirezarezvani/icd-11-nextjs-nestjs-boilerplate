import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global HTTP exception filter to standardize error responses
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    // Extract error message and error name
    const errorMessage = 
      typeof errorResponse === 'object' && errorResponse
        ? (errorResponse as any).message || exception.message
        : exception.message;
    
    const errorName = 
      typeof errorResponse === 'object' && errorResponse 
        ? (errorResponse as any).error || 'Error'
        : 'Error';

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} ${status} - ${errorMessage}`,
      exception.stack,
    );

    // Return standardized error response
    response.status(status).json({
      statusCode: status,
      message: errorMessage,
      error: errorName,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
} 
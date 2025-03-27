import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorHandlerUtil } from '../utils';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Prepare error details
    let status: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      // Handle known HTTP exceptions from NestJS
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      
      if (typeof errorResponse === 'object' && errorResponse !== null) {
        message = (errorResponse as any).message || exception.message;
        error = (errorResponse as any).error || 'Error';
      } else {
        message = errorResponse as string || exception.message;
        error = 'Error';
      }
    } else {
      // Handle unknown exceptions
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Internal Server Error';
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} ${status} - ${message}`,
      exception.stack,
    );

    // Send the error response
    response.status(status).json({
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
} 
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

/**
 * Interceptor for logging requests and responses
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = request;
    const userAgent = request.get("user-agent") || "";
    const startTime = Date.now();

    // Log request details
    this.logger.log(
      `Request: ${method} ${url} | UA: ${userAgent}` +
        `${Object.keys(query || {}).length ? ` | Query: ${JSON.stringify(query)}` : ""}` +
        `${Object.keys(params || {}).length ? ` | Params: ${JSON.stringify(params)}` : ""}` +
        `${Object.keys(body || {}).length ? ` | Body: ${JSON.stringify(body)}` : ""}`,
    );

    // Continue with the handler and log the response time
    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - startTime;
        this.logger.log(`Response: ${method} ${url} | ${responseTime}ms`);
      }),
    );
  }
}

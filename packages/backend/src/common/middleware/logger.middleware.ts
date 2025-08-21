import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get("user-agent") || "";

    // Log request when it starts
    this.logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent}`);

    // Get timestamp to calculate response time
    const start = Date.now();

    // Listen for response finish event to log the result
    res.on("finish", () => {
      const { statusCode } = res;
      const responseTime = Date.now() - start;

      if (statusCode >= 500) {
        this.logger.error(
          `${method} ${originalUrl} ${statusCode} - ${responseTime}ms`,
        );
      } else if (statusCode >= 400) {
        this.logger.warn(
          `${method} ${originalUrl} ${statusCode} - ${responseTime}ms`,
        );
      } else {
        this.logger.log(
          `${method} ${originalUrl} ${statusCode} - ${responseTime}ms`,
        );
      }
    });

    next();
  }
}

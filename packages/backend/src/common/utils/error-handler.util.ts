import { Logger } from "@nestjs/common";

export class ErrorHandlerUtil {
  private static readonly logger = new Logger(ErrorHandlerUtil.name);

  /**
   * Handle unknown errors and convert to a standard format
   * @param error Any caught error
   * @param context Additional context information
   * @returns Standardized error object
   */
  static handleUnknownError(error: unknown, context?: string): Error {
    // If already an Error, log and return
    if (error instanceof Error) {
      this.logError(error, context);
      return error;
    }

    // Convert to Error
    let errorMessage = "Unknown error occurred";

    // Try to get a message from the error
    if (error !== null && typeof error === "object") {
      if ("message" in error && typeof error.message === "string") {
        errorMessage = error.message;
      } else if ("toString" in error && typeof error.toString === "function") {
        errorMessage = error.toString();
      }
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    const standardError = new Error(errorMessage);
    this.logError(standardError, context);
    return standardError;
  }

  /**
   * Log errors consistently
   * @param error Error to log
   * @param context Additional context
   */
  static logError(error: Error, context?: string): void {
    const contextInfo = context ? ` [${context}]` : "";
    this.logger.error(`${error.message}${contextInfo}`);

    if (error.stack) {
      this.logger.verbose(error.stack);
    }
  }
}

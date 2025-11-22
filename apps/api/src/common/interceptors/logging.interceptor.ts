import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Logging interceptor
 * Logs incoming requests and outgoing responses
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, params, query } = request;
    const userAgent = request.get('user-agent') || '';
    const userId = request.user?.id || 'anonymous';

    const now = Date.now();

    this.logger.log(
      `→ ${method} ${url} - User: ${userId} - UA: ${userAgent.substring(0, 50)}`,
    );

    if (Object.keys(params).length > 0) {
      this.logger.debug(`Params: ${JSON.stringify(params)}`);
    }
    if (Object.keys(query).length > 0) {
      this.logger.debug(`Query: ${JSON.stringify(query)}`);
    }
    if (body && Object.keys(body).length > 0) {
      // Don't log sensitive fields
      const sanitized = { ...body };
      ['password', 'token', 'secret'].forEach((field) => {
        if (sanitized[field]) sanitized[field] = '***';
      });
      this.logger.debug(`Body: ${JSON.stringify(sanitized)}`);
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          this.logger.log(`← ${method} ${url} - ${responseTime}ms`);
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(`← ${method} ${url} - ${responseTime}ms - Error: ${error.message}`);
        },
      }),
    );
  }
}

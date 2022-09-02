import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  LoggerService,
  NestInterceptor,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const { method, url, body } = context.getArgByIndex(0);
    this.logger.log(`Request to ${method} ${url}`);

    return next.handle().pipe(
      tap((data) => {
        let jsonData = '';
        try {
          jsonData = JSON.stringify(data);
        } catch (e) {
          // this.logger.error('json data error', data);
        } finally {
          this.logger.log(`Response from ${method} ${url} \n response: ${jsonData}`);
        }
      }),
    );
  }
}

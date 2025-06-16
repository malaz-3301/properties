import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap, map } from 'rxjs';
import { config } from 'dotenv';

config({ path: '.env' });

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    console.log('start..');
    console.log(`Running on APP ${process.env.APP_NAME}`);
    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`Done! ${Date.now() - now}ms`)));
  }
}

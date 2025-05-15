import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { UserType } from '../enums';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    // Admin NOOOOOOOOOOOOOOOOOOOOOOt Super admin
    if (req['payload'].userType === UserType.SUPER_ADMIN) {
      const adminId = req['payload'].id;
      const meta = {
        method: req.method,
        url: req.originalUrl,
        params: req.params,
        body: req.body,
        ip: req.ips && req.ips.length ? req.ips[0] : req.ip,
      };
      //next when use catch
      return next.handle().pipe(
        tap({
          next: () => {
            this.auditService
              .create(adminId, meta)
              .catch((err) => console.error('Audit log error:', err));
          },
        }),
      );
    }
    return next.handle();
  }
}

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

const AUDITED_ACTIONS = new Set([
  'POST /api/v1/auth/login',
  'POST /api/v1/auth/register',
  'PATCH /api/v1/admin/users/:id/role',
  'PATCH /api/v1/admin/users/:id/suspend',
  'POST /api/v1/payments/stripe/create-intent',
  'POST /api/v1/payments/crypto/initiate',
  'POST /api/v1/agreements/:id/sign',
  'POST /api/v1/agreements/:id/terminate',
  'POST /api/v1/escrow/:id/release',
  'POST /api/v1/escrow/:id/refund',
  'POST /api/v1/escrow/:id/dispute',
  'POST /api/v1/kyc/:id/review',
]);

function matchesPattern(method: string, path: string): boolean {
  const normalized = `${method} ${path.replace(/\/[0-9a-f-]{36}/g, '/:id')}`;
  return AUDITED_ACTIONS.has(normalized);
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditLog');

  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, ip } = req;

    if (!matchesPattern(method, url)) {
      return next.handle();
    }

    const userId = req.user?.id || req.user?.sub || null;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const action = `${method} ${url}`;
          this.logger.log(`[AUDIT] ${action} by ${userId || 'anonymous'} from ${ip} (${duration}ms)`);

          // Fire-and-forget DB insert
          this.prisma.$executeRaw`
            INSERT INTO audit_logs (id, user_id, action, ip, timestamp)
            VALUES (gen_random_uuid(), ${userId}, ${action}, ${ip}, NOW())
          `.catch(() => {
            // Table may not exist yet — log only
          });
        },
        error: (error) => {
          const action = `${method} ${url}`;
          this.logger.warn(`[AUDIT:FAIL] ${action} by ${userId || 'anonymous'} from ${ip}: ${error.message}`);
        },
      }),
    );
  }
}

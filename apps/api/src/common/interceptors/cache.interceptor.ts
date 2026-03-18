import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, of, tap } from 'rxjs';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Cache');
  private redis: Redis | null = null;

  constructor(private config: ConfigService) {
    const redisUrl = this.config.get<string>('REDIS_URL');
    if (redisUrl) {
      try {
        this.redis = new Redis(redisUrl);
      } catch {
        this.logger.warn('Redis cache not available');
      }
    }
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    if (!this.redis) return next.handle();

    const req = context.switchToHttp().getRequest();
    if (req.method !== 'GET') return next.handle();

    const key = `cache:${req.url}`;
    const ttl = this.getTtl(req.url);
    if (ttl === 0) return next.handle();

    try {
      const cached = await this.redis.get(key);
      if (cached) {
        this.logger.debug(`Cache HIT: ${key}`);
        return of(JSON.parse(cached));
      }
    } catch {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (data) => {
        try {
          await this.redis!.setex(key, ttl, JSON.stringify(data));
          this.logger.debug(`Cache SET: ${key} (${ttl}s)`);
        } catch {
          // Ignore cache write errors
        }
      }),
    );
  }

  private getTtl(url: string): number {
    if (url.match(/\/properties\/[a-f0-9-]+$/)) return 120;
    if (url.match(/\/properties\??/)) return 60;
    return 0; // Don't cache by default
  }
}

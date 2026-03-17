import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  async check() {
    let database = 'disconnected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      database = 'connected';
    } catch {}

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database,
    };
  }
}

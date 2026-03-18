import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import * as os from 'os';
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

    const memUsage = process.memoryUsage();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      database,
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024),
        unit: 'MB',
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        cpus: os.cpus().length,
        freeMemory: Math.round(os.freemem() / 1024 / 1024),
        totalMemory: Math.round(os.totalmem() / 1024 / 1024),
      },
    };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Prometheus-compatible metrics' })
  async metrics() {
    const mem = process.memoryUsage();
    const uptime = process.uptime();

    const lines = [
      `# HELP process_uptime_seconds Process uptime in seconds`,
      `# TYPE process_uptime_seconds gauge`,
      `process_uptime_seconds ${Math.floor(uptime)}`,
      `# HELP process_heap_bytes Process heap memory in bytes`,
      `# TYPE process_heap_bytes gauge`,
      `process_heap_bytes{type="used"} ${mem.heapUsed}`,
      `process_heap_bytes{type="total"} ${mem.heapTotal}`,
      `# HELP process_rss_bytes Process RSS in bytes`,
      `# TYPE process_rss_bytes gauge`,
      `process_rss_bytes ${mem.rss}`,
      `# HELP nodejs_version Node.js version info`,
      `# TYPE nodejs_version gauge`,
      `nodejs_version{version="${process.version}"} 1`,
    ];

    return lines.join('\n');
  }
}

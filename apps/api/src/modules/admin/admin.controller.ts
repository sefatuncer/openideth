import { Controller, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'List users' })
  async getUsers(
    @Query() pagination: PaginationQueryDto,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(pagination, { role, search });
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  async updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.adminService.updateUserRole(id, role);
  }

  @Patch('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend user' })
  async suspendUser(@Param('id') id: string) {
    return this.adminService.suspendUser(id);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Payment overview' })
  async getPayments(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.adminService.getPaymentOverview(startDate, endDate);
  }

  @Get('disputes')
  @ApiOperation({ summary: 'Dispute queue' })
  async getDisputes(@Query() pagination: PaginationQueryDto) {
    return this.adminService.getDisputeQueue(pagination);
  }

  @Get('reports/:type')
  @ApiOperation({ summary: 'Generate report' })
  async getReports(
    @Param('type') type: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getReports(type, startDate, endDate);
  }
}

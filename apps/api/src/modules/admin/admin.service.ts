import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PaginationQueryDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [users, properties, agreements, payments, revenue] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.property.count(),
      this.prisma.rentalAgreement.count({ where: { status: 'ACTIVE' } }),
      this.prisma.payment.count(),
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { platformFee: true, amount: true },
      }),
    ]);

    return {
      totalUsers: users,
      totalProperties: properties,
      activeAgreements: agreements,
      totalPayments: payments,
      totalRevenue: revenue._sum.amount || 0,
      platformRevenue: revenue._sum.platformFee || 0,
    };
  }

  async getUsers(pagination: PaginationQueryDto, filters?: { role?: string; search?: string }) {
    const where: any = {};
    if (filters?.role) where.role = filters.role;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        select: {
          id: true, email: true, name: true, role: true,
          emailVerified: true, createdAt: true,
          _count: { select: { properties: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return new PaginatedResponseDto(users, total, pagination.page, pagination.limit);
  }

  async updateUserRole(userId: string, role: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async suspendUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    return { message: 'User suspended and all tokens revoked' };
  }

  async getPaymentOverview(startDate?: string, endDate?: string) {
    const where: any = { status: 'COMPLETED' };
    if (startDate || endDate) {
      where.paidAt = {};
      if (startDate) where.paidAt.gte = new Date(startDate);
      if (endDate) where.paidAt.lte = new Date(endDate);
    }

    const [completed, pending, failed, stats] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.count({ where: { status: 'PENDING' } }),
      this.prisma.payment.count({ where: { status: 'FAILED' } }),
      this.prisma.payment.aggregate({
        where,
        _sum: { amount: true, platformFee: true },
      }),
    ]);

    return {
      completed, pending, failed,
      totalAmount: stats._sum.amount || 0,
      totalFees: stats._sum.platformFee || 0,
    };
  }

  async getDisputeQueue(pagination: PaginationQueryDto) {
    const where = { status: 'DISPUTED' as const };
    const [disputes, total] = await Promise.all([
      this.prisma.escrowDeposit.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          agreement: {
            select: {
              id: true,
              property: { select: { title: true } },
              landlord: { select: { id: true, name: true } },
              tenant: { select: { id: true, name: true } },
            },
          },
        },
      }),
      this.prisma.escrowDeposit.count({ where }),
    ]);

    return new PaginatedResponseDto(disputes, total, pagination.page, pagination.limit);
  }

  async getReports(type: string, startDate?: string, endDate?: string) {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);
    const hasDateFilter = startDate || endDate;

    switch (type) {
      case 'revenue': {
        const payments = await this.prisma.payment.groupBy({
          by: ['method'],
          where: { status: 'COMPLETED', ...(hasDateFilter && { paidAt: dateFilter }) },
          _sum: { amount: true, platformFee: true },
          _count: true,
        });
        return payments;
      }
      case 'users': {
        const users = await this.prisma.user.groupBy({
          by: ['role'],
          ...(hasDateFilter && { where: { createdAt: dateFilter } }),
          _count: true,
        });
        return users;
      }
      case 'properties': {
        const properties = await this.prisma.property.groupBy({
          by: ['status'],
          ...(hasDateFilter && { where: { createdAt: dateFilter } }),
          _count: true,
        });
        return properties;
      }
      default:
        return [];
    }
  }
}

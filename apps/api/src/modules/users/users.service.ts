import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PaginationQueryDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        walletAddress: true,
        avatarUrl: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, dto: { name?: string; phone?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatarUrl: true,
        walletAddress: true,
      },
    });
  }

  async updateWalletAddress(id: string, walletAddress: string) {
    return this.prisma.user.update({
      where: { id },
      data: { walletAddress },
      select: { id: true, walletAddress: true },
    });
  }

  async findAll(pagination: PaginationQueryDto, filters?: { role?: string; search?: string }) {
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
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return new PaginatedResponseDto(users, total, pagination.page, pagination.limit);
  }

  async getStats(userId: string) {
    const [propertyCount, agreementCount, paymentStats] = await Promise.all([
      this.prisma.property.count({ where: { landlordId: userId } }),
      this.prisma.rentalAgreement.count({
        where: { OR: [{ landlordId: userId }, { tenantId: userId }] },
      }),
      this.prisma.payment.aggregate({
        where: { payerId: userId, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    return {
      propertyCount,
      agreementCount,
      totalPayments: paymentStats._sum.amount || 0,
    };
  }
}

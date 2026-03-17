import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PaginationQueryDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, type: string, title: string, message: string, data?: any) {
    return this.prisma.notification.create({
      data: { userId, type: type as any, title, message, data },
    });
  }

  async findByUser(userId: string, pagination: PaginationQueryDto, unreadOnly?: boolean) {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return new PaginatedResponseDto(notifications, total, pagination.page, pagination.limit);
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async deleteOld(days: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return this.prisma.notification.deleteMany({
      where: { createdAt: { lt: cutoff }, isRead: true },
    });
  }
}

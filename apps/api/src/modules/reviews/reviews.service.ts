import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PaginationQueryDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(reviewerId: string, dto: { propertyId: string; rating: number; comment?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: reviewerId }, select: { role: true } });
    if (user?.role !== 'TENANT') throw new ForbiddenException('Only tenants can leave reviews');

    const hasAgreement = await this.prisma.rentalAgreement.findFirst({
      where: { tenantId: reviewerId, propertyId: dto.propertyId, status: 'ACTIVE' },
    });
    if (!hasAgreement) throw new ForbiddenException('You must have an active agreement to review');

    const existing = await this.prisma.review.findUnique({
      where: { propertyId_reviewerId: { propertyId: dto.propertyId, reviewerId } },
    });
    if (existing) throw new ConflictException('You already reviewed this property');

    return this.prisma.review.create({
      data: { propertyId: dto.propertyId, reviewerId, rating: dto.rating, comment: dto.comment },
    });
  }

  async findByProperty(propertyId: string, pagination: PaginationQueryDto) {
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { propertyId },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: { reviewer: { select: { id: true, name: true, avatarUrl: true } } },
      }),
      this.prisma.review.count({ where: { propertyId } }),
    ]);
    return new PaginatedResponseDto(reviews, total, pagination.page, pagination.limit);
  }

  async findByUser(userId: string, pagination: PaginationQueryDto) {
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { reviewerId: userId },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: { property: { select: { id: true, title: true, city: true } } },
      }),
      this.prisma.review.count({ where: { reviewerId: userId } }),
    ]);
    return new PaginatedResponseDto(reviews, total, pagination.page, pagination.limit);
  }

  async getAverageRating(propertyId: string) {
    const result = await this.prisma.review.aggregate({
      where: { propertyId },
      _avg: { rating: true },
      _count: true,
    });
    return { average: result._avg.rating || 0, count: result._count };
  }
}

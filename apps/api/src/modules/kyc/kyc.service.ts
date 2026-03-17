import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PaginationQueryDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class KycService {
  constructor(private prisma: PrismaService) {}

  async initiate(userId: string) {
    const existing = await this.prisma.kycVerification.findUnique({ where: { userId } });
    if (existing) {
      if (existing.status === 'APPROVED') throw new BadRequestException('KYC already approved');
      return existing;
    }

    return this.prisma.kycVerification.create({
      data: { userId, status: 'PENDING' },
    });
  }

  async uploadDocument(
    userId: string,
    type: string,
    frontUrl: string,
    backUrl?: string,
    selfieUrl?: string,
  ) {
    const kyc = await this.prisma.kycVerification.findUnique({ where: { userId } });
    if (!kyc) throw new NotFoundException('KYC verification not found. Initiate first.');
    if (kyc.status === 'APPROVED') throw new BadRequestException('KYC already approved');

    return this.prisma.kycVerification.update({
      where: { userId },
      data: {
        documentType: type as any,
        documentFrontUrl: frontUrl,
        documentBackUrl: backUrl,
        selfieUrl,
        submittedAt: new Date(),
        status: 'PENDING',
      },
    });
  }

  async getStatus(userId: string) {
    const kyc = await this.prisma.kycVerification.findUnique({ where: { userId } });
    if (!kyc) return { status: 'NOT_STARTED' };
    return kyc;
  }

  async review(id: string, adminId: string, approved: boolean, rejectionReason?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: adminId }, select: { role: true } });
    if (user?.role !== 'ADMIN') throw new ForbiddenException('Only admin can review KYC');

    const kyc = await this.prisma.kycVerification.findUnique({ where: { id } });
    if (!kyc) throw new NotFoundException('KYC verification not found');
    if (kyc.status !== 'PENDING') throw new BadRequestException('KYC is not pending review');

    return this.prisma.kycVerification.update({
      where: { id },
      data: {
        status: approved ? 'APPROVED' : 'REJECTED',
        rejectionReason: approved ? null : rejectionReason,
        reviewedById: adminId,
        reviewedAt: new Date(),
      },
    });
  }

  async getPendingReviews(pagination: PaginationQueryDto) {
    const where = { status: 'PENDING' as const, submittedAt: { not: null } };
    const [reviews, total] = await Promise.all([
      this.prisma.kycVerification.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { submittedAt: 'asc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.kycVerification.count({ where }),
    ]);

    return new PaginatedResponseDto(reviews, total, pagination.page, pagination.limit);
  }
}

import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class EscrowService {
  constructor(private prisma: PrismaService) {}

  async createDeposit(agreementId: string, amount: number) {
    const agreement = await this.prisma.rentalAgreement.findUnique({ where: { id: agreementId } });
    if (!agreement) throw new NotFoundException('Agreement not found');

    return this.prisma.escrowDeposit.create({
      data: {
        agreementId,
        amount,
        status: 'HELD',
      },
    });
  }

  async release(id: string, userId: string) {
    const deposit = await this.getDepositWithAccess(id, userId, ['LANDLORD', 'ADMIN']);
    if (deposit.status !== 'HELD') throw new BadRequestException('Deposit is not in HELD status');

    return this.prisma.escrowDeposit.update({
      where: { id },
      data: { status: 'RELEASED', releasedAt: new Date() },
    });
  }

  async refund(id: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: adminId }, select: { role: true } });
    if (user?.role !== 'ADMIN') throw new ForbiddenException('Only admin can refund');

    const deposit = await this.prisma.escrowDeposit.findUnique({ where: { id } });
    if (!deposit) throw new NotFoundException('Deposit not found');
    if (deposit.status !== 'HELD' && deposit.status !== 'DISPUTED') {
      throw new BadRequestException('Deposit cannot be refunded');
    }

    return this.prisma.escrowDeposit.update({
      where: { id },
      data: { status: 'REFUNDED', refundedAt: new Date() },
    });
  }

  async dispute(id: string, userId: string, reason: string) {
    const deposit = await this.getDepositWithAccess(id, userId, ['TENANT', 'LANDLORD']);
    if (deposit.status !== 'HELD') throw new BadRequestException('Deposit is not in HELD status');

    return this.prisma.escrowDeposit.update({
      where: { id },
      data: { status: 'DISPUTED', disputeReason: reason },
    });
  }

  async resolveDispute(id: string, adminId: string, resolution: string) {
    const user = await this.prisma.user.findUnique({ where: { id: adminId }, select: { role: true } });
    if (user?.role !== 'ADMIN') throw new ForbiddenException('Only admin can resolve disputes');

    const deposit = await this.prisma.escrowDeposit.findUnique({ where: { id } });
    if (!deposit) throw new NotFoundException('Deposit not found');
    if (deposit.status !== 'DISPUTED') throw new BadRequestException('No active dispute');

    const newStatus = resolution === 'refund' ? 'REFUNDED' : 'RELEASED';
    const data: any = {
      status: newStatus,
      disputeResolution: resolution,
      disputeResolvedAt: new Date(),
      resolvedById: adminId,
    };
    if (newStatus === 'RELEASED') data.releasedAt = new Date();
    if (newStatus === 'REFUNDED') data.refundedAt = new Date();

    return this.prisma.escrowDeposit.update({ where: { id }, data });
  }

  async getByAgreement(agreementId: string) {
    return this.prisma.escrowDeposit.findMany({
      where: { agreementId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async getDepositWithAccess(id: string, userId: string, allowedRoles: string[]) {
    const deposit = await this.prisma.escrowDeposit.findUnique({
      where: { id },
      include: { agreement: { select: { landlordId: true, tenantId: true } } },
    });
    if (!deposit) throw new NotFoundException('Deposit not found');

    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    const isParty = deposit.agreement.landlordId === userId || deposit.agreement.tenantId === userId;
    const isAdmin = user?.role === 'ADMIN';

    if (!isParty && !isAdmin) throw new ForbiddenException('Access denied');
    return deposit;
  }
}

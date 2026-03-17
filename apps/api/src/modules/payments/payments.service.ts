import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PaginationQueryDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { StripePaymentStrategy } from './strategies/stripe-payment.strategy';
import { CryptoPaymentStrategy } from './strategies/crypto-payment.strategy';
import { IPaymentStrategy } from './interfaces/payment-strategy.interface';
import { CreatePaymentDto } from './dto';
import { PLATFORM_FEE_BPS } from '@openideth/shared';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private stripeStrategy: StripePaymentStrategy,
    private cryptoStrategy: CryptoPaymentStrategy,
  ) {}

  private getStrategy(method: string): IPaymentStrategy {
    switch (method) {
      case 'STRIPE':
        return this.stripeStrategy;
      case 'ETH':
      case 'USDT':
        return this.cryptoStrategy;
      default:
        return this.stripeStrategy;
    }
  }

  async createPayment(userId: string, dto: CreatePaymentDto) {
    const agreement = await this.prisma.rentalAgreement.findUnique({
      where: { id: dto.agreementId },
    });
    if (!agreement) throw new NotFoundException('Agreement not found');
    if (agreement.tenantId !== userId) throw new ForbiddenException('Only tenant can make payments');

    const strategy = this.getStrategy(dto.method);
    const result = await strategy.createPayment(dto.amount, 'USD', {
      agreementId: dto.agreementId,
      payerId: userId,
    });

    const platformFee = this.calculatePlatformFee(dto.amount);
    const netAmount = dto.amount - platformFee;

    const payment = await this.prisma.payment.create({
      data: {
        agreementId: dto.agreementId,
        payerId: userId,
        payeeId: agreement.landlordId,
        amount: dto.amount,
        method: dto.method as any,
        status: 'PROCESSING',
        dueDate: new Date(),
        stripePaymentIntentId: result.paymentIntentId,
        platformFee,
        netAmount,
      },
    });

    return { payment, clientSecret: result.clientSecret };
  }

  async confirmPayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.stripePaymentIntentId) {
      const strategy = this.getStrategy('STRIPE');
      await strategy.confirmPayment(payment.stripePaymentIntentId);
    }

    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'COMPLETED', paidAt: new Date() },
    });
  }

  async getPaymentsByAgreement(agreementId: string, pagination: PaginationQueryDto) {
    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { agreementId },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { dueDate: 'desc' },
      }),
      this.prisma.payment.count({ where: { agreementId } }),
    ]);
    return new PaginatedResponseDto(payments, total, pagination.page, pagination.limit);
  }

  async getPaymentsByUser(userId: string, pagination: PaginationQueryDto) {
    const where = { OR: [{ payerId: userId }, { payeeId: userId }] };
    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          agreement: { select: { id: true, property: { select: { title: true } } } },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);
    return new PaginatedResponseDto(payments, total, pagination.page, pagination.limit);
  }

  async getUpcomingPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: {
        payerId: userId,
        status: 'PENDING',
        dueDate: { gte: new Date() },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
      include: {
        agreement: { select: { property: { select: { title: true, address: true } } } },
      },
    });
  }

  async handleStripeWebhook(event: any) {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        await this.prisma.payment.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: { status: 'COMPLETED', paidAt: new Date() },
        });
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        await this.prisma.payment.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: { status: 'FAILED', failureReason: paymentIntent.last_payment_error?.message },
        });
        break;
      }
    }
  }

  calculatePlatformFee(amount: number): number {
    return Number(((amount * PLATFORM_FEE_BPS) / 10000).toFixed(2));
  }

  async getPaymentStats(userId: string) {
    const [totalPaid, totalReceived, pending] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { payerId: userId, status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.payment.aggregate({
        where: { payeeId: userId, status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.payment.count({
        where: { OR: [{ payerId: userId }, { payeeId: userId }], status: 'PENDING' },
      }),
    ]);

    return {
      totalPaid: totalPaid._sum.amount || 0,
      totalPaidCount: totalPaid._count,
      totalReceived: totalReceived._sum.amount || 0,
      totalReceivedCount: totalReceived._count,
      pendingCount: pending,
    };
  }
}

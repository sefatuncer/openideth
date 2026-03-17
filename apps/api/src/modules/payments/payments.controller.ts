import {
  Controller, Get, Post, Body, Param, Query, UseGuards, Req, RawBodyRequest,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { StripePaymentStrategy } from './strategies/stripe-payment.strategy';
import { CreatePaymentDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private stripeStrategy: StripePaymentStrategy,
  ) {}

  @Post('stripe/create-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe payment intent' })
  async createStripeIntent(@CurrentUser() user: any, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPayment(user.id, { ...dto, method: 'STRIPE' });
  }

  @Post('stripe/confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm payment' })
  async confirmPayment(@Body('paymentId') paymentId: string) {
    return this.paymentsService.confirmPayment(paymentId);
  }

  @Post('crypto/initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate crypto payment (placeholder)' })
  async initiateCrypto(@CurrentUser() user: any, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPayment(user.id, { ...dto, method: dto.method });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my payments' })
  async getPayments(@CurrentUser() user: any, @Query() pagination: PaginationQueryDto) {
    return this.paymentsService.getPaymentsByUser(user.id, pagination);
  }

  @Get('upcoming')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get upcoming payments' })
  async getUpcoming(@CurrentUser() user: any) {
    return this.paymentsService.getUpcomingPayments(user.id);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment statistics' })
  async getStats(@CurrentUser() user: any) {
    return this.paymentsService.getPaymentStats(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment details' })
  async getPayment(@Param('id') id: string) {
    return this.paymentsService.confirmPayment(id);
  }

  @Post('stripe/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async stripeWebhook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['stripe-signature'] as string;
    const event = await this.stripeStrategy.constructWebhookEvent(req.rawBody!, signature);
    await this.paymentsService.handleStripeWebhook(event);
    return { received: true };
  }
}

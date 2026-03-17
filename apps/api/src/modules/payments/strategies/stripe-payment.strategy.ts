import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { IPaymentStrategy, PaymentResult } from '../interfaces/payment-strategy.interface';
import { PLATFORM_FEE_BPS } from '@openideth/shared';

@Injectable()
export class StripePaymentStrategy implements IPaymentStrategy {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY', ''), {
      apiVersion: '2025-02-24.acacia' as any,
    });
  }

  async createPayment(
    amount: number,
    currency: string,
    metadata?: Record<string, string>,
  ): Promise<PaymentResult> {
    const amountInCents = Math.round(amount * 100);
    const platformFee = Math.round((amountInCents * PLATFORM_FEE_BPS) / 10000);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: metadata || {},
      application_fee_amount: platformFee,
    });

    return {
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret || undefined,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
    return {
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    };
  }

  async refundPayment(paymentIntentId: string, amount?: number): Promise<PaymentResult> {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
    return {
      paymentIntentId,
      status: refund.status || 'refunded',
    };
  }

  async constructWebhookEvent(payload: Buffer, signature: string): Promise<Stripe.Event> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET', '');
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}

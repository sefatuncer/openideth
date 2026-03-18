import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { IPaymentStrategy, PaymentResult } from '../interfaces/payment-strategy.interface';
import { PLATFORM_FEE_BPS } from '@openideth/shared';

@Injectable()
export class StripePaymentStrategy implements IPaymentStrategy {
  private readonly logger = new Logger(StripePaymentStrategy.name);
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

    const params: Stripe.PaymentIntentCreateParams = {
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: metadata || {},
    };

    // If connected account specified, use destination charge
    const connectedAccountId = metadata?.stripeConnectedAccountId;
    if (connectedAccountId) {
      params.transfer_data = { destination: connectedAccountId };
      params.application_fee_amount = platformFee;
    }

    const paymentIntent = await this.stripe.paymentIntents.create(params);

    return {
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret || undefined,
    };
  }

  async createConnectAccount(email: string, businessType = 'individual'): Promise<string> {
    const account = await this.stripe.accounts.create({
      type: 'express',
      email,
      business_type: businessType as Stripe.AccountCreateParams.BusinessType,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    return account.id;
  }

  async createAccountLink(accountId: string, refreshUrl: string, returnUrl: string): Promise<string> {
    const link = await this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
    return link.url;
  }

  async getAccountStatus(accountId: string): Promise<{ chargesEnabled: boolean; payoutsEnabled: boolean }> {
    const account = await this.stripe.accounts.retrieve(accountId);
    return {
      chargesEnabled: account.charges_enabled ?? false,
      payoutsEnabled: account.payouts_enabled ?? false,
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

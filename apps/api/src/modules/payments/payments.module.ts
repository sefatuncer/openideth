import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { StripePaymentStrategy } from './strategies/stripe-payment.strategy';
import { CryptoPaymentStrategy } from './strategies/crypto-payment.strategy';

@Module({
  providers: [PaymentsService, StripePaymentStrategy, CryptoPaymentStrategy],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}

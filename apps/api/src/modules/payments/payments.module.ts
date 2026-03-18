import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { StripePaymentStrategy } from './strategies/stripe-payment.strategy';
import { CryptoPaymentStrategy } from './strategies/crypto-payment.strategy';
import { BlockchainService } from '../../common/services/blockchain.service';

@Module({
  providers: [PaymentsService, StripePaymentStrategy, CryptoPaymentStrategy, BlockchainService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}

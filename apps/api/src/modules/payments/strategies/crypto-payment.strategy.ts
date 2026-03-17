import { Injectable, NotImplementedException } from '@nestjs/common';
import { IPaymentStrategy, PaymentResult } from '../interfaces/payment-strategy.interface';

@Injectable()
export class CryptoPaymentStrategy implements IPaymentStrategy {
  async createPayment(): Promise<PaymentResult> {
    throw new NotImplementedException('Crypto payments will be available in Phase 3');
  }

  async confirmPayment(): Promise<PaymentResult> {
    throw new NotImplementedException('Crypto payments will be available in Phase 3');
  }

  async refundPayment(): Promise<PaymentResult> {
    throw new NotImplementedException('Crypto payments will be available in Phase 3');
  }
}

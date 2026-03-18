import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { IPaymentStrategy, PaymentResult } from '../interfaces/payment-strategy.interface';
import { BlockchainService } from '../../../common/services/blockchain.service';

@Injectable()
export class CryptoPaymentStrategy implements IPaymentStrategy {
  private readonly logger = new Logger(CryptoPaymentStrategy.name);

  constructor(private blockchain: BlockchainService) {}

  async createPayment(
    amount: number,
    currency: string,
    metadata?: Record<string, string>,
  ): Promise<PaymentResult> {
    if (!this.blockchain.isEnabled() || !this.blockchain.paymentProcessor) {
      return { status: 'pending', paymentIntentId: `crypto_${Date.now()}` };
    }

    const agreementId = metadata?.agreementId ? BigInt(metadata.agreementId) : 0n;
    const payee = metadata?.payeeAddress || ethers.ZeroAddress;
    const amountWei = ethers.parseEther(amount.toString());

    try {
      const tx = await this.blockchain.paymentProcessor!.payRent(agreementId, payee, {
        value: amountWei,
      });
      this.logger.log(`Crypto payment initiated: ${tx.hash}`);

      return {
        paymentIntentId: tx.hash,
        status: 'processing',
      };
    } catch (error) {
      this.logger.error(`Crypto payment failed: ${error}`);
      return { status: 'failed' };
    }
  }

  async confirmPayment(txHash: string): Promise<PaymentResult> {
    if (!this.blockchain.isEnabled()) {
      return { status: 'completed', paymentIntentId: txHash };
    }

    try {
      const provider = (this.blockchain as any).provider;
      if (!provider) return { status: 'failed', paymentIntentId: txHash };

      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt) return { status: 'processing', paymentIntentId: txHash };

      return {
        paymentIntentId: txHash,
        status: receipt.status === 1 ? 'completed' : 'failed',
      };
    } catch (error) {
      this.logger.error(`Failed to confirm crypto payment: ${error}`);
      return { status: 'failed', paymentIntentId: txHash };
    }
  }

  async refundPayment(txHash: string): Promise<PaymentResult> {
    this.logger.warn(`Crypto refund requested for ${txHash} — use escrow dispute resolution`);
    return { status: 'failed', paymentIntentId: txHash };
  }
}

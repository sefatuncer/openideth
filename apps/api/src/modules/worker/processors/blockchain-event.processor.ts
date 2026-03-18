import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../../common/prisma/prisma.service';

export enum BlockchainEventType {
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
  ESCROW_DEPOSITED = 'ESCROW_DEPOSITED',
  ESCROW_RELEASED = 'ESCROW_RELEASED',
  AGREEMENT_SIGNED = 'AGREEMENT_SIGNED',
  PROPERTY_REGISTERED = 'PROPERTY_REGISTERED',
}

interface BlockchainEventJobData {
  type: BlockchainEventType;
  txHash: string;
  blockNumber: number;
  data: Record<string, unknown>;
}

@Processor('blockchain-event')
export class BlockchainEventProcessor {
  private readonly logger = new Logger(BlockchainEventProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process()
  async handleBlockchainEvent(job: Job<BlockchainEventJobData>) {
    const { type, txHash, blockNumber, data } = job.data;
    this.logger.log(`Processing blockchain event: ${type} (tx: ${txHash}, block: ${blockNumber})`);

    switch (type) {
      case BlockchainEventType.PAYMENT_CONFIRMED:
        await this.handlePaymentConfirmed(txHash, data);
        break;
      case BlockchainEventType.ESCROW_DEPOSITED:
        await this.handleEscrowDeposited(txHash, data);
        break;
      case BlockchainEventType.ESCROW_RELEASED:
        await this.handleEscrowReleased(data);
        break;
      case BlockchainEventType.AGREEMENT_SIGNED:
        await this.handleAgreementSigned(txHash, data);
        break;
      case BlockchainEventType.PROPERTY_REGISTERED:
        await this.handlePropertyRegistered(txHash, data);
        break;
      default:
        this.logger.warn(`Unknown blockchain event type: ${type}`);
    }
  }

  private async handlePaymentConfirmed(txHash: string, data: Record<string, unknown>) {
    const paymentId = data.paymentId as string;
    if (!paymentId) return;

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        blockchainTxHash: txHash,
        blockchainConfirmations: (data.confirmations as number) || 1,
        paidAt: new Date(),
      },
    });
    this.logger.log(`Payment ${paymentId} confirmed on-chain`);
  }

  private async handleEscrowDeposited(txHash: string, data: Record<string, unknown>) {
    const escrowId = data.escrowId as string;
    if (!escrowId) return;

    await this.prisma.escrowDeposit.update({
      where: { id: escrowId },
      data: { blockchainTxHash: txHash, depositedAt: new Date() },
    });
    this.logger.log(`Escrow ${escrowId} deposit recorded on-chain`);
  }

  private async handleEscrowReleased(data: Record<string, unknown>) {
    const escrowId = data.escrowId as string;
    if (!escrowId) return;

    await this.prisma.escrowDeposit.update({
      where: { id: escrowId },
      data: { status: 'RELEASED', releasedAt: new Date() },
    });
    this.logger.log(`Escrow ${escrowId} released on-chain`);
  }

  private async handleAgreementSigned(txHash: string, data: Record<string, unknown>) {
    const agreementId = data.agreementId as string;
    if (!agreementId) return;

    await this.prisma.rentalAgreement.update({
      where: { id: agreementId },
      data: { blockchainTxHash: txHash },
    });
    this.logger.log(`Agreement ${agreementId} signed on-chain`);
  }

  private async handlePropertyRegistered(txHash: string, data: Record<string, unknown>) {
    const propertyId = data.propertyId as string;
    const registryId = data.registryId as string;
    if (!propertyId) return;

    await this.prisma.property.update({
      where: { id: propertyId },
      data: { blockchainRegistryId: registryId || txHash },
    });
    this.logger.log(`Property ${propertyId} registered on-chain`);
  }
}

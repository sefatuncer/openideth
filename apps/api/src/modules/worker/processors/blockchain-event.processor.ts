import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

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

  @Process()
  async handleBlockchainEvent(job: Job<BlockchainEventJobData>) {
    const { type, txHash, blockNumber } = job.data;
    this.logger.log(`Processing blockchain event: ${type} (tx: ${txHash}, block: ${blockNumber})`);

    // Placeholder — blockchain event listeners will be implemented
    // when the smart contracts are integrated with the backend.
    // Each event type will update the corresponding database records:
    // - PAYMENT_CONFIRMED: Update payment status + confirmations
    // - ESCROW_DEPOSITED: Create/update escrow deposit record
    // - ESCROW_RELEASED: Update escrow status to released
    // - AGREEMENT_SIGNED: Update agreement signature status
    // - PROPERTY_REGISTERED: Update property blockchain registry ID

    switch (type) {
      case BlockchainEventType.PAYMENT_CONFIRMED:
        this.logger.log(`Payment confirmed on-chain: ${txHash}`);
        break;
      case BlockchainEventType.ESCROW_DEPOSITED:
        this.logger.log(`Escrow deposited on-chain: ${txHash}`);
        break;
      case BlockchainEventType.ESCROW_RELEASED:
        this.logger.log(`Escrow released on-chain: ${txHash}`);
        break;
      case BlockchainEventType.AGREEMENT_SIGNED:
        this.logger.log(`Agreement signed on-chain: ${txHash}`);
        break;
      case BlockchainEventType.PROPERTY_REGISTERED:
        this.logger.log(`Property registered on-chain: ${txHash}`);
        break;
      default:
        this.logger.warn(`Unknown blockchain event type: ${type}`);
    }
  }
}

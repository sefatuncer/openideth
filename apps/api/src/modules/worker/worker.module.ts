import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailProcessor } from './processors/email.processor';
import { PaymentReminderProcessor } from './processors/payment-reminder.processor';
import { BlockchainEventProcessor } from './processors/blockchain-event.processor';

export const QUEUES = {
  EMAIL: 'email',
  PAYMENT_REMINDER: 'payment-reminder',
  BLOCKCHAIN_EVENT: 'blockchain-event',
} as const;

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUES.EMAIL },
      { name: QUEUES.PAYMENT_REMINDER },
      { name: QUEUES.BLOCKCHAIN_EVENT },
    ),
  ],
  providers: [EmailProcessor, PaymentReminderProcessor, BlockchainEventProcessor],
  exports: [BullModule],
})
export class WorkerModule {}

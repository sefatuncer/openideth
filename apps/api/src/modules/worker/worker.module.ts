import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailService } from '../../common/services/email.service';
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
  providers: [EmailService, EmailProcessor, PaymentReminderProcessor, BlockchainEventProcessor],
  exports: [BullModule, EmailService],
})
export class WorkerModule {}

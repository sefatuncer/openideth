import { Process, Processor, InjectQueue } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { EmailJobType } from './email.processor';

interface PaymentReminderJobData {
  daysBeforeDue: number;
}

@Processor('payment-reminder')
export class PaymentReminderProcessor {
  private readonly logger = new Logger(PaymentReminderProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {}

  @Process()
  async handlePaymentReminder(job: Job<PaymentReminderJobData>) {
    const { daysBeforeDue } = job.data;
    this.logger.log(`Checking for payments due in ${daysBeforeDue} days`);

    const now = new Date();
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + daysBeforeDue);

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const upcomingPayments = await this.prisma.payment.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        payer: { select: { id: true, email: true, name: true } },
        agreement: {
          include: {
            property: { select: { title: true } },
          },
        },
      },
    });

    this.logger.log(`Found ${upcomingPayments.length} payments due in ${daysBeforeDue} days`);

    for (const payment of upcomingPayments) {
      // Create notification
      await this.prisma.notification.create({
        data: {
          userId: payment.payer.id,
          type: 'PAYMENT_DUE',
          title: `Payment Due${daysBeforeDue === 0 ? ' Today' : ` in ${daysBeforeDue} day${daysBeforeDue > 1 ? 's' : ''}`}`,
          message: `Your rent payment of $${payment.amount} for ${payment.agreement.property.title} is due${daysBeforeDue === 0 ? ' today' : ` on ${payment.dueDate.toLocaleDateString()}`}.`,
          data: {
            paymentId: payment.id,
            agreementId: payment.agreementId,
            amount: payment.amount.toString(),
          },
        },
      });

      // Queue email
      await this.emailQueue.add({
        type: EmailJobType.PAYMENT_REMINDER,
        to: payment.payer.email,
        subject: `Payment Reminder: Rent due${daysBeforeDue === 0 ? ' today' : ` in ${daysBeforeDue} days`}`,
        templateData: {
          name: payment.payer.name,
          amount: payment.amount.toString(),
          propertyTitle: payment.agreement.property.title,
          dueDate: payment.dueDate.toISOString(),
          daysBeforeDue,
        },
      });
    }
  }
}

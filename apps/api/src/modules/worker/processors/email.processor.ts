import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

export enum EmailJobType {
  PAYMENT_REMINDER = 'PAYMENT_REMINDER',
  AGREEMENT_NOTIFICATION = 'AGREEMENT_NOTIFICATION',
  KYC_STATUS = 'KYC_STATUS',
  WELCOME = 'WELCOME',
}

interface EmailJobData {
  type: EmailJobType;
  to: string;
  subject: string;
  templateData: Record<string, unknown>;
}

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  @Process()
  async handleEmail(job: Job<EmailJobData>) {
    const { type, to, subject, templateData } = job.data;
    this.logger.log(`Processing email job: ${type} to ${to}`);

    switch (type) {
      case EmailJobType.PAYMENT_REMINDER:
        await this.sendPaymentReminder(to, subject, templateData);
        break;
      case EmailJobType.AGREEMENT_NOTIFICATION:
        await this.sendAgreementNotification(to, subject, templateData);
        break;
      case EmailJobType.KYC_STATUS:
        await this.sendKycStatusUpdate(to, subject, templateData);
        break;
      case EmailJobType.WELCOME:
        await this.sendWelcomeEmail(to, subject, templateData);
        break;
      default:
        this.logger.warn(`Unknown email job type: ${type}`);
    }
  }

  private async sendPaymentReminder(
    to: string,
    subject: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    // TODO: Integrate with SMTP transport (nodemailer)
    this.logger.log(`[PAYMENT_REMINDER] To: ${to}, Subject: ${subject}, Data: ${JSON.stringify(data)}`);
  }

  private async sendAgreementNotification(
    to: string,
    subject: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    this.logger.log(`[AGREEMENT_NOTIFICATION] To: ${to}, Subject: ${subject}, Data: ${JSON.stringify(data)}`);
  }

  private async sendKycStatusUpdate(
    to: string,
    subject: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    this.logger.log(`[KYC_STATUS] To: ${to}, Subject: ${subject}, Data: ${JSON.stringify(data)}`);
  }

  private async sendWelcomeEmail(
    to: string,
    subject: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    this.logger.log(`[WELCOME] To: ${to}, Subject: ${subject}, Data: ${JSON.stringify(data)}`);
  }
}

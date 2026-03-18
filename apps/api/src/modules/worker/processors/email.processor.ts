import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EmailService } from '../../../common/services/email.service';
import {
  welcomeTemplate,
  paymentReminderTemplate,
  agreementNotificationTemplate,
  kycStatusTemplate,
} from '../../../common/services/email-templates';

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

  constructor(private readonly emailService: EmailService) {}

  @Process()
  async handleEmail(job: Job<EmailJobData>) {
    const { type, to, subject, templateData } = job.data;
    this.logger.log(`Processing email job: ${type} to ${to}`);

    let html: string;

    switch (type) {
      case EmailJobType.WELCOME:
        html = welcomeTemplate(templateData.name as string);
        break;
      case EmailJobType.PAYMENT_REMINDER:
        html = paymentReminderTemplate(
          templateData.name as string,
          templateData.amount as string,
          templateData.dueDate as string,
          templateData.propertyTitle as string,
        );
        break;
      case EmailJobType.AGREEMENT_NOTIFICATION:
        html = agreementNotificationTemplate(
          templateData.name as string,
          templateData.propertyTitle as string,
          templateData.action as string,
        );
        break;
      case EmailJobType.KYC_STATUS:
        html = kycStatusTemplate(
          templateData.name as string,
          templateData.status as string,
          templateData.reason as string | undefined,
        );
        break;
      default:
        this.logger.warn(`Unknown email job type: ${type}`);
        return;
    }

    await this.emailService.sendMail(to, subject, html);
  }
}

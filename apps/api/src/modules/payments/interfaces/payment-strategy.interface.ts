export interface PaymentResult {
  paymentIntentId?: string;
  status: string;
  clientSecret?: string;
}

export interface IPaymentStrategy {
  createPayment(amount: number, currency: string, metadata?: Record<string, string>): Promise<PaymentResult>;
  confirmPayment(paymentIntentId: string): Promise<PaymentResult>;
  refundPayment(paymentIntentId: string, amount?: number): Promise<PaymentResult>;
}

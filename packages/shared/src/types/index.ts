export enum UserRole {
  TENANT = "TENANT",
  LANDLORD = "LANDLORD",
  ADMIN = "ADMIN",
}

export enum AgreementStatus {
  DRAFT = "DRAFT",
  PENDING_SIGNATURE = "PENDING_SIGNATURE",
  ACTIVE = "ACTIVE",
  TERMINATED = "TERMINATED",
  EXPIRED = "EXPIRED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum PaymentMethod {
  STRIPE = "STRIPE",
  ETH = "ETH",
  USDT = "USDT",
}

export enum EscrowStatus {
  HELD = "HELD",
  RELEASED = "RELEASED",
  REFUNDED = "REFUNDED",
  DISPUTED = "DISPUTED",
}

export enum KycStatus {
  NOT_STARTED = "NOT_STARTED",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum PropertyStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  RENTED = "RENTED",
}

export enum PropertyType {
  APARTMENT = "APARTMENT",
  HOUSE = "HOUSE",
  STUDIO = "STUDIO",
  COMMERCIAL = "COMMERCIAL",
}

export enum NotificationType {
  PAYMENT_DUE = "PAYMENT_DUE",
  PAYMENT_RECEIVED = "PAYMENT_RECEIVED",
  AGREEMENT_SIGNED = "AGREEMENT_SIGNED",
  AGREEMENT_TERMINATED = "AGREEMENT_TERMINATED",
  KYC_UPDATE = "KYC_UPDATE",
  ESCROW_UPDATE = "ESCROW_UPDATE",
  SYSTEM = "SYSTEM",
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

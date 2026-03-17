/** Platform fee in basis points (2.5%) */
export const PLATFORM_FEE_BPS = 250;

/** Reward token amounts for various actions */
export const REWARD_AMOUNTS = {
  ON_TIME_PAYMENT: 10,
  KYC_COMPLETE: 50,
  REFERRAL: 25,
  FIRST_LISTING: 20,
} as const;

/** Maximum file upload size in bytes (10MB) */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Supported image MIME types for uploads */
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** Default pagination limit */
export const PAGINATION_DEFAULT_LIMIT = 20;

/** Maximum pagination limit */
export const PAGINATION_MAX_LIMIT = 100;

/** Minimum password length */
export const PASSWORD_MIN_LENGTH = 8;

/** Default JWT access token expiration */
export const JWT_DEFAULT_EXPIRATION = "15m";

/** Default JWT refresh token expiration */
export const JWT_REFRESH_DEFAULT_EXPIRATION = "7d";

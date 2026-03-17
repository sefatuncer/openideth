import { z } from "zod";
import { PaymentMethod, PropertyType, UserRole } from "../types";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be at most 255 characters"),
  role: z.nativeEnum(UserRole),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createPropertySchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be at most 255 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(5000, "Description must be at most 5000 characters"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
  bedrooms: z.number().int().min(0, "Bedrooms must be a non-negative integer"),
  bathrooms: z
    .number()
    .int()
    .min(0, "Bathrooms must be a non-negative integer"),
  area: z.number().positive("Area must be a positive number"),
  monthlyRent: z.number().positive("Monthly rent must be a positive number"),
  depositAmount: z
    .number()
    .nonnegative("Deposit amount must be non-negative"),
  propertyType: z.nativeEnum(PropertyType),
  amenities: z.array(z.string()).optional(),
});

export const createAgreementSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID"),
  tenantId: z.string().uuid("Invalid tenant ID"),
  startDate: z.string().datetime("Invalid start date"),
  endDate: z.string().datetime("Invalid end date"),
  monthlyRent: z.number().positive("Monthly rent must be a positive number"),
  depositAmount: z
    .number()
    .nonnegative("Deposit amount must be non-negative"),
  terms: z.string().optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

export const createPaymentSchema = z.object({
  agreementId: z.string().uuid("Invalid agreement ID"),
  amount: z.number().positive("Amount must be a positive number"),
  method: z.nativeEnum(PaymentMethod),
});

export const createReviewSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const propertySearchSchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  bedrooms: z.number().int().optional(),
  propertyType: z.nativeEnum(PropertyType).optional(),
  sortBy: z.enum(["price", "createdAt", "area"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type CreateAgreementInput = z.infer<typeof createAgreementSchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type PropertySearchInput = z.infer<typeof propertySearchSchema>;

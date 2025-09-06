import { z } from "zod"
import { UserRole, AccessLevel, AlertDirection, NotificationChannel } from "@/generated/prisma"

// User validations
export const createUserSchema = z.object({
  email: z.string().email("Email non valida"),
  name: z.string().min(1, "Nome richiesto"),
  password: z.string().min(6, "Password deve essere almeno 6 caratteri"),
  role: z.nativeEnum(UserRole).default(UserRole.VIEWER),
})

export const updateUserSchema = z.object({
  name: z.string().min(1, "Nome richiesto").optional(),
  role: z.nativeEnum(UserRole).optional(),
})

// Property validations
export const createPropertySchema = z.object({
  name: z.string().min(1, "Nome struttura richiesto"),
  city: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  propertyType: z.string().optional(),
  ownerId: z.string().min(1, "Owner richiesto"),
  brandingLogoUrl: z.string().url().optional().or(z.literal("")),
  brandingPrimaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  brandingAccentColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  defaultTimezone: z.string().optional(),
  defaultFrequencyCron: z.string().optional(),
  defaultLookaheadDays: z.number().int().min(1).max(365).optional(),
})

export const updatePropertySchema = createPropertySchema.partial()

// Room Type validations
export const createRoomTypeSchema = z.object({
  propertyId: z.string().min(1, "Property ID richiesto"),
  name: z.string().min(1, "Nome tipologia camera richiesto"),
  code: z.string().optional(),
  capacity: z.number().int().min(1).optional(),
  active: z.boolean().default(true),
})

export const updateRoomTypeSchema = createRoomTypeSchema.partial().omit({ propertyId: true })

// Competitor validations
export const createCompetitorSchema = z.object({
  propertyId: z.string().min(1, "Property ID richiesto"),
  name: z.string().min(1, "Nome competitor richiesto"),
  baseUrl: z.string().url("URL non valido"),
  active: z.boolean().default(true),
  frequencyCron: z.string().optional(),
  timezone: z.string().optional(),
})

export const updateCompetitorSchema = createCompetitorSchema.partial().omit({ propertyId: true })

// Competitor Config validations
export const createCompetitorConfigSchema = z.object({
  competitorId: z.string().min(1, "Competitor ID richiesto"),
  roomTypeId: z.string().min(1, "Room Type ID richiesto"),
  priceSelector: z.string().optional(),
  dateSelector: z.string().optional(),
  currencySelector: z.string().optional(),
  availabilitySelector: z.string().optional(),
  notes: z.string().optional(),
})

export const updateCompetitorConfigSchema = createCompetitorConfigSchema.partial()

// Property Access validations
export const createPropertyAccessSchema = z.object({
  userId: z.string().min(1, "User ID richiesto"),
  propertyId: z.string().min(1, "Property ID richiesto"),
  level: z.nativeEnum(AccessLevel).default(AccessLevel.VIEWER),
})

export const updatePropertyAccessSchema = z.object({
  level: z.nativeEnum(AccessLevel),
})

// User Invitation validations
export const createInvitationSchema = z.object({
  email: z.string().email("Email non valida"),
  role: z.nativeEnum(UserRole).default(UserRole.VIEWER),
  propertyId: z.string().optional(),
})

// Alert Rule validations
export const createAlertRuleSchema = z.object({
  propertyId: z.string().min(1, "Property ID richiesto"),
  roomTypeId: z.string().optional(),
  competitorId: z.string().optional(),
  direction: z.nativeEnum(AlertDirection).default(AlertDirection.DOWN),
  thresholdPct: z.number().min(0.1).max(100),
  active: z.boolean().default(true),
  channels: z.array(z.nativeEnum(NotificationChannel)).default([NotificationChannel.EMAIL]),
})

export const updateAlertRuleSchema = createAlertRuleSchema.partial().omit({ propertyId: true })

// Price History validations
export const createPriceHistorySchema = z.object({
  propertyId: z.string().min(1, "Property ID richiesto"),
  competitorId: z.string().min(1, "Competitor ID richiesto"),
  roomTypeId: z.string().min(1, "Room Type ID richiesto"),
  targetDate: z.string().datetime("Data non valida"),
  price: z.number().min(0, "Prezzo deve essere positivo"),
  currency: z.string().default("EUR"),
  available: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
  source: z.string().optional(),
})

// Webhook validations (per n8n)
export const webhookPriceDataSchema = z.object({
  propertyId: z.string().min(1),
  competitorId: z.string().min(1),
  roomTypeId: z.string().min(1),
  prices: z.array(z.object({
    targetDate: z.string().datetime(),
    price: z.number().min(0),
    currency: z.string().default("EUR"),
    available: z.boolean().default(true),
  })),
  metadata: z.record(z.any()).optional(),
  source: z.string().optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>
export type CreateRoomTypeInput = z.infer<typeof createRoomTypeSchema>
export type UpdateRoomTypeInput = z.infer<typeof updateRoomTypeSchema>
export type CreateCompetitorInput = z.infer<typeof createCompetitorSchema>
export type UpdateCompetitorInput = z.infer<typeof updateCompetitorSchema>
export type CreateCompetitorConfigInput = z.infer<typeof createCompetitorConfigSchema>
export type UpdateCompetitorConfigInput = z.infer<typeof updateCompetitorConfigSchema>
export type CreatePropertyAccessInput = z.infer<typeof createPropertyAccessSchema>
export type UpdatePropertyAccessInput = z.infer<typeof updatePropertyAccessSchema>
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>
export type CreateAlertRuleInput = z.infer<typeof createAlertRuleSchema>
export type UpdateAlertRuleInput = z.infer<typeof updateAlertRuleSchema>
export type CreatePriceHistoryInput = z.infer<typeof createPriceHistorySchema>
export type WebhookPriceDataInput = z.infer<typeof webhookPriceDataSchema>

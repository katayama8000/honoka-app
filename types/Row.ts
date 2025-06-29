import type { Tables } from "./supabase";

export type Couple = Tables<"couples">;
export type Payment = Tables<"payments">;
export type Invoice = Tables<"monthly_invoices">;
export type User = Tables<"users">;
export type Subscription = Tables<"couple_subscriptions">;

// Utility functions for Supabase TypeScript compatibility
import { PostgrestFilterBuilder, SupabaseClient } from "@supabase/supabase-js";

/**
 * Type-safe from method to properly handle table types
 */
export function safeFrom<T extends Record<string, any>>(
  supabase: SupabaseClient,
  table: string
) {
  return supabase.from(table) as unknown as ReturnType<SupabaseClient['from']>;
}

/**
 * Type-safe update method for Supabase queries
 */
export function safeUpdate<T extends Record<string, any>>(
  query: PostgrestFilterBuilder<any, any, any>,
  data: Partial<T>
) {
  return query.update(data as any);
}

/**
 * Type-safe insert method for Supabase queries
 */
export function safeInsert<T extends Record<string, any>>(
  query: PostgrestFilterBuilder<any, any, any>,
  data: T | T[]
) {
  return query.insert(data as any);
}

/**
 * Type-safe RPC call
 */
export function safeRPC<T extends Record<string, any>>(
  supabase: SupabaseClient,
  functionName: string,
  params: T
) {
  return supabase.rpc(functionName, params as any);
}
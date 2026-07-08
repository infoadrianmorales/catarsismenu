// [MCP] Helper para crear un cliente Supabase autenticado como el usuario del token OAuth.
// Todas las herramientas del MCP lo usan para que RLS se aplique como ese usuario.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

// El bundle final corre en Deno (edge function); `process.env` está disponible allí.
declare const process: { env: Record<string, string | undefined> };


export function supabaseForUser(ctx: ToolContext): SupabaseClient {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function requireAdmin(ctx: ToolContext) {
  if (!ctx.isAuthenticated()) {
    return { ok: false as const, error: "No autenticado" };
  }
  const sb = supabaseForUser(ctx);
  const { data, error } = await sb.rpc("is_admin", { _user_id: ctx.getUserId() });
  if (error) return { ok: false as const, error: `Error verificando permisos: ${error.message}` };
  if (data !== true) return { ok: false as const, error: "Acceso denegado: se requiere rol admin" };
  return { ok: true as const, sb };
}

export function textError(msg: string) {
  return { content: [{ type: "text" as const, text: msg }], isError: true };
}

export function textJson(obj: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(obj, null, 2) }],
    structuredContent: { data: obj } as Record<string, unknown>,
  };
}

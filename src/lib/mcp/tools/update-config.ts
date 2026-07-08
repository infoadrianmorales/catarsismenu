// [MCP] Lee o actualiza claves de configuración global (tasa_ves, whatsapp, etc.).
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAdmin, textError, textJson } from "../supabaseClient";

export default defineTool({
  name: "update_config",
  title: "Actualizar configuración",
  description: "Lee (sin value) o actualiza (con value) una clave de configuración global de Catarsis (ej: tasa_ves, whatsapp, instagram_url).",
  inputSchema: {
    key: z.string().min(1).describe("Clave de configuración"),
    value: z.string().optional().describe("Nuevo valor. Omitir para solo leer."),
  },
  annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ key, value }, ctx) => {
    const check = await requireAdmin(ctx);
    if (!check.ok) return textError(check.error);
    if (value === undefined) {
      const { data, error } = await check.sb.from("config").select("key, value").eq("key", key).maybeSingle();
      if (error) return textError(error.message);
      return textJson(data ?? { key, value: null });
    }
    const { data, error } = await check.sb
      .from("config")
      .upsert({ key, value }, { onConflict: "key" })
      .select()
      .single();
    if (error) return textError(error.message);
    return textJson(data);
  },
});

// [MCP] Actualiza campos editables de un producto por id.
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAdmin, textError, textJson } from "../supabaseClient";

export default defineTool({
  name: "update_product",
  title: "Actualizar producto",
  description: "Modifica un producto de Catarsis (precio, nombre, descripción, activo, destacado, orden).",
  inputSchema: {
    id: z.string().uuid().describe("UUID del producto a modificar"),
    nombre: z.string().min(1).optional(),
    descripcion_corta: z.string().optional(),
    precio_usd: z.number().nonnegative().optional().describe("Precio en USD"),
    activo: z.boolean().optional(),
    destacado: z.boolean().optional(),
    orden: z.number().int().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    const check = await requireAdmin(ctx);
    if (!check.ok) return textError(check.error);
    const { id, ...patch } = input;
    const clean = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
    if (Object.keys(clean).length === 0) return textError("No se especificó ningún campo a modificar");
    const { data, error } = await check.sb.from("products").update(clean).eq("id", id).select().single();
    if (error) return textError(error.message);
    return textJson(data);
  },
});

// [MCP] Lista productos del catálogo con filtros opcionales.
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAdmin, textError, textJson } from "../supabaseClient";

export default defineTool({
  name: "list_products",
  title: "Listar productos",
  description: "Lista productos del menú de Catarsis. Permite filtrar por categoría y estado activo.",
  inputSchema: {
    categoria: z.string().optional().describe("Filtro por categoría (bebidas, hamburguesas, etc.)"),
    activo: z.boolean().optional().describe("true = solo activos, false = solo inactivos, omitir = todos"),
    limit: z.number().int().min(1).max(200).optional().describe("Máximo de resultados (default 100)"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ categoria, activo, limit }, ctx) => {
    const check = await requireAdmin(ctx);
    if (!check.ok) return textError(check.error);
    let q = check.sb
      .from("products")
      .select("id, nombre, slug, categoria, precio_usd, activo, destacado, orden, descripcion_corta")
      .order("categoria")
      .order("orden")
      .limit(limit ?? 100);
    if (categoria) q = q.eq("categoria", categoria);
    if (typeof activo === "boolean") q = q.eq("activo", activo);
    const { data, error } = await q;
    if (error) return textError(error.message);
    return textJson(data);
  },
});

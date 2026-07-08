// [MCP] Métricas de ventas: por categoría, por producto y por fuente.
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAdmin, textError, textJson } from "../supabaseClient";

export default defineTool({
  name: "get_sales_summary",
  title: "Resumen de ventas",
  description: "Métricas de ventas de Catarsis en un rango de fechas: ventas por categoría, top productos y por fuente (menú/local/etc.).",
  inputSchema: {
    days: z.number().int().min(1).max(365).optional().describe("Últimos N días (default 30). Alternativa a date_from/date_to."),
    date_from: z.string().datetime().optional().describe("ISO 8601 inicio"),
    date_to: z.string().datetime().optional().describe("ISO 8601 fin"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ days, date_from, date_to }, ctx) => {
    const check = await requireAdmin(ctx);
    if (!check.ok) return textError(check.error);
    const to = date_to ?? new Date().toISOString();
    const from = date_from ?? new Date(Date.now() - (days ?? 30) * 86400_000).toISOString();
    const [cat, prod, src] = await Promise.all([
      check.sb.rpc("get_sales_by_category", { date_from: from, date_to: to }),
      check.sb.rpc("get_product_sales_history", { date_from: from, date_to: to, category_filter: null }),
      check.sb.rpc("get_sales_by_source", { date_from: from, date_to: to }),
    ]);
    if (cat.error) return textError(cat.error.message);
    if (prod.error) return textError(prod.error.message);
    if (src.error) return textError(src.error.message);
    return textJson({
      period: { from, to },
      by_category: cat.data,
      top_products: (prod.data ?? []).slice(0, 20),
      by_source: src.data,
    });
  },
});

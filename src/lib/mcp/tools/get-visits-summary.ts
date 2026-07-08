// [MCP] Métricas de visitantes: totales, páginas populares, países y fuentes.
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAdmin, textError, textJson } from "../supabaseClient";

export default defineTool({
  name: "get_visits_summary",
  title: "Resumen de visitas",
  description: "Métricas de tráfico web de Catarsis: total de visitas, visitantes únicos, páginas más populares, países y fuentes de tráfico.",
  inputSchema: {
    days: z.number().int().min(1).max(365).optional().describe("Últimos N días (default 30)"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ days }, ctx) => {
    const check = await requireAdmin(ctx);
    if (!check.ok) return textError(check.error);
    const to = new Date().toISOString();
    const from = new Date(Date.now() - (days ?? 30) * 86400_000).toISOString();
    const [totals, pages, countries, sources] = await Promise.all([
      check.sb.rpc("get_page_views_totals", { p_start: from, p_end: to }),
      check.sb.rpc("get_popular_pages", { p_start: from, p_end: to, p_limit: 10 }),
      check.sb.rpc("get_visits_by_country", { p_start: from, p_end: to }),
      check.sb.rpc("get_visits_by_source", { p_start: from, p_end: to }),
    ]);
    for (const r of [totals, pages, countries, sources]) {
      if (r.error) return textError(r.error.message);
    }
    return textJson({
      period: { from, to },
      totals: totals.data?.[0] ?? totals.data,
      popular_pages: pages.data,
      by_country: countries.data,
      by_source: sources.data,
    });
  },
});

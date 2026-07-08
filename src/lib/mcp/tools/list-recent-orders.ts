// [MCP] Lista órdenes recientes con estado y totales.
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { requireAdmin, textError, textJson } from "../supabaseClient";

export default defineTool({
  name: "list_recent_orders",
  title: "Órdenes recientes",
  description: "Lista las órdenes más recientes de Catarsis con estado, cliente, total y método de pago.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).optional().describe("Cantidad de órdenes (default 20)"),
    status: z.enum(["NEW", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELED"]).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, status }, ctx) => {
    const check = await requireAdmin(ctx);
    if (!check.ok) return textError(check.error);
    let q = check.sb
      .from("orders")
      .select("id, order_number, created_at, status, first_name, last_name, phone, payment_method, payment_currency, total, delivery_type")
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return textError(error.message);
    return textJson(data);
  },
});

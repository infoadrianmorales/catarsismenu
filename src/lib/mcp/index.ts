// [MCP] Servidor MCP de Catarsis. Expone herramientas de métricas y edición del menú
// para clientes MCP externos (ChatGPT, Claude, Cursor, Codex, etc.) con OAuth vía Supabase.
import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProducts from "./tools/list-products";
import updateProduct from "./tools/update-product";
import getSalesSummary from "./tools/get-sales-summary";
import getVisitsSummary from "./tools/get-visits-summary";
import listRecentOrders from "./tools/list-recent-orders";
import updateConfig from "./tools/update-config";

// El issuer OAuth DEBE ser el host directo supabase.co (no el proxy .lovable.cloud).
// Se construye desde el project ref, inlined por Vite en build.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "catarsis-mcp",
  title: "Catarsis MCP",
  version: "0.1.0",
  instructions:
    "Herramientas de administración para Catarsis Drinks & Food. Permite consultar métricas de ventas y visitantes, listar y modificar productos del menú, revisar órdenes recientes y ajustar la configuración global. Todas las herramientas requieren un usuario con rol admin.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listProducts, updateProduct, getSalesSummary, getVisitsSummary, listRecentOrders, updateConfig],
});

/**
 * CONFIGURACIÓN VITE — CATARSIS DRINKS & FOOD
 * ================================================
 * 'vite build' genera la carpeta /dist que Vercel despliega.
 * 'vite preview' sirve el build localmente para pruebas.
 *
 * VARIABLES DE ENTORNO:
 * Variables con prefijo VITE_ son accesibles en el frontend.
 * Variables sin prefijo VITE_ permanecen privadas en el servidor.
 *
 * CONFIGURAR EN VERCEL ANTES DEL DEPLOY:
 * Vercel → Settings → Environment Variables:
 * - VITE_SUPABASE_URL → Project URL de Supabase
 * - VITE_SUPABASE_PUBLISHABLE_KEY → anon key de Supabase
 * - VITE_SUPABASE_PROJECT_ID → project ID de Supabase
 * ================================================
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

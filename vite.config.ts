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
  /**
   * PERFORMANCE [CODE SPLITTING]: Separa librerías en chunks
   * independientes. El navegador cachea cada chunk por separado —
   * si cambia el código de la app pero no las librerías, el
   * usuario no re-descarga todo.
   * Reduce "unused JavaScript" reportado por Lighthouse (~246 KiB).
   * Mejora Network dependency tree y cache lifetimes.
   */
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core — cambia raramente, cachear agresivamente
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          // Router — cambia raramente
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }
          // Supabase — bundle grande, separar del core
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          // Radix UI — componentes de UI pesados
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix';
          }
          // Charts — solo se usan en /admin
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/d3-')) {
            return 'vendor-charts';
          }
          // Resto de node_modules en vendor general
          if (id.includes('node_modules/')) {
            return 'vendor-misc';
          }
        },
      },
    },
    // PERFORMANCE: Alerta si algún chunk supera 400KB.
    // Un chunk muy grande indica que algo no se está
    // dividiendo correctamente.
    chunkSizeWarningLimit: 400,
  },
}));

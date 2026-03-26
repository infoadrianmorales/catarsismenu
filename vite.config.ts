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
  // CORRECCIÓN CRÍTICA [CODE-SPLITTING]:
  // La función manualChunks anterior causaba dependencias
  // circulares en el chunk de charts que rompían la
  // inicialización de módulos con ReferenceError.
  // Esta versión usa solo chunks seguros para librerías
  // que no tienen dependencias entre sí.
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 400,
  },
}));

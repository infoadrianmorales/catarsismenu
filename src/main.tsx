import { createRoot } from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
// ERROR BOUNDARY: Envuelve toda la app para capturar cualquier crash
// de render y mostrar mensaje útil en lugar de pantalla en blanco.
import { ErrorBoundary } from '@/components/ErrorBoundary';
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </HelmetProvider>
);

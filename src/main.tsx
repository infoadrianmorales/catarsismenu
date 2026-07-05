import { createRoot } from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
// ERROR BOUNDARY: Envuelve toda la app para capturar cualquier crash
// de render y mostrar mensaje útil en lugar de pantalla en blanco.
import { ErrorBoundary } from '@/components/ErrorBoundary';
// [2026-07-05] CATARSIS — Captura fbc/fbp ANTES de montar React.
// processAndCollectAllParams() setea las cookies _fbc/_fbp de forma
// SÍNCRONA (antes de su primer await interno), pero como es una
// función async, debe invocarse (no necesariamente esperarse) antes
// de que cualquier componente monte — si se llama dentro de un
// useEffect de un componente hijo (ej. MetaPixelProvider), ese hijo
// puede disparar su propio efecto (el primer PageView) ANTES que el
// efecto del padre, dejando el primer evento sin fbc/fbp.
import { initClickIdParams } from "@/lib/metaClickIds";
import App from "./App.tsx";
import "./index.css";

initClickIdParams();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </HelmetProvider>
);

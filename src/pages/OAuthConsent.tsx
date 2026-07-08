/**
 * [MCP OAUTH] Ruta de consentimiento para el servidor OAuth de Supabase.
 *
 * URL: /.lovable/oauth/consent?authorization_id=...
 * La usa cualquier cliente MCP externo (ChatGPT, Claude, Cursor...) para que el
 * usuario apruebe/rechace el acceso a su cuenta de admin de Catarsis.
 */
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck } from "lucide-react";

// La API supabase.auth.oauth aún es beta y no está tipada en el cliente.
// Envolvemos solo lo que usamos para mantener types locales.
interface OAuthDetails {
  client?: { name?: string; client_uri?: string; logo_uri?: string };
  redirect_url?: string;
  redirect_to?: string;
  scope?: string;
  scopes?: string[];
}
interface OAuthResult {
  data?: OAuthDetails | null;
  error?: { message: string } | null;
}
interface OAuthNamespace {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
  approveAuthorization: (id: string) => Promise<OAuthResult>;
  denyAuthorization: (id: string) => Promise<OAuthResult>;
}

const oauth = (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;

const OAuthConsent = () => {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<OAuthDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Falta el parámetro authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        // Preservar la URL completa de consentimiento para volver tras iniciar sesión.
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      const res = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (res.error) {
        setError(res.error.message);
        return;
      }
      const immediate = res.data?.redirect_url ?? res.data?.redirect_to;
      if (immediate && !res.data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(res.data ?? null);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  const decide = async (approve: boolean) => {
    setBusy(true);
    const res = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (res.error) {
      setBusy(false);
      setError(res.error.message);
      return;
    }
    const target = res.data?.redirect_url ?? res.data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("El servidor de autorización no devolvió una URL de redirección.");
      return;
    }
    window.location.href = target;
  };

  if (error) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No se pudo cargar la autorización</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  const clientName = details.client?.name ?? "una aplicación externa";
  const scopes = details.scopes ?? (details.scope ? details.scope.split(" ").filter(Boolean) : []);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Conectar {clientName} a Catarsis</CardTitle>
          <CardDescription>
            Esto permite que {clientName} use las herramientas de Catarsis actuando como tu usuario.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">Al aprobar, {clientName} podrá:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Consultar métricas de ventas y visitantes</li>
              <li>Listar y modificar productos del menú</li>
              <li>Ver órdenes recientes</li>
              <li>Ajustar la configuración global</li>
            </ul>
            <p className="mt-3 text-xs">
              No se omiten las políticas de acceso de la app: las herramientas solo funcionan si tu cuenta tiene rol admin.
            </p>
          </div>
          {scopes.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Permisos solicitados:</span> {scopes.join(", ")}
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" disabled={busy} onClick={() => decide(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aprobar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default OAuthConsent;

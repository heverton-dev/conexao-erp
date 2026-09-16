import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "~/core/supabase";
import {
  normalizeLinktreeTheme,
  type LinktreeColaboradorComCredencial,
  type LinktreeThemeConfig,
} from "~/features/linktree/types";
import { LinkTreeCard } from "./LinkTreeCard";
import { useParams } from "@tanstack/react-router";

export function PublicLinkTreePage() {
  const { id } = useParams({ from: "/linktree/$id" });
  const [state, setState] = useState<
    | { kind: "loading" }
    | {
        kind: "ready";
        c: LinktreeColaboradorComCredencial;
        theme: LinktreeThemeConfig;
      }
    | { kind: "inactive" }
    | { kind: "missing" }
  >({ kind: "loading" });

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: cData } = await supabase
        .from("linktree_colaboradores")
        .select(
          "*, credenciais(id, nome_completo, email_corporativo, whatsapp_corporativo, departamento)",
        )
        .eq("id", id)
        .maybeSingle();

      if (!alive) return;
      if (!cData) {
        setState({ kind: "missing" });
        return;
      }
      if (cData.status !== "ativo") {
        setState({ kind: "inactive" });
        return;
      }

      const empresaId = cData.empresa_id;
      let themeConfig: LinktreeThemeConfig | null = null;

      if (empresaId) {
        const { data: empresaTheme } = await supabase
          .from("linktree_tema_config")
          .select("config")
          .eq("id", empresaId)
          .maybeSingle();
        if (empresaTheme?.config)
          themeConfig = normalizeLinktreeTheme(empresaTheme.config);
      }

      if (!themeConfig) {
        const { data: globalTheme } = await supabase
          .from("linktree_tema_config")
          .select("config")
          .eq("id", "global")
          .maybeSingle();
        themeConfig = normalizeLinktreeTheme(globalTheme?.config);
      }

      setState({
        kind: "ready",
        c: cData as LinktreeColaboradorComCredencial,
        theme: themeConfig,
      });

      const empresa = themeConfig.institucional.nomeEmpresa?.trim();
      const consultor = cData.nome?.trim();
      if (typeof document !== "undefined") {
        document.title =
          [empresa, consultor].filter(Boolean).join(" | ") || "LinkTree";
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (state.kind === "loading") {
    return (
      <Centered>
        <Loader2 className="size-6 animate-spin text-primary" />
      </Centered>
    );
  }
  if (state.kind === "missing") {
    return (
      <Centered
        title="Cartao nao encontrado"
        message="Verifique o link com quem o compartilhou."
      />
    );
  }
  if (state.kind === "inactive") {
    return (
      <Centered
        title="Cartao indisponivel"
        message="Este LinkTree esta temporariamente inativo."
      />
    );
  }
  return <LinkTreeCard collaborator={state.c} theme={state.theme} />;
}

function Centered({
  title,
  message,
  children,
}: {
  title?: string;
  message?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      {children}
      {title && (
        <h1 className="mt-4 text-xl font-bold text-text-main">{title}</h1>
      )}
      {message && (
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}

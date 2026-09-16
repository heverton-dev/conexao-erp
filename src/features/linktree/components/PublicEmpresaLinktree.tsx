import { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { Loader2, AlertCircle } from "lucide-react";
import { EmpresaLinktreeCard } from "./EmpresaLinktreeCard";
import {
  buscarConfigPorSlug,
  listarSecoes,
  listarLinksPublicos,
  registrarClique,
} from "../services/empresa";
import { normalizeEmpresaTheme } from "../types-empresa";
import type {
  EmpresaLinktreeConfig,
  EmpresaLinktreeSection,
  EmpresaLinktreeLink,
  EmpresaLinktreeTheme,
} from "../types-empresa";

export function PublicEmpresaLinktree() {
  const { slug } = useParams({ from: "/e/$slug" });
  const [config, setConfig] = useState<EmpresaLinktreeConfig | null>(null);
  const [sections, setSections] = useState<EmpresaLinktreeSection[]>([]);
  const [links, setLinks] = useState<EmpresaLinktreeLink[]>([]);
  const [theme, setTheme] = useState<EmpresaLinktreeTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setNotFound(false);

      const cfg = await buscarConfigPorSlug(slug);
      if (!cfg) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setConfig(cfg);
      setTheme(normalizeEmpresaTheme(cfg.theme));

      const [secs, lnks] = await Promise.all([
        listarSecoes(cfg.empresa_id),
        listarLinksPublicos(cfg.empresa_id),
      ]);

      setSections(secs);
      setLinks(lnks);
      setLoading(false);
    }

    load();
  }, [slug]);

  async function handleLinkClick(link: EmpresaLinktreeLink) {
    try {
      await registrarClique(link.id, link.empresa_id);
    } catch {
      // silent
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !config || !theme) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <AlertCircle className="size-12 text-muted-foreground" />
        <h1 className="text-xl font-bold">Pagina nao encontrada</h1>
        <p className="text-sm text-muted-foreground">
          O linktree "{slug}" nao existe.
        </p>
      </div>
    );
  }

  return (
    <EmpresaLinktreeCard
      sections={sections}
      links={links}
      theme={theme}
      bio={config.bio}
      bannerUrl={config.banner_url}
      avatarUrl={config.avatar_url}
      empresaNome={theme.institucional.nomeEmpresa || undefined}
      onLinkClick={handleLinkClick}
    />
  );
}

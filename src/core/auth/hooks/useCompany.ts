import { useState, useCallback } from "react";
import { supabase } from "~/core/supabase";
import { EMPRESA_ID } from "~/config/empresa";
import type { EmpresaInfo } from "../types";

export function useCompany() {
  const [empresa, setEmpresa] = useState<EmpresaInfo | null>(null);
  const [modulosAtivos, setModulosAtivos] = useState<string[]>([]);

  const carregarEmpresa = useCallback(async () => {
    const { data: emp } = await supabase
      .from("empresas")
      .select("id, nome, slug")
      .eq("id", EMPRESA_ID)
      .single();
    if (!emp) return;

    const { data: config } = await supabase
      .from("empresas_config")
      .select("logo_url, logo_index_url, logo_app_url, favicon_url, theme")
      .eq("empresa_id", EMPRESA_ID)
      .single();

    setEmpresa({
      id: emp.id,
      nome: emp.nome,
      slug: emp.slug,
      logo_url: config?.logo_url,
      logo_index_url: config?.logo_index_url,
      logo_app_url: config?.logo_app_url,
      favicon_url: config?.favicon_url,
      theme: (config?.theme ?? {}) as Record<string, string>,
    });

    const { data: modulos } = await supabase
      .from("empresa_modulos")
      .select("modulo_key, ativo")
      .eq("empresa_id", EMPRESA_ID)
      .eq("ativo", true);

    setModulosAtivos((modulos ?? []).map((m) => m.modulo_key));
  }, []);

  return { empresa, setEmpresa, modulosAtivos, setModulosAtivos, carregarEmpresa };
}

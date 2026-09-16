import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "~/core/supabase";
import { EMPRESA_ID } from "~/config/empresa";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { MapasDistributor, MapasConsultant } from "../types";

export function useMapasDistributors() {
  const empresaId = EMPRESA_ID;
  return useQuery({
    queryKey: ["mapas", "distributors", empresaId],
    queryFn: async () => {
      let q = supabase.from("mapas_distribuidores").select("*");
      if (empresaId) q = q.eq("empresa_id", empresaId);
      const { data } = await q.order("name");
      return (data ?? []) as MapasDistributor[];
    },
    staleTime: 60_000,
  });
}

export function useMapasConsultants() {
  const empresaId = EMPRESA_ID;
  return useQuery({
    queryKey: ["mapas", "consultants", empresaId],
    queryFn: async () => {
      let q = supabase.from("mapas_consultores").select("*");
      if (empresaId) q = q.eq("empresa_id", empresaId);
      const { data } = await q.order("name");
      return (data ?? []) as MapasConsultant[];
    },
    staleTime: 60_000,
  });
}

export function useUpsertDistributor(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<MapasDistributor>) => {
      if (payload.id) {
        const { data } = await supabase
          .from("mapas_distribuidores")
          .update(payload)
          .eq("id", payload.id)
          .select()
          .single();
        dispararEventoModulo("mapas-interativos", "mapas.distribuidor.atualizado", { distribuidor_id: data.id, nome: data.name, empresa_id: data.empresa_id }).catch(() => {});
        return data as MapasDistributor;
      }
      const { data } = await supabase
        .from("mapas_distribuidores")
        .insert(payload)
        .select()
        .single();
      dispararEventoModulo("mapas-interativos", "mapas.distribuidor.criado", { distribuidor_id: data.id, nome: data.name, empresa_id: data.empresa_id }).catch(() => {});
      return data as MapasDistributor;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mapas", "distributors"] });
      onSuccess?.();
    },
  });
}

export function useDeleteDistributor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Buscar dados antes de deletar para ter info no evento
      const { data: dist } = await supabase
        .from("mapas_distribuidores")
        .select("name, empresa_id")
        .eq("id", id)
        .single();
      await supabase.from("mapas_distribuidores").delete().eq("id", id);
      if (dist) {
        dispararEventoModulo("mapas-interativos", "mapas.distribuidor.excluido", { distribuidor_id: id, nome: dist.name, empresa_id: dist.empresa_id }).catch(() => {});
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mapas", "distributors"] });
    },
  });
}

export function useUpsertConsultant(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<MapasConsultant>) => {
      if (payload.id) {
        const { data } = await supabase
          .from("mapas_consultores")
          .update(payload)
          .eq("id", payload.id)
          .select()
          .single();
        dispararEventoModulo("mapas-interativos", "mapas.consultor.atualizado", { consultor_id: data.id, nome: data.name, empresa_id: data.empresa_id }).catch(() => {});
        return data as MapasConsultant;
      }
      const { data } = await supabase
        .from("mapas_consultores")
        .insert(payload)
        .select()
        .single();
      dispararEventoModulo("mapas-interativos", "mapas.consultor.criado", { consultor_id: data.id, nome: data.name, empresa_id: data.empresa_id }).catch(() => {});
      return data as MapasConsultant;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mapas", "consultants"] });
      onSuccess?.();
    },
  });
}

export function useDeleteConsultant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: cons } = await supabase
        .from("mapas_consultores")
        .select("name, empresa_id")
        .eq("id", id)
        .single();
      await supabase.from("mapas_consultores").delete().eq("id", id);
      if (cons) {
        dispararEventoModulo("mapas-interativos", "mapas.consultor.excluido", { consultor_id: id, nome: cons.name, empresa_id: cons.empresa_id }).catch(() => {});
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mapas", "consultants"] });
    },
  });
}

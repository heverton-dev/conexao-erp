import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "~/lib/auth";
import {
  listarNotificacoes,
  marcarComoLida,
  marcarTodasComoLidas,
  contarNaoLidas,
} from "../services/notifications";

export function useNotificacoes(limit = 20) {
  const { profile } = useAuth();
  const userId = profile?.id ?? "";
  return useQuery({
    queryKey: ["funis-notificacoes", userId],
    queryFn: () => listarNotificacoes(userId, limit),
    enabled: !!userId,
  });
}

export function useContarNaoLidas() {
  const { profile } = useAuth();
  const userId = profile?.id ?? "";
  return useQuery({
    queryKey: ["funis-notificacoes-count", userId],
    queryFn: () => contarNaoLidas(userId),
    enabled: !!userId,
  });
}

export function useMarcarNotificacaoLida() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => marcarComoLida(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["funis-notificacoes"] }),
  });
}

export function useMarcarTodasLidas() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const userId = profile?.id ?? "";
  return useMutation({
    mutationFn: () => marcarTodasComoLidas(userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["funis-notificacoes"] }),
  });
}

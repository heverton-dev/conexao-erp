import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as postsService from "../services/posts.service";
import * as campaignsService from "../services/campaigns.service";

const POSTS_KEY = "mktg-meta-posts";
const CAMPANHAS_KEY = "mktg-meta-campanhas";

export function useMetaPosts(empresaId: string) {
  return useQuery({
    queryKey: [POSTS_KEY, empresaId],
    queryFn: () => postsService.listarPosts(empresaId),
    enabled: !!empresaId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCriarMetaPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: postsService.CriarPostInput) => postsService.criarPost(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POSTS_KEY] });
    },
  });
}

export function useDeletarMetaPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postsService.deletarPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POSTS_KEY] });
    },
  });
}

export function useMetaCampanhas(empresaId: string) {
  return useQuery({
    queryKey: [CAMPANHAS_KEY, empresaId],
    queryFn: () => campaignsService.listarCampanhas(empresaId),
    enabled: !!empresaId,
    staleTime: 5 * 60 * 1000,
  });
}

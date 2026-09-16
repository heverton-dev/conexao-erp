import { useQuery } from "@tanstack/react-query";
import { useAuth } from "~/lib/auth";
import {
  fetchHubLevels,
  fetchHubRanking,
  fetchHubUserBadges,
} from "../services/gamification";

export function useHubLevels() {
  const { empresa } = useAuth();
  return useQuery({
    queryKey: ["hub-levels", empresa?.id],
    queryFn: () => fetchHubLevels(),
    enabled: !!empresa?.id,
  });
}

export function useHubRanking() {
  const { empresa } = useAuth();
  return useQuery({
    queryKey: ["hub-ranking", empresa?.id],
    queryFn: () => fetchHubRanking(),
    enabled: !!empresa?.id,
  });
}

export function useHubUserBadges(userId?: string) {
  const { empresa } = useAuth();
  return useQuery({
    queryKey: ["hub-user-badges", userId, empresa?.id],
    queryFn: () => fetchHubUserBadges(userId!, empresa!.id),
    enabled: !!userId && !!empresa?.id,
  });
}

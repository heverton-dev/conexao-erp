import { useState, useEffect } from "react";
import { supabase } from "~/core/supabase";
import type { Profile } from "../types";

export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    async function fetch() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (!cancelled && !error && data) {
        setProfile(data as Profile);
      }
    }
    fetch();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { profile, setProfile };
}

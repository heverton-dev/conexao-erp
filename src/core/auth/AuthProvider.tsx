import {
  type ReactNode,
  useState,
  useEffect,
  useRef,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "~/core/supabase";
import { AuthContext } from "./useAuth";
import type { Profile } from "./types";
import { useProfile } from "./hooks/useProfile";
import { usePermissions } from "./hooks/usePermissions";
import { useRealtimePermissions } from "./hooks/useRealtimePermissions";
import { useAuthActions } from "./hooks/useAuthActions";
import { useCompany } from "./hooks/useCompany";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { profile, setProfile } = useProfile(user?.id ?? null);
  const {
    permissoes,
    setPermissoes,
    modulosAcesso,
    setModulosAcesso,
    carregarPermissoesUsuario,
  } = usePermissions();
  const { empresa, modulosAtivos, carregarEmpresa } = useCompany();
  const { login, logout, register, resetPassword, refreshPermissoes } =
    useAuthActions(user, profile, carregarPermissoesUsuario);

  // Ref sempre atualizada com o profile mais recente — usada pelo listener
  // Realtime abaixo, que só é re-inscrito quando o usuário muda (não a cada
  // render), então não pode confiar num `profile` capturado por closure.
  const profileRef = useRef<Profile | null>(null);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useRealtimePermissions(
    user?.id,
    carregarPermissoesUsuario,
    profileRef,
  );

  async function fetchProfile(userId: string): Promise<void> {
    const { data: p, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!error && p) {
      setProfile(p as Profile);
      await carregarPermissoesUsuario(userId, p.is_super_admin === true);
      await carregarEmpresa();
    }
  }

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setPermissoes(null);
        setModulosAcesso(null);
      }
      setLoading(false);
    });

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) await fetchProfile(user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deve rodar 1x no mount; funções vêm de refs/hooks estáveis
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        permissoes,
        modulosAcesso,
        empresa,
        modulosAtivos,
        loading,
        login,
        logout,
        register,
        resetPassword,
        fetchProfile,
        refreshPermissoes,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

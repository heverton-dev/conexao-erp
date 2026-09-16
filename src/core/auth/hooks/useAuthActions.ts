import toast from "react-hot-toast";
import { supabase } from "~/core/supabase";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "../types";

export function useAuthActions(
  user: User | null,
  profile: Profile | null,
  carregarPermissoesUsuario: (
    userId: string,
    isSuperAdmin: boolean,
  ) => Promise<void>,
) {
  async function login(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    toast.success("Login realizado!");
  }

  async function logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async function register(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    toast.success("Cadastro realizado! Verifique seu email.");
  }

  async function resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  function refreshPermissoes(): void {
    if (!user?.id) return;
    carregarPermissoesUsuario(
      user.id,
      profile?.is_super_admin === true,
    ).catch(() => {});
  }

  return { login, logout, register, resetPassword, refreshPermissoes };
}

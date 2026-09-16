import { supabase } from "~/core/supabase";

export type AppConfig = {
  id: string;
  key: string;
  value: string;
  description: string | null;
  type: "env" | "internal";
  updated_at: string;
  updated_by: string | null;
};

export type MockCredential = {
  id: string;
  identifier: string;
  email: string;
  password: string;
  role: "admin" | "editor" | "viewer";
  ambiente: "cadastro" | "consultor" | "tecnologia" | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type MockCredentialInput = {
  identifier: string;
  email: string;
  password: string;
  role: "admin" | "editor" | "viewer";
  ambiente?: string;
  ativo?: boolean;
};

export async function getAppConfig() {
  const { data, error } = await supabase
    .from("config_app")
    .select("*")
    .order("key");
  if (error) throw error;
  return data as AppConfig[];
}

export async function updateAppConfig(key: string, value: string) {
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("config_app")
    .upsert({ key, value, updated_by: user.user?.id || null })
    .select()
    .single();
  if (error) throw error;
  return data as AppConfig;
}

export async function listMockCredentials() {
  const { data, error } = await supabase
    .from("credenciais_mock")
    .select("*")
    .order("identifier");
  if (error) throw error;
  return data as MockCredential[];
}

export async function createMockCredential(input: MockCredentialInput) {
  const { data, error } = await supabase
    .from("credenciais_mock")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as MockCredential;
}

export async function updateMockCredential(
  id: string,
  input: Partial<MockCredentialInput>,
) {
  const { data, error } = await supabase
    .from("credenciais_mock")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as MockCredential;
}

export async function toggleMockCredential(id: string, ativo: boolean) {
  return updateMockCredential(id, { ativo });
}

export async function deleteMockCredential(id: string) {
  const { error } = await supabase
    .from("credenciais_mock")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

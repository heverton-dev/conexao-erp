import { createRoute, useNavigate } from "@tanstack/react-router";
import { rootRoute } from "./__root";
import { useEffect, useState } from "react";
import { supabase } from "~/core/supabase";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Logo } from "~/features/crm/components/Logo";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export const crmAceitarConviteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crm/aceitar-convite/$token",
  component: AceitarConvite,
});

async function sha256(input: string) {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function AceitarConvite() {
  const { token } = crmAceitarConviteRoute.useParams();
  const navigate = useNavigate();
  const [convite, setConvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const hash = await sha256(token);
        const { data } = await supabase
          .from("convites_acesso")
          .select("*")
          .eq("token_hash", hash)
          .maybeSingle();
        if (!data) {
          setErro("Convite inválido.");
          return;
        }
        if (data.status !== "pendente") {
          setErro("Este convite já foi utilizado ou revogado.");
          return;
        }
        if (new Date(data.data_expiracao) < new Date()) {
          setErro("Este convite expirou.");
          return;
        }
        setConvite(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  async function aceitar(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 8) {
      toast.error("Senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (senha !== senha2) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: convite.email_destino,
      password: senha,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          role: convite.role_atribuida,
          nome_completo:
            convite.nome_destino ?? convite.email_destino.split("@")[0],
          celular_corporativo: convite.celular_corporativo ?? "",
          gestor_id: convite.gestor_vinculado_id ?? "",
          diretor_id: convite.diretor_vinculado_id ?? "",
        },
      },
    });
    setBusy(false);
    if (error) {
      toast.error("Erro ao criar conta: " + error.message);
      return;
    }
    await supabase
      .from("convites_acesso")
      .update({ status: "utilizado" })
      .eq("id", convite.id);
    toast.success("Conta criada! Faça login.");
    navigate({ to: "/" });
  }

  return (
    <main className="content-layer flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <header className="flex flex-col items-center text-center">
          <Logo size={64} className="mb-3" />
          <h1 className="gradient-text-gold text-2xl font-bold">
            Aceitar convite
          </h1>
        </header>
        <div className="glass-strong rounded-2xl p-6 space-y-4">
          {loading && (
            <p className="text-sm text-muted-foreground">
              <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
              Validando…
            </p>
          )}
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          {!loading && !erro && convite && (
            <form onSubmit={aceitar} className="space-y-4">
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Bem-vindo(a),</p>
                <p className="font-semibold">{convite.nome_destino}</p>
                <p className="text-xs text-muted-foreground">
                  {convite.email_destino}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Confirmar senha</Label>
                <Input
                  type="password"
                  value={senha2}
                  onChange={(e) => setSenha2(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Criar acesso"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

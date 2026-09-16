import { createRoute, useNavigate } from "@tanstack/react-router";
import { rootRoute } from "./__root";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PasswordInput } from "~/components/ui/password-input";
import { useState, useEffect } from "react";
import { supabase } from "~/lib/supabase";
import { useAuth } from "~/lib/auth";
import { useEmpresaTheme } from "~/core/theme";
import {
  Loader2,
  Fingerprint,
  AlertTriangle,
  X,
  Mail,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();
  const { logoIndexUrl, empresaNome, theme } = useEmpresaTheme();
  const accentColor = theme?.accent || "#c9a655";
  const accentHover = theme?.accent_hover || "#d4b366";
  const gradStart = theme?.gradient_start || accentColor;
  const gradMid = theme?.gradient_mid || "#e8d48b";
  const gradEnd = theme?.gradient_end || "#a8873a";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Popups
  const [popup, setPopup] = useState<"inativo" | "reset" | null>(null);
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (!loading && user && !redirected) rotearPosLogin();
  }, [user, loading]);

  async function rotearPosLogin() {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (!currentUser) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("ambiente, ativo")
      .eq("id", currentUser.id)
      .single();

    if (!profile) return;
    if (profile.ativo === false) {
      setPopup("inativo");
      return;
    }

    setRedirected(true);
    const amb = profile.ambiente;
    if (amb === "consultor") navigate({ to: "/cadastros/consultor" });
    else if (amb === "tecnologia" || amb === "suporte")
      navigate({ to: "/credenciais" });
    else navigate({ to: "/cadastros/dashboard" });
  }

  async function handleLogin() {
    if (!email || !password) return;
    setSubmitting(true);
    setErrorMsg("");
    try {
      await login(email, password);
      await rotearPosLogin();
    } catch (e: any) {
      const rawMsg = e?.message;
      const msg =
        typeof rawMsg === "string" &&
        rawMsg.trim() !== "{}" &&
        rawMsg.trim() !== ""
          ? rawMsg
          : "Erro ao fazer login. Verifique suas credenciais.";

      if (
        msg.includes("Invalid login credentials") ||
        msg.includes("invalid_credentials")
      ) {
        setErrorMsg("Email ou senha inválidos.");
      } else if (msg.includes("Failed to fetch") || msg.includes("fetch")) {
        setErrorMsg("Failed to fetch");
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#040914]">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-[#040914] px-6 overflow-hidden select-none">
      {/* Luz de fundo (Glow Azul) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[390px] rounded-[2rem] bg-[#0b121f]/90 p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md">
        {/* Linha dourada brilhante superior */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] rounded-t-[2rem] opacity-80" style={{ background: `linear-gradient(to right, transparent, ${accentColor}, transparent)` }} />

        {/* Logo */}
        <div className="mx-auto mb-6 flex items-center justify-center">
          {logoIndexUrl ? (
            <img
              src={logoIndexUrl}
              className="h-16 w-auto object-contain"
              alt="Logo"
            />
          ) : (
            <img
              src="/logos/logo-vertical-branco.png"
              className="h-16 w-auto object-contain"
              alt="Logo"
            />
          )}
        </div>

        {/* Título e Subtítulo */}
        <div className="text-center mb-6 flex flex-col gap-0.5">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Entrar
          </h1>
          <span className="text-xs font-bold tracking-[0.25em] uppercase" style={{ color: accentColor }}>
            {empresaNome || "Odonto"}
          </span>
        </div>

        {/* Banner de Erro Inline */}
        {errorMsg && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-xs text-red-400 animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="flex flex-col gap-5"
        >
          <div>
            <label className="text-xs font-bold text-[#8899aa] uppercase tracking-wider mb-1.5 block">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="bg-[#131d30] border-[#1f2f4d] focus:ring-0 text-white rounded-xl placeholder-[#41536b] text-sm h-11 w-full"
              style={{ borderColor: undefined, '--tw-ring-color': accentColor + '80' } as React.CSSProperties}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#8899aa] uppercase tracking-wider mb-1.5 block">
              Senha
            </label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="bg-[#131d30] border-[#1f2f4d] text-white placeholder:text-gray-500 rounded-xl px-4 py-3 w-full outline-none transition-all pr-12"
              style={{ '--tw-ring-color': accentColor + '80' } as React.CSSProperties}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-[#0d1625] transition-all duration-300 cursor-pointer group"
            style={{
              background: `linear-gradient(to right, ${gradStart}, ${gradMid}, ${gradEnd})`,
              boxShadow: `0 4px 20px ${accentColor}33`,
            }}
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin text-[#0d1625]" />
            ) : (
              <>
                <span className="flex-1 text-center pl-4">
                  Entrar na Plataforma
                </span>
                <ChevronRight
                  size={16}
                  className="text-[#0d1625] transition-transform group-hover:translate-x-0.5"
                />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="absolute bottom-6 flex items-center justify-center gap-2 text-text-muted/20">
        <Fingerprint size={12} />
        <span className="text-[8px] tracking-[0.2em] uppercase">
          ERP Odonto
        </span>
      </div>

      {/* POPUP - INATIVO */}
      {popup === "inativo" && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-card border border-border/50 p-0 shadow-2xl shadow-black/40 max-h-[90dvh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-br from-accent/20 via-accent/10 to-transparent px-6 pt-6 pb-4 border-b border-border/50 relative">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-main tracking-tight">
                    Usuário Inativo
                  </h2>
                  <p className="text-sm text-text-muted mt-0.5">
                    Conta inativa
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPopup(null);
                  navigate({ to: "/" });
                }}
                className="absolute right-4 top-5 rounded-lg p-1.5 text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-6 flex-1 space-y-4">
              <p className="text-sm text-text-muted">
                Sua conta está inativa. Entre em contato com o administrador do
                sistema.
              </p>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end px-6 pb-6 pt-4 border-t border-border/50">
              <button
                onClick={() => {
                  supabase.auth.signOut();
                  setPopup(null);
                }}
                className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP - RESETE SENHA */}
      {popup === "reset" && <ResetSenhaPopup onClose={() => setPopup(null)} />}
    </div>
  );
}

function ResetSenhaPopup({ onClose }: { onClose: () => void }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-card border border-border/50 p-0 shadow-2xl shadow-black/40 max-h-[90dvh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-br from-accent/20 via-accent/10 to-transparent px-6 pt-6 pb-4 border-b border-border/50 relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Mail size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-main tracking-tight">
                Redefinir Senha
              </h2>
              <p className="text-sm text-text-muted mt-0.5">
                Recuperação de acesso
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 top-5 rounded-lg p-1.5 text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {sent ? (
          <>
            <div className="px-6 py-6 flex-1 space-y-4">
              <p className="text-sm text-text-muted">
                Email enviado! Verifique sua caixa de entrada e siga as
                instruções.
              </p>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end px-6 pb-6 pt-4 border-t border-border/50">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]"
              >
                Fechar
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-6 flex-1 space-y-4">
              <p className="text-sm text-text-muted">
                Digite seu email para receber o link de recuperação.
              </p>
              <Input
                id="reset-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#131d30] border-[#1f2f4d] focus:ring-0 text-white rounded-xl placeholder-[#41536b] text-sm h-11 w-full"
              />
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end px-6 pb-6 pt-4 border-t border-border/50">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px] cursor-pointer inline-flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Mail size={18} />
                )}
                Enviar link
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

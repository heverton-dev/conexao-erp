import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useState, useEffect, useCallback } from "react";
import {
  Link2, Plus, Trash2, ExternalLink, Check, X, Loader2,
  FlaskConical, Copy, Download, Clock, Database, FileText,
  Play, RefreshCw, AlertTriangle, Search, Beaker, RotateCcw,
  ShieldCheck, Lock, CheckCircle2
} from "lucide-react";
import { useAuth } from "~/lib/auth";
import { supabase } from "~/lib/supabase";
import toast from "react-hot-toast";
import { RequireSuperAdmin } from "~/components/guards";

export const adminLaboratorioRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/global/laboratorio",
  component: () => (
    <RequireSuperAdmin>
      <AdminLaboratorio />
    </RequireSuperAdmin>
  ),
});

type LinkItem = {
  id: string;
  token: string;
  pin?: string;
  descricao: string;
  tipo: string;
  url: string;
  criadoEm: string;
  serverId?: string;
  serverStatus?: string | null;
};

type Tab = "gerador" | "fluxo" | "historico";

const STORAGE_KEY = "lab_links_v2";

function carregarLinks(): LinkItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function salvarLinks(links: LinkItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

function AdminLaboratorio() {
  const { profile } = useAuth();
  if (!profile?.is_super_admin) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-8">
        <div className="text-center">
          <Link2 size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">Acesso restrito</h2>
          <p className="text-muted-foreground mt-2">Apenas Super Administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }
  return <LaboratorioPage />;
}

function LaboratorioPage() {
  const [tab, setTab] = useState<Tab>("gerador");
  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "gerador", label: "Gerador de Links", icon: Link2 },
    { key: "fluxo", label: "Teste de Fluxo", icon: Beaker },
    { key: "historico", label: "Histórico", icon: Clock },
  ];

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-2 mb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              tab === t.key
? "bg-accent text-accent-fg"
               : "bg-card text-text-muted hover:text-text-main border border-border"
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "gerador" && <GeradorTab />}
      {tab === "fluxo" && <TesteFluxoTab />}
      {tab === "historico" && <HistoricoTab />}
    </div>
  );
}

function GeradorTab() {
  const [links, setLinks] = useState<LinkItem[]>(carregarLinks);
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("PF");
  const [criando, setCriando] = useState(false);
  const [usandoServer, setUsandoServer] = useState(false);

  useEffect(() => { salvarLinks(links); }, [links]);

  const gerarLink = useCallback(async () => {
    if (!descricao.trim()) return;
    setCriando(true);
    try {
      const { data, error } = await supabase.rpc("gerar_token_teste_lab", {
        p_descricao: descricao.trim(),
        p_tipo_pessoa: tipo,
      });
      if (error) throw error;
      const r = data as any;
      const novo: LinkItem = {
        id: crypto.randomUUID(),
        token: r.token,
        pin: r.pin,
        descricao: descricao.trim(),
        tipo,
        url: `${window.location.origin}${r.url}`,
        criadoEm: new Date().toISOString(),
        serverId: r.id,
        serverStatus: "link_gerado",
      };
      setLinks((p) => [novo, ...p]);
      setDescricao("");
      setUsandoServer(true);
      toast.success("Token real criado no banco!");
    } catch {
      const token = crypto.randomUUID();
      const novo: LinkItem = {
        id: crypto.randomUUID(), token,
        descricao: descricao.trim(), tipo,
        url: `${window.location.origin}/pre-cadastro/${token}`,
        criadoEm: new Date().toISOString(),
        serverStatus: null,
      };
      setLinks((p) => [novo, ...p]);
      setDescricao("");
      toast("Token local (RPC indisponível — aplicar migration 00054)", { icon: "⚠️" });
    } finally {
      setCriando(false);
    }
  }, [descricao, tipo]);

  async function deletarLink(item: LinkItem) {
    if (item.serverId) {
      const { error } = await supabase.rpc("deletar_token_teste_lab", { p_token: item.token });
      if (error) { toast.error("Erro ao remover do banco: " + error.message); return; }
    }
    setLinks((p) => p.filter((l) => l.id !== item.id));
    toast.success("Link removido");
  }

  function limparTudo() {
    setLinks([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  async function copiarTodos() {
    const txt = links.map((l) => `${l.descricao}\t${l.url}`).join("\n");
    await navigator.clipboard.writeText(txt);
    toast.success(`${links.length} link(s) copiados`);
  }

  function exportarJSON() {
    const blob = new Blob([JSON.stringify(links, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `lab-links-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-xl bg-card p-5 shadow-lg border border-border">
      <h2 className="text-sm font-bold text-text-main flex items-center gap-2 mb-4">
        <Link2 size={16} className="text-accent" /> Links de Teste - Pré-Cadastro
      </h2>

      <div className="flex flex-col gap-3 md:flex-row items-end mb-4 bg-input-bg p-3 rounded-lg border border-input-border">
        <div className="flex-1 w-full">
          <label className="text-xs text-text-muted ml-1 mb-1 block">Descrição do Teste</label>
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && gerarLink()}
            placeholder="Ex: QA Pessoa Física" disabled={criando}
            className="w-full rounded-xl border border-input-border bg-bg-dark px-3 py-2 text-sm text-text-main outline-none focus:border-accent disabled:opacity-50" />
        </div>
        <div className="w-full md:w-32">
          <label className="text-xs text-text-muted ml-1 mb-1 block">Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} disabled={criando}
            className="w-full rounded-xl border border-input-border bg-bg-dark px-3 py-2 text-sm text-text-main outline-none focus:border-accent">
            <option value="PF">Física</option>
            <option value="PJ">Jurídica</option>
          </select>
        </div>
        <button onClick={gerarLink} disabled={!descricao.trim() || criando}
          className="flex items-center justify-center gap-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50 cursor-pointer">
          {criando ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {criando ? "Criando..." : "Gerar Link"}
        </button>
      </div>

      {links.length > 0 && (
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <span className="text-xs text-text-muted">
            {links.length} link(s) {usandoServer && "(tokens reais no banco)"}
          </span>
          <div className="flex gap-2">
            <button onClick={copiarTodos}
              className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 px-2 py-1 rounded-lg bg-accent/10 cursor-pointer">
              <Copy size={12} /> Copiar todos
            </button>
            <button onClick={exportarJSON}
              className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 px-2 py-1 rounded-lg bg-accent/10 cursor-pointer">
              <Download size={12} /> Exportar JSON
            </button>
            <button onClick={limparTudo}
              className="text-xs text-red-400 hover:text-red-300 cursor-pointer">
              Limpar tudo
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {links.length === 0 ? (
          <p className="text-xs text-text-muted py-4 text-center">
            Nenhum link gerado. Links ficam salvos no navegador mesmo após recarregar.
          </p>
        ) : (
          links.map((link) => (
            <LinkCard key={link.id} link={link}
              onDelete={() => deletarLink(link)} />
          ))
        )}
      </div>
    </div>
  );
}

function LinkCard({ link, onDelete }: { link: LinkItem; onDelete: () => void }) {
  const [validando, setValidando] = useState(false);
  const [health, setHealth] = useState<any>(null);

  async function checkHealth() {
    setValidando(true);
    setHealth(null);
    try {
      const { data } = await supabase.rpc("validar_token_teste_lab", {
        p_token: link.token,
      });
      setHealth(data || { existe: false });
    } catch {
      // fallback: query direta
      try {
        const { data } = await supabase.from("cadastros")
          .select("id, status, link_acessado, inicio_preenchimento, data_finalizacao")
          .eq("token_acesso", link.token).maybeSingle();
        setHealth(data ? { existe: true, ...data } : { existe: false });
      } catch {
        setHealth({ existe: false, erro: "consulta_falhou" });
      }
    } finally {
      setValidando(false);
    }
  }

  const statusBadge = health?.existe ? (
    health.status === "link_gerado" ? "bg-blue-500/20 text-blue-400" :
    health.status === "dados_enviados" ? "bg-yellow-500/20 text-yellow-400" :
    health.status === "em_analise" ? "bg-purple-500/20 text-purple-400" :
    health.status === "aprovado" ? "bg-green-500/20 text-green-400" :
    health.status === "reprovado" ? "bg-red-500/20 text-red-400" :
    health.expirado ? "bg-gray-500/20 text-gray-400" : "bg-gray-500/20 text-gray-400"
  ) : "";

  return (
    <div className="rounded-lg bg-input-bg p-3 border border-border-subtle flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-text-main">{link.descricao}</p>
        <p className="text-xs text-text-muted mt-0.5">{link.tipo === "PF" ? "Física" : "Jurídica"}</p>
        <code className="text-xs text-accent font-mono block truncate mt-1">{link.url}</code>
        {link.pin && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] text-green-400">PIN:</span>
            <code className="text-xs font-mono font-bold text-green-400 tracking-widest">{link.pin}</code>
          </div>
        )}
        <p className="text-[10px] text-text-muted mt-1">{new Date(link.criadoEm).toLocaleString("pt-BR")}</p>

        {health?.existe && (
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusBadge}`}>
              {health.status?.replace(/_/g, " ")}
            </span>
            {health.link_acessado && <span className="text-[10px] text-green-400 flex items-center gap-0.5"><Check size={8} /> acessado</span>}
            {health.inicio_preenchimento && <span className="text-[10px] text-yellow-400 flex items-center gap-0.5"><Play size={8} /> preenchendo</span>}
            {health.data_finalizacao && <span className="text-[10px] text-blue-400 flex items-center gap-0.5"><FileText size={8} /> finalizado</span>}
            {health.expirado && <span className="text-[10px] text-red-400 flex items-center gap-0.5"><AlertTriangle size={8} /> expirado</span>}
          </div>
        )}

        {health && !health.existe && !health.erro && (
          <span className="text-[10px] text-red-400 flex items-center gap-0.5 mt-1"><X size={8} /> token não encontrado no banco</span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button onClick={checkHealth} disabled={validando}
          className="rounded-lg bg-blue-500/10 px-2 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer disabled:opacity-50"
          title="Ver status no banco">
          {validando ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
        </button>
        <button onClick={() => { navigator.clipboard.writeText(link.url); toast.success("URL copiada!"); }}
          className="rounded-lg bg-accent/10 px-2 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors cursor-pointer" title="Copiar">
          <Copy size={12} />
        </button>
        <button onClick={() => window.open(link.url, "_blank")}
          className="rounded-lg bg-accent/10 p-1.5 text-accent hover:bg-accent/20 transition-colors cursor-pointer" title="Abrir">
          <ExternalLink size={14} />
        </button>
        <button onClick={onDelete}
          className="rounded-lg bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer" title="Excluir">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

type WizardStep = "token" | "2fa" | "pronto";

const STEPS_WIZARD: { key: WizardStep; label: string }[] = [
  { key: "token", label: "Validar Token" },
  { key: "2fa", label: "Verificação 2FA" },
  { key: "pronto", label: "Acessar Pré-Cadastro" },
];

function TesteFluxoTab() {
  const [step, setStep] = useState<WizardStep>("token");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [pinGerado, setPinGerado] = useState<string | null>(null);
  const [skipFeito, setSkipFeito] = useState(false);

  const stepIdx = STEPS_WIZARD.findIndex((s) => s.key === step);

  async function validarToken() {
    if (!token.trim()) return;
    setLoading(true);
    setResultado(null);
    try {
      const { data, error } = await supabase.rpc("validar_token_teste_lab", { p_token: token.trim() });
      if (error) throw error;
      setResultado(data || { existe: false });
      if (data?.existe) { toast.success("Token válido!"); setStep("2fa"); }
      else toast.error("Token não encontrado no banco");
    } catch (e: any) {
      toast.error(e.message || "Erro ao validar");
      setResultado({ existe: false, erro: e.message });
    } finally {
      setLoading(false);
    }
  }

  async function gerarPin() {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("gerar_pin_teste_lab", { p_token: token.trim() });
      if (error) throw error;
      if (data?.sucesso) {
        setPinGerado(data.pin);
        toast.success("PIN gerado!");
      } else toast.error(data?.erro || "Erro ao gerar PIN");
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar PIN");
    } finally {
      setLoading(false);
    }
  }

  async function pular2FA() {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("pular_verificacao_teste_lab", { p_token: token.trim() });
      if (error) throw error;
      if (data?.sucesso) {
        setSkipFeito(true);
        setStep("pronto");
        toast.success("Verificação 2FA pulada!");
      } else toast.error(data?.erro || "Erro ao pular verificação");
    } catch (e: any) {
      toast.error(e.message || "Erro ao pular verificação");
    } finally {
      setLoading(false);
    }
  }

  function irPreCadastro() {
    window.open(`${window.location.origin}/pre-cadastro/${token}`, "_blank");
  }

  const dadosMockPF = {
    nome: "Maria Silva Teste", cpf: "529.982.247-25",
    data_nascimento: "1990-05-15",
    email_comunicacao: "maria.teste@email.com",
    celular1: "(11) 99999-8888",
  };
  const dadosMockPJ = {
    razao_social: "Odonto Teste Ltda",
    cnpj: "11.222.333/0001-44",
    nome_fantasia: "Odonto Teste",
    email_comunicacao: "teste@odonto.com.br",
    celular1: "(11) 99999-8888",
  };

  return (
    <div className="rounded-xl bg-card p-5 shadow-lg border border-border space-y-4">
      <h2 className="text-sm font-bold text-text-main flex items-center gap-2">
        <Beaker size={16} className="text-accent" /> Teste de Fluxo do Pré-Cadastro
      </h2>

      <div className="flex items-center gap-1">
        {STEPS_WIZARD.map((s, i) => (
          <div key={s.key} className="flex items-center gap-1 flex-1">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
               i === stepIdx ? "bg-accent text-white" :
               i < stepIdx ? "bg-green-500/20 text-green-400" :
               "bg-input-bg text-text-muted"
            }`}>
              {i < stepIdx ? <Check size={10} /> : i + 1}
              {s.label}
            </div>
            {i < STEPS_WIZARD.length - 1 && <div className="flex-1 h-px bg-border" />}
          </div>
        ))}
      </div>

      {step === "token" && (
        <div className="flex gap-2">
          <input value={token} onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && validarToken()}
            placeholder="Cole o token de teste..." disabled={loading}
            className="flex-1 rounded-xl border border-input-border bg-bg-dark px-3 py-2 text-sm text-text-main outline-none focus:border-accent font-mono" />
          <button onClick={validarToken} disabled={!token.trim() || loading}
            className="flex items-center gap-1 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-fg disabled:opacity-50 cursor-pointer">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Validar
          </button>
        </div>
      )}

      {step === "2fa" && resultado?.existe && (
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-input-bg p-4">
            <h3 className="text-xs font-semibold text-text-main flex items-center gap-1 mb-3">
              <ShieldCheck size={12} className="text-accent" /> Verificação 2FA
            </h3>
            <p className="text-xs text-text-muted mb-3">
              O pré-cadastro exige verificação 2FA. Escolha como prosseguir:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg bg-bg-dark p-3 border border-border-subtle">
                <p className="text-xs font-medium text-text-main mb-2">Pular verificação</p>
                <p className="text-[10px] text-text-muted mb-3">Marca o token como verificado e permite acessar o formulário diretamente.</p>
                <button onClick={pular2FA} disabled={loading}
                  className="w-full flex items-center justify-center gap-1 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-accent-fg disabled:opacity-50 cursor-pointer">
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  Pular 2FA
                </button>
              </div>
              <div className="rounded-lg bg-bg-dark p-3 border border-border-subtle">
                <p className="text-xs font-medium text-text-main mb-2">Simular 2FA</p>
                <p className="text-[10px] text-text-muted mb-3">Gera um PIN de 6 dígitos (como se fosse enviado por e-mail/WhatsApp).</p>
                <button onClick={gerarPin} disabled={loading || !!pinGerado}
                  className="w-full flex items-center justify-center gap-1 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-accent-fg disabled:opacity-50 cursor-pointer">
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <Lock size={12} />}
                  Gerar PIN
                </button>
              </div>
            </div>
            {pinGerado && (
              <div className="mt-3 rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-center">
                <p className="text-[10px] text-text-muted mb-1">PIN gerado para teste:</p>
                <p className="text-2xl font-mono font-bold text-green-400 tracking-[0.3em] select-all">{pinGerado}</p>
                <p className="text-[10px] text-text-muted mt-1">Use este PIN na tela de verificação 2FA do pré-cadastro.</p>
                <div className="flex gap-2 mt-2 justify-center">
                  <button onClick={() => { navigator.clipboard.writeText(pinGerado!); toast.success("PIN copiado!"); }}
                    className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg cursor-pointer">
                    <Copy size={11} /> Copiar PIN
                  </button>
                  <button onClick={irPreCadastro}
                    className="flex items-center gap-1 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent cursor-pointer">
                    <ExternalLink size={11} /> Abrir e Inserir PIN
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {step === "pronto" && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4 space-y-3">
          <h3 className="text-xs font-semibold text-text-main flex items-center gap-1">
            <CheckCircle2 size={12} className="text-green-400" /> Token Verificado
          </h3>
          <p className="text-xs text-text-muted">
            {skipFeito
              ? "Verificação 2FA pulada. O pré-cadastro agora aceita o token sem pedir código."
              : `PIN ${pinGerado} gerado. Use-o na tela de veritação 2FA.`}
          </p>
          <p className="text-xs text-text-muted">
            Abaixo estão dados mockados para preencher o formulário rapidamente.
          </p>
          <button onClick={irPreCadastro}
            className="flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg cursor-pointer">
            <ExternalLink size={14} /> Abrir Pré-Cadastro
          </button>
        </div>
      )}

      {resultado?.existe && (
        <div className="rounded-lg border border-border bg-input-bg p-3 text-xs">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-text-muted">Token:</span>
            <span className="text-text-main font-mono truncate">{token}</span>
            <span className="text-text-muted">Tipo:</span>
            <span className="text-text-main">{resultado.tipo_pessoa}</span>
            <span className="text-text-muted">Status:</span>
            <span className="text-text-main">{resultado.status?.replace(/_/g, " ")}</span>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-input-bg p-4 space-y-2">
        <h3 className="text-xs font-semibold text-text-main flex items-center gap-1">
          <FileText size={12} className="text-accent" /> Dados Mockados
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg bg-bg-dark p-3 border border-border-subtle">
            <p className="text-xs font-medium text-text-main mb-2">PF - Pessoa Física</p>
            <pre className="text-[10px] text-text-muted font-mono whitespace-pre-wrap">{JSON.stringify(dadosMockPF, null, 2)}</pre>
            <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(dadosMockPF, null, 2)); toast.success("Dados PF copiados!"); }}
              className="mt-2 flex items-center gap-1 text-xs text-accent cursor-pointer">
              <Copy size={10} /> Copiar
            </button>
          </div>
          <div className="rounded-lg bg-bg-dark p-3 border border-border-subtle">
            <p className="text-xs font-medium text-text-main mb-2">PJ - Pessoa Jurídica</p>
            <pre className="text-[10px] text-text-muted font-mono whitespace-pre-wrap">{JSON.stringify(dadosMockPJ, null, 2)}</pre>
            <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(dadosMockPJ, null, 2)); toast.success("Dados PJ copiados!"); }}
              className="mt-2 flex items-center gap-1 text-xs text-accent cursor-pointer">
              <Copy size={10} /> Copiar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoricoTab() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [limpando, setLimpando] = useState(false);
  const [deletando, setDeletando] = useState<string | null>(null);

  async function carregar() {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("listar_tokens_teste_lab");
      if (!error && data) setTokens(Array.isArray(data) ? data : []);
      else toast.error("Erro ao carregar histórico");
    } catch {
      toast.error("Erro ao carregar histórico");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  async function limparHistorico() {
    setLimpando(true);
    const { error } = await supabase.rpc("limpar_tokens_teste_lab");
    if (error) {
      toast.error("Erro ao limpar: " + error.message);
      setLimpando(false);
      return;
    }
    toast.success("Histórico limpo");
    carregar();
  }

  async function deletarToken(tokenId: string, token: string) {
    setDeletando(tokenId);
    const { error } = await supabase.rpc("deletar_token_teste_lab", { p_token: token });
    if (error) { toast.error("Erro ao deletar: " + error.message); setDeletando(null); return; }
    setTokens((p) => p.filter((t) => t.id !== tokenId));
    toast.success("Token removido");
    setDeletando(null);
  }

  return (
    <div className="rounded-xl bg-card p-5 shadow-lg border border-border">
      <h2 className="text-sm font-bold text-text-main flex items-center gap-2 mb-4">
        <Clock size={16} className="text-accent" /> Histórico de Tokens de Teste
      </h2>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-accent" /></div>
      ) : tokens.length === 0 ? (
        <p className="text-xs text-text-muted py-4 text-center">Nenhum token de teste encontrado no banco.</p>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-muted">{tokens.length} token(s)</span>
            <button onClick={limparHistorico}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 cursor-pointer">
              <Trash2 size={12} /> Limpar tudo
            </button>
          </div>
          {tokens.map((t: any) => (
            <div key={t.id} className="rounded-lg bg-input-bg p-3 border border-border-subtle flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text-main">{t.lead_nome || "Sem nome"}</p>
                <code className="text-[10px] text-accent font-mono block truncate">{t.token}</code>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-text-muted">{t.tipo_pessoa}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    t.status === "link_gerado" ? "bg-blue-500/20 text-blue-400" :
                    t.status === "dados_enviados" ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-500/20 text-gray-400"
                  }`}>{t.status?.replace(/_/g, " ")}</span>
                  {t.link_acessado && <span className="text-[10px] text-green-400">✓ acessado</span>}
                  {t.expirado && <span className="text-[10px] text-red-400">⚠ expirado</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => deletarToken(t.id, t.token)} disabled={deletando === t.id}
                  className="rounded-lg bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50" title="Excluir">
                  {deletando === t.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
                <button onClick={() => window.open(`/pre-cadastro/${t.token}`, "_blank")}
                  className="rounded-lg bg-accent/10 p-1.5 text-accent hover:bg-accent/20 cursor-pointer" title="Abrir">
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

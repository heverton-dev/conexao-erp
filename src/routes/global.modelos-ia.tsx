import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useAuth } from "~/lib/auth";
import { supabase } from "~/lib/supabase";
import { useState, useEffect, useCallback, type ReactNode } from "react";
import {
  BrainCircuit, RefreshCw, Loader2, ChevronDown, ExternalLink, Trophy, Search, X, Download, Volume2, VolumeX,
} from "lucide-react";
import toast from "react-hot-toast";
import { RequireSuperAdmin } from "~/components/guards";

export const globalModelosIaRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/global/modelos-ia",
  component: () => (
    <RequireSuperAdmin>
      <GlobalModelosIaPage />
    </RequireSuperAdmin>
  ),
});

type Modelo = {
  id: string;
  modelo_id: string;
  nome: string;
  provedor: string;
  modalidade: string;
  win_rate: number | null;
  top_arena: string | null;
  input_cost: number | null;
  output_cost: number | null;
  context_window: number | null;
  max_output: number | null;
  reasoning: boolean | null;
  tool_call: boolean | null;
  structured_output: boolean | null;
  temperature: boolean | null;
  open_weights: boolean | null;
  knowledge: string | null;
  release_date: string | null;
  last_updated: string | null;
  modalities_input: string | null;
  modalities_output: string | null;
  providers_count: number | null;
  created_at: string;
};

type Versao = {
  id: string;
  created_at: string;
  total_modelos: number;
};

function GlobalModelosIaPage() {
  const { profile } = useAuth();
  if (!profile?.is_super_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted">Acesso restrito a Super Admin.</p>
      </div>
    );
  }
  return <Page />;
}

function Page() {
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [versoes, setVersoes] = useState<Versao[]>([]);
  const [versaoAtiva, setVersaoAtiva] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");
  const [buscaTabela, setBuscaTabela] = useState("");
  const STORAGE_KEY = "modelos-ia-secoes";

  const [secaoAberta, setSecaoAberta] = useState<Record<string, boolean>>(
    function () {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            return { rankings: true, provedores: true, tabela: true, ...parsed };
          }
        }
      } catch (_) {}
      return { rankings: true, provedores: true, tabela: true };
    }
  );

  const SOUND_KEY = "modelos-ia-som";

  const [somAtivo, setSomAtivo] = useState<boolean>(
    function () {
      try {
        var saved = localStorage.getItem(SOUND_KEY);
        if (saved !== null) return saved === "true";
      } catch (_) {}
      return true;
    }
  );

  function toggleSom() {
    setSomAtivo(function (prev) {
      var next = !prev;
      try { localStorage.setItem(SOUND_KEY, String(next)); } catch (_) {}
      return next;
    });
  }

  function playToggleSound(abrindo: boolean) {
    if (!somAtivo) return;
    try {
      var ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "sine";
      var freqInicio = abrindo ? 600 : 300;
      var freqFim = abrindo ? 300 : 600;
      osc.frequency.setValueAtTime(freqInicio, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freqFim, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
      osc.onended = function () { ctx.close(); };
    } catch (_) {}
  }

  function toggleSecao(chave: string) {
    var abrindo = !secaoAberta[chave];
    playToggleSound(abrindo);
    setSecaoAberta(function (prev) {
      const next = { ...prev, [chave]: abrindo };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  }

  var secoesAbertas = [secaoAberta.rankings, secaoAberta.provedores, secaoAberta.tabela].filter(Boolean).length;
  var tudoAberto = secoesAbertas === 3;

  function toggleTudo() {
    var novo = !tudoAberto;
    playToggleSound(novo);
    var todas = { rankings: novo, provedores: novo, tabela: novo };
    setSecaoAberta(todas);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(todas)); } catch (_) {}
  }

  const modelosTabela = [...modelos]
    .filter((m) => {
      const termo = buscaTabela.toLowerCase();
      return (
        m.nome.toLowerCase().includes(termo) ||
        m.provedor.toLowerCase().includes(termo)
      );
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const carregarVersoes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("modelos_ia_versoes")
        .select("id, created_at, total_modelos")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setVersoes(data || []);
      if (data?.length && !versaoAtiva) {
        setVersaoAtiva(data[0].id);
      }
    } catch (e: any) {
      setErro(e.message);
    }
  }, [versaoAtiva]);

  const carregarModelos = useCallback(async (versaoId: string) => {
    if (!versaoId) return;
    setLoading(true);
    setErro("");
    try {
      const { data, error } = await supabase
        .from("modelos_ia")
        .select("*")
        .eq("versao_id", versaoId)
        .order("win_rate", { ascending: false });
      if (error) throw error;
      setModelos(data || []);
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarVersoes();
  }, []);

  useEffect(() => {
    if (versaoAtiva) carregarModelos(versaoAtiva);
  }, [versaoAtiva, carregarModelos]);

  async function handleAtualizar() {
    setAtualizando(true);
    setErro("");
    try {
      const { data, error } = await supabase.functions.invoke("fetch-modelos-ia");
      if (error) throw new Error(error.message);
      if (!data?.models?.length) throw new Error("Nenhum modelo retornado");

      const { data: versao, error: errVersao } = await supabase
        .from("modelos_ia_versoes")
        .insert({ total_modelos: data.models.length })
        .select()
        .single();
      if (errVersao) throw errVersao;

      const inserts = data.models.map((m: any) => ({
        versao_id: versao.id,
        modelo_id: m.modelo_id,
        nome: m.nome,
        provedor: m.provedor,
        modalidade: m.modalidade,
        win_rate: m.win_rate,
        top_arena: m.top_arena,
        input_cost: m.input_cost,
        output_cost: m.output_cost,
        context_window: m.context_window,
        max_output: m.max_output,
        reasoning: m.reasoning,
        tool_call: m.tool_call,
        structured_output: m.structured_output,
        temperature: m.temperature,
        open_weights: m.open_weights,
        knowledge: m.knowledge,
        release_date: m.release_date,
        last_updated: m.last_updated,
        modalities_input: m.modalities_input,
        modalities_output: m.modalities_output,
        providers_count: m.providers_count,
      }));

      const { error: errInsert } = await supabase
        .from("modelos_ia")
        .insert(inserts);
      if (errInsert) throw errInsert;

      toast.success(`${data.models.length} modelos atualizados!`);
      await carregarVersoes();
      setVersaoAtiva(versao.id);
    } catch (e: any) {
      toast.error("Erro ao atualizar: " + (e.message || "desconhecido"));
      setErro(e.message);
    } finally {
      setAtualizando(false);
    }
  }

  const rankingCodificacao = [...modelos]
    .filter((m) => m.reasoning !== false && (m.tool_call ?? true))
    .sort((a, b) => {
      const wa = a.win_rate ?? 0;
      const wb = b.win_rate ?? 0;
      if (wb !== wa) return wb - wa;
      return custoMedio(a) - custoMedio(b);
    });

  const melhorCodificacao = rankingCodificacao[0] ?? null;

  const rankingCustoBeneficio = [...modelos]
    .filter((m) => m.win_rate != null && custoMedio(m) !== Infinity)
    .sort((a, b) => {
      const scoreA = (a.win_rate ?? 0) / custoMedio(a);
      const scoreB = (b.win_rate ?? 0) / custoMedio(b);
      return scoreB - scoreA;
    });

  const melhorCustoBeneficio = rankingCustoBeneficio[0] ?? null;

  const modelosMaisCaros = [...modelos]
    .filter((m) => custoMedio(m) !== Infinity)
    .sort((a, b) => custoMedio(b) - custoMedio(a))
    .slice(0, 5);

  const versaoAtivaData = versaoAtiva
    ? versoes.find(function (v) { return v.id === versaoAtiva; })
    : null;

  function exportarCSV() {
    const cols = [
      "Modelo","Provedor","Modalidade","Win Rate","Top Arena",
      "Input $","Output $","Contexto","Max Output",
      "Reasoning","Tool Call","Open Weights","Release","Providers",
    ];
    const rows = modelosTabela.map(function (m) {
      return [
        m.nome,
        m.provedor,
        m.modalidade,
        m.win_rate != null ? m.win_rate + "%" : "",
        m.top_arena || "",
        m.input_cost != null ? m.input_cost : "",
        m.output_cost != null ? m.output_cost : "",
        m.context_window != null ? m.context_window : "",
        m.max_output != null ? m.max_output : "",
        m.reasoning === true ? "Sim" : m.reasoning === false ? "Nao" : "",
        m.tool_call === true ? "Sim" : m.tool_call === false ? "Nao" : "",
        m.open_weights === true ? "Sim" : m.open_weights === false ? "Nao" : "",
        m.release_date || "",
        m.providers_count != null ? m.providers_count : "",
      ];
    });
    let csv = cols.join(",") + "\r\n";
    for (let i = 0; i < rows.length; i++) {
      const escaped = rows[i].map(function (val) {
        return '"' + String(val).replace(/"/g, '""') + '"';
      });
      csv += escaped.join(",") + "\r\n";
    }
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelos-ia.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("CSV exportado com " + modelosTabela.length + " modelos!");
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <BrainCircuit size={24} className="text-accent" />
              Modelos de IA
            </h1>
            <p className="text-sm text-text-muted">
              Acompanhamento de modelos de IA do mercado e seus custos
            </p>
          </div>
          <div className="flex items-center gap-3">
            {versoes.length > 0 && (
              <div className="relative">
                <select
                  value={versaoAtiva}
                  onChange={(e) => setVersaoAtiva(e.target.value)}
                  className="appearance-none rounded-xl border border-input-border bg-input-bg px-3 py-2 pr-8 text-xs text-text-main outline-none focus:border-accent cursor-pointer"
                >
                  {versoes.map((v) => (
                    <option key={v.id} value={v.id}>
                      {new Date(v.created_at).toLocaleString("pt-BR")} ({v.total_modelos} modelos)
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              </div>
            )}
            <button
              onClick={toggleSom}
              title={somAtivo ? "Desativar som" : "Ativar som"}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-input-border bg-input-bg text-xs text-text-muted hover:text-text-main hover:border-accent/50 transition-colors cursor-pointer shrink-0"
            >
              {somAtivo ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
            {modelos.length > 0 && (
              <button
                onClick={toggleTudo}
                title={tudoAberto ? "Recolher todas as secoes" : "Expandir todas as secoes"}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-input-border bg-input-bg text-xs text-text-muted hover:text-text-main hover:border-accent/50 transition-colors cursor-pointer shrink-0"
              >
                <ChevronDown size={14} className={"transition-transform duration-300 " + (tudoAberto ? "rotate-180" : "")} />
                {tudoAberto ? "Recolher" : "Expandir"}
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-surface-hover text-text-muted leading-none">{secoesAbertas}/3</span>
              </button>
            )}
            <button
              onClick={handleAtualizar}
              disabled={atualizando}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-fg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 cursor-pointer"
            >
              {atualizando ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              {atualizando ? "Atualizando..." : "Atualizar"}
            </button>
          </div>
        </div>

        {erro && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4">
            <p className="text-sm text-red-400">{erro}</p>
          </div>
        )}

        {!loading && modelos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardDestaque
              titulo="Melhor para Codificacao"
              icone={<BrainCircuit size={20} className="text-emerald-400" />}
              modelo={melhorCodificacao}
              badge="Top Win Rate + Tooling"
              cor="emerald"
            />
            <CardDestaque
              titulo="Melhor Custo-Beneficio"
              icone={<BrainCircuit size={20} className="text-amber-400" />}
              modelo={melhorCustoBeneficio}
              badge="Win Rate / Custo"
              cor="amber"
            />
          </div>
        )}

        {!loading && modelos.length > 0 && (
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <button
              onClick={function () { toggleSecao("rankings"); }}
              className="w-full flex items-center justify-between p-4 hover:bg-surface-hover transition-colors duration-300 cursor-pointer text-left"
            >
              <div>
                <h3 className="text-sm font-semibold text-text-main">Rankings</h3>
                <p className="text-xs text-text-muted mt-0.5">Custo-beneficio e modelos mais caros</p>
              </div>
              <ChevronDown size={16} className={"text-text-muted shrink-0 transition-transform duration-300 " + (secaoAberta.rankings ? "rotate-180" : "")} />
            </button>
            <div
              className={"grid transition-[grid-template-rows] duration-500 ease-in-out " + (secaoAberta.rankings ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 pt-0">
                  <RankingCard
                    titulo="1. Ranking Custo-Beneficio para Codificacao"
                    descricao="Modelos com melhor relacao Win Rate / custo medio, priorizando reasoning e tool calls."
                    itens={rankingCustoBeneficio.slice(0, 10).map((m) => ({
                      modelo: m,
                      valor: "Score " + ((m.win_rate! / custoMedio(m))).toFixed(1),
                    }))}
                  />
                  <RankingCard
                    titulo="2. Modelos Mais Caros da Atualidade"
                    descricao="Top 5 modelos com maior custo medio (input + output) por 1M tokens."
                    itens={modelosMaisCaros.map((m) => ({
                      modelo: m,
                      valor: "$" + custoMedio(m).toFixed(2),
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && modelos.length > 0 && (
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <button
              onClick={function () { toggleSecao("provedores"); }}
              className="w-full flex items-center justify-between p-4 hover:bg-surface-hover transition-colors duration-300 cursor-pointer text-left"
            >
              <div>
                <h3 className="text-sm font-semibold text-text-main">Modelos por Provedor</h3>
                <p className="text-xs text-text-muted mt-0.5">{modelos.length} modelo(s) agrupados por provedor</p>
              </div>
              <ChevronDown size={16} className={"text-text-muted shrink-0 transition-transform duration-300 " + (secaoAberta.provedores ? "rotate-180" : "")} />
            </button>
            <div
              className={"grid transition-[grid-template-rows] duration-500 ease-in-out " + (secaoAberta.provedores ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
            >
              <div className="min-h-0 overflow-hidden">
                <ModelosPorProvedor modelos={modelos} noHeader />
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : modelos.length === 0 ? (
          <div className="rounded-xl bg-card border border-border p-8 text-center">
            <BrainCircuit size={48} className="mx-auto mb-3 text-text-muted" />
            <h2 className="text-lg font-semibold text-text-main mb-1">Nenhum modelo</h2>
            <p className="text-sm text-text-muted">
              Clique em "Atualizar" para buscar os modelos mais recentes do mercado.
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <button
              onClick={function () { toggleSecao("tabela"); }}
              className="w-full flex items-center justify-between p-4 hover:bg-surface-hover transition-colors duration-300 cursor-pointer text-left"
            >
              <div>
                <h3 className="text-sm font-semibold text-text-main">Todos os Modelos</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {modelosTabela.length} de {modelos.length} modelo(s) listados
                  {versaoAtivaData ? " \u00B7 " + new Date(versaoAtivaData.created_at).toLocaleString("pt-BR") : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {buscaTabela && (
                  <span
                    onClick={function (e) { e.stopPropagation(); setBuscaTabela(""); }}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-accent/10 text-accent cursor-pointer hover:bg-accent/20 transition-colors"
                  >
                    Limpar filtro
                  </span>
                )}
                <ChevronDown size={16} className={"text-text-muted shrink-0 transition-transform duration-300 " + (secaoAberta.tabela ? "rotate-180" : "")} />
              </div>
            </button>
            <div
              className={"grid transition-[grid-template-rows] duration-500 ease-in-out " + (secaoAberta.tabela ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="px-4 pb-3 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Buscar por modelo ou provedor..."
                      value={buscaTabela}
                      onChange={(e) => setBuscaTabela(e.target.value)}
                      className="w-full rounded-lg border border-input-border bg-input-bg pl-9 pr-8 py-2 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-accent transition-colors"
                    />
                    {buscaTabela && (
                      <button
                        onClick={() => setBuscaTabela("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={exportarCSV}
                    title="Exportar CSV"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-input-border bg-input-bg text-xs text-text-muted hover:text-text-main hover:border-accent/50 transition-colors cursor-pointer shrink-0"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">CSV</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Modelo</th>
                        <th className="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Provedor</th>
                        <th className="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Modalidade</th>
                        <th className="text-right p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Win Rate</th>
                        <th className="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Top Arena</th>
                        <th className="text-right p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Input $</th>
                        <th className="text-right p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Output $</th>
                        <th className="text-right p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Contexto</th>
                        <th className="text-right p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Max Output</th>
                        <th className="text-center p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Reasoning</th>
                        <th className="text-center p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Tool</th>
                        <th className="text-center p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Open</th>
                        <th className="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Release</th>
                        <th className="text-right p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Providers</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {modelosTabela.length === 0 ? (
                        <tr>
                          <td colSpan={14} className="p-6 text-center text-sm text-text-muted">
                            {buscaTabela
                              ? "Nenhum modelo encontrado para \"" + buscaTabela + "\"."
                              : "Nenhum modelo disponivel."}
                          </td>
                        </tr>
                      ) : (
                        modelosTabela.map((m) => (
                          <tr key={m.id} className="hover:bg-surface-hover transition-colors">
                            <td className="p-3 text-text-main font-medium">{m.nome}</td>
                            <td className="p-3 text-text-muted">{m.provedor}</td>
                            <td className="p-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent">{m.modalidade}</span>
                            </td>
                            <td className="p-3 text-right text-text-main font-mono">{m.win_rate != null ? m.win_rate + "%" : "-"}</td>
                            <td className="p-3 text-text-muted text-xs">{m.top_arena || "-"}</td>
                            <td className="p-3 text-right text-text-main font-mono">{m.input_cost != null ? "$" + Number(m.input_cost).toFixed(2) : "-"}</td>
                            <td className="p-3 text-right text-text-main font-mono">{m.output_cost != null ? "$" + Number(m.output_cost).toFixed(2) : "-"}</td>
                            <td className="p-3 text-right text-text-muted font-mono text-xs">{m.context_window != null ? formatTokens(m.context_window) : "-"}</td>
                            <td className="p-3 text-right text-text-muted font-mono text-xs">{m.max_output != null ? formatTokens(m.max_output) : "-"}</td>
                            <td className="p-3 text-center text-text-muted">{m.reasoning ? "\u2713" : m.reasoning === false ? "\u2717" : "-"}</td>
                            <td className="p-3 text-center text-text-muted">{m.tool_call ? "\u2713" : m.tool_call === false ? "\u2717" : "-"}</td>
                            <td className="p-3 text-center text-text-muted">{m.open_weights ? "\u2713" : m.open_weights === false ? "\u2717" : "-"}</td>
                            <td className="p-3 text-text-muted text-xs">{m.release_date || "-"}</td>
                            <td className="p-3 text-right text-text-muted font-mono text-xs">{m.providers_count != null ? m.providers_count : "-"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTokens(val: number): string {
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + "M";
  if (val >= 1_000) return (val / 1_000).toFixed(1) + "K";
  return String(val);
}

function custoMedio(m: Modelo): number {
  const input = m.input_cost ?? 0;
  const output = m.output_cost ?? 0;
  if (input === 0 && output === 0) return Infinity;
  return (input + output) / 2;
}

function ModelosPorProvedor({ modelos, noHeader }: { modelos: Modelo[]; noHeader?: boolean }) {
  const agrupado = new Map<string, Modelo[]>();
  for (const m of modelos) {
    const key = m.provedor || "Sem provedor";
    if (!agrupado.has(key)) agrupado.set(key, []);
    agrupado.get(key)!.push(m);
  }
  for (const [, lista] of agrupado) {
    lista.sort((a, b) => a.nome.localeCompare(b.nome));
  }
  const provedores = [...agrupado.entries()].sort((a, b) => b[1].length - a[1].length);

  const grid = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
      {provedores.map(([provedor, lista]) => (
        <div key={provedor} className="bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-text-main">{provedor}</span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-surface-hover text-text-muted">{lista.length}</span>
          </div>
          <ul className="space-y-1">
            {lista.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-text-muted truncate">{m.nome}</span>
                <span className="font-mono text-text-main shrink-0">{m.win_rate != null ? m.win_rate + "%" : "-"}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  if (noHeader) return grid;

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-text-main">Modelos por Provedor</h3>
        <p className="text-xs text-text-muted mt-1">{provedores.length} provedor(es) · {modelos.length} modelo(s) no total</p>
      </div>
      {grid}
    </div>
  );
}

function CardDestaque({
  titulo, icone, modelo, badge, cor,
}: {
  titulo: string;
  icone: ReactNode;
  modelo: Modelo | null;
  badge: string;
  cor: "emerald" | "amber";
}) {
  const borda = cor === "emerald" ? "border-emerald-500/40" : "border-amber-500/40";
  const bgGrad = cor === "emerald"
    ? "from-emerald-500/10 to-transparent"
    : "from-amber-500/10 to-transparent";
  return (
    <div className={"rounded-xl bg-card border " + borda + " overflow-hidden"}>
      <div className={"bg-gradient-to-br " + bgGrad + " p-4"}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-main flex items-center gap-2">{icone}{titulo}</h3>
          {modelo && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-surface-hover text-text-muted">
              <Trophy size={11} /> {badge}
            </span>
          )}
        </div>
        {modelo ? (
          <div>
            <p className="text-lg font-bold text-white leading-tight">{modelo.nome}</p>
            <p className="text-xs text-text-muted mt-0.5">{modelo.provedor} · {modelo.modalidade}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs">
              <span className="text-text-muted">
                Win Rate:{" "}
                <span className="text-text-main font-mono font-semibold">{modelo.win_rate != null ? modelo.win_rate + "%" : "-"}</span>
              </span>
              <span className="text-text-muted">
                Custo medio:{" "}
                <span className="text-text-main font-mono font-semibold">{"$" + custoMedio(modelo).toFixed(2)}</span>
              </span>
              <span className="text-text-muted">
                Contexto:{" "}
                <span className="text-text-main font-mono font-semibold">{modelo.context_window != null ? formatTokens(modelo.context_window) : "-"}</span>
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-muted">Sem dados suficientes.</p>
        )}
      </div>
    </div>
  );
}

function RankingCard({
  titulo, descricao, itens,
}: {
  titulo: string;
  descricao: string;
  itens: { modelo: Modelo; valor: string }[];
}) {
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-text-main">{titulo}</h3>
        <p className="text-xs text-text-muted mt-1">{descricao}</p>
      </div>
      {itens.length === 0 ? (
        <p className="p-4 text-sm text-text-muted">Sem dados suficientes.</p>
      ) : (
        <ol className="divide-y divide-border/50">
          {itens.map((item, i) => (
            <li key={item.modelo.id} className="flex items-center gap-3 p-3 hover:bg-surface-hover transition-colors">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-hover text-xs font-bold text-text-muted shrink-0">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-main font-medium truncate">{item.modelo.nome}</p>
                <p className="text-[11px] text-text-muted truncate">{item.modelo.provedor} · {item.modelo.modalidade}</p>
              </div>
              <span className="text-xs font-mono font-semibold text-accent shrink-0">{item.valor}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Link2,
  Copy,
  Shield,
  Database,
  Clock,
  KeyRound,
  AlertCircle,
  ShieldAlert,
  Mail,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  listarLinksTestes,
  criarLinkTeste,
  excluirLinkTeste,
  listarDemoCredentials,
  criarDemoCredential,
  excluirDemoCredential,
  atualizarExpiraLink,
  atualizarInicioPreenchimento,
  resetar2FA,
  type LinkTeste,
  type DemoCredential,
} from "~/features/demos";

export function DemosTab() {
  const [links, setLinks] = useState<LinkTeste[]>([]);
  const [demos, setDemos] = useState<DemoCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  // Link form
  const [criandoLink, setCriandoLink] = useState(false);
  const [descLink, setDescLink] = useState("");
  const [tipoLink, setTipoLink] = useState<"PF" | "PJ">("PJ");
  const [confirmDeleteLink, setConfirmDeleteLink] = useState<string | null>(
    null,
  );

  // Demo form
  const [criandoDemo, setCriandoDemo] = useState(false);
  const [emailDemo, setEmailDemo] = useState("");
  const [senhaDemo, setSenhaDemo] = useState("");
  const [roleDemo, setRoleDemo] = useState("viewer");
  const [qtdMock, setQtdMock] = useState(5);
  const [confirmDeleteDemo, setConfirmDeleteDemo] = useState<{
    id: string;
    userId: string;
  } | null>(null);

  useEffect(() => {
    carregar();
  }, []);

  // Ticker para atualizar timers em tempo real
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  async function carregar() {
    setLoading(true);
    try {
      const [l, d] = await Promise.all([
        listarLinksTestes(),
        listarDemoCredentials(),
      ]);
      setLinks(l);
      setDemos(d);
    } catch {
      toast.error("Erro ao carregar laboratório");
    } finally {
      setLoading(false);
    }
  }

  async function handleCriarLink() {
    if (!descLink.trim()) return toast.error("Preencha a descrição");
    setCriandoLink(true);
    try {
      await criarLinkTeste(descLink, tipoLink);
      toast.success("Link gerado!");
      setDescLink("");
      carregar();
    } catch (e: any) {
      toast.error("Erro: " + e.message);
    } finally {
      setCriandoLink(false);
    }
  }

  async function handleExcluirLink(id: string) {
    try {
      await excluirLinkTeste(id);
      toast.success("Excluído");
      setConfirmDeleteLink(null);
      carregar();
    } catch {
      toast.error("Erro ao excluir");
    }
  }

  async function handleCriarDemo() {
    if (!emailDemo || !senhaDemo) return toast.error("Preencha email e senha");
    setCriandoDemo(true);
    try {
      await criarDemoCredential(emailDemo, senhaDemo, roleDemo, qtdMock);
      toast.success("Conta Demo Criada com Sucesso!");
      setEmailDemo("");
      setSenhaDemo("");
      carregar();
    } catch (e: any) {
      toast.error("Erro: " + e.message);
    } finally {
      setCriandoDemo(false);
    }
  }

  async function handleExcluirDemo(id: string, userId: string) {
    try {
      await excluirDemoCredential(id, userId);
      toast.success("Conta Demo aniquilada");
      setConfirmDeleteDemo(null);
      carregar();
    } catch {
      toast.error("Erro ao excluir");
    }
  }

  // Funções de Simulação do Ambiente de Testes
  async function handleAltExpira(cadastroId: string, minutosOffset: number) {
    try {
      const novaData = new Date(
        Date.now() + minutosOffset * 60000,
      ).toISOString();
      await atualizarExpiraLink(cadastroId, novaData);
      toast.success("Prazo do link geral atualizado!");
      carregar();
    } catch {
      toast.error("Erro ao atualizar validade");
    }
  }

  async function handleAltInicioPreenchimento(
    cadastroId: string,
    horasOffset: number | null,
  ) {
    try {
      const novaData =
        horasOffset !== null
          ? new Date(Date.now() + horasOffset * 3600000).toISOString()
          : null;
      await atualizarInicioPreenchimento(cadastroId, novaData);
      toast.success("Início do preenchimento alterado!");
      carregar();
    } catch {
      toast.error("Erro ao alterar início do preenchimento");
    }
  }

  async function handleReset2FA(cadastroId: string) {
    try {
      await resetar2FA(cadastroId);
      toast.success("2FA e progresso limpos com sucesso!");
      carregar();
    } catch {
      toast.error("Erro ao resetar 2FA");
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl bg-card p-5 shadow-lg">
        <h2 className="text-sm font-bold text-text-main flex items-center gap-2 mb-4">
          <Link2 size={16} className="text-accent" /> Links de Teste Rota Coleta
        </h2>
        <div className="flex flex-col gap-3 md:flex-row items-end mb-4 bg-input-bg p-3 rounded-lg border border-input-border">
          <div className="flex-1 w-full">
            <label className="text-xs text-text-muted ml-1 mb-1 block">
              Descrição do Teste
            </label>
            <input
              value={descLink}
              onChange={(e) => setDescLink(e.target.value)}
              placeholder="Ex: QA Pessoa Física"
              className="w-full rounded-xl border border-input-border bg-bg-dark px-3 py-2 text-sm text-text-main outline-none focus:border-accent"
            />
          </div>
          <div className="w-full md:w-32">
            <label className="text-xs text-text-muted ml-1 mb-1 block">
              Tipo Cliente
            </label>
            <select
              value={tipoLink}
              onChange={(e) => setTipoLink(e.target.value as any)}
              className="w-full rounded-xl border border-input-border bg-bg-dark px-3 py-2 text-sm text-text-main outline-none focus:border-accent"
            >
              <option value="PF" className="text-black bg-white">
                Física
              </option>
              <option value="PJ" className="text-black bg-white">
                Jurídica
              </option>
            </select>
          </div>
          <button
            onClick={handleCriarLink}
            disabled={criandoLink}
            className="flex items-center justify-center gap-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
          >
            {criandoLink ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}{" "}
            Gerar Link
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {links.length === 0 && (
            <p className="text-xs text-text-muted py-4 text-center">
              Nenhum link gerado.
            </p>
          )}
          {links.map((l) => {
            const cad = l.cadastros;
            const exp2fa = cad?.["2fa_expiracao"]
              ? new Date(cad["2fa_expiracao"])
              : null;
            const expSec = exp2fa
              ? Math.max(0, Math.floor((exp2fa.getTime() - Date.now()) / 1000))
              : 0;

            return (
              <div
                key={l.id}
                className="flex flex-col gap-4 rounded-xl border border-input-border bg-bg-dark p-4 transition-all hover:border-input-border/75"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="text-xs font-bold text-text-main truncate max-w-[200px]"
                        title={l.descricao}
                      >
                        {l.descricao}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-semibold uppercase tracking-wider">
                        {cad?.tipo_pessoa || "Indefinido"}
                      </span>
                      {cad?.link_acessado && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                          Acessado
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p
                        className="text-xs text-text-muted font-mono bg-black/20 px-2 py-0.5 rounded truncate max-w-[150px] md:max-w-[300px]"
                        title={l.token}
                      >
                        {l.token}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/pre-cadastro/${l.token}`,
                          );
                          toast.success("URL Copiada!");
                        }}
                        className="text-accent hover:text-accent/80 p-1"
                        title="Copiar URL completa"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmDeleteLink(l.id)}
                    className="text-red-400 p-1.5 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Excluir Link"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {cad && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-input-border/30 pt-3 bg-card/25 p-3 rounded-lg">
                    {/* Validade do Link Geral */}
                    <div className="flex flex-col gap-1 text-xs border-r border-input-border/20 pr-2 last:border-none">
                      <span className="text-text-muted font-bold flex items-center gap-1">
                        <Clock size={11} className="text-accent" /> Validade do
                        Link Geral
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        {(() => {
                          if (!cad.link_expiracao)
                            return (
                              <span className="text-text-muted">
                                Sem expiração definida
                              </span>
                            );
                          const exp = new Date(cad.link_expiracao);
                          const agora = new Date();
                          if (exp < agora)
                            return (
                              <span className="px-2 py-0.5 rounded text-xs bg-red-500/15 text-red-400 font-bold border border-red-500/30">
                                Expirado
                              </span>
                            );
                          const diffMin =
                            (exp.getTime() - agora.getTime()) / 60000;
                          if (diffMin < 15)
                            return (
                              <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/15 text-yellow-400 font-bold border border-yellow-500/30">
                                Expirando em Breve
                              </span>
                            );
                          return (
                            <span className="px-2 py-0.5 rounded text-xs bg-green-500/15 text-green-400 font-bold border border-green-500/30">
                              Ativo
                            </span>
                          );
                        })()}
                      </div>
                      <span className="text-xs text-text-muted mt-1">
                        Expira:{" "}
                        {cad.link_expiracao
                          ? new Date(cad.link_expiracao).toLocaleString("pt-BR")
                          : "Indefinido"}
                      </span>
                    </div>

                    {/* Código 2FA PIN */}
                    <div className="flex flex-col gap-1 text-xs border-r border-input-border/20 pr-2 last:border-none">
                      <span className="text-text-muted font-bold flex items-center gap-1">
                        <KeyRound size={11} className="text-accent" /> Código
                        2FA PIN
                      </span>
                      <div className="mt-1">
                        {cad.status_verificacao_token ? (
                          <span className="px-2 py-0.5 rounded text-xs bg-green-500/15 text-green-400 font-bold border border-green-500/30">
                            Verificado & Liberado
                          </span>
                        ) : cad["2fa_token"] ? (
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-sm text-accent bg-accent/15 px-2 py-0.5 rounded font-bold border border-accent/25 w-max">
                              PIN: {cad["2fa_token"]}
                            </span>
                            <span className="text-xs text-text-muted flex items-center gap-1">
                              Canal:{" "}
                              {cad["2fa_canal"] === "email" ? (
                                <Mail size={10} />
                              ) : (
                                <MessageSquare size={10} />
                              )}{" "}
                              {cad["2fa_contato"]}
                            </span>
                            <span className="text-xs text-text-muted font-semibold">
                              expira em {Math.floor(expSec / 60)}m {expSec % 60}
                              s {expSec === 0 && "(expirado)"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-text-muted italic">
                            Aguardando solicitação...
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Preenchimento de 24h */}
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="text-text-muted font-bold flex items-center gap-1">
                        <AlertCircle size={11} className="text-accent" /> Limite
                        Preenchimento (24h)
                      </span>
                      <div className="mt-1">
                        {cad.inicio_preenchimento ? (
                          (() => {
                            const limite =
                              new Date(cad.inicio_preenchimento).getTime() +
                              24 * 60 * 60 * 1000;
                            const restante = limite - Date.now();
                            if (restante <= 0) {
                              return (
                                <span className="px-2 py-0.5 rounded text-xs bg-red-500/15 text-red-400 font-bold border border-red-500/30 block w-max">
                                  Prazo Excedido
                                </span>
                              );
                            }
                            const horas = Math.floor(restante / 3600000);
                            const minutos = Math.floor(
                              (restante % 3600000) / 60000,
                            );
                            return (
                              <div className="flex flex-col gap-1">
                                <span className="px-2 py-0.5 rounded text-xs bg-blue-500/15 text-blue-400 font-bold border border-blue-500/30 w-max">
                                  Preenchimento Iniciado
                                </span>
                                <span className="text-xs text-text-muted font-semibold">
                                  Restam: {horas}h {minutos}m
                                </span>
                              </div>
                            );
                          })()
                        ) : (
                          <span className="text-text-muted italic">
                            Aguardando login por 2FA
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {cad && (
                  <div className="border-t border-input-border/30 pt-3 flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-text-muted font-bold uppercase tracking-wider mr-1">
                      Simular Estados:
                    </span>

                    {/* Botões do Link Geral */}
                    <button
                      onClick={() => handleAltExpira(cad.id, -60)}
                      className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/25 border border-red-500/20 px-2 py-1 rounded-lg transition-colors font-medium"
                    >
                      Expirar Geral
                    </button>
                    <button
                      onClick={() => handleAltExpira(cad.id, 10)}
                      className="text-xs bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/25 border border-yellow-500/20 px-2 py-1 rounded-lg transition-colors font-medium"
                    >
                      Expirar em 10min
                    </button>
                    <button
                      onClick={() => handleAltExpira(cad.id, 30 * 24 * 60)}
                      className="text-xs bg-green-500/10 text-green-400 hover:bg-green-500/25 border border-green-500/20 px-2 py-1 rounded-lg transition-colors font-medium"
                    >
                      Resetar Validade
                    </button>

                    {/* Botões do Timer 24h */}
                    <button
                      onClick={() => handleAltInicioPreenchimento(cad.id, -25)}
                      className="text-xs bg-orange-500/10 text-orange-400 hover:bg-orange-500/25 border border-orange-500/20 px-2 py-1 rounded-lg transition-colors font-medium"
                    >
                      Exceder 24h
                    </button>
                    <button
                      onClick={() => handleAltInicioPreenchimento(cad.id, -1)}
                      className="text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/25 border border-blue-500/20 px-2 py-1 rounded-lg transition-colors font-medium"
                    >
                      Iniciado há 1h
                    </button>

                    {/* Reset de 2FA */}
                    <button
                      onClick={() => handleReset2FA(cad.id)}
                      className="text-xs bg-purple-500/10 text-purple-400 hover:bg-purple-500/25 border border-purple-500/20 px-2 py-1 rounded-lg transition-colors font-medium ml-auto"
                    >
                      Reiniciar 2FA
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl bg-card p-5 shadow-lg">
        <h2 className="text-sm font-bold text-text-main flex items-center gap-2 mb-4">
          <Shield size={16} className="text-accent" /> Credenciais Demo (Mocks)
        </h2>
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap items-end mb-4 bg-input-bg p-3 rounded-lg border border-input-border">
          <div className="flex-1 w-full min-w-[200px]">
            <label className="text-xs text-text-muted ml-1 mb-1 block">
              Email Demo
            </label>
            <input
              type="email"
              value={emailDemo}
              onChange={(e) => setEmailDemo(e.target.value)}
              placeholder="demo@teste.com"
              className="w-full rounded-xl border border-input-border bg-bg-dark px-3 py-2 text-sm text-text-main outline-none focus:border-accent"
            />
          </div>
          <div className="w-full md:w-32">
            <label className="text-xs text-text-muted ml-1 mb-1 block">
              Senha Livre
            </label>
            <input
              value={senhaDemo}
              onChange={(e) => setSenhaDemo(e.target.value)}
              className="w-full rounded-xl border border-input-border bg-bg-dark px-3 py-2 text-sm text-text-main outline-none focus:border-accent"
            />
          </div>
          <div className="w-full md:w-32">
            <label className="text-xs text-text-muted ml-1 mb-1 block">
              Papel
            </label>
            <select
              value={roleDemo}
              onChange={(e) => setRoleDemo(e.target.value)}
              className="w-full rounded-xl border border-input-border bg-bg-dark px-3 py-2 text-sm text-text-main outline-none focus:border-accent"
            >
              <option value="admin" className="text-black bg-white">
                Admin
              </option>
              <option value="editor" className="text-black bg-white">
                Editor
              </option>
              <option value="viewer" className="text-black bg-white">
                Consultor (viewer)
              </option>
            </select>
          </div>
          <div className="w-full md:w-20">
            <label className="text-xs text-text-muted ml-1 mb-1 block">
              Mocks
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={qtdMock}
              onChange={(e) => setQtdMock(Number(e.target.value))}
              className="w-full rounded-xl border border-input-border bg-bg-dark px-3 py-2 text-sm text-text-main outline-none focus:border-accent"
            />
          </div>
          <button
            onClick={handleCriarDemo}
            disabled={criandoDemo}
            className="flex items-center justify-center gap-1 w-full md:w-auto rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50 mt-2 md:mt-0"
          >
            {criandoDemo ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Database size={16} />
            )}{" "}
            Criar Demo
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {demos.length === 0 && (
            <p className="text-xs text-text-muted py-4 text-center">
              Nenhuma conta demo ativa.
            </p>
          )}
          {demos.map((d) => (
            <div
              key={d.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-input-border bg-bg-dark p-3"
            >
              <div>
                <p className="text-xs font-bold text-text-main flex items-center gap-2">
                  {d.email_demo}{" "}
                  <span className="text-xs font-normal bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                    {d.role_escolhida}
                  </span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-text-muted font-mono">
                    Senha: {d.senha_demo}
                  </p>
                  <p className="text-xs text-text-muted border-l border-input-border pl-2 ml-1">
                    {d.qtd_cadastros_mock} cadastros mockados
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setConfirmDeleteDemo({ id: d.id, userId: d.user_id })
                }
                className="text-red-400 p-1.5 hover:bg-red-400/10 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Excluir Link */}
      {confirmDeleteLink && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
          onClick={() => setConfirmDeleteLink(null)}
        >
          <div
            className="bg-card w-full max-w-sm rounded-2xl p-6 shadow-xl border border-input-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-text-main mb-2">
              Excluir Link de Teste?
            </h3>
            <p className="text-sm text-text-muted mb-6">
              Tem certeza? O cadastro vinculado será deletado permanentemente.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteLink(null)}
                className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-main hover:bg-input-bg rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleExcluirLink(confirmDeleteLink)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500/80 hover:bg-red-600 rounded-xl transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Excluir Demo */}
      {confirmDeleteDemo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
          onClick={() => setConfirmDeleteDemo(null)}
        >
          <div
            className="bg-card w-full max-w-sm rounded-2xl p-6 shadow-xl border border-input-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-text-main mb-2">
              Excluir Conta Demo?
            </h3>
            <p className="text-sm text-text-muted mb-6">
              Isso excluirá a conta, os perfis e{" "}
              <strong className="text-red-400 font-medium">TODOS</strong> os
              cadastros mock vinculados! Prosseguir?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteDemo(null)}
                className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-main hover:bg-input-bg rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() =>
                  handleExcluirDemo(
                    confirmDeleteDemo.id,
                    confirmDeleteDemo.userId,
                  )
                }
                className="px-4 py-2 text-sm font-medium text-white bg-red-500/80 hover:bg-red-600 rounded-xl transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

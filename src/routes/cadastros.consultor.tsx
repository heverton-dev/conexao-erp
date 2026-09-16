import { createRoute, useNavigate } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useState, useEffect } from "react";
import { useAuth } from "~/lib/auth";
import {
  listarCadastros,
  criarCadastro,
  STATUS_LABEL,
  STATUS_COLOR,
  type Cadastro,
  type CadastroStatus,
} from "~/features/clientes";
import {
  getDocumentosStatusMap,
  DOC_STATUS_LABEL,
  DOC_STATUS_COLOR,
  type DocStatus,
} from "~/features/documentos";
import { logAtividade } from "~/core/services";
import { dispararWebhooks } from "~/lib/webhooks";
import {
  Link2,
  Plus,
  Share2,
  ArrowRight,
  X,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  BarChart3,
  Loader2,
} from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";
import { EMPRESA_ID } from "~/config/empresa";
import { RequirePermission } from "~/components/guards";
import {
  KPICard,
  KPI_PRESETS,
  StatusBreakdown,
  CadastroCard,
} from "~/features/cadastros/components";
export const consultorRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/cadastros/consultor",
  component: () => (
    <RequirePermission modulo="cadastros" permissions={["gerar_links"]}>
      <ConsultorPage />
    </RequirePermission>
  ),
});

const PAISES = [
  { nome: "Brasil", ddi: "55", bandeira: "BR" },
  { nome: "Portugal", ddi: "351", bandeira: "PT" },
  { nome: "Estados Unidos / Canadá", ddi: "1", bandeira: "US" },
  { nome: "Argentina", ddi: "54", bandeira: "AR" },
  { nome: "Chile", ddi: "56", bandeira: "CL" },
  { nome: "Colômbia", ddi: "57", bandeira: "CO" },
  { nome: "Uruguai", ddi: "598", bandeira: "UY" },
  { nome: "Paraguai", ddi: "595", bandeira: "PY" },
  { nome: "Peru", ddi: "51", bandeira: "PE" },
  { nome: "Equador", ddi: "593", bandeira: "EC" },
  { nome: "Venezuela", ddi: "58", bandeira: "VE" },
  { nome: "Bolívia", ddi: "591", bandeira: "BO" },
  { nome: "México", ddi: "52", bandeira: "MX" },
  { nome: "Espanha", ddi: "34", bandeira: "ES" },
  { nome: "Itália", ddi: "39", bandeira: "IT" },
  { nome: "França", ddi: "33", bandeira: "FR" },
  { nome: "Alemanha", ddi: "49", bandeira: "DE" },
  { nome: "Reino Unido", ddi: "44", bandeira: "GB" },
  { nome: "Japão", ddi: "81", bandeira: "JP" },
  { nome: "China", ddi: "86", bandeira: "CN" },
];

function ConsultorPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [cadastros, setCadastros] = useState<
    (Cadastro & { profiles: { nome: string } | null })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null);
  const [showGerarLink, setShowGerarLink] = useState(false);
  const [linkForm, setLinkForm] = useState({
    tipo_acao: "solicitar_cadastro" as
      | "solicitar_cadastro"
      | "atualizar_cadastro",
    receber_por: "whatsapp" as "whatsapp" | "email",
    nome_lead: "",
    email_lead: "",
    ddi: "55",
    ddd: "",
    whatsapp_num: "",
    expiracao_dias: "5",
  });
  const [linkGerado, setLinkGerado] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [docsStatus, setDocsStatus] = useState<Record<string, DocStatus>>({});

  useEffect(() => {
    if (user?.id) carregar();
  }, [user]);

  useEffect(() => {
    const isModalOpen = showGerarLink || showSuccess;
    if (isModalOpen) {
      const scrollY = window.scrollY;
      document.body.classList.add("modal-open");
      document.body.style.top = `-${scrollY}px`;
      return () => {
        document.body.classList.remove("modal-open");
        document.body.style.top = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [showGerarLink, showSuccess]);

  async function carregar() {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await listarCadastros({ created_by: user.id });
      setCadastros(res);
      const status = await getDocumentosStatusMap(
        res.map((c) => ({ id: c.id, tipo_pessoa: c.tipo_pessoa })),
      );
      setDocsStatus(status);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const numeroCompleto = linkForm.ddi + linkForm.ddd + linkForm.whatsapp_num;

  async function gerarLink() {
    setSubmitting(true);
    setShowGerarLink(false);
    try {
      const expiracao = new Date();
      expiracao.setDate(
        expiracao.getDate() + parseInt(linkForm.expiracao_dias),
      );
      const s = await criarCadastro({
        tipo_acao: linkForm.tipo_acao,
        forma_compartilhamento: linkForm.receber_por,
        lead_nome: linkForm.nome_lead || null,
        lead_email: linkForm.email_lead || null,
        lead_whatsapp: numeroCompleto || null,
        link_expiracao: expiracao.toISOString(),
      });
      await logAtividade(
        "cadastro",
        s.id,
        "link_gerado",
        `Link gerado para ${linkForm.nome_lead}`,
      );
      const dataFormatada =
        new Date().toLocaleDateString("pt-BR") +
        " " +
        new Date().toLocaleTimeString("pt-BR");
      dispararWebhooks(
        "botao_compartilhar_link",
        {
          cadastro_id: s.id,
          token_acesso: s.token_acesso,
          status: "link_gerado",
          data_gerado: dataFormatada,
          usuario_nome: profile?.nome || "",
          usuario_id: profile?.id || "",
          tipo_acao: linkForm.tipo_acao,
          forma_compartilhamento: linkForm.receber_por,
          lead_nome: linkForm.nome_lead,
          lead_email: linkForm.email_lead,
          lead_ddi: linkForm.ddi,
          lead_ddd: linkForm.ddd,
          lead_whatsapp_num: linkForm.whatsapp_num,
          expiracao_dias: linkForm.expiracao_dias,
        },
      );
      dispararWebhooks(
        "link_gerado",
        {
          cadastro_id: s.id,
          token_acesso: s.token_acesso,
          status: "link_gerado",
          data_gerado: dataFormatada,
          usuario_nome: profile?.nome || "",
          usuario_id: profile?.id || "",
          tipo_acao: linkForm.tipo_acao,
          forma_compartilhamento: linkForm.receber_por,
          lead_nome: linkForm.nome_lead,
          lead_email: linkForm.email_lead,
          lead_ddi: linkForm.ddi,
          lead_ddd: linkForm.ddd,
          lead_whatsapp_num: linkForm.whatsapp_num,
          expiracao_dias: linkForm.expiracao_dias,
        },
      );
      const link = `${window.location.origin}/pre-cadastro/${s.token_acesso}`;
      setLinkGerado(link);
      setShowSuccess(true);
      setLinkForm({
        tipo_acao: "solicitar_cadastro",
        receber_por: "whatsapp",
        nome_lead: "",
        email_lead: "",
        ddi: "55",
        ddd: "",
        whatsapp_num: "",
        expiracao_dias: "5",
      });
      if (linkForm.receber_por === "whatsapp" && numeroCompleto) {
        window.open(
          `https://wa.me/${numeroCompleto.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá! Acesse o link para seu cadastro: ${link}`)}`,
          "_blank",
        );
      }
      carregar();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  const stats = {
    total: cadastros.length,
    link_gerado: cadastros.filter((s) => s.status === "link_gerado").length,
    dados_enviados: cadastros.filter((s) => s.status === "dados_enviados")
      .length,
    em_analise: cadastros.filter((s) => s.status === "em_analise").length,
    em_correcao: cadastros.filter((s) => s.status === "em_correcao").length,
    aprovados: cadastros.filter((s) => s.status === "aprovado").length,
    reprovados: cadastros.filter((s) => s.status === "reprovado").length,
  };

  const taxaAprovacao =
    stats.total > 0 ? Math.round((stats.aprovados / stats.total) * 100) : 0;
  const pendentes = stats.em_analise + stats.dados_enviados + stats.em_correcao;

  const lista = filtroStatus
    ? cadastros.filter(
        (s) =>
          s.status === filtroStatus ||
          (filtroStatus === "em_analise" &&
            (s.status === "em_analise" || s.status === "dados_enviados")),
      )
    : cadastros;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">
            Consultor
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Gerencie seus cadastros e crie novos links para clientes
          </p>
        </div>
        <button
          onClick={() => {
            setLinkForm((prev) => ({
              ...prev,
              tipo_acao: "solicitar_cadastro",
            }));
            setShowGerarLink(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-accent text-accent-fg px-5 py-2.5 text-sm font-semibold hover:bg-accent-hover transition-all duration-200 min-h-[44px] shadow-lg shadow-accent/20"
        >
          <Plus size={16} />
          <span>Solicitar Cadastro</span>
        </button>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={Users}
            label="Total"
            value={stats.total}
            subtitle="Solicitações criadas"
            colorClass={KPI_PRESETS.total}
          />
          <KPICard
            icon={Clock}
            label="Pendentes"
            value={pendentes}
            subtitle="Aguardando ação"
            colorClass={KPI_PRESETS.pendentes}
          />
          <KPICard
            icon={CheckCircle}
            label="Aprovados"
            value={stats.aprovados}
            subtitle="Cadastros ativos"
            colorClass={KPI_PRESETS.aprovados}
          />
          <KPICard
            icon={TrendingUp}
            label="Taxa Aprovação"
            value={`${taxaAprovacao}%`}
            subtitle="Taxa de aprovação"
            colorClass={KPI_PRESETS.taxa}
          />
        </div>
      )}

      {/* Status Breakdown */}
      {!loading && (
        <StatusBreakdown
          cols="5"
          items={[
            {
              label: "Links",
              value: stats.link_gerado,
              icon: Link2,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
              border: "border-blue-500/20",
              filter: "link_gerado",
            },
            {
              label: "Enviados",
              value: stats.dados_enviados,
              icon: Clock,
              color: "text-cyan-400",
              bg: "bg-cyan-500/10",
              border: "border-cyan-500/20",
              filter: "dados_enviados" as CadastroStatus,
            },
            {
              label: "Análise",
              value: stats.em_analise,
              icon: AlertTriangle,
              color: "text-yellow-400",
              bg: "bg-yellow-500/10",
              border: "border-yellow-500/20",
              filter: "em_analise",
            },
            {
              label: "Correção",
              value: stats.em_correcao,
              icon: AlertTriangle,
              color: "text-orange-400",
              bg: "bg-orange-500/10",
              border: "border-orange-500/20",
              filter: "em_correcao",
            },
            {
              label: "Reprovados",
              value: stats.reprovados,
              icon: XCircle,
              color: "text-red-400",
              bg: "bg-red-500/10",
              border: "border-red-500/20",
              filter: "reprovado",
            },
          ]}
          activeFilter={filtroStatus}
          onSelect={(f) => setFiltroStatus(f)}
        />
      )}

      {/* Minhas Solicitações */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-main">
            {filtroStatus
              ? STATUS_LABEL[filtroStatus as CadastroStatus] || filtroStatus
              : "Minhas Solicitações"}
          </h2>
          {filtroStatus && (
            <button
              onClick={() => setFiltroStatus(null)}
              className="text-sm text-accent hover:text-accent-hover transition-colors font-medium"
            >
              Limpar filtro
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        ) : lista.length === 0 ? (
          <EmptyState
            icon={<BarChart3 className="w-10 h-10 text-text-muted/30" />}
            title={
              filtroStatus
                ? "Nenhuma solicitação com este status"
                : "Nenhuma solicitação ainda"
            }
            description={
              filtroStatus
                ? "Tente limpar o filtro para ver outras solicitações."
                : "Crie seu primeiro link de cadastro para começar."
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lista.slice(0, 30).map((s, i) => (
              <CadastroCard
                key={s.id}
                nome={s.lead_nome || s.nome_temporario || "Sem nome"}
                statusColor={STATUS_COLOR[s.status]}
                statusLabel={STATUS_LABEL[s.status]}
                docStatusColor={
                  docsStatus[s.id] ? DOC_STATUS_COLOR[docsStatus[s.id]] : undefined
                }
                docStatusLabel={
                  docsStatus[s.id] ? DOC_STATUS_LABEL[docsStatus[s.id]] : undefined
                }
                tipoPessoa={s.tipo_pessoa ?? undefined}
                codigoCliente={s.codigo_cliente ?? undefined}
                createdAt={s.created_at}
                index={i}
                onClick={() =>
                  navigate({
                    to: "/cadastros/solicitacoes/$id",
                    params: { id: s.id },
                  })
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Gerar Link Modal */}
      {showGerarLink && !linkGerado && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          onClick={() => {
            setShowGerarLink(false);
            setLinkGerado(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-card border border-border/50 p-0 shadow-2xl shadow-black/40 max-h-[90dvh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-accent/20 via-accent/10 to-transparent px-6 pt-6 pb-4 border-b border-border/50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                    <Link2 size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-main tracking-tight">
                      Gerar Link de Cadastro
                    </h2>
                    <p className="text-sm text-text-muted mt-0.5">
                      Crie um novo link de cadastro para enviar ao cliente.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowGerarLink(false);
                    setLinkGerado(null);
                  }}
                  className="absolute right-4 top-5 rounded-lg p-1.5 text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="px-6 py-6 flex-1 space-y-4">
              <p className="mb-1 text-xs font-medium text-text-muted">
                Indique a forma que o Lead receberá o link:
              </p>
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() =>
                    setLinkForm((prev) => ({
                      ...prev,
                      receber_por: "whatsapp",
                    }))
                  }
                  className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${linkForm.receber_por === "whatsapp" ? "bg-accent text-accent-fg" : "bg-input-bg text-text-muted"}`}
                >
                  WhatsApp
                </button>
                <button
                  onClick={() =>
                    setLinkForm((prev) => ({ ...prev, receber_por: "email" }))
                  }
                  className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${linkForm.receber_por === "email" ? "bg-accent text-accent-fg" : "bg-input-bg text-text-muted"}`}
                >
                  E-mail
                </button>
              </div>
              <p className="mb-1 text-xs font-medium text-text-muted">
                Prazo de expiração
              </p>
              <select
                value={linkForm.expiracao_dias}
                onChange={(e) =>
                  setLinkForm((prev) => ({
                    ...prev,
                    expiracao_dias: e.target.value,
                  }))
                }
                className="mb-4 w-full rounded-lg border border-input-border bg-input-bg px-4 py-3 text-sm text-text-main outline-none focus:border-accent min-h-[44px]"
              >
                {[1, 3, 5, 7].map((d) => (
                  <option key={d} value={d}>
                    {d} {d === 1 ? "dia" : "dias"}
                  </option>
                ))}
              </select>
              <InputField
                label="Nome do Lead"
                value={linkForm.nome_lead}
                onChange={(v) =>
                  setLinkForm((prev) => ({ ...prev, nome_lead: v }))
                }
                placeholder="Nome do cliente"
              />
              {linkForm.receber_por === "whatsapp" ? (
                <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
                  <p className="mb-1 text-xs font-medium text-text-muted">
                    WhatsApp do Lead
                  </p>
                  <div className="mb-2 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={linkForm.ddi}
                        onChange={(e) =>
                          setLinkForm((prev) => ({
                            ...prev,
                            ddi: e.target.value,
                          }))
                        }
                        className="min-w-0 flex-1 rounded-lg border border-input-border bg-input-bg px-3 py-3 text-sm text-text-main outline-none focus:border-accent min-h-[44px]"
                      >
                        {PAISES.map((p) => (
                          <option key={p.ddi} value={p.ddi}>
                            {p.bandeira} {p.nome} (+{p.ddi})
                          </option>
                        ))}
                      </select>
                      <input
                        value={linkForm.ddd}
                        onChange={(e) =>
                          setLinkForm((prev) => ({
                            ...prev,
                            ddd: e.target.value.replace(/\D/g, "").slice(0, 2),
                          }))
                        }
                        placeholder="DDD"
                        autoComplete="tel-area-code"
                        className="w-[80px] max-w-[80px] shrink-0 rounded-lg border border-input-border bg-input-bg px-3 py-3 text-base text-text-main outline-none focus:border-accent min-h-[44px]"
                      />
                    </div>
                    <input
                      value={linkForm.whatsapp_num}
                      onChange={(e) =>
                        setLinkForm((prev) => ({
                          ...prev,
                          whatsapp_num: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 9),
                        }))
                      }
                      placeholder="Número"
                      autoComplete="tel-national"
                      className="w-full rounded-lg border border-input-border bg-input-bg px-3 py-3 text-base text-text-main outline-none focus:border-accent min-h-[44px]"
                    />
                  </div>
                  {numeroCompleto.length > 2 && (
                    <p className="mb-3 text-xs text-text-muted italic">
                      Número configurado:{" "}
                      <span className="not-italic font-mono">
                        {numeroCompleto}
                      </span>
                    </p>
                  )}
                </form>
              ) : (
                <InputField
                  label="E-mail do Lead"
                  value={linkForm.email_lead}
                  onChange={(v) =>
                    setLinkForm((prev) => ({ ...prev, email_lead: v }))
                  }
                  placeholder="cliente@email.com"
                  type="email"
                />
              )}
              {linkForm.receber_por === "whatsapp" && (
                <p className="mb-4 text-xs text-text-muted">
                  O WhatsApp será aberto em uma nova guia.
                </p>
              )}
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end px-6 pb-6 pt-4 border-t border-border/50">
              <button
                onClick={gerarLink}
                disabled={submitting || !linkForm.nome_lead}
                className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px] flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Share2 size={16} />
                )}{" "}
                Compartilhar Link
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          onClick={() => {
            setShowSuccess(false);
            setLinkGerado(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-card border border-border/50 p-0 shadow-2xl shadow-black/40 max-h-[90dvh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-accent/20 via-accent/10 to-transparent px-6 pt-6 pb-4 border-b border-border/50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                    <CheckCircle size={22} className="text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-main tracking-tight">
                      Link Gerado com Sucesso!
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowSuccess(false);
                    setLinkGerado(null);
                  }}
                  className="absolute right-4 top-5 rounded-lg p-1.5 text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="mb-4">
      <p className="mb-1 text-xs font-medium text-text-muted">{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type || "text"}
        className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-3 text-base text-text-main outline-none focus:border-accent focus:ring-[0.25px] focus:ring-ring min-h-[44px]"
      />
    </div>
  );
}

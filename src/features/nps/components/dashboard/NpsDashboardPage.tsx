import { useState, useEffect, useMemo } from "react";
// Tooltips are mocked below
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "~/core/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  RefreshCw,
  Users,
  TrendingUp,
  Star,
  MessageSquare,
  Trash2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  Smile,
  Quote,
  ListChecks,
  Briefcase,
  ShoppingCart,
  UserCheck,
  Trophy,
  Filter,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "~/lib/auth";
import { listarRespostas, excluirRespostas } from "../../services/respostas";

const TooltipProvider = ({ children }: any) => <>{children}</>;
const Tooltip = ({ children }: any) => <>{children}</>;
const TooltipTrigger = ({ children, asChild: _asChild, ...props }: any) => (
  <span {...props}>{children}</span>
);
const TooltipContent = ({ children }: any) => (
  <div className="hidden">{children}</div>
);
import NPSTrendChart from "./charts/NPSTrendChart";
import ResponseVolumeChart from "./charts/ResponseVolumeChart";
import KeyPhrasesCard from "./charts/KeyPhrasesCard";
import CorrelationCard from "./charts/CorrelationCard";
import SourceComparisonCard from "./charts/SourceComparisonCard";
import DetractorAlerts from "./charts/DetractorAlerts";

import SectionHeader from "./charts/SectionHeader";
import SectionNav from "./charts/SectionNav";
import MetricCard from "./charts/MetricCard";
import CommentRateCard from "./charts/CommentRateCard";
import RepeatCustomerCard from "./charts/RepeatCustomerCard";
import CompletionRateCard from "./charts/CompletionRateCard";
import MonthOverMonthCard from "./charts/MonthOverMonthCard";
import TimeHeatmap from "./charts/TimeHeatmap";
import DistributionBarsCard from "./charts/DistributionBarsCard";
import DynamicQuestionsChart from "./charts/DynamicQuestionsChart";
import SellerRanking from "./charts/SellerRanking";
import SellerComparison from "./charts/SellerComparison";
import SellerMatrixHeatmap from "./charts/SellerMatrixHeatmap";
import SentimentAnalysis from "./charts/SentimentAnalysis";
import EmergingThemes from "./charts/EmergingThemes";

interface SurveyResponse {
  id: string;
  created_at: string;
  nps_score: number | null;
  nps_comment: string;
  csat: string;
  atendimento_comercial: string;
  entendimento_consultor: string;
  melhoria_atendimento: string;
  experiencia_compra: string;
  matrix_facilidade_pedido: number;
  matrix_clareza_condicoes: number;
  matrix_prazo_entrega: number;
  matrix_disponibilidade_produtos: number;
  matrix_comunicacao: number;
  expansao_produtos: string;
  oportunidade: string;
  pergunta_final: string;
  order_id: string | null;
  client_id: string | null;
  source: string | null;
  client_name: string | null;
  vendor_name: string | null;
  dynamic_answers?: Record<string, any> | null;
}

type NpsBucket = "all" | "detractors" | "passives" | "promoters";
type SubjectiveKey =
  | "all"
  | "nps_comment"
  | "melhoria_atendimento"
  | "expansao_produtos"
  | "oportunidade"
  | "pergunta_final";

const SUBJECTIVE_OPTIONS: {
  key: Exclude<SubjectiveKey, "all">;
  label: string;
}[] = [
  { key: "nps_comment", label: "Comentário NPS" },
  { key: "melhoria_atendimento", label: "Melhoria no atendimento" },
  { key: "expansao_produtos", label: "Produto/solução em falta" },
  { key: "oportunidade", label: "Compraria mais se..." },
  { key: "pergunta_final", label: "Mudaria UMA coisa" },
];

// CSAT colors mapped by satisfaction level (best → worst)
const CSAT_COLORS: Record<string, string> = {
  "Muito satisfeito": "#22c55e",
  Satisfeito: "#4ade80",
  Neutro: "#eab308",
  Insatisfeito: "#f97316",
  "Muito insatisfeito": "#ef4444",
};
const CSAT_COLOR_FALLBACKS = ["#22c55e", "#4ade80", "#eab308", "#f97316", "#ef4444"];

const getCsatColor = (name: string, index: number) => {
  return (
    CSAT_COLORS[name] ||
    CSAT_COLOR_FALLBACKS[index % CSAT_COLOR_FALLBACKS.length]
  );
};

const MATRIX_COLORS = ["#c9a655", "#b8963f", "#a88535", "#97742b", "#866321"];

export function NpsDashboardPage() {
  const { profile, empresa } = useAuth();
  const navigate = useNavigate();
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [npsBucketFilter, setNpsBucketFilter] = useState<NpsBucket>("all");
  const [subjectiveFilter, setSubjectiveFilter] =
    useState<SubjectiveKey>("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [detailResponse, setDetailResponse] = useState<SurveyResponse | null>(
    null,
  );
  const [showResponsesTable, setShowResponsesTable] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("todas");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "visao-geral": true,
    "nps": true,
    "satisfacao": false,
    "vendedores": false,
    "insights": false,
    "respostas": false,
  });
  const [searchResponse, setSearchResponse] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const isSuperAdmin = profile?.is_super_admin === true;
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>(
    empresa?.id || "",
  );
  const [empresas, setEmpresas] = useState<{ id: string; nome: string }[]>([]);

  useEffect(() => {
    if (isSuperAdmin) {
      supabase
        .from("empresas")
        .select("id, nome")
        .order("nome")
        .then(({ data }) => {
          if (data) setEmpresas(data);
        });
    }
  }, [isSuperAdmin]);

  const activeEmpresaId = isSuperAdmin ? selectedEmpresa : empresa?.id;

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading) fetchData(activeEmpresaId);
  }, [activeEmpresaId]);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigate({ to: "/" });
      return;
    }
    // Get profile name
    const { data: profile } = await supabase
      .from("dashboard_perfis")
      .select("full_name, role")
      .eq("id", session.user.id)
      .single();
    if (profile?.full_name) setUserName(profile.full_name);
    if (profile?.role) setUserRole(profile.role);

    fetchData(activeEmpresaId);
  };

  const fetchData = async (empresaFilter?: string) => {
    setLoading(true);
    try {
      const data = await listarRespostas(empresaFilter || "");
      setResponses(data || []);
    } catch {
      setResponses([]);
    }
    setLoading(false);
  };

  const [deleting, setDeleting] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

  const deleteFilteredResponses = async () => {
    if (!filtered.length) {
      toast.error("Nenhuma resposta para excluir");
      return;
    }
    setShowDeleteAllDialog(true);
  };

  const confirmDeleteAll = async () => {
    setShowDeleteAllDialog(false);
    setDeleting(true);
    try {
      const ids = filtered.map((r) => r.id);
      await excluirRespostas(ids);
      toast.success(`${ids.length} resposta(s) excluída(s) com sucesso!`);
      fetchData(activeEmpresaId);
    } catch {
      toast.success("Erro ao excluir respostas");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    return responses.filter((r) => {
      if (dateFrom && new Date(r.created_at) < new Date(dateFrom)) return false;
      if (dateTo && new Date(r.created_at) > new Date(dateTo + "T23:59:59"))
        return false;

      if (vendorFilter !== "all" && (r.vendor_name || "") !== vendorFilter)
        return false;
      if (npsBucketFilter !== "all") {
        if (r.nps_score === null || r.nps_score === undefined) return false;
        if (npsBucketFilter === "detractors" && r.nps_score > 6) return false;
        if (
          npsBucketFilter === "passives" &&
          (r.nps_score < 7 || r.nps_score > 8)
        )
          return false;
        if (npsBucketFilter === "promoters" && r.nps_score < 9) return false;
      }
      if (subjectiveFilter !== "all") {
        const val = (r as any)[subjectiveFilter];
        if (!val || String(val).trim() === "") return false;
      }
      return true;
    });
  }, [
    responses,
    dateFrom,
    dateTo,
    vendorFilter,
    npsBucketFilter,
    subjectiveFilter,
  ]);

  const activeData = filtered;

  const vendors = useMemo(
    () =>
      [
        ...new Set(responses.map((r) => r.vendor_name).filter(Boolean)),
      ] as string[],
    [responses],
  );
  const hasMultipleVendors = useMemo(
    () =>
      new Set(activeData.map((r) => r.vendor_name).filter(Boolean)).size > 1,
    [activeData],
  );

  const npsStats = useMemo(() => {
    const scored = activeData.filter((r) => r.nps_score !== null);
    if (!scored.length)
      return { score: 0, promoters: 0, passives: 0, detractors: 0, total: 0 };
    const promoters = scored.filter((r) => r.nps_score! >= 9).length;
    const detractors = scored.filter((r) => r.nps_score! <= 6).length;
    const passives = scored.length - promoters - detractors;
    const score = Math.round(((promoters - detractors) / scored.length) * 100);
    return { score, promoters, passives, detractors, total: scored.length };
  }, [activeData]);

  const csatData = useMemo(() => {
    const counts: Record<string, number> = {};
    activeData.forEach((r) => {
      if (r.csat) counts[r.csat] = (counts[r.csat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [activeData]);

  const npsDistribution = useMemo(() => {
    const counts = Array(11).fill(0);
    activeData.forEach((r) => {
      if (r.nps_score !== null) counts[r.nps_score]++;
    });
    return counts.map((count, score) => ({ score: String(score), count }));
  }, [activeData]);

  const matrixAvg = useMemo(() => {
    if (!activeData.length) return [];
    const items = [
      { key: "matrix_facilidade_pedido", label: "Facilidade de Pedido" },
      { key: "matrix_clareza_condicoes", label: "Clareza Comercial" },
      { key: "matrix_prazo_entrega", label: "Prazo de Entrega" },
      { key: "matrix_disponibilidade_produtos", label: "Disponibilidade" },
      { key: "matrix_comunicacao", label: "Comunicação" },
    ];
    return items.map(({ key, label }) => {
      const vals = activeData
        .map((r) => (r as any)[key])
        .filter((v: number) => v > 0);
      const avg = vals.length
        ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length
        : 0;
      return { label, avg: Number(avg.toFixed(1)) };
    });
  }, [activeData]);

  const overallMatrixAvg = useMemo(() => {
    const keys = [
      "matrix_facilidade_pedido",
      "matrix_clareza_condicoes",
      "matrix_prazo_entrega",
      "matrix_disponibilidade_produtos",
      "matrix_comunicacao",
    ];
    let sum = 0,
      n = 0;
    activeData.forEach((r) =>
      keys.forEach((k) => {
        const v = (r as any)[k];
        if (typeof v === "number" && v > 0) {
          sum += v;
          n++;
        }
      }),
    );
    return n ? (sum / n).toFixed(1) : "—";
  }, [activeData]);

  const commentsCount = useMemo(() => {
    const TEXT_KEYS = [
      "nps_comment",
      "melhoria_atendimento",
      "expansao_produtos",
      "oportunidade",
      "pergunta_final",
    ];
    return filtered.filter((r: any) => {
      if (
        TEXT_KEYS.some(
          (k) => typeof r[k] === "string" && r[k].trim().length > 0,
        )
      )
        return true;
      const dyn = r.dynamic_answers;
      if (dyn && typeof dyn === "object") {
        return Object.values(dyn).some(
          (v) => typeof v === "string" && (v as string).trim().length > 0,
        );
      }
      return false;
    }).length;
  }, [filtered]);

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = Object.keys(filtered[0]);
    const csv = [
      headers.join(","),
      ...filtered.map((r) =>
        headers
          .map((h) => {
            const val = (r as any)[h];
            return typeof val === "string"
              ? `"${val.replace(/"/g, '""')}"`
              : (val ?? "");
          })
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `respostas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const getNPSColor = (score: number) => {
    if (score >= 50) return "text-green-400";
    if (score >= 0) return "text-yellow-400";
    return "text-red-400";
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Search filter for responses table
  const searchedResponses = useMemo(() => {
    if (!searchResponse.trim()) return filtered;
    const term = searchResponse.toLowerCase();
    return filtered.filter(
      (r) =>
        (r.client_name || "").toLowerCase().includes(term) ||
        (r.nps_comment || "").toLowerCase().includes(term) ||
        (r.vendor_name || "").toLowerCase().includes(term) ||
        (r.melhoria_atendimento || "").toLowerCase().includes(term) ||
        (r.oportunidade || "").toLowerCase().includes(term),
    );
  }, [filtered, searchResponse]);

  // Pagination
  const totalPages = Math.ceil(searchedResponses.length / ITEMS_PER_PAGE);
  const paginatedResponses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return searchedResponses.slice(start, start + ITEMS_PER_PAGE);
  }, [searchedResponses, currentPage]);

  // Simulated trends (comparing first half vs second half of data)
  const trends = useMemo(() => {
    if (activeData.length < 4) return { responses: 0, nps: 0, avg: 0, comments: 0 };
    const mid = Math.floor(activeData.length / 2);
    const firstHalf = activeData.slice(0, mid);
    const secondHalf = activeData.slice(mid);

    const calcTrend = (a: number, b: number) => {
      if (a === 0) return b > 0 ? 100 : 0;
      return Math.round(((b - a) / a) * 100);
    };

    const halfNps = (data: typeof activeData) => {
      const scored = data.filter((r) => r.nps_score !== null);
      if (!scored.length) return 0;
      const promoters = scored.filter((r) => r.nps_score! >= 9).length;
      const detractors = scored.filter((r) => r.nps_score! <= 6).length;
      return Math.round(((promoters - detractors) / scored.length) * 100);
    };

    return {
      responses: calcTrend(firstHalf.length, secondHalf.length),
      nps: calcTrend(halfNps(firstHalf), halfNps(secondHalf)),
      avg: 0,
      comments: calcTrend(
        firstHalf.filter((r) => r.nps_comment).length,
        secondHalf.filter((r) => r.nps_comment).length,
      ),
    };
  }, [activeData]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">
            Olá, {userName?.split(" ")[0] || "Usuário"}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Dashboard analítico e visão geral das avaliações NPS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-2 px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text-main hover:bg-surface-hover transition-colors whitespace-nowrap"
          >
            <Filter className="w-4 h-4 transition-colors" />
            {showMobileFilters ? "Ocultar Filtros" : "Filtros"}
          </button>
          <button
            onClick={() => fetchData(activeEmpresaId)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-fg text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            <RefreshCw className="w-4 h-4 transition-colors" />
            Atualizar
          </button>
        </div>
      </div>

        {/* Sticky Filters */}
        <div className="sticky top-0 z-30 -mx-2 px-2 py-2">
          <div
            className={`bg-card rounded-xl p-4 md:p-5 shadow-sm border border-border/50 max-w-6xl mx-auto space-y-4 overflow-y-auto max-h-[60vh] md:max-h-none ${showMobileFilters ? "block" : "hidden md:block"}`}
          >
            {/* Filtros em Grid responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 md:flex md:flex-wrap items-end justify-between gap-3 md:gap-4">
              <div className="flex flex-col gap-1 w-full md:w-[130px]">
                <Label className="text-[10px] uppercase tracking-wider text-text-muted font-medium px-1">
                  De
                </Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 w-full bg-bg border border-border text-text-main text-sm"
                />
              </div>
              <div className="flex flex-col gap-1 w-full md:w-[130px]">
                <Label className="text-[10px] uppercase tracking-wider text-text-muted font-medium px-1">
                  Até
                </Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 w-full bg-bg border border-border text-text-main text-sm"
                />
              </div>
              <div className="flex flex-col gap-1 w-full md:flex-1 md:min-w-[160px]">
                <Label className="text-[10px] uppercase tracking-wider text-text-muted font-medium px-1">
                  Vendedor
                </Label>
                <Select value={vendorFilter} onValueChange={setVendorFilter}>
                  <SelectTrigger className="h-9 w-full bg-bg border border-border text-text-main text-sm">
                    <SelectValue placeholder="Todos" className="truncate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os vendedores</SelectItem>
                    {vendors.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isSuperAdmin && empresas.length > 0 && (
                <div className="flex flex-col gap-1 w-full md:flex-1 md:min-w-[160px]">
                  <Label className="text-[10px] uppercase tracking-wider text-text-muted font-medium px-1">
                    Empresa
                  </Label>
                  <Select
                    value={selectedEmpresa}
                    onValueChange={(v) => {
                      setSelectedEmpresa(v);
                    }}
                  >
                    <SelectTrigger className="h-9 w-full bg-bg border border-border text-text-main text-sm">
                      <SelectValue placeholder="Todas" className="truncate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as empresas</SelectItem>
                      {empresas.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex flex-col gap-1 w-full md:flex-1 md:min-w-[150px]">
                <Label className="text-[10px] uppercase tracking-wider text-text-muted font-medium px-1">
                  NPS
                </Label>
                <Select
                  value={npsBucketFilter}
                  onValueChange={(v) => setNpsBucketFilter(v as NpsBucket)}
                >
                  <SelectTrigger className="h-9 w-full bg-bg border border-border text-text-main text-sm">
                    <SelectValue placeholder="Todas" className="truncate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as notas</SelectItem>
                    <SelectItem value="detractors">Detratores (0–6)</SelectItem>
                    <SelectItem value="passives">Neutros (7–8)</SelectItem>
                    <SelectItem value="promoters">Promotores (9–10)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1 w-full md:flex-[1.5] md:min-w-[180px] col-span-2 sm:col-span-1">
                <Label className="text-[10px] uppercase tracking-wider text-text-muted font-medium px-1">
                  Pergunta
                </Label>
                <Select
                  value={subjectiveFilter}
                  onValueChange={(v) => setSubjectiveFilter(v as SubjectiveKey)}
                >
                  <SelectTrigger className="h-9 w-full bg-bg border border-border text-text-main text-sm">
                    <SelectValue placeholder="Todas" className="truncate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as perguntas</SelectItem>
                    {SUBJECTIVE_OPTIONS.map((o) => (
                      <SelectItem key={o.key} value={o.key}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1 min-w-fit md:mt-0 col-span-2 sm:col-span-1">
                {/* Removido o label Ações no mobile para ficar mais clean, ou manter alinhado invisível no desk */}
                <Label className="text-[10px] uppercase tracking-wider text-transparent font-medium px-1 hidden md:block select-none">
                  &nbsp;
                </Label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                      setVendorFilter("all");
                      setNpsBucketFilter("all");
                      setSubjectiveFilter("all");
                    }}
                    disabled={
                      !dateFrom &&
                      !dateTo &&
                      vendorFilter === "all" &&
                      npsBucketFilter === "all" &&
                      subjectiveFilter === "all"
                    }
                    className="h-9 px-3 w-full md:w-auto rounded-md bg-bg border border-border text-text-muted hover:bg-surface-hover hover:text-text-main transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                </div>
              </div>
            </div>

            {/* Resumo + ações */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              {(dateFrom || dateTo) && (
                <span className="px-2 py-1 rounded-md bg-accent/10 text-accent">
                  {dateFrom || "..."} → {dateTo || "hoje"}
                </span>
              )}
              {vendorFilter !== "all" && (
                <span className="px-2 py-1 rounded-md bg-accent/10 text-accent">
                  Vendedor: {vendorFilter}
                </span>
              )}
              {npsBucketFilter !== "all" && (
                <span className="px-2 py-1 rounded-md bg-accent/10 text-accent">
                  {npsBucketFilter === "detractors"
                    ? "Detratores"
                    : npsBucketFilter === "passives"
                      ? "Neutros"
                      : "Promotores"}
                </span>
              )}
              {subjectiveFilter !== "all" && (
                <span className="px-2 py-1 rounded-md bg-accent/10 text-accent">
                  {
                    SUBJECTIVE_OPTIONS.find((o) => o.key === subjectiveFilter)
                      ?.label
                  }
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ============ [1] VISÃO GERAL ============ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-main tracking-tight leading-tight">
                  Visão Geral
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Como estamos hoje — números-chave do recorte atual
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleSection("visao-geral")}
              className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors font-medium"
            >
              {expandedSections["visao-geral"] ? "Recolher" : "Expandir"}
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${expandedSections["visao-geral"] ? "rotate-180" : ""}`}
              />
            </button>
          </div>
          {expandedSections["visao-geral"] && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  icon={Users}
                  label="Respostas"
                  value={activeData.length}
                  hint={`${trends.responses > 0 ? "+" : ""}${trends.responses}% vs. período anterior`}
                  accent="text-accent"
                  accentBg="bg-accent/15"
                  gradientFrom="from-accent/20"
                  gradientVia="via-accent/10"
                  borderColor="border-accent/20"
                  shadowColor="shadow-accent/10"
                  trend={trends.responses}
                />
                <MetricCard
                  icon={TrendingUp}
                  label="NPS Score"
                  value={npsStats.score}
                  hint={npsStats.score >= 50 ? "Excelente" : npsStats.score >= 0 ? "Neutro" : "Precisa de atenção"}
                  accent={npsStats.score >= 50 ? "text-green-400" : npsStats.score >= 0 ? "text-yellow-400" : "text-red-400"}
                  accentBg={npsStats.score >= 50 ? "bg-green-500/15" : npsStats.score >= 0 ? "bg-yellow-500/15" : "bg-red-500/15"}
                  gradientFrom={npsStats.score >= 50 ? "from-green-500/20" : npsStats.score >= 0 ? "from-yellow-500/20" : "from-red-500/20"}
                  gradientVia={npsStats.score >= 50 ? "via-green-500/10" : npsStats.score >= 0 ? "via-yellow-500/10" : "via-red-500/10"}
                  borderColor={npsStats.score >= 50 ? "border-green-500/20" : npsStats.score >= 0 ? "border-yellow-500/20" : "border-red-500/20"}
                  shadowColor={npsStats.score >= 50 ? "shadow-green-500/10" : npsStats.score >= 0 ? "shadow-yellow-500/10" : "shadow-red-500/10"}
                  trend={trends.nps}
                  showProgress
                  progressValue={npsStats.score + 100}
                  progressMax={200}
                  progressGradient={npsStats.score >= 50 ? "from-green-500 to-green-400" : npsStats.score >= 0 ? "from-yellow-500 to-yellow-400" : "from-red-500 to-red-400"}
                />
                <MetricCard
                  icon={Star}
                  label="Média Matriz"
                  value={overallMatrixAvg}
                  hint="Média de todas as dimensões avaliadas"
                  accent="text-blue-400"
                  accentBg="bg-blue-500/15"
                  gradientFrom="from-blue-500/20"
                  gradientVia="via-blue-500/10"
                  borderColor="border-blue-500/20"
                  shadowColor="shadow-blue-500/10"
                  trend={trends.avg}
                  showProgress
                  progressValue={parseFloat(overallMatrixAvg) || 0}
                  progressMax={5}
                  progressGradient="from-blue-500 to-blue-400"
                />
                <MetricCard
                  icon={MessageSquare}
                  label="Com Comentários"
                  value={commentsCount}
                  hint={`${activeData.length > 0 ? Math.round((commentsCount / activeData.length) * 100) : 0}% do total de respostas`}
                  accent="text-purple-400"
                  accentBg="bg-purple-500/15"
                  gradientFrom="from-purple-500/20"
                  gradientVia="via-purple-500/10"
                  borderColor="border-purple-500/20"
                  shadowColor="shadow-purple-500/10"
                  trend={trends.comments}
                  showProgress
                  progressValue={commentsCount}
                  progressMax={activeData.length || 1}
                  trendLabel={`${activeData.length > 0 ? Math.round((commentsCount / activeData.length) * 100) : 0}% do total`}
                  progressGradient="from-purple-500 to-purple-400"
                />
              </div>
            </div>
          )}
          {/* KPIs secundários */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CommentRateCard data={activeData} />
            <RepeatCustomerCard data={activeData} />
            <CompletionRateCard data={activeData} />
          </div>
          {/* Alertas críticos só quando houver detratores no recorte */}
          {npsStats.detractors > 0 && (
            <DetractorAlerts data={activeData as any} />
          )}
        </section>

        {/* ============ NAVEGAÇÃO DAS SEÇÕES ============ */}
        <div className="bg-surface border border-border rounded-xl p-3">
          <SectionNav
            value={activeSection}
            onChange={setActiveSection}
            items={[
              { id: "nps", label: "NPS" },
              { id: "satisfacao", label: "Satisfação" },
              ...(hasMultipleVendors
                ? [{ id: "vendedores", label: "Vendedores" }]
                : []),
              { id: "insights", label: "Insights" },
              { id: "respostas", label: "Respostas" },
            ]}
          />
        </div>

        {/* ============ [2] NPS ============ */}
        {(activeSection === "nps" || activeSection === "todas") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10 text-accent">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-main tracking-tight leading-tight">
                    NPS
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Quanto clientes recomendariam — distribuição, tendência e fonte
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleSection("nps")}
                className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors font-medium"
              >
                {expandedSections["nps"] ? "Recolher" : "Expandir"}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${expandedSections["nps"] ? "rotate-180" : ""}`}
                />
              </button>
            </div>
            {expandedSections["nps"] && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-surface border border-border rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-text-main text-base font-semibold">
                        Distribuição NPS
                      </CardTitle>
                    </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={npsDistribution}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)" strokeOpacity={0.5}
                      />
                      <XAxis
                        dataKey="score"
                        stroke="var(--color-text-muted)"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="var(--color-text-muted)"
                        fontSize={12}
                        allowDecimals={false}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 10,
                          color: "var(--color-text-main)",
                          padding: "10px 14px",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                        }}
                        itemStyle={{ color: "var(--color-text-main)" }}
                        labelStyle={{ color: "var(--color-text-main)" }}
                        formatter={(value: any) => [
                          `${value} resposta(s)`,
                          "Quantidade",
                        ]}
                        labelFormatter={(label) => `Nota ${label}`}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {npsDistribution.map((entry, index) => {
                          const score = Number(entry.score);
                          const color =
                            score <= 6
                              ? "#ef4444"
                              : score <= 8
                                ? "#eab308"
                                : "#22c55e";
                          return <Cell key={index} fill={color} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-3 text-xs text-muted-foreground">
                    <span>🔴 Detratores: {npsStats.detractors}</span>
                    <span>🟡 Neutros: {npsStats.passives}</span>
                    <span>🟢 Promotores: {npsStats.promoters}</span>
                  </div>
                </CardContent>
              </Card>
              <NPSTrendChart data={activeData as any} />
            </div>
            <SourceComparisonCard data={activeData as any} />
            <div className="grid md:grid-cols-2 gap-6">
              <MonthOverMonthCard data={activeData} />
              <TimeHeatmap data={activeData} />
            </div>
              </div>
            )}
          </section>
        )}

        {/* ============ [3] SATISFAÇÃO & QUALIDADE ============ */}
        {(activeSection === "satisfacao" || activeSection === "todas") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10 text-accent">
                  <Smile className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-main tracking-tight leading-tight">
                    Satisfação & Qualidade
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Onde estamos bem e onde precisamos melhorar
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleSection("satisfacao")}
                className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors font-medium"
              >
                {expandedSections["satisfacao"] ? "Recolher" : "Expandir"}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${expandedSections["satisfacao"] ? "rotate-180" : ""}`}
                />
              </button>
            </div>
            {expandedSections["satisfacao"] && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-surface border border-border rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-text-main text-base font-semibold">
                        Satisfação (CSAT)
                      </CardTitle>
                    </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={csatData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={50}
                        dataKey="value"
                        label={({ name, percent = 0, x, y }: any) => {
                          const short: Record<string, string> = {
                            "Muito satisfeito": "Muito satisf.",
                            "Muito insatisfeito": "Muito insatisf.",
                          };
                          return (
                            <text
                              x={x}
                              y={y}
                              fill="#f8fafc"
                              fontSize={11}
                              textAnchor={x > 200 ? "start" : "end"}
                              dominantBaseline="central"
                            >
                              {`${short[name] || name} ${(percent * 100).toFixed(0)}%`}
                            </text>
                          );
                        }}
                        labelLine={{
                          stroke: "#475569",
                          strokeWidth: 1,
                        }}
                      >
                        {csatData.map((entry, i) => (
                          <Cell key={i} fill={getCsatColor(entry.name, i)} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 10,
                          color: "var(--color-text-main)",
                          padding: "10px 14px",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                        }}
                        itemStyle={{ color: "var(--color-text-main)" }}
                        labelStyle={{ color: "var(--color-text-main)" }}
                        formatter={(value: any, name: any) => [
                          `${value} resposta(s)`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="bg-surface border border-border rounded-xl">
                <CardHeader>
                  <CardTitle className="text-text-main text-base font-semibold">
                    Avaliação por Critério (Média)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={matrixAvg} layout="vertical">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)" strokeOpacity={0.5}
                      />
                      <XAxis
                        type="number"
                        domain={[0, 5]}
                        stroke="var(--color-text-muted)"
                        fontSize={12}
                      />
                      <YAxis
                        type="category"
                        dataKey="label"
                        width={130}
                        stroke="var(--color-text-muted)"
                        fontSize={12}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid var(--color-border)",
                          borderRadius: 8,
                          color: "var(--color-text-main)",
                        }}
                        itemStyle={{ color: "var(--color-text-main)" }}
                        labelStyle={{ color: "var(--color-text-main)" }}
                      />
                      <Bar
                        dataKey="avg"
                        radius={[0, 4, 4, 0]}
                        fill="#3b82f6"
                        fillOpacity={0.45}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <CorrelationCard data={activeData as any} />
            <div className="grid md:grid-cols-2 gap-6">
              <DistributionBarsCard
                data={activeData}
                field="atendimento_comercial"
                title="Atendimento Comercial"
                icon={Briefcase}
                order={["Excelente", "Bom", "Regular", "Ruim", "Péssimo"]}
                colorMap={{
                  Excelente: "#22c55e",
                  Bom: "#4ade80",
                  Regular: "#eab308",
                  Ruim: "#f97316",
                  Péssimo: "#ef4444",
                }}
                hint="Distribuição das respostas para 'Como foi o atendimento comercial?'. Conta cada categoria nas respostas filtradas. Use para identificar quedas em qualidade de atendimento."
              />
              <DistributionBarsCard
                data={activeData}
                field="entendimento_consultor"
                title="Entendimento do Consultor"
                icon={UserCheck}
                layout="vertical"
                order={["Sim totalmente", "Sim", "Mais ou menos", "Não"]}
                colorMap={{
                  "Sim totalmente": "#22c55e",
                  Sim: "#4ade80",
                  "Mais ou menos": "#eab308",
                  Não: "#ef4444",
                }}
                hint="Distribuição da pergunta 'O consultor entendeu sua necessidade?'. Indica se o time comercial está captando bem o que o cliente precisa."
              />
            </div>
            <DistributionBarsCard
              data={activeData}
              field="experiencia_compra"
              title="Experiência de Compra"
              icon={ShoppingCart}
              order={[
                "Muito fácil",
                "Fácil",
                "Neutra",
                "Difícil",
                "Muito difícil",
              ]}
              colorMap={{
                "Muito fácil": "#22c55e",
                Fácil: "#4ade80",
                Neutra: "#eab308",
                Difícil: "#f97316",
                "Muito difícil": "#ef4444",
              }}
              hint="Distribuição de 'Como foi a experiência de compra?'. Mede a fricção percebida no processo, do pedido à conclusão."
            />
            <DynamicQuestionsChart data={activeData} />
            </div>
            )}
          </section>
        )}

        {/* ============ [3.5] VENDEDORES ============ */}
        {(activeSection === "vendedores" || activeSection === "todas") &&
          hasMultipleVendors && (
            <section className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-main tracking-tight leading-tight">
                      Vendedores
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5">
                      Performance comparativa do time comercial
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection("vendedores")}
                  className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors font-medium"
                >
                  {expandedSections["vendedores"] ? "Recolher" : "Expandir"}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${expandedSections["vendedores"] ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
              {expandedSections["vendedores"] && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <SellerRanking data={activeData} />
                  <div className="grid md:grid-cols-2 gap-6">
                    <SellerComparison data={activeData} />
                    <SellerMatrixHeatmap data={activeData} />
                  </div>
                </div>
              )}
            </section>
          )}

        {/* ============ [4] INSIGHTS QUALITATIVOS ============ */}
        {(activeSection === "insights" || activeSection === "todas") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10 text-accent">
                  <Quote className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-main tracking-tight leading-tight">
                    Insights Qualitativos
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    O que os clientes estão dizendo e quando estão respondendo
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleSection("insights")}
                className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors font-medium"
              >
                {expandedSections["insights"] ? "Recolher" : "Expandir"}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${expandedSections["insights"] ? "rotate-180" : ""}`}
                />
              </button>
            </div>
            {expandedSections["insights"] && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid md:grid-cols-2 gap-6">
                  <SentimentAnalysis data={activeData} />
                  <EmergingThemes data={activeData} />
                </div>
                <KeyPhrasesCard data={activeData as any} />
                <ResponseVolumeChart data={activeData} />
              </div>
            )}
          </section>
        )}

        {/* ============ [5] RESPOSTAS ============ */}
        {(activeSection === "respostas" || activeSection === "todas") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10 text-accent">
                  <ListChecks className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-main tracking-tight leading-tight">
                    Respostas Recentes
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Tabela bruta das últimas respostas do recorte — clique numa linha para abrir o detalhe
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleSection("respostas")}
                className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors font-medium"
              >
                {expandedSections["respostas"] ? "Recolher" : "Expandir"}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${expandedSections["respostas"] ? "rotate-180" : ""}`}
                />
              </button>
            </div>
            {expandedSections["respostas"] && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <Card className="bg-surface border border-border rounded-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-text-main text-base font-semibold">
                      Lista de respostas ({searchedResponses.length})
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <Input
                          type="text"
                          placeholder="Buscar cliente, comentário..."
                          value={searchResponse}
                          onChange={(e) => {
                            setSearchResponse(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="h-8 pl-8 pr-8 w-48 bg-bg border border-border text-text-main text-sm"
                        />
                        {searchResponse && (
                          <button
                            onClick={() => setSearchResponse("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowResponsesTable((v) => !v)}
                        className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                      >
                        {showResponsesTable ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Ocultar
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Exibir
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {showResponsesTable && (
                    <CardContent className="overflow-x-auto">
                      {/* Mobile card view */}
                      <div className="md:hidden space-y-2">
                        {paginatedResponses.map((r) => (
                          <div
                        key={r.id}
                        className="bg-surface border border-border rounded-xl p-3 cursor-pointer active:bg-accent/20"
                        onClick={() => setDetailResponse(r)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-text-muted">
                            {new Date(r.created_at).toLocaleDateString("pt-BR")}
                          </span>
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold text-xs ${
                              (r.nps_score ?? 0) >= 9
                                ? "bg-green-500/15 text-green-400"
                                : (r.nps_score ?? 0) >= 7
                                  ? "bg-yellow-500/15 text-yellow-400"
                                  : "bg-red-500/15 text-red-400"
                            }`}
                          >
                            {r.nps_score ?? "—"}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-text-main truncate">
                          {(r as any).client_name || (r as any).client_id || (
                            <span className="text-text-muted italic">
                              Anônimo
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {(r as any).vendor_name && (
                            <span className="text-[10px] text-muted-foreground">
                              Vendedor: {(r as any).vendor_name}
                            </span>
                          )}
                          {r.source && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                              {r.source}
                            </span>
                          )}
                        </div>
                        {r.nps_comment && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {r.nps_comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Desktop table view */}
                  <table className="w-full text-sm hidden md:table">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground">
                        <th className="text-left py-3 px-3 font-medium">
                          Data
                        </th>
                        <th className="text-left py-3 px-3 font-medium">
                          Identificação
                        </th>
                        <th className="text-left py-3 px-3 font-medium">NPS</th>
                        <th className="text-left py-3 px-3 font-medium">
                          CSAT
                        </th>
                        <th className="text-left py-3 px-3 font-medium">
                          Comercial
                        </th>
                        <th className="text-left py-3 px-3 font-medium">
                          Compra
                        </th>
                        <th className="text-left py-3 px-3 font-medium">
                          Fonte
                        </th>
                        <th className="text-left py-3 px-3 font-medium">
                          Comentário NPS
                        </th>
                        <th className="text-center py-3 px-3 font-medium">
                          Média
                        </th>
                        {profile?.is_super_admin && (
                          <th className="text-center py-3 px-3 font-medium w-12"></th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedResponses.map((r) => (
                        <tr
                          key={r.id}
                          className="border-b border-border/20 text-text-main hover:bg-accent/10 transition-colors cursor-pointer"
                          onClick={(e) => {
                            if ((e.target as HTMLElement).closest("button"))
                              return;
                            setDetailResponse(r);
                          }}
                        >
                          <td className="py-3 px-3 whitespace-nowrap">
                            {new Date(r.created_at).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="py-3 px-3 max-w-[200px]">
                            <div className="flex flex-col leading-tight">
                              <span className="text-foreground truncate font-medium">
                                {(r as any).client_name ||
                                  (r as any).client_id || (
                                    <span className="text-text-muted italic">
                                      Anônimo
                                    </span>
                                  )}
                              </span>
                              <span className="text-[11px] text-muted-foreground truncate">
                                {(r as any).vendor_name
                                  ? `Vendedor: ${(r as any).vendor_name}`
                                  : "Sem vendedor"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                                (r.nps_score ?? 0) >= 9
                                  ? "bg-green-500/15 text-green-400"
                                  : (r.nps_score ?? 0) >= 7
                                    ? "bg-yellow-500/15 text-yellow-400"
                                    : "bg-red-500/15 text-red-400"
                              }`}
                            >
                              {r.nps_score ?? "—"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${
                                r.csat === "Muito satisfeito"
                                  ? "bg-green-500/15 text-green-400"
                                  : r.csat === "Satisfeito"
                                    ? "bg-emerald-500/15 text-emerald-400"
                                    : r.csat === "Neutro"
                                      ? "bg-yellow-500/15 text-yellow-400"
                                      : r.csat === "Insatisfeito"
                                        ? "bg-orange-500/15 text-orange-400"
                                        : r.csat === "Muito insatisfeito"
                                          ? "bg-red-500/15 text-red-400"
                                          : "text-muted-foreground"
                              }`}
                            >
                              {r.csat || "—"}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            {r.atendimento_comercial || "—"}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            {r.experiencia_compra || "—"}
                          </td>
                          <td className="py-3 px-3">
                            {r.source ? (
                              <span className="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary">
                                {r.source}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-3 px-3 max-w-[250px] truncate">
                            {r.nps_comment || "—"}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {(() => {
                              const vals = [
                                r.matrix_facilidade_pedido,
                                r.matrix_clareza_condicoes,
                                r.matrix_prazo_entrega,
                                r.matrix_disponibilidade_produtos,
                                r.matrix_comunicacao,
                              ].filter((v) => v > 0);
                              const avg = vals.length
                                ? vals.reduce((a, b) => a + b, 0) / vals.length
                                : 0;
                              return (
                                <span
                                  className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-bold text-base ${
                                    avg >= 4
                                      ? "bg-green-500/15 text-green-400"
                                      : avg >= 3
                                        ? "bg-yellow-500/15 text-yellow-400"
                                        : avg > 0
                                          ? "bg-red-500/15 text-red-400"
                                          : "text-muted-foreground"
                                  }`}
                                >
                                  {avg > 0 ? avg.toFixed(1) : "—"}
                                </span>
                              );
                            })()}
                          </td>
                          {profile?.is_super_admin && (
                            <td className="py-3 px-3 text-center">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button
                                    className="text-text-muted hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10"
                                    title="Excluir resposta"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card border-border">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-text-main">
                                      Excluir resposta
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-text-muted">
                                      Tem certeza que deseja excluir
                                      permanentemente esta resposta do banco de
                                      dados? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-border text-text-main rounded-xl">
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                      onClick={async () => {
                                        try {
                                          await excluirRespostas([r.id]);
                                          toast.success(
                                            "Resposta excluída com sucesso!",
                                          );
                                          fetchData();
                                        } catch {
                                          toast.success("Erro ao excluir");
                                        }
                                      }}
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </td>
                          )}
                        </tr>
                      ))}
                      {!paginatedResponses.length && (
                        <tr>
                          <td
                            colSpan={profile?.is_super_admin ? 9 : 8}
                            className="text-center py-12 text-muted-foreground"
                          >
                            Nenhuma resposta encontrada
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {/* Pagination */}
                  {searchedResponses.length > ITEMS_PER_PAGE && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                      <p className="text-xs text-text-muted">
                        Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                        {Math.min(currentPage * ITEMS_PER_PAGE, searchedResponses.length)} de{" "}
                        {searchedResponses.length}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="h-8 px-2"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-xs text-text-muted">
                          {currentPage} / {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="h-8 px-2"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
            </div>
            )}
          </section>
        )}

        {/* Detail Dialog */}
        <Dialog
          open={!!detailResponse}
          onOpenChange={(open) => {
            if (!open) setDetailResponse(null);
          }}
        >
          <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] w-[95vw] sm:w-full flex flex-col overflow-hidden p-0">
            <DialogHeader className="shrink-0 border-b border-border/50 mb-0">
              <DialogTitle className="text-text-main text-lg">
                Detalhes da Resposta
              </DialogTitle>
              <DialogDescription className="text-text-muted">
                {detailResponse &&
                  new Date(detailResponse.created_at).toLocaleDateString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                {detailResponse?.source && ` · Fonte: ${detailResponse.source}`}
                {detailResponse?.client_id &&
                  ` · Cliente: ${detailResponse.client_id}`}
                {detailResponse?.order_id &&
                  ` · Pedido: ${detailResponse.order_id}`}
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto custom-scrollbar flex-1">
              {detailResponse && (
                <div className="space-y-5">
                  {/* Identification */}
                  <div>
                    <h3 className="text-sm font-semibold text-accent mb-3">
                      Identificação
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-surface border border-border rounded-xl p-3">
                        <span className="text-xs text-text-muted font-medium block mb-1">
                          Nome do Cliente
                        </span>
                        <span className="text-sm font-medium text-text-main">
                          {detailResponse.client_name || "—"}
                        </span>
                      </div>
                      <div className="bg-surface border border-border rounded-xl p-3">
                        <span className="text-xs text-text-muted font-medium block mb-1">
                          Nome do Vendedor
                        </span>
                        <span className="text-sm font-medium text-text-main">
                          {detailResponse.vendor_name || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Objective answers */}
                  <div>
                    <h3 className="text-sm font-semibold text-accent mb-3">
                      Respostas Objetivas
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-surface border border-border rounded-xl p-3">
                        <span className="text-xs text-text-muted font-medium block mb-1">
                          NPS Score
                        </span>
                        <span
                          className={`text-lg font-bold ${(detailResponse.nps_score ?? 0) >= 9 ? "text-green-400" : (detailResponse.nps_score ?? 0) >= 7 ? "text-yellow-400" : "text-red-400"}`}
                        >
                          {detailResponse.nps_score ?? "—"}
                        </span>
                      </div>
                      <div className="bg-surface border border-border rounded-xl p-3">
                        <span className="text-xs text-text-muted font-medium block mb-1">
                          Satisfação Geral (CSAT)
                        </span>
                        <span className="text-sm font-medium text-text-main">
                          {detailResponse.csat || "—"}
                        </span>
                      </div>
                      <div className="bg-surface border border-border rounded-xl p-3">
                        <span className="text-xs text-text-muted font-medium block mb-1">
                          Atendimento Comercial
                        </span>
                        <span className="text-sm font-medium text-text-main">
                          {detailResponse.atendimento_comercial || "—"}
                        </span>
                      </div>
                      <div className="bg-surface border border-border rounded-xl p-3">
                        <span className="text-xs text-text-muted font-medium block mb-1">
                          Consultor entendeu a necessidade?
                        </span>
                        <span className="text-sm font-medium text-text-main">
                          {detailResponse.entendimento_consultor || "—"}
                        </span>
                      </div>
                      <div className="bg-surface border border-border rounded-xl p-3">
                        <span className="text-xs text-text-muted font-medium block mb-1">
                          Experiência de Compra
                        </span>
                        <span className="text-sm font-medium text-text-main">
                          {detailResponse.experiencia_compra || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Matrix ratings */}
                  <div>
                    <h3 className="text-sm font-semibold text-accent mb-3">
                      Avaliação por Critério
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          label: "Facilidade de Pedido",
                          value: detailResponse.matrix_facilidade_pedido,
                        },
                        {
                          label: "Clareza Comercial",
                          value: detailResponse.matrix_clareza_condicoes,
                        },
                        {
                          label: "Prazo de Entrega",
                          value: detailResponse.matrix_prazo_entrega,
                        },
                        {
                          label: "Disponibilidade",
                          value: detailResponse.matrix_disponibilidade_produtos,
                        },
                        {
                          label: "Comunicação",
                          value: detailResponse.matrix_comunicacao,
                        },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="bg-surface border border-border rounded-xl p-3 flex items-center justify-between"
                        >
                          <span className="text-xs text-text-muted">
                            {label}
                          </span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-4 h-4 ${s <= (value || 0) ? "fill-primary text-primary" : "text-border"}`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subjective answers */}
                  <div>
                    <h3 className="text-sm font-semibold text-accent mb-3">
                      Respostas Subjetivas
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          label: "Comentário NPS",
                          value: detailResponse.nps_comment,
                        },
                        {
                          label: "O que melhorar no atendimento?",
                          value: detailResponse.melhoria_atendimento,
                        },
                        {
                          label: "Produto/solução que sente falta",
                          value: detailResponse.expansao_produtos,
                        },
                        {
                          label: "Compraria mais se...",
                          value: detailResponse.oportunidade,
                        },
                        {
                          label: "Se pudesse mudar UMA coisa",
                          value: detailResponse.pergunta_final,
                        },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="bg-surface border border-border rounded-xl p-3"
                        >
                          <span className="text-xs text-text-muted font-medium block mb-1">
                            {label}
                          </span>
                          <p className="text-sm text-text-main whitespace-pre-wrap">
                            {value || (
                              <span className="text-text-muted italic">
                                Sem resposta
                              </span>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic / custom answers */}
                  {detailResponse.dynamic_answers &&
                    Object.keys(detailResponse.dynamic_answers).length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-accent mb-3">
                          Perguntas Personalizadas
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(detailResponse.dynamic_answers)
                            .filter(
                              ([k]) =>
                                ![
                                  "nps_score",
                                  "csat",
                                  "atendimento_comercial",
                                  "entendimento_consultor",
                                  "melhoria_atendimento",
                                  "experiencia_compra",
                                  "matrix_principal",
                                  "expansao_produtos",
                                  "oportunidade",
                                  "pergunta_final",
                                ].includes(k),
                            )
                            .map(([k, v]) => (
                              <div
                                key={k}
                                className="bg-surface border border-border rounded-xl p-3"
                              >
                                <span className="text-xs text-text-muted font-medium block mb-1 font-mono">
                                  {k}
                                </span>
                                <p className="text-sm text-text-main whitespace-pre-wrap">
                                  {Array.isArray(v)
                                    ? v.join(", ")
                                    : typeof v === "object"
                                      ? JSON.stringify(v)
                                      : String(v ?? "—")}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={showDeleteAllDialog}
          onOpenChange={setShowDeleteAllDialog}
        >
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-text-main">
                Excluir respostas?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-text-muted">
                Tem certeza que deseja excluir {filtered.length} resposta(s)?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border text-text-main rounded-xl">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteAll}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

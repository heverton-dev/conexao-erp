import { createRoute, useNavigate } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useState, useEffect } from "react";
import { useAuth, useCan } from "~/lib/auth";
import {
  listarCadastros,
  deletarCadastro,
  atualizarCadastro,
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
import {
  Search,
  Trash2,
  Pencil,
  XCircle,
  X,
  Link2,
  Clock,
  AlertTriangle,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { EmptyState } from "~/components/ui/empty-state";
import { Skeleton } from "~/components/ui/skeleton";
import { RequirePermission } from "~/components/guards";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "~/components/ui/pagination";
import {
  KPICard,
  KPI_PRESETS,
  StatusBreakdown,
  CadastroCard,
  usePagination,
} from "~/features/cadastros/components";

export const clientesRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/cadastros/solicitacoes",
  component: () => (
    <RequirePermission
      modulo="cadastros"
      permissions={["ver_todos_cadastros", "gerar_links"]}
    >
      <ClientesPage />
    </RequirePermission>
  ),
});

function ClientesPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const podeExcluir = useCan("excluir_cadastro");
  const podeVerTodos = useCan("ver_todos_cadastros");
  const [data, setData] = useState<
    (Cadastro & { profiles: { nome: string } | null })[]
  >([]);
  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<CadastroStatus | "">("");
  const [filtroConsultor, setFiltroConsultor] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Cadastro | null>(null);
  const [editForm, setEditForm] = useState({
    lead_nome: "",
    lead_email: "",
    lead_whatsapp: "",
    codigo_cliente: "",
    observacoes: "",
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [docsStatus, setDocsStatus] = useState<Record<string, DocStatus>>({});

  useEffect(() => {
    if (editTarget) {
      setEditForm({
        lead_nome: editTarget.lead_nome || "",
        lead_email: editTarget.lead_email || "",
        lead_whatsapp: editTarget.lead_whatsapp || "",
        codigo_cliente: editTarget.codigo_cliente || "",
        observacoes: editTarget.observacoes || "",
      });
    }
  }, [editTarget]);

  useEffect(() => {
    if (profile?.ambiente === "consultor") {
      navigate({ to: "/cadastros/consultor/clientes", replace: true });
      return;
    }
    carregar();
  }, [profile]);

  async function carregar() {
    if (!profile) return;
    setLoading(true);
    try {
      const filters: { created_by?: string } = {};
      if (podeVerTodos !== true)
        filters.created_by = profile.id;
      const res = await listarCadastros(
        Object.keys(filters).length ? filters : undefined,
      );
      setData(res);
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

  async function handleEditSave() {
    if (!editTarget) return;
    setEditSubmitting(true);
    try {
      await atualizarCadastro(editTarget.id, editForm);
      toast.success("Registro atualizado com sucesso");
      setEditTarget(null);
      carregar();
    } catch (e) {
      toast.error("Erro ao atualizar registro");
      console.error(e);
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deletarCadastro(id);
      toast.success("Registro excluído com sucesso");
      setDeleteConfirm(null);
      carregar();
    } catch (e) {
      toast.error("Erro ao excluir registro");
      console.error(e);
    }
  }

  const consultores = [
    ...new Set(data.map((c) => c.profiles?.nome).filter(Boolean)),
  ].sort();

  const dataWithoutAprovado = data.filter((c) => c.status !== "aprovado");

  const dataForConsultor = dataWithoutAprovado.filter((c) => {
    if (filtroConsultor && (c.profiles?.nome || "") !== filtroConsultor)
      return false;
    return true;
  });

  const filtered = dataForConsultor.filter((c) => {
    if (filtroStatus && c.status !== filtroStatus) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (c.lead_nome || c.nome_temporario || "").toLowerCase().includes(q) ||
      (c.codigo_cliente || "").toLowerCase().includes(q)
    );
  });

  const stats = {
    total: dataForConsultor.length,
    link_gerado: dataForConsultor.filter((c) => c.status === "link_gerado")
      .length,
    dados_enviados: dataForConsultor.filter(
      (c) => c.status === "dados_enviados",
    ).length,
    em_analise: dataForConsultor.filter((c) => c.status === "em_analise")
      .length,
    em_correcao: dataForConsultor.filter((c) => c.status === "em_correcao")
      .length,
    reprovados: dataForConsultor.filter((c) => c.status === "reprovado")
      .length,
  };

  const pendentes = stats.em_analise + stats.dados_enviados + stats.em_correcao;

  const { paginatedItems, currentPage, totalPages, canPrev, canNext, nextPage, prevPage, goTo, reset } =
    usePagination(filtered, 12);

  // Reset pagination when filters/search change
  useEffect(() => {
    reset();
  }, [search, filtroStatus, filtroConsultor, reset]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">
            Solicitações
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {filtered.length}{" "}
            {filtered.length === 1
              ? "solicitação pendente"
              : "solicitações pendentes"}
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou código..."
            className="pl-11 h-12"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {podeVerTodos && (
          <Select
            value={filtroConsultor}
            onValueChange={(v) => setFiltroConsultor(v)}
          >
            <SelectTrigger className="w-full lg:w-56 h-12 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200">
              <SelectValue placeholder="Todos os consultores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os consultores</SelectItem>
              {consultores.map((nome) => (
                <SelectItem key={nome} value={nome!}>
                  {nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
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
            subtitle="Solicitações ativas"
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
            icon={Link2}
            label="Links"
            value={stats.link_gerado}
            subtitle="Aguardando preenchimento"
            colorClass={KPI_PRESETS.links}
          />
          <KPICard
            icon={AlertTriangle}
            label="Correção"
            value={stats.em_correcao}
            subtitle="Precisa de ajustes"
            colorClass={KPI_PRESETS.correcao}
          />
        </div>
      )}

      {/* Status Breakdown */}
      {!loading && podeVerTodos && (
        <StatusBreakdown
          items={[
            {
              label: "Todos",
              value: stats.total,
              icon: Users,
              color: "text-accent",
              bg: "bg-accent/10",
              border: "border-accent/20",
              filter: "",
            },
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
              label: "Análise",
              value: stats.em_analise + stats.dados_enviados,
              icon: Clock,
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
          onSelect={(f) => setFiltroStatus((f as CadastroStatus | "") || "")}
          cols="5"
        />
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="w-10 h-10 text-text-muted/30" />}
          title="Nenhuma solicitação encontrada"
          description="Tente ajustar seus filtros ou termos de busca."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedItems.map((c, i) => (
              <CadastroCard
                key={c.id}
                nome={c.lead_nome || c.nome_temporario || "Sem nome"}
                statusColor={STATUS_COLOR[c.status]}
                statusLabel={STATUS_LABEL[c.status]}
                docStatusColor={
                  docsStatus[c.id]
                    ? DOC_STATUS_COLOR[docsStatus[c.id]]
                    : undefined
                }
                docStatusLabel={
                  docsStatus[c.id]
                    ? DOC_STATUS_LABEL[docsStatus[c.id]]
                    : undefined
                }
                tipoPessoa={c.tipo_pessoa ?? undefined}
                codigoCliente={c.codigo_cliente ?? undefined}
                createdBy={c.profiles?.nome ?? undefined}
                createdAt={c.created_at}
                onClick={() =>
                  navigate({
                    to: "/cadastros/solicitacoes/$id",
                    params: { id: c.id },
                  })
                }
                actions={
                  podeExcluir ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditTarget(c);
                        }}
                        className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(c.id);
                        }}
                        className="p-2 rounded-lg text-error hover:bg-error/10 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  ) : undefined
                }
                index={i}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => canPrev && prevPage()}
                    className={!canPrev ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <PaginationItem key={idx}>
                    <PaginationLink
                      isActive={currentPage === idx + 1}
                      onClick={() => goTo(idx + 1)}
                      className="cursor-pointer"
                    >
                      {idx + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => canNext && nextPage()}
                    className={!canNext ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Delete AlertDialog */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={(o) => !o && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <div className="h-1 w-full bg-gradient-to-r from-error via-error to-error rounded-t-2xl" />
          <div className="p-6 sm:p-8">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-3 text-lg">
                <div className="w-10 h-10 rounded-xl bg-error/15 flex items-center justify-center">
                  <XCircle className="text-error" size={20} />
                </div>
                Confirmar exclusão
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-text-muted leading-relaxed">
                Tem certeza que deseja excluir este cliente? Esta ação não pode
                ser desfeita e todos os dados associados serão removidos
                permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                className="bg-error text-white hover:bg-error/90 shadow-lg shadow-error/25"
              >
                Excluir permanentemente
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize as informações do cliente abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-secondary">
                Nome do Lead
              </label>
              <Input
                value={editForm.lead_nome}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    lead_nome: e.target.value,
                  }))
                }
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-secondary">
                E-mail do Lead
              </label>
              <Input
                value={editForm.lead_email}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    lead_email: e.target.value,
                  }))
                }
                type="email"
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-secondary">
                WhatsApp do Lead
              </label>
              <Input
                value={editForm.lead_whatsapp}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    lead_whatsapp: e.target.value,
                  }))
                }
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-secondary">
                Código do Cliente
              </label>
              <Input
                value={editForm.codigo_cliente}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    codigo_cliente: e.target.value,
                  }))
                }
                placeholder="Código interno"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-secondary">
                Observações
              </label>
              <textarea
                value={editForm.observacoes}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    observacoes: e.target.value,
                  }))
                }
                rows={3}
                className="flex w-full rounded-xl border border-border bg-input-bg px-4 py-3 text-sm text-text-main font-medium shadow-sm transition-all duration-200 placeholder:text-text-muted/60 hover:border-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:border-accent resize-none"
                placeholder="Anotações sobre o cliente..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSave} loading={editSubmitting}>
              {editSubmitting ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
  Search,
  Trash2,
  Pencil,
  XCircle,
  X,
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
import { CadastroCard, usePagination } from "~/features/cadastros/components";
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

export const cadastrosClientesRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/cadastros/clientes",
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
    carregar();
  }, [profile]);

  async function carregar() {
    if (!profile) return;
    setLoading(true);
    try {
      const filters: { created_by?: string; status?: CadastroStatus } = {
        status: "aprovado",
      };
      if (podeVerTodos !== true)
        filters.created_by = profile.id;
      const res = await listarCadastros(filters);
      setData(res);
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

  const dataForConsultor = data.filter((c) => {
    if (filtroConsultor && (c.profiles?.nome || "") !== filtroConsultor)
      return false;
    return true;
  });

  const filtered = dataForConsultor.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (c.lead_nome || c.nome_temporario || "").toLowerCase().includes(q) ||
      (c.codigo_cliente || "").toLowerCase().includes(q)
    );
  });

  const { paginatedItems, currentPage, totalPages, canPrev, canNext, nextPage, prevPage, goTo } = usePagination(filtered, 12);

  useEffect(() => {
    goTo(1);
  }, [search, filtroConsultor]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">
            Clientes
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {data.length}{" "}
            {data.length === 1 ? "cliente aprovado" : "clientes aprovados"}
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
            <SelectTrigger className="w-full lg:w-56 h-12">
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
          title="Nenhum cliente encontrado"
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
                tipoPessoa={c.tipo_pessoa}
                codigoCliente={c.codigo_cliente}
                createdBy={c.profiles?.nome}
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
                      {profile?.is_super_admin && (
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
                      )}
                    </>
                  ) : undefined
                }
                avatarColor="green"
                index={i}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => prevPage()}
                    className={canPrev ? "" : "pointer-events-none opacity-50"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => goTo(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => nextPage()}
                    className={canNext ? "" : "pointer-events-none opacity-50"}
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

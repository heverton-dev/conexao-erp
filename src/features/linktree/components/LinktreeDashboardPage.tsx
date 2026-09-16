import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  ExternalLink,
  Pencil,
  QrCode,
  Trash2,
  Loader2,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
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
import { useAuth, useCan } from "~/core/auth";
import { EMPRESA_ID } from "~/config/empresa";
import { supabase } from "~/core/supabase";
import {
  buildCardUrl,
  downloadQrPng,
} from "~/features/linktree/index";
import {
  useColaboradores,
  useToggleColaborador,
  useDeletarColaborador,
} from "~/features/linktree/hooks/useLinktreeColaboradores";
import { LinktreeColaboradorModal } from "./LinktreeColaboradorModal";
import { LinktreeQrModal } from "./LinktreeQrModal";
import type { LinktreeColaboradorComCredencial } from "~/features/linktree/types";

export function LinktreeDashboardPage() {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isSuper = profile?.is_super_admin === true;
  const podeVerDashboard = useCan("lt_ver_dashboard");
  const podeCriarColaborador = useCan("lt_criar_colaborador");
  const podeToggleStatus = useCan("lt_toggle_status");
  const podeVerLink = useCan("lt_ver_link");
  const podeEditarColaborador = useCan("lt_editar_colaborador");
  const podeVerQr = useCan("lt_ver_qr");
  const podeBaixarQr = useCan("lt_baixar_qr");
  const podeExcluirColaborador = useCan("lt_excluir_colaborador");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] =
    useState<LinktreeColaboradorComCredencial | null>(null);
  const [toDelete, setToDelete] =
    useState<LinktreeColaboradorComCredencial | null>(null);
  const [qrView, setQrView] = useState<LinktreeColaboradorComCredencial | null>(
    null,
  );

  const [filtroEmpresa, setFiltroEmpresa] = useState<string>(
    EMPRESA_ID,
  );

  const { data: empresas = [] } = useQuery({
    queryKey: ["empresas-list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("empresas")
        .select("id, nome")
        .order("nome");
      return data ?? [];
    },
    enabled: !!isSuper,
  });

  const queryEmpresa = isSuper ? (filtroEmpresa || undefined) : undefined;
  const {
    data: rows = null,
    isLoading,
    refetch,
  } = useColaboradores(queryEmpresa);

  const toggleMutation = useToggleColaborador();
  const deleteMutation = useDeletarColaborador();

  useEffect(() => {
    if (authLoading) return;
    if (!isSuper && !podeVerDashboard) {
      toast.error("Voce nao tem permissao para acessar o Dashboard");
      navigate({ to: "/", replace: true });
    }
  }, [authLoading, isSuper, podeVerDashboard, navigate]);

  function handleToggle(c: LinktreeColaboradorComCredencial) {
    const next = c.status === "ativo" ? "inativo" : "ativo";
    toggleMutation.mutate({ id: c.id, status: next });
  }

  function handleDelete() {
    if (!toDelete) return;
    deleteMutation.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success("Colaborador excluido");
        setToDelete(null);
      },
      onError: (e: any) => {
        toast.error(`Falha ao excluir: ${e.message}`);
      },
    });
  }

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-text-main">LinkTree</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os cartoes digitais e QR Codes dos colaboradores.
          </p>
        </div>
        {podeCriarColaborador && (
          <Button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Novo LinkTree</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        )}
      </header>

        {isSuper && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-muted-foreground">
            Filtrar por empresa:
          </label>
          <select
            value={filtroEmpresa}
            onChange={(e) => {
              setFiltroEmpresa(e.target.value);
            }}
            className="h-9 w-full max-w-xs rounded-md border border-border/70 bg-surface/60 px-3 text-sm"
          >
            <option value="">Todas as empresas</option>
            {empresas.map((e: any) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" /> Carregando...
          </div>
        ) : !rows || rows.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            Nenhum colaborador cadastrado ainda. Clique em{" "}
            <strong>Novo LinkTree</strong> para comecar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="p-4">Colaborador</th>
                  <th className="hidden p-4 md:table-cell">Cargo</th>
                  <th className="hidden p-4 lg:table-cell">E-mail</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border last:border-0 hover:bg-surface-hover/50"
                  >
                    <td className="p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-surface-hover">
                          {c.foto_url ? (
                            <img
                              src={c.foto_url}
                              alt={c.nome}
                              className="size-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold">
                              {c.nome.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-text-main">
                            {c.nome}
                          </div>
                          <div className="truncate text-xs text-muted-foreground md:hidden">
                            {c.cargo}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden p-4 text-muted-foreground md:table-cell">
                      {c.cargo}
                    </td>
                    <td className="hidden p-4 text-muted-foreground lg:table-cell">
                      {c.email}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={c.status === "ativo"}
                          onCheckedChange={() => handleToggle(c)}
                          disabled={!podeToggleStatus}
                        />
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            background:
                              c.status === "ativo"
                                ? "color-mix(in srgb, var(--color-success) 15%, transparent)"
                                : "color-mix(in srgb, var(--color-warning) 15%, transparent)",
                            color:
                              c.status === "ativo"
                                ? "var(--color-success)"
                                : "var(--color-warning)",
                          }}
                        >
                          {c.status === "ativo" ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        {podeVerLink && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Visualizar LinkTree"
                            asChild
                          >
                            <a
                              href={buildCardUrl(c.id)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink className="size-4" />
                            </a>
                          </Button>
                        )}
                        {podeEditarColaborador && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Editar"
                            onClick={() => {
                              setEditing(c);
                              setModalOpen(true);
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        )}
                        {podeVerQr && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="QR Code"
                            onClick={() => setQrView(c)}
                          >
                            <QrCode className="size-4" />
                          </Button>
                        )}
                        {podeBaixarQr && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Baixar QR"
                            onClick={() => downloadQrPng(c.id, c.nome)}
                          >
                            <Download className="size-4" />
                          </Button>
                        )}
                        {podeExcluirColaborador && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Excluir"
                            className="text-error hover:bg-error/10 hover:text-error"
                            onClick={() => setToDelete(c)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LinktreeColaboradorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        collaborator={editing}
        onSaved={() => refetch()}
        empresaId={
          isSuper ? filtroEmpresa || null : EMPRESA_ID
        }
      />

      <AlertDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir LinkTree?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao e irreversivel. O LinkTree de{" "}
              <strong>{toDelete?.nome}</strong> sera removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LinktreeQrModal
        open={!!qrView}
        onOpenChange={(o) => !o && setQrView(null)}
        collaborator={qrView}
      />
    </div>
  );
}

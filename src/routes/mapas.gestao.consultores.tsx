import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useMemo, useState, useEffect } from "react";
import {
  useMapasConsultants,
  useUpsertConsultant,
  useDeleteConsultant,
} from "~/features/mapas/hooks/useMapasData";
import { useAuth } from "~/lib/auth";
import { supabase } from "~/lib/supabase";
import { Plus, Pencil, Trash2, Search, Loader2, Users } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
import { ALL_UFS } from "~/features/mapas/constants/brazil-states";
import type { MapasConsultant } from "~/features/mapas/types";
import { RequirePermission } from "~/components/guards";
import { EMPRESA_ID } from "~/config/empresa";
export const mapasAdminConsultoresRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/mapas/gestao/consultores",
  component: () => (
    <RequirePermission modulo="mapas-interativos" permissions={["mapas_gerir_consultores"]}>
      <MapasAdminConsultoresPage />
    </RequirePermission>
  ),
});

const empty = (empresa_id: string): Partial<MapasConsultant> => ({
  empresa_id,
  name: "",
  state: "SP",
  registration: "",
  region: "",
  supervisor: "",
  pin_color: "#4169e1",
});

function MapasAdminConsultoresPage() {
  const { profile } = useAuth();
  const consQ = useMapasConsultants();
  const upsertM = useUpsertConsultant(() => setEditing(null));
  const deleteM = useDeleteConsultant();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<MapasConsultant> | null>(null);
  const [toDelete, setToDelete] = useState<MapasConsultant | null>(null);

  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  async function getEmpresaId(): Promise<string | null> {
    if (EMPRESA_ID) return EMPRESA_ID;
    const { data } = await supabase
      .from("empresas")
      .select("id")
      .limit(1)
      .single();
    return data?.id ?? null;
  }

  useEffect(() => {
    if (!editing?.state) {
      setCities([]);
      return;
    }
    let active = true;
    setLoadingCities(true);
    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${editing.state}/municipios`,
    )
      .then((res) => res.json())
      .then((data: Array<{ nome: string }>) => {
        if (!active) return;
        setCities(data.map((c) => c.nome).sort((a, b) => a.localeCompare(b)));
      })
      .catch(() => {
        if (active) setCities([]);
      })
      .finally(() => {
        if (active) setLoadingCities(false);
      });
    return () => {
      active = false;
    };
  }, [editing?.state]);

  const rows = useMemo(() => {
    const s = search.toLowerCase().trim();
    return (consQ.data ?? []).filter(
      (r: MapasConsultant) =>
        !s ||
        r.name.toLowerCase().includes(s) ||
        (r.region ?? "").toLowerCase().includes(s) ||
        (r.registration ?? "").toLowerCase().includes(s),
    );
  }, [consQ.data, search]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">Consultores</h1>
          <p className="text-sm text-text-muted mt-1">
            {consQ.data?.length ?? 0} cadastrados
          </p>
        </div>
        <Button
          onClick={async () => {
            const eid = await getEmpresaId();
            if (eid) setEditing(empty(eid));
          }}
          className="flex items-center gap-2 rounded-xl bg-accent text-accent-fg px-5 py-2.5 text-sm font-semibold hover:bg-accent-hover transition-all duration-200 min-h-[44px] shadow-lg shadow-accent/20"
        >
          <Plus className="h-4 w-4" /> Novo consultor
        </Button>
      </div>

      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, região ou matrícula…"
          className="pl-11 h-12 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
        />
      </div>

      <div className="relative w-full overflow-x-auto rounded-xl border border-border">
        <div className="hidden md:grid md:grid-cols-[1fr_120px_140px_100px_140px_120px] gap-2 bg-surface-hover/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          <span>Nome</span>
          <span>Matrícula</span>
          <span>Região</span>
          <span>UF</span>
          <span>Supervisor</span>
          <span className="text-right">Ações</span>
        </div>
        {consQ.isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
            <p className="text-sm text-text-muted">Carregando…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-surface mb-4">
              <Users className="w-8 h-8 text-text-muted/40" />
            </div>
            <p className="text-lg font-semibold text-text-main mb-1">
              Nenhum consultor encontrado
            </p>
            <p className="text-sm text-text-muted max-w-sm">
              {search
                ? "Ajuste os filtros para ver resultados."
                : "Comece adicionando um novo consultor."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {rows.map((r: MapasConsultant) => (
              <li
                key={r.id}
                className="group grid grid-cols-1 gap-1 px-4 py-3 md:grid-cols-[1fr_120px_140px_100px_140px_120px] md:items-center hover:bg-surface-hover/20 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ background: r.pin_color ?? "#4169e1" }}
                  />
                  <span className="truncate font-semibold text-text-main group-hover:text-accent transition-colors">{r.name}</span>
                </div>
                <span className="text-sm text-text-muted">
                  {r.registration ?? "—"}
                </span>
                <span className="text-sm text-text-muted">
                  {r.region ?? "—"}
                </span>
                <span className="text-sm text-text-main">{r.state}</span>
                <span className="text-sm text-text-muted">
                  {r.supervisor ?? "—"}
                </span>
                <div className="flex justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost-edit"
                    onClick={() => setEditing(r)}
                    className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-400"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost-destructive"
                    onClick={() => setToDelete(r)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o: boolean) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle>{editing?.id ? "Editar Consultor" : "Novo Consultor"}</DialogTitle>
                <DialogDescription>Preencha os dados do consultor</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {editing && (
            <form
              className="px-6 py-6 flex-1 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                editing && upsertM.mutate(editing);
              }}
            >
              {/* Seção: Dados Básicos */}
              <div>
                <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">
                  Dados Básicos
                </p>
                <div className="space-y-4">
                  <fieldset className="space-y-2">
                    <label className="block text-sm font-semibold text-text-main">
                      Nome *
                    </label>
                    <Input
                      required
                      value={editing.name ?? ""}
                      onChange={(e) =>
                        setEditing({ ...editing, name: e.target.value })
                      }
                      placeholder="Nome do consultor"
                      className="h-12 rounded-xl border border-border bg-surface px-4 text-sm text-text-main font-medium transition-all duration-200 placeholder:text-text-muted hover:border-accent/30 focus:ring-2 focus:ring-accent/40 focus:border-accent"
                    />
                  </fieldset>
                  <div className="grid grid-cols-2 gap-4">
                    <fieldset className="space-y-2">
                      <label className="block text-sm font-semibold text-text-main">
                        Matrícula
                      </label>
                      <Input
                        value={editing.registration ?? ""}
                        onChange={(e) =>
                          setEditing({ ...editing, registration: e.target.value })
                        }
                        placeholder="Nº matrícula"
                        className="h-12 rounded-xl border border-border bg-surface px-4 text-sm text-text-main font-medium transition-all duration-200 placeholder:text-text-muted hover:border-accent/30 focus:ring-2 focus:ring-accent/40 focus:border-accent"
                      />
                    </fieldset>
                    <fieldset className="space-y-2">
                      <label className="block text-sm font-semibold text-text-main">
                        Região
                      </label>
                      <Input
                        value={editing.region ?? ""}
                        onChange={(e) =>
                          setEditing({ ...editing, region: e.target.value })
                        }
                        placeholder="Região de atuação"
                        className="h-12 rounded-xl border border-border bg-surface px-4 text-sm text-text-main font-medium transition-all duration-200 placeholder:text-text-muted hover:border-accent/30 focus:ring-2 focus:ring-accent/40 focus:border-accent"
                      />
                    </fieldset>
                  </div>
                </div>
              </div>

              {/* Seção: Localização */}
              <div>
                <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">
                  Localização
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <fieldset className="space-y-2">
                    <label className="block text-sm font-semibold text-text-main">
                      UF *
                    </label>
                    <Select
                      value={editing.state}
                      onValueChange={(v: string) =>
                        setEditing({ ...editing, state: v, region: "" })
                      }
                    >
                      <SelectTrigger className="h-12 rounded-xl border border-border bg-surface px-4 text-sm text-text-main font-medium focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {ALL_UFS.map((uf) => (
                          <SelectItem key={uf} value={uf}>
                            {uf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </fieldset>
                  <fieldset className="space-y-2">
                    <label className="block text-sm font-semibold text-text-main">
                      Supervisor
                    </label>
                    <Input
                      value={editing.supervisor ?? ""}
                      onChange={(e) =>
                        setEditing({ ...editing, supervisor: e.target.value })
                      }
                      placeholder="Nome do supervisor"
                      className="h-12 rounded-xl border border-border bg-surface px-4 text-sm text-text-main font-medium transition-all duration-200 placeholder:text-text-muted hover:border-accent/30 focus:ring-2 focus:ring-accent/40 focus:border-accent"
                    />
                  </fieldset>
                </div>
              </div>

              {/* Footer */}
              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={upsertM.isPending}
                  className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]"
                >
                  {upsertM.isPending ? "Salvando…" : "Salvar"}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!toDelete}
        onOpenChange={(o: boolean) => !o && setToDelete(null)}
      >
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <AlertDialogTitle>Excluir consultor?</AlertDialogTitle>
                <AlertDialogDescription>Esta ação não pode ser desfeita</AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="px-6 py-4">
            <p className="text-sm text-text-muted">
              O consultor{" "}
              <span className="font-semibold text-text-main">
                {toDelete?.name}
              </span>{" "}
              será removido permanentemente.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toDelete && deleteM.mutate(toDelete.id)}
              className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]"
            >
              {deleteM.isPending ? "Excluindo…" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

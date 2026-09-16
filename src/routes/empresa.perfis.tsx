import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "~/core/supabase";
import { getAllPermissionDefs } from "~/registry";
import {
  listarPerfis,
  listarPermissoesDoPerfil,
  listarPerfisDoUsuario,
  atribuirPerfil,
  removerPerfil,
  type PerfilRow,
} from "~/core/auth/perfis.service";
import { RequireSuperAdmin } from "~/components/guards/RequireSuperAdmin";
import { useAuth } from "~/lib/auth";
import {
  ShieldCheck,
  Loader2,
  ChevronDown,
  ChevronRight,
  Users,
  Trash2,
  Plus,
} from "lucide-react";
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
import toast from "react-hot-toast";

export const empresaPerfisRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/empresa/perfis",
  component: () => (
    <RequireSuperAdmin>
      <PerfisPage />
    </RequireSuperAdmin>
  ),
});

type ProfileRow = { id: string; nome: string; email: string };

function PerfisPage() {
  const { profile } = useAuth();
  const [perfis, setPerfis] = useState<PerfilRow[]>([]);
  const [usuarios, setUsuarios] = useState<ProfileRow[]>([]);
  const [permsPorPerfil, setPermsPorPerfil] = useState<
    Record<string, string[]>
  >({});
  const [perfisPorUsuario, setPerfisPorUsuario] = useState<
    Record<string, string[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState("");
  const [perfilParaAtribuir, setPerfilParaAtribuir] = useState("");
  const [atribuindo, setAtribuindo] = useState(false);
  const [paraRemover, setParaRemover] = useState<{
    usuarioId: string;
    perfilId: string;
    label: string;
  } | null>(null);

  const permLabelMap = useMemo(() => {
    const defs = getAllPermissionDefs();
    return new Map(defs.map((d) => [d.key, d.label]));
  }, []);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setLoading(true);
    const [listaPerfis, { data: profiles }] = await Promise.all([
      listarPerfis(),
      supabase.from("profiles").select("id, nome, email").order("nome"),
    ]);
    setPerfis(listaPerfis);
    setUsuarios((profiles ?? []) as ProfileRow[]);

    const permsMap: Record<string, string[]> = {};
    await Promise.all(
      listaPerfis.map(async (p) => {
        permsMap[p.id] = await listarPermissoesDoPerfil(p.id);
      }),
    );
    setPermsPorPerfil(permsMap);

    const usuarioPerfisMap: Record<string, string[]> = {};
    await Promise.all(
      (profiles ?? []).map(async (u: any) => {
        usuarioPerfisMap[u.id] = await listarPerfisDoUsuario(u.id);
      }),
    );
    setPerfisPorUsuario(usuarioPerfisMap);
    setLoading(false);
  }

  async function handleAtribuir() {
    if (!usuarioSelecionado || !perfilParaAtribuir) return;
    setAtribuindo(true);
    try {
      await atribuirPerfil(
        usuarioSelecionado,
        perfilParaAtribuir,
        profile?.id,
      );
      toast.success("Perfil atribuído!");
      setUsuarioSelecionado("");
      setPerfilParaAtribuir("");
      await carregar();
    } catch (e: any) {
      toast.error("Erro ao atribuir: " + (e.message || "desconhecido"));
    } finally {
      setAtribuindo(false);
    }
  }

  async function handleRemoverConfirmado() {
    if (!paraRemover) return;
    try {
      await removerPerfil(paraRemover.usuarioId, paraRemover.perfilId);
      toast.success("Perfil removido do usuário.");
      setParaRemover(null);
      await carregar();
    } catch (e: any) {
      toast.error("Erro ao remover: " + (e.message || "desconhecido"));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-bold text-text-main flex items-center gap-2">
          <ShieldCheck size={18} className="text-accent" /> Perfis (RBAC)
        </h1>
        <p className="text-xs text-text-muted">
          Perfis reutilizáveis de permissões. Perfis de fábrica (marcados
          "sistema") vieram da migração do antigo campo "ambiente" e não
          podem ser excluídos aqui. Um usuário pode ter vários perfis — a
          permissão efetiva é a união de todos + eventuais overrides em
          Permissões.
        </p>
      </div>

      {/* Lista de perfis e suas permissões */}
      <div className="space-y-2">
        {perfis.map((p) => {
          const aberto = expandido === p.id;
          const chaves = permsPorPerfil[p.id] ?? [];
          return (
            <div
              key={p.id}
              className="rounded-lg bg-card border border-border-subtle overflow-hidden"
            >
              <button
                onClick={() => setExpandido(aberto ? null : p.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-surface-hover transition-colors text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {aberto ? (
                    <ChevronDown size={14} className="shrink-0 text-text-muted" />
                  ) : (
                    <ChevronRight size={14} className="shrink-0 text-text-muted" />
                  )}
                  <span className="text-sm font-medium text-text-main">
                    {p.nome}
                  </span>
                  {p.is_sistema && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                      sistema
                    </span>
                  )}
                </div>
                <span className="text-xs text-text-muted">
                  {chaves.length} permissões
                </span>
              </button>
              {aberto && (
                <div className="px-3 pb-3 pt-1 border-t border-border-subtle/50">
                  {p.descricao && (
                    <p className="text-xs text-text-muted mb-2">{p.descricao}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {chaves.length === 0 && (
                      <span className="text-xs text-text-muted">
                        Nenhuma permissão concedida.
                      </span>
                    )}
                    {chaves.map((k) => (
                      <span
                        key={k}
                        className="px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success border border-success/20"
                      >
                        {permLabelMap.get(k) ?? k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Atribuir perfil a usuário */}
      <div className="rounded-lg bg-card border border-border-subtle p-3 space-y-3">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <Users size={14} /> Atribuir perfil a usuário
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={usuarioSelecionado}
            onChange={(e) => setUsuarioSelecionado(e.target.value)}
            className="flex-1 h-9 rounded-lg border border-input-border bg-input-bg px-3 text-sm text-text-main"
          >
            <option value="">Selecione o usuário...</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome} ({u.email})
              </option>
            ))}
          </select>
          <select
            value={perfilParaAtribuir}
            onChange={(e) => setPerfilParaAtribuir(e.target.value)}
            className="flex-1 h-9 rounded-lg border border-input-border bg-input-bg px-3 text-sm text-text-main"
          >
            <option value="">Selecione o perfil...</option>
            {perfis.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
          <button
            onClick={handleAtribuir}
            disabled={!usuarioSelecionado || !perfilParaAtribuir || atribuindo}
            className="flex items-center justify-center gap-1.5 px-4 h-9 rounded-lg bg-accent text-accent-fg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {atribuindo ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Atribuir
          </button>
        </div>
      </div>

      {/* Usuários e seus perfis atuais */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
          Usuários e perfis atribuídos
        </p>
        {usuarios.map((u) => {
          const perfilIds = perfisPorUsuario[u.id] ?? [];
          return (
            <div
              key={u.id}
              className="rounded-lg bg-card border border-border-subtle p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <span className="text-sm font-medium text-text-main block truncate">
                  {u.nome}
                </span>
                <span className="text-xs text-text-muted block truncate">
                  {u.email}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-end">
                {perfilIds.length === 0 && (
                  <span className="text-xs text-text-muted">Sem perfil</span>
                )}
                {perfilIds.map((pid) => {
                  const perfil = perfis.find((p) => p.id === pid);
                  if (!perfil) return null;
                  return (
                    <span
                      key={pid}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-accent/10 text-accent border border-accent/20"
                    >
                      {perfil.nome}
                      <button
                        onClick={() =>
                          setParaRemover({
                            usuarioId: u.id,
                            perfilId: pid,
                            label: `${perfil.nome} de ${u.nome}`,
                          })
                        }
                        className="hover:text-error transition-colors"
                        title="Remover perfil"
                      >
                        <Trash2 size={10} />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog
        open={!!paraRemover}
        onOpenChange={(o) => !o && setParaRemover(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Remover perfil?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              O perfil <strong>{paraRemover?.label}</strong> será removido.
              O usuário perde as permissões concedidas exclusivamente por
              esse perfil (overrides individuais em Permissões continuam
              valendo).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoverConfirmado}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

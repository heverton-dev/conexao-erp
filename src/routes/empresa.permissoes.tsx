import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useAuth } from "~/lib/auth";
import { supabase } from "~/core/supabase";
import {
  type Permissoes,
  type ModulosAcesso,
  type ModuloAcesso,
} from "~/core/permissions/types";
import {
  setPermissoes,
  getModulosAcesso,
  setModulosAcesso,
} from "~/core/permissions/services";

import { EMPRESA_ID } from "~/config/empresa";
import {
  getAllModules,
  getNavItemsByModule,
  getAllPermissionDefs,
} from "~/registry";
import { useState, useEffect, useMemo } from "react";
import {
  Shield,
  Loader2,
  Save,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Building2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Pencil,
  Power,
  Search,
  Plus,
  Trash2,
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
import { cn } from "~/lib/utils";
import { PasswordInput } from "~/components/ui/password-input";
import { RequirePermission } from "~/components/guards";

export const adminPermissoesRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/empresa/permissoes",
  component: () => (
    <RequirePermission modulo="empresas-core">
      <AdminPermissoes />
    </RequirePermission>
  ),
});

type ProfileRow = {
  id: string;
  email: string;
  nome: string;
  ambiente: string;
  is_super_admin: boolean;
  empresa_id?: string | null;
  role?: string;
  ativo?: boolean;
};

type ModuloUIO = {
  key: string;
  nome: string;
  icon: any;
  paginas: { id: string; label: string }[];
  acoes: { key: string; label: string; group: string }[];
};

function AdminPermissoes() {
  const { profile } = useAuth();
  const empresaVinculada = EMPRESA_ID;

  const [usuarios, setUsuarios] = useState<ProfileRow[]>([]);
  const [permMap, setPermMap] = useState<Record<string, Permissoes>>({});
  const [modulosMap, setModulosMap] = useState<Record<string, ModulosAcesso>>(
    {},
  );
  const [dirtyMap, setDirtyMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [expandedModulosDetalhes, setExpandedModulosDetalhes] = useState<
    Record<string, boolean>
  >({});
  const [saving, setSaving] = useState<string | null>(null);
  const [editandoUsuario, setEditandoUsuario] = useState<ProfileRow | null>(
    null,
  );
  const [termoBusca, setTermoBusca] = useState("");
  const [criandoNovaCredencial, setCriandoNovaCredencial] = useState(false);
  const [credencialParaDeletar, setCredencialParaDeletar] =
    useState<ProfileRow | null>(null);

  // Load modules once
  const modulos = useMemo(() => {
    const defs = getAllModules();
    const permDefs = getAllPermissionDefs();
    const permDefsMap = new Map(permDefs.map((p) => [p.key, p]));

    return defs.map((m) => {
      const paginas = getNavItemsByModule(m.key).map((n) => ({
        id: n.id,
        label: n.label,
      }));
      const acoes = (m.permissions || [])
        .map((pk) => permDefsMap.get(pk))
        .filter(Boolean)
        .map((p) => ({
          key: p!.key,
          label: p!.label,
          group: p!.group,
        }));
      return {
        key: m.key,
        nome: m.nome,
        icon: m.icon,
        paginas,
        acoes,
      } as ModuloUIO;
    });
  }, []);

  useEffect(() => {
    carregarUsuarios(empresaVinculada);
  }, []);

  async function carregarUsuarios(empresaId?: string) {
    setLoading(true);
    let query = supabase
      .from("profiles")
      .select(
        "id, email, nome, ambiente, is_super_admin, empresa_id, role, ativo",
      )
      .order("nome");

    if (empresaId) {
      query = query.eq("empresa_id", empresaId);
    }

    const { data: profiles } = await query;
    const rows = (profiles ?? []) as ProfileRow[];
    setUsuarios(rows);

    const { data: perms } = await supabase
      .from("permissoes")
      .select("usuario_id, permissoes, modulos_acesso");

    const permMap: Record<string, Permissoes> = {};
    const modMap: Record<string, ModulosAcesso> = {};
    for (const row of rows) {
      permMap[row.id] = { ...ALL_FALSE };
      modMap[row.id] = {};
    }
    for (const p of perms ?? []) {
      const uid = p.usuario_id as string;
      if (permMap[uid]) {
        permMap[uid] = { ...ALL_FALSE, ...(p.permissoes as any as Permissoes) };
      }
      if (modMap[uid]) {
        modMap[uid] = (p.modulos_acesso as ModulosAcesso) || {};
      }
    }
    setPermMap(permMap);
    setModulosMap(modMap);
    setDirtyMap({});
    setLoading(false);
  }



  function togglePerm(userId: string, key: keyof Permissoes) {
    setPermMap((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [key]: !prev[userId]?.[key] },
    }));
    setDirtyMap((prev) => ({ ...prev, [userId]: true }));
  }

  function setAllPerms(userId: string, value: boolean) {
    const all: Permissoes = {} as Permissoes;
    for (const k of Object.keys(ALL_FALSE) as (keyof Permissoes)[])
      all[k] = value;
    setPermMap((prev) => ({ ...prev, [userId]: all }));
    setDirtyMap((prev) => ({ ...prev, [userId]: true }));
  }

  function toggleModuloAcessar(userId: string, modKey: string) {
    setModulosMap((prev) => {
      const current = prev[userId]?.[modKey];
      return {
        ...prev,
        [userId]: {
          ...prev[userId],
          [modKey]: {
            acessar: !current?.acessar,
            paginas: current?.acessar
              ? []
              : modulos
                  .find((m) => m.key === modKey)
                  ?.paginas.map((p) => p.id) || [],
            acoes: current?.acessar
              ? []
              : modulos
                  .find((m) => m.key === modKey)
                  ?.acoes.map((a) => a.key) || [],
          },
        },
      };
    });
    setDirtyMap((prev) => ({ ...prev, [userId]: true }));
  }

  function togglePagina(userId: string, modKey: string, paginaId: string) {
    setModulosMap((prev) => {
      const mod = prev[userId]?.[modKey];
      if (!mod?.acessar) return prev;
      const paginas = mod.paginas.includes(paginaId)
        ? mod.paginas.filter((p) => p !== paginaId)
        : [...mod.paginas, paginaId];
      return {
        ...prev,
        [userId]: { ...prev[userId], [modKey]: { ...mod, paginas } },
      };
    });
    setDirtyMap((prev) => ({ ...prev, [userId]: true }));
  }

  function toggleAcao(userId: string, modKey: string, acaoKey: string) {
    setModulosMap((prev) => {
      const mod = prev[userId]?.[modKey];
      if (!mod?.acessar) return prev;
      const acoes = mod.acoes.includes(acaoKey)
        ? mod.acoes.filter((a) => a !== acaoKey)
        : [...mod.acoes, acaoKey];
      return {
        ...prev,
        [userId]: { ...prev[userId], [modKey]: { ...mod, acoes } },
      };
    });
    setDirtyMap((prev) => ({ ...prev, [userId]: true }));
  }

  async function handleSave(userId: string) {
    setSaving(userId);
    try {
      await Promise.all([
        setPermissoes(userId, permMap[userId]),
        setModulosAcesso(userId, modulosMap[userId] || {}),
      ]);
      setDirtyMap((prev) => ({ ...prev, [userId]: false }));
      toast.success("Permissões salvas!");
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(null);
  }

  async function handleToggleAtivoCredencial(usuario: ProfileRow) {
    try {
      const novoStatus = usuario.ativo === false ? true : false;
      const { error } = await supabase
        .from("profiles")
        .update({ ativo: novoStatus })
        .eq("id", usuario.id);
      if (error) throw error;
      toast.success(
        novoStatus ? "Credencial ativada!" : "Credencial inativada!",
      );
      carregarUsuarios(empresaVinculada);
    } catch (e: any) {
      toast.error(
        "Erro ao alterar. A coluna 'ativo' (boolean) existe em profiles?",
      );
      console.error(e);
    }
  }

  async function handleDeletarCredencialConfirmada() {
    if (!credencialParaDeletar) return;
    try {
      const { error } = await supabase.rpc("admin_deletar_usuario", {
        p_user_id: credencialParaDeletar.id,
      });
      if (error) throw error;
      toast.success("Credencial excluída com sucesso!");
      setCredencialParaDeletar(null);
      carregarUsuarios(empresaVinculada);
    } catch (e: any) {
      toast.error(
        "Erro ao excluir credencial: " + (e.message || "desconhecido"),
      );
      console.error(e);
    }
  }

  async function handleSalvarEdicao(id: string, formData: any, novosModulosMap?: Record<string, any>) {
    try {
      const updateData: Record<string, any> = {
        nome: formData.nome_completo,
        ambiente: formData.departamento,
      };



      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      if (formData.nova_senha && formData.nova_senha.length >= 6) {
        const { error: pwdErr } = await supabase.rpc("admin_atualizar_senha", {
          p_user_id: id,
          p_nova_senha: formData.nova_senha,
        });
        if (pwdErr) {
          console.error("Erro ao atualizar senha:", pwdErr);
          toast.success(
            "Dados atualizados, mas não foi possível alterar a senha.",
          );
        }
      }

      if (novosModulosMap) {
        await setModulosAcesso(id, novosModulosMap);
      }

      toast.success("Credencial atualizada!");
      setEditandoUsuario(null);
      carregarUsuarios(empresaVinculada);
    } catch (e: any) {
      toast.error("Erro ao salvar: " + e.message);
      console.error(e);
    }
  }

  function toggleExpand(userId: string) {
    setExpanded((prev) => ({ ...prev, [userId]: !prev[userId] }));
  }

  function toggleExpandModuloDetalhes(key: string) {
    setExpandedModulosDetalhes((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const usuariosFiltrados = usuarios.filter((u) => {
    if (
      termoBusca &&
      !u.nome.toLowerCase().includes(termoBusca.toLowerCase()) &&
      !u.email.toLowerCase().includes(termoBusca.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-text-main flex items-center gap-2">
            <Shield size={18} className="text-accent" /> Permissões
          </h1>
          <p className="text-xs text-text-muted">
            Configure quais módulos, páginas e ações cada credencial pode
            acessar por empresa.
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-input-bg border border-input-border text-text-main text-sm focus:border-accent focus:outline-none"
            />
          </div>

          <button
            onClick={() => setCriandoNovaCredencial(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-accent text-accent-fg text-sm font-medium hover:bg-accent-hover transition-colors ml-auto shadow-sm"
          >
            <Plus size={16} /> Novo
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <p className="text-center text-sm text-text-muted py-8">
          Nenhum usuário encontrado.
        </p>
      ) : (
        <div className="space-y-2">
          {usuariosFiltrados.map((u) => {
            const perms = permMap[u.id] ?? ALL_FALSE;
            const mods = modulosMap[u.id] ?? {};
            const isDirty = dirtyMap[u.id];
            const isOpen = expanded[u.id];

            return (
              <div
                key={u.id}
                className="rounded-lg bg-card border border-border-subtle overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(u.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-surface-hover transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isOpen ? (
                      <ChevronDown
                        size={14}
                        className="shrink-0 text-text-muted"
                      />
                    ) : (
                      <ChevronRight
                        size={14}
                        className="shrink-0 text-text-muted"
                      />
                    )}
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-text-main block truncate">
                        {u.nome}
                      </span>
                      <span className="text-xs text-text-muted block truncate">
                        {u.email} | {u.ambiente}

                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditandoUsuario(u);
                      }}
                      className="p-1.5 rounded-md text-text-muted hover:text-text-main hover:bg-surface-hover/50 transition-colors"
                      title="Editar dados da credencial"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleAtivoCredencial(u);
                      }}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        u.ativo !== false
                          ? "text-success hover:bg-success/10"
                          : "text-text-muted hover:text-error hover:bg-error/10",
                      )}
                      title={
                        u.ativo !== false
                          ? "Desativar credencial"
                          : "Ativar credencial"
                      }
                    >
                      <Power size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCredencialParaDeletar(u);
                      }}
                      className="p-1.5 rounded-md text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                      title="Excluir credencial"
                    >
                      <Trash2 size={14} />
                    </button>
                    {isDirty && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium shrink-0 ml-2">
                        Não salvo
                      </span>
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 pt-1 border-t border-border-subtle/50">
                    {/* Module-level permissions */}
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                      Acesso por módulo
                    </p>
                    <div className="space-y-2">
                      {modulos.map((mod) => {
                        const modAcesso = mods[mod.key];
                        const ativo = modAcesso?.acessar === true;
                        const Icon = mod.icon;
                        return (
                          <div
                            key={mod.key}
                            className="rounded-lg bg-input-bg p-3"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className={cn(
                                  "p-1 rounded-lg transition-colors",
                                  ativo
                                    ? "bg-accent/10 text-accent"
                                    : "bg-bg-dark text-text-muted",
                                )}
                              >
                                <Icon size={14} />
                              </div>
                              <span
                                className={cn(
                                  "text-xs font-medium",
                                  ativo ? "text-text-main" : "text-text-muted",
                                )}
                              >
                                {mod.nome}
                              </span>

                              <div className="ml-auto flex items-center gap-3">
                                {ativo && (
                                  <button
                                    onClick={() =>
                                      toggleExpandModuloDetalhes(
                                        `${u.id}-${mod.key}`,
                                      )
                                    }
                                    className="text-text-muted hover:text-text-main transition-colors p-1 rounded-md hover:bg-surface-hover/50"
                                    title={
                                      expandedModulosDetalhes[
                                        `${u.id}-${mod.key}`
                                      ]
                                        ? "Ocultar detalhes"
                                        : "Mostrar detalhes"
                                    }
                                  >
                                    {!expandedModulosDetalhes[
                                      `${u.id}-${mod.key}`
                                    ] ? (
                                      <EyeOff size={14} />
                                    ) : (
                                      <Eye size={14} />
                                    )}
                                  </button>
                                )}

                                <button
                                  onClick={() =>
                                    toggleModuloAcessar(u.id, mod.key)
                                  }
                                  className="flex items-center gap-2 group cursor-pointer"
                                >
                                  <div className="flex items-center gap-1.5 text-xs font-medium">
                                    {ativo ? (
                                      <Unlock
                                        size={12}
                                        className="text-accent"
                                      />
                                    ) : (
                                      <Lock
                                        size={12}
                                        className="text-text-muted group-hover:text-text-main transition-colors"
                                      />
                                    )}
                                    <span
                                      className={
                                        ativo
                                          ? "text-accent"
                                          : "text-text-muted group-hover:text-text-main transition-colors"
                                      }
                                    >
                                      {ativo ? "Acesso liberado" : "Sem acesso"}
                                    </span>
                                  </div>
                                  <div
                                    className={cn(
                                      "relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out",
                                      ativo
                                        ? "bg-accent"
                                        : "bg-bg-dark border border-border-subtle",
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                                        ativo
                                          ? "translate-x-3.5"
                                          : "translate-x-0.5",
                                      )}
                                    />
                                  </div>
                                </button>
                              </div>
                            </div>

                            {ativo &&
                              !expandedModulosDetalhes[
                                `${u.id}-${mod.key}`
                              ] && (
                                <div className="pl-6 space-y-2 border-l border-border-subtle/30 ml-[7px]">
                                  {mod.paginas.length > 0 && (
                                    <div>
                                      <p className="text-xs font-bold text-text-muted uppercase mb-1">
                                        Páginas
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {mod.paginas.map((pag) => {
                                          const ativa =
                                            modAcesso?.paginas?.includes(
                                              pag.id,
                                            ) || false;
                                          return (
                                            <button
                                              key={pag.id}
                                              onClick={() =>
                                                togglePagina(
                                                  u.id,
                                                  mod.key,
                                                  pag.id,
                                                )
                                              }
                                              className={cn(
                                                "flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors border",
                                                ativa
                                                  ? "bg-accent/10 text-accent border-accent/20"
                                                  : "bg-bg-dark text-text-muted border-transparent hover:text-text-main",
                                              )}
                                            >
                                              {ativa ? (
                                                <Check size={8} />
                                              ) : (
                                                <X size={8} />
                                              )}
                                              {pag.label}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {mod.acoes.length > 0 && (
                                    <div className="space-y-3 mt-2">
                                      {Object.entries(
                                        mod.acoes.reduce(
                                          (acc, acao) => {
                                            const g =
                                              acao.group || "Outras Ações";
                                            if (!acc[g]) acc[g] = [];
                                            acc[g].push(acao);
                                            return acc;
                                          },
                                          {} as Record<
                                            string,
                                            typeof mod.acoes
                                          >,
                                        ),
                                      ).map(([groupName, acoesList]) => (
                                        <div key={groupName}>
                                          <p className="text-xs font-bold text-text-muted uppercase mb-1">
                                            {groupName}
                                          </p>
                                          <div className="flex flex-wrap gap-1">
                                            {acoesList.map((acao) => {
                                              const ativa =
                                                modAcesso?.acoes?.includes(
                                                  acao.key,
                                                ) || false;
                                              return (
                                                <button
                                                  key={acao.key}
                                                  onClick={() =>
                                                    toggleAcao(
                                                      u.id,
                                                      mod.key,
                                                      acao.key,
                                                    )
                                                  }
                                                  className={cn(
                                                    "flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors border",
                                                    ativa
                                                      ? "bg-success/10 text-success border-success/20"
                                                      : "bg-error/10 text-error border-error/20",
                                                  )}
                                                >
                                                  {ativa ? (
                                                    <Check size={8} />
                                                  ) : (
                                                    <X size={8} />
                                                  )}
                                                  {acao.label}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Botão salvar */}
                    {isDirty && (
                      <div className="flex justify-end mt-3 pt-2 border-t border-border-subtle/30">
                        <button
                          onClick={() => handleSave(u.id)}
                          disabled={saving === u.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent text-accent-fg text-xs font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
                        >
                          {saving === u.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Save size={12} />
                          )}
                          Salvar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editandoUsuario && (
        <EditCredencialModal
          usuario={editandoUsuario}
          onClose={() => setEditandoUsuario(null)}
          onSave={handleSalvarEdicao}
          modulos={modulos}
        />
      )}

      {criandoNovaCredencial && (
        <NovaCredencialModal
          onClose={() => setCriandoNovaCredencial(false)}
          modulos={modulos}
          empresaId={empresaVinculada}
        />
      )}

      <AlertDialog
        open={!!credencialParaDeletar}
        onOpenChange={(o) => !o && setCredencialParaDeletar(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Excluir credencial?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              A credencial de <strong>{credencialParaDeletar?.nome}</strong>{" "}
              será removida permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletarCredencialConfirmada}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function NovaCredencialModal({
  onClose,
  modulos,
  empresaId,
}: {
  onClose: () => void;
  modulos: ModuloUIO[];
  empresaId?: string;
}) {
  const [form, setForm] = useState({
    nome_completo: "",
    email_corporativo: "",
    whatsapp_corporativo: "",
    departamento: "",
    senha_padrao: "",
    empresa_id: "",
  });
  const [modulosMap, setModulosMap] = useState<Record<string, any>>({});
  const [limitErrors, setLimitErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!empresaId) return;
    const modulosAtivos = Object.entries(modulosMap).filter(
      ([, v]: [string, any]) => v?.acessar === true,
    );
    if (modulosAtivos.length === 0) {
      setLimitErrors({});
      return;
    }

    Promise.all(
      modulosAtivos.map(([key]) =>
        supabase
          .rpc("check_empresa_modulo_limit", {
            p_empresa_id: empresaId,
            p_modulo_key: key,
          })
          .then(({ data }) => ({ key, allowed: data })),
      ),
    ).then((results) => {
      const errors: Record<string, string> = {};
      results.forEach(({ key, allowed }) => {
        if (allowed === false) {
          const mod = modulos.find((m) => m.key === key);
          errors[key] = `Limite atingido para o módulo ${mod?.nome || key}`;
        }
      });
      setLimitErrors(errors);
    });
  }, [empresaId, modulosMap]);

  const [expandedModulosDetalhes, setExpandedModulosDetalhes] = useState<
    Record<string, boolean>
  >({});
  const [salvando, setSalvando] = useState(false);

  function toggleModuloAcessar(modKey: string) {
    setModulosMap((prev) => {
      const current = prev[modKey];
      return {
        ...prev,
        [modKey]: {
          ...current,
          acessar: !current?.acessar,
          paginas: current?.acessar
            ? []
            : modulos.find((m) => m.key === modKey)?.paginas.map((p) => p.id) ||
              [],
          acoes: current?.acessar
            ? []
            : modulos.find((m) => m.key === modKey)?.acoes.map((a) => a.key) ||
              [],
        },
      };
    });
  }

  function togglePagina(modKey: string, paginaId: string) {
    setModulosMap((prev) => {
      const mod = prev[modKey];
      if (!mod?.acessar) return prev;
      const paginas = mod.paginas.includes(paginaId)
        ? mod.paginas.filter((p: string) => p !== paginaId)
        : [...mod.paginas, paginaId];
      return { ...prev, [modKey]: { ...mod, paginas } };
    });
  }

  function toggleAcao(modKey: string, acaoKey: string) {
    setModulosMap((prev) => {
      const mod = prev[modKey];
      if (!mod?.acessar) return prev;
      const acoes = mod.acoes.includes(acaoKey)
        ? mod.acoes.filter((a: string) => a !== acaoKey)
        : [...mod.acoes, acaoKey];
      return { ...prev, [modKey]: { ...mod, acoes } };
    });
  }

  async function handleSave() {
    setSalvando(true);
    try {
      const { data: userId, error: rpcErr } = await supabase.rpc(
        "admin_criar_usuario",
        {
          p_email: form.email_corporativo,
          p_senha: form.senha_padrao || "conexao123",
          p_nome: form.nome_completo,
          p_empresa_id: empresaId || null,
          p_is_super_admin: false,
        },
      );
      if (rpcErr) throw rpcErr;

      await setModulosAcesso(userId, modulosMap);
      toast.success("Credencial e permissões criadas com sucesso!");
      onClose();
      setTimeout(() => window.location.reload(), 1000);
    } catch (e: any) {
      toast.error("Erro ao criar credencial: " + (e.message || "desconhecido"));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-2xl rounded-t-2xl sm:rounded-2xl bg-card border border-border/50 p-0 shadow-2xl shadow-black/40 max-h-[90dvh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-br from-accent/20 via-accent/10 to-transparent px-6 pt-6 pb-4 border-b border-border/50 relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Plus size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-main tracking-tight">
                Nova Credencial com Permissões
              </h2>
              <p className="text-sm text-text-muted mt-0.5">
                Crie uma credencial e configure acessos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 top-5 rounded-lg p-1.5 text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6 flex-1 min-h-0 overflow-y-auto space-y-4">
        {/* Dados Básicos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 text-xs font-medium text-text-muted">Nome Completo</label>
            <input
              placeholder="Nome Completo"
              className="w-full h-11 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
              value={form.nome_completo}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, nome_completo: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-1.5 text-xs font-medium text-text-muted">Email Corporativo</label>
            <input
              placeholder="Email Corporativo"
              type="email"
              className="w-full h-11 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
              value={form.email_corporativo}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  email_corporativo: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="mb-1.5 text-xs font-medium text-text-muted">WhatsApp (opcional)</label>
            <input
              placeholder="WhatsApp (opcional)"
              className="w-full h-11 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
              value={form.whatsapp_corporativo}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  whatsapp_corporativo: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="mb-1.5 text-xs font-medium text-text-muted">Departamento</label>
            <select
              className="w-full h-11 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
              value={form.departamento}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, departamento: e.target.value }))
              }
            >
              <option value="">Departamento</option>
              <option value="Vendas">Vendas</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Financeiro">Financeiro</option>
              <option value="TI">TI</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 text-xs font-medium text-text-muted">Senha Padrão</label>
            <PasswordInput
              placeholder="Senha Padrão (mínimo 6 caracteres)"
              className="w-full h-11 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
              value={form.senha_padrao}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, senha_padrao: e.target.value }))
              }
            />
          </div>

        </div>

        {/* Módulos e Permissões */}
        <div className="border-t border-border/50 pt-4">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
            Módulos e Permissões
          </p>
          <div className="space-y-3">
            {modulos.map((mod) => {
              const modAcesso = modulosMap[mod.key];
              const ativo = modAcesso?.acessar === true;
              const Icon = mod.icon;

              return (
                <div
                  key={mod.key}
                  className="rounded-lg bg-input-bg p-3 border border-border-subtle/50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        ativo
                          ? "bg-accent/10 text-accent"
                          : "bg-bg-dark text-text-muted",
                      )}
                    >
                      <Icon size={14} />
                    </div>
                    <span
                      className={cn(
                        "text-xs font-bold",
                        ativo ? "text-text-main" : "text-text-muted",
                      )}
                    >
                      {mod.nome}
                    </span>

                    <div className="ml-auto flex items-center gap-3">
                      {ativo && (
                        <button
                          onClick={() =>
                            setExpandedModulosDetalhes((prev) => ({
                              ...prev,
                              [mod.key]: !prev[mod.key],
                            }))
                          }
                          className="text-text-muted hover:text-text-main transition-colors p-1 rounded-md hover:bg-surface-hover/50"
                        >
                          {!expandedModulosDetalhes[mod.key] ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => toggleModuloAcessar(mod.key)}
                        className="flex items-center gap-2 group cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          {ativo ? (
                            <Unlock size={12} className="text-accent" />
                          ) : (
                            <Lock
                              size={12}
                              className="text-text-muted group-hover:text-text-main transition-colors"
                            />
                          )}
                          <span
                            className={
                              ativo
                                ? "text-accent"
                                : "text-text-muted group-hover:text-text-main transition-colors"
                            }
                          >
                            {ativo ? "Acesso liberado" : "Sem acesso"}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out",
                            ativo
                              ? "bg-accent"
                              : "bg-bg-dark border border-border-subtle",
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                              ativo ? "translate-x-3.5" : "translate-x-0.5",
                            )}
                          />
                        </div>
                      </button>
                    </div>
                  </div>

                  {ativo && !expandedModulosDetalhes[mod.key] && (
                    <div className="pl-8 space-y-3 border-l border-border-subtle/30 ml-2.5 mt-3 pt-1">
                      {mod.paginas.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-text-muted uppercase mb-1.5">
                            Páginas
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {mod.paginas.map((pag) => {
                              const ativa =
                                modAcesso?.paginas?.includes(pag.id) || false;
                              return (
                                <button
                                  key={pag.id}
                                  onClick={() => togglePagina(mod.key, pag.id)}
                                  className={cn(
                                    "flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors border",
                                    ativa
                                      ? "bg-accent/10 text-accent border-accent/20"
                                      : "bg-bg-dark text-text-muted border-transparent hover:text-text-main",
                                  )}
                                >
                                  {ativa ? (
                                    <Check size={10} />
                                  ) : (
                                    <X size={10} />
                                  )}
                                  {pag.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {mod.acoes.length > 0 && (
                        <div className="space-y-3 mt-3">
                          {Object.entries(
                            mod.acoes.reduce(
                              (acc, acao) => {
                                const g = acao.group || "Outras Ações";
                                if (!acc[g]) acc[g] = [];
                                acc[g].push(acao);
                                return acc;
                              },
                              {} as Record<string, typeof mod.acoes>,
                            ),
                          ).map(([groupName, acoesList]) => (
                            <div key={groupName}>
                              <p className="text-xs font-bold text-text-muted uppercase mb-1.5">
                                {groupName}
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {acoesList.map((acao) => {
                                  const ativa =
                                    modAcesso?.acoes?.includes(acao.key) ||
                                    false;
                                  return (
                                    <button
                                      key={acao.key}
                                      onClick={() =>
                                        toggleAcao(mod.key, acao.key)
                                      }
                                      className={cn(
                                        "flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors border",
                                        ativa
                                          ? "bg-success/10 text-success border-success/20"
                                          : "bg-error/10 text-error border-error/20",
                                      )}
                                    >
                                      {ativa ? (
                                        <Check size={10} />
                                      ) : (
                                        <X size={10} />
                                      )}
                                      {acao.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {Object.keys(limitErrors).length > 0 && (
          <div className="rounded-lg bg-error/10 border border-error/30 p-3 space-y-1">
            {Object.values(limitErrors).map((msg, i) => (
              <p key={i} className="text-xs text-error font-medium">
                {msg}
              </p>
            ))}
          </div>
        )}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end px-6 pb-6 pt-4 border-t border-border/50">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={
              !form.nome_completo ||
              !form.email_corporativo ||
              salvando ||
              Object.keys(limitErrors).length > 0
            }
            className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px] flex items-center justify-center gap-2"
          >
            {salvando ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Save size={16} /> Criar Credencial
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditCredencialModal({
  usuario,
  onClose,
  onSave,
  modulos,
}: {
  usuario: any;
  onClose: () => void;
  onSave: (id: string, formData: any, novosModulos?: Record<string, any>) => void;
  modulos: ModuloUIO[];
}) {
  const [form, setForm] = useState({
    nome_completo: usuario.nome || "",
    email_corporativo: usuario.email || "",
    whatsapp_corporativo: "",
    departamento: usuario.ambiente || "",
    nova_senha: "",
    empresa_id: usuario.empresa_id || "",
  });
  const [salvando, setSalvando] = useState(false);
  const [modulosMap, setModulosMap] = useState<Record<string, any>>({});
  const [expandedModulosDetalhes, setExpandedModulosDetalhes] = useState<
    Record<string, boolean>
  >({});
  const [loadedPerms, setLoadedPerms] = useState(false);

  useEffect(() => {
    getModulosAcesso(usuario.id).then((data) => {
      if (data) setModulosMap(data);
      setLoadedPerms(true);
    });
  }, [usuario.id]);

  function toggleModuloAcessar(modKey: string) {
    setModulosMap((prev) => {
      const current = prev[modKey];
      return {
        ...prev,
        [modKey]: {
          ...current,
          acessar: !current?.acessar,
          paginas: current?.acessar
            ? []
            : modulos.find((m) => m.key === modKey)?.paginas.map((p) => p.id) ||
              [],
          acoes: current?.acessar
            ? []
            : modulos.find((m) => m.key === modKey)?.acoes.map((a) => a.key) ||
              [],
        },
      };
    });
  }

  function togglePagina(modKey: string, paginaId: string) {
    setModulosMap((prev) => {
      const mod = prev[modKey];
      if (!mod?.acessar) return prev;
      const paginas = mod.paginas.includes(paginaId)
        ? mod.paginas.filter((p: string) => p !== paginaId)
        : [...mod.paginas, paginaId];
      return { ...prev, [modKey]: { ...mod, paginas } };
    });
  }

  function toggleAcao(modKey: string, acaoKey: string) {
    setModulosMap((prev) => {
      const mod = prev[modKey];
      if (!mod?.acessar) return prev;
      const acoes = mod.acoes.includes(acaoKey)
        ? mod.acoes.filter((a: string) => a !== acaoKey)
        : [...mod.acoes, acaoKey];
      return { ...prev, [modKey]: { ...mod, acoes } };
    });
  }

  async function handleSave() {
    setSalvando(true);
    await onSave(usuario.id, form, modulosMap);
    setSalvando(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-2xl rounded-t-2xl sm:rounded-2xl bg-card border border-border/50 p-0 shadow-2xl shadow-black/40 max-h-[90dvh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-br from-accent/20 via-accent/10 to-transparent px-6 pt-6 pb-4 border-b border-border/50 relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Pencil size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-main tracking-tight">
                Editar Credencial
              </h2>
              <p className="text-sm text-text-muted mt-0.5">
                Atualize dados e permissões da credencial
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 top-5 rounded-lg p-1.5 text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-6 flex-1 min-h-0 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 text-xs font-medium text-text-muted">Nome Completo</label>
              <input
                placeholder="Nome Completo"
                className="w-full h-11 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
                value={form.nome_completo}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, nome_completo: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1.5 text-xs font-medium text-text-muted">Email Corporativo</label>
              <input
                placeholder="Email Corporativo"
                className="w-full h-11 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
                type="email"
                disabled
                value={form.email_corporativo}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email_corporativo: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1.5 text-xs font-medium text-text-muted">WhatsApp (opcional)</label>
              <input
                placeholder="WhatsApp (opcional)"
                className="w-full h-11 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
                value={form.whatsapp_corporativo}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    whatsapp_corporativo: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-1.5 text-xs font-medium text-text-muted">Departamento</label>
              <select
                className="w-full h-11 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
                value={form.departamento}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, departamento: e.target.value }))
                }
              >
                <option value="">Departamento</option>
                <option value="Vendas">Vendas</option>
                <option value="Administrativo">Administrativo</option>
                <option value="Financeiro">Financeiro</option>
                <option value="TI">TI</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 text-xs font-medium text-text-muted">Nova Senha</label>
              <PasswordInput
                placeholder="Nova senha (deixe vazio para manter)"
                className="w-full h-11 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
                value={form.nova_senha}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, nova_senha: e.target.value }))
                }
              />
            </div>

          </div>

          {loadedPerms && (
            <div className="border-t border-border/50 pt-4">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                Módulos e Permissões
              </p>
              <div className="space-y-3">
                {modulos.map((mod) => {
                  const modAcesso = modulosMap[mod.key];
                  const ativo = modAcesso?.acessar === true;
                  const Icon = mod.icon;

                  return (
                    <div
                      key={mod.key}
                      className="rounded-lg bg-input-bg p-3 border border-border-subtle/50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            ativo
                              ? "bg-accent/10 text-accent"
                              : "bg-bg-dark text-text-muted",
                          )}
                        >
                          <Icon size={14} />
                        </div>
                        <span
                          className={cn(
                            "text-xs font-bold",
                            ativo ? "text-text-main" : "text-text-muted",
                          )}
                        >
                          {mod.nome}
                        </span>

                        <div className="ml-auto flex items-center gap-3">
                          {ativo && (
                            <button
                              onClick={() =>
                                setExpandedModulosDetalhes((prev) => ({
                                  ...prev,
                                  [mod.key]: !prev[mod.key],
                                }))
                              }
                              className="text-text-muted hover:text-text-main transition-colors p-1 rounded-md hover:bg-surface-hover/50"
                            >
                              {!expandedModulosDetalhes[mod.key] ? (
                                <EyeOff size={14} />
                              ) : (
                                <Eye size={14} />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => toggleModuloAcessar(mod.key)}
                            className="flex items-center gap-2 group cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5 text-xs font-medium">
                              {ativo ? (
                                <Unlock size={12} className="text-accent" />
                              ) : (
                                <Lock
                                  size={12}
                                  className="text-text-muted group-hover:text-text-main transition-colors"
                                />
                              )}
                              <span
                                className={
                                  ativo
                                    ? "text-accent"
                                    : "text-text-muted group-hover:text-text-main transition-colors"
                                }
                              >
                                {ativo ? "Acesso liberado" : "Sem acesso"}
                              </span>
                            </div>
                            <div
                              className={cn(
                                "relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out",
                                ativo
                                  ? "bg-accent"
                                  : "bg-bg-dark border border-border-subtle",
                              )}
                            >
                              <span
                                className={cn(
                                  "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                                  ativo ? "translate-x-3.5" : "translate-x-0.5",
                                )}
                              />
                            </div>
                          </button>
                        </div>
                      </div>

                      {ativo && !expandedModulosDetalhes[mod.key] && (
                        <div className="pl-8 space-y-3 border-l border-border-subtle/30 ml-2.5 mt-3 pt-1">
                          {mod.paginas.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-text-muted uppercase mb-1.5">
                                Páginas
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {mod.paginas.map((pag) => (
                                  <button
                                    key={pag.id}
                                    onClick={() => togglePagina(mod.key, pag.id)}
                                    className={cn(
                                      "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                                      modulosMap[mod.key]?.paginas?.includes(pag.id)
                                        ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                                        : "bg-red-500/15 text-red-500 border border-red-500/30",
                                    )}
                                  >
                                    {pag.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {mod.acoes.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-text-muted uppercase mb-1.5">
                                Ações
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {mod.acoes.map((ac) => (
                                  <button
                                    key={ac.key}
                                    onClick={() => toggleAcao(mod.key, ac.key)}
                                    className={cn(
                                      "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                                      modulosMap[mod.key]?.acoes?.includes(ac.key)
                                        ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                                        : "bg-red-500/15 text-red-500 border border-red-500/30",
                                    )}
                                  >
                                    {ac.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end px-6 pb-6 pt-4 border-t border-border/50">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!form.nome_completo || salvando}
            className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px] flex items-center justify-center gap-2"
          >
            {salvando ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Save size={16} /> Salvar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const ALL_FALSE: any = {
  ver_todos_cadastros: false,
  aprovar_cadastro: false,
  reprovar_cadastro: false,
  solicitar_correcao_cadastro: false,
  aprovar_documento: false,
  reprovar_documento: false,
  solicitar_correcao_documento: false,
  aprovar_campo: false,
  reprovar_campo: false,
  solicitar_correcao_campo: false,
  visualizar_documento: false,
  excluir_cadastro: false,
  gerenciar_credenciais: false,
  gerenciar_credenciais_admin: false,
  gerenciar_config: false,
  gerar_links: false,
  ver_relatorios: false,
};

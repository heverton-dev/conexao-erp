import { Outlet, useNavigate, useLocation, Link } from "@tanstack/react-router";
import { BottomNav } from "./BottomNav";
import { ModuleDrawer } from "./ModuleDrawer";
import { NavSidebar } from "./NavSidebar";
import { useAuth } from "~/lib/auth";
import { LogOut, Bell, Building2, Grid3X3, Search } from "lucide-react";
import { useModulos } from "./useNavItems";
import { getAllModules } from "~/registry";
import { cn } from "~/lib/utils";
import { DeviceGate } from "./DeviceGate";
import { PwaInstallPrompt } from "./PwaInstallPrompt";
import { MaintenanceGate } from "./MaintenanceGate";
import { ManutencaoProvider } from "~/features/manutencao/ManutencaoContext";
import { useState, useEffect, useMemo } from "react";
import {
  listarNotificacoes,
  marcarComoLida,
  marcarTodasComoLidas,
  type Notificacao,
} from "~/core/services";
import { useEmpresaTheme } from "~/core/theme";

const LS_KEY = "selectedModule";
const LS_SIDEBAR = "sidebarCollapsed";

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isFunilPage = location.pathname.startsWith("/funis/funil/");
  const { profile, logout, empresa, permissoes, modulosAcesso, modulosAtivos } =
    useAuth();
  const { logoAppUrl } = useEmpresaTheme();
  const modulos = useModulos();
  const [showDrawer, setShowDrawer] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(LS_SIDEBAR) === "true";
    } catch {
      return false;
    }
  });
  const toggleSidebar = () =>
    setSidebarCollapsed((p) => {
      const next = !p;
      localStorage.setItem(LS_SIDEBAR, String(next));
      return next;
    });
  const [selectedModuleKey, setSelectedModuleKey] = useState<
    string | undefined
  >(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved && getAllModules().some((m) => m.key === saved)
        ? saved
        : undefined;
    } catch {
      return undefined;
    }
  });
  useEffect(() => {
    if (selectedModuleKey !== undefined) {
      localStorage.setItem(LS_KEY, selectedModuleKey);
    } else {
      localStorage.removeItem(LS_KEY);
    }
  }, [selectedModuleKey]);

  useEffect(() => {
    if (!profile?.is_super_admin) {
      const temAcesso = selectedModuleKey
        ? modulos.some((m) => m.key === selectedModuleKey)
        : false;
      if (!temAcesso && modulos.length > 0) {
        setSelectedModuleKey(modulos[0].key);
      }
    }
  }, [profile, modulos, selectedModuleKey]);

  const activeModuleKey = useMemo(() => {
    const path = location.pathname;
    const allMods = getAllModules();
    for (const mod of allMods) {
      if (mod.routes?.some((r) => path === r || path.startsWith(r + "/"))) {
        return mod.key;
      }
    }
    return selectedModuleKey;
  }, [location.pathname, selectedModuleKey]);

  const [notifs, setNotifs] = useState<Notificacao[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [ocultarLidas, setOcultarLidas] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      carregarNotifs();
      const interval = setInterval(carregarNotifs, 10000);
      return () => clearInterval(interval);
    }
  }, [profile?.id]);

  async function carregarNotifs() {
    if (!profile?.id) return;
    try {
      const data = await listarNotificacoes(profile.id);
      setNotifs(data);
    } catch (e) {
      console.error("Erro ao carregar notificações:", e);
    }
  }

  async function handleMarcarLida(
    id: string,
    cadastroId?: string,
    jaLida?: boolean,
  ) {
    try {
      if (!jaLida) {
        await marcarComoLida(id);
        await carregarNotifs();
      }
      if (cadastroId) {
        setShowNotifs(false);
        navigate({ to: "/crm/cliente/$id", params: { id: cadastroId } });
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleMarcarTodasLidas() {
    if (!profile?.id) return;
    try {
      await marcarTodasComoLidas(profile.id);
      await carregarNotifs();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <DeviceGate>
      <ManutencaoProvider>
        <div className="min-h-dvh bg-bg-dark">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border/50 bg-header-bg/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 lg:px-6 h-[70px] max-w-[1600px] mx-auto w-full">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {logoAppUrl ? (
                <img
                  src={logoAppUrl}
                  alt={empresa?.nome ?? "Odonto"}
                  className="h-7 object-contain"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                    <Building2 size={16} className="text-accent" />
                  </div>
                  <span className="text-sm font-bold text-text-main truncate max-w-[160px]">
                    {empresa?.nome ?? "Odonto"}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {modulos.length > 1 && (
                <button
                  onClick={() => setShowDrawer(true)}
                  className="lg:hidden flex items-center justify-center p-2 rounded-xl text-text-muted hover:bg-surface-hover hover:text-text-main transition-all duration-200 min-h-[44px] min-w-[44px]"
                  title="Módulos e navegação"
                  aria-label="Módulos e navegação"
                >
                  <Grid3X3 size={20} />
                </button>
              )}

              {/* Notifications */}
              <div className="relative">
                {(() => {
                  const naoLidas = notifs.filter((n) => !n.lida);
                  const notificacoesExibidas = ocultarLidas ? naoLidas : notifs;
                  return (
                    <>
                      <button
                        onClick={() => setShowNotifs(!showNotifs)}
                        className="relative flex items-center justify-center p-2 rounded-xl text-text-muted hover:bg-surface-hover hover:text-text-main transition-all duration-200 min-h-[44px] min-w-[44px]"
                        title="Notificações"
                        aria-label={`Notificações${naoLidas.length > 0 ? ` (${naoLidas.length} não lidas)` : ""}`}
                      >
                        <Bell size={20} />
                        {naoLidas.length > 0 && (
                          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white ring-2 ring-header-bg">
                            {naoLidas.length}
                          </span>
                        )}
                      </button>
                      {showNotifs && (
                        <div className="absolute right-0 mt-3 w-80 max-sm:fixed max-sm:inset-x-4 max-sm:top-16 max-sm:w-auto rounded-2xl bg-surface border border-border/50 shadow-2xl shadow-black/30 z-50 overflow-hidden animate-slide-up">
                          <div className="p-4 border-b border-border/30">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-text-main">
                                Notificações
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setOcultarLidas(!ocultarLidas)}
                                  className="text-xs text-text-muted hover:text-accent font-medium transition-colors"
                                >
                                  {ocultarLidas ? "Ver lidas" : "Ocultar lidas"}
                                </button>
                                {naoLidas.length > 0 && (
                                  <button
                                    onClick={handleMarcarTodasLidas}
                                    className="text-xs text-accent font-semibold hover:text-accent-hover transition-colors"
                                  >
                                    Limpar tudo
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="max-h-[350px] overflow-y-auto p-2">
                            {notificacoesExibidas.length === 0 ? (
                              <div className="py-8 text-center">
                                <Bell
                                  size={24}
                                  className="mx-auto text-text-muted/30 mb-2"
                                />
                                <p className="text-xs text-text-muted">
                                  Nenhuma notificação{" "}
                                  {ocultarLidas ? "nova" : "no histórico"}
                                </p>
                              </div>
                            ) : (
                              notificacoesExibidas.map((n) => (
                                <button
                                  key={n.id}
                                  onClick={() =>
                                    handleMarcarLida(
                                      n.id,
                                      n.dados?.cadastro_id,
                                      n.lida,
                                    )
                                  }
                                  className={cn(
                                    "w-full text-left rounded-xl p-3 transition-all duration-200 flex flex-col gap-1.5 min-h-[44px] mb-1",
                                    n.lida
                                      ? "opacity-50 hover:opacity-80 hover:bg-surface-hover"
                                      : "bg-accent/5 hover:bg-accent/10 border border-accent/10",
                                  )}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span
                                      className={cn(
                                        "text-xs font-bold",
                                        n.lida
                                          ? "text-text-muted"
                                          : "text-text-main",
                                      )}
                                    >
                                      {n.titulo}
                                    </span>
                                    {!n.lida && (
                                      <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                                    )}
                                  </div>
                                  <span className="text-xs text-text-muted leading-relaxed line-clamp-2">
                                    {n.mensagem}
                                  </span>
                                  <span className="text-[10px] text-text-muted/60 font-mono">
                                    {new Date(n.created_at).toLocaleTimeString(
                                      "pt-BR",
                                      { hour: "2-digit", minute: "2-digit" },
                                    )}{" "}
                                    -{" "}
                                    {new Date(n.created_at).toLocaleDateString(
                                      "pt-BR",
                                    )}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* User */}
              <div className="hidden sm:flex items-center gap-3 pl-3 ml-1 border-l border-border/30">
                <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
                  <span className="text-xs font-bold text-accent">
                    {profile?.nome?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <span className="text-xs font-medium text-text-secondary truncate max-w-[100px]">
                  {profile?.nome}
                </span>
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate({ to: "/" });
                }}
                className="flex items-center justify-center p-2 rounded-xl text-text-muted hover:text-error hover:bg-error/10 transition-all duration-200 min-h-[44px] min-w-[44px]"
                aria-label="Sair"
                title="Sair"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <NavSidebar
          selectedModuleKey={activeModuleKey}
          onModuleChange={setSelectedModuleKey}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
        <ModuleDrawer
          open={showDrawer}
          onClose={() => setShowDrawer(false)}
          selectedModuleKey={activeModuleKey}
          onModuleChange={setSelectedModuleKey}
          modulos={modulos}
        />

        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            isFunilPage
              ? "h-[calc(100vh-70px)] overflow-hidden"
              : "pb-20 lg:pb-0",
            sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-64",
          )}
        >
            <main
              className={cn(
                "w-full",
                isFunilPage
                  ? "h-full max-w-none p-0 m-0 flex flex-col"
                  : "mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8",
              )}
            >
              <MaintenanceGate>
                <Outlet />
              </MaintenanceGate>
            </main>
        </div>

        <BottomNav selectedModuleKey={activeModuleKey} />
        </div>
      </ManutencaoProvider>
      <PwaInstallPrompt />
    </DeviceGate>
  );
}

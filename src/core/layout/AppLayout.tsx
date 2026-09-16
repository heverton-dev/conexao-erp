import { Outlet, useNavigate, useLocation, Link } from "@tanstack/react-router";
import { BottomNav } from "./BottomNav";
import { useAuth } from "~/core/auth";
import { LogOut, Bell } from "lucide-react";
import { useNavItems } from "./useNavItems";
import { cn } from "~/core/utils";
import { DeviceGate } from "./DeviceGate";
import { PwaInstallPrompt } from "./PwaInstallPrompt";
import { useState, useEffect } from "react";
import {
  listarNotificacoes,
  marcarComoLida,
  marcarTodasComoLidas,
  type Notificacao,
} from "~/core/services";
export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, logout } = useAuth();
  const navItems = useNavItems();

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
      <div className="min-h-dvh bg-bg-dark">
        <header className="sticky top-0 z-40 border-b border-border-subtle bg-header-bg/95 backdrop-blur-lg">
          <div className="flex items-center justify-between px-4 py-3 lg:h-[70px] max-w-7xl mx-auto w-full relative">
            <div className="flex items-center">
              <img
                src="/logos/logo-horizontal-branco.png"
                alt="Odonto"
                className="h-6 object-contain"
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center justify-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  location.pathname.startsWith(item.path + "/") ||
                  (item.matchPaths || []).includes(location.pathname);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent/10 text-accent"
                        : "text-text-muted hover:bg-input-bg hover:text-text-main",
                    )}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              {/* Sino de Notificações */}
              <div className="relative">
                {(() => {
                  const naoLidas = notifs.filter((n) => !n.lida);
                  const notificacoesExibidas = ocultarLidas ? naoLidas : notifs;

                  return (
                    <>
                      <button
                        onClick={() => setShowNotifs(!showNotifs)}
                        className="relative flex items-center justify-center p-1.5 rounded-lg text-text-muted hover:bg-input-bg hover:text-text-main transition-colors"
                        title="Notificações"
                      >
                        <Bell size={18} />
                        {naoLidas.length > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-header-bg">
                            {naoLidas.length}
                          </span>
                        )}
                      </button>

                      {showNotifs && (
                        <div className="absolute right-0 mt-2 w-72 max-sm:fixed max-sm:inset-x-4 max-sm:top-16 max-sm:w-auto rounded-xl bg-card border border-border-subtle shadow-2xl z-50 p-2 flex flex-col gap-1.5 max-h-[350px] max-sm:max-h-[60dvh] overflow-y-auto">
                          <div className="flex items-center justify-between px-2 py-1.5 border-b border-border-subtle/50 mb-1">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-bold text-text-main">
                                Notificações
                              </span>
                              <button
                                onClick={() => setOcultarLidas(!ocultarLidas)}
                                className="text-[9px] text-text-muted hover:text-accent font-semibold flex items-center gap-1 transition-colors self-start"
                              >
                                {ocultarLidas ? "Ver lidas" : "Ocultar lidas"}
                              </button>
                            </div>
                            {naoLidas.length > 0 && (
                              <button
                                onClick={handleMarcarTodasLidas}
                                className="text-[10px] text-accent font-medium hover:underline"
                              >
                                Limpar tudo
                              </button>
                            )}
                          </div>

                          {notificacoesExibidas.length === 0 ? (
                            <p className="text-center text-xs text-text-muted py-6">
                              Nenhuma notificação{" "}
                              {ocultarLidas ? "nova" : "no histórico"}
                            </p>
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
                                  "w-full text-left rounded-lg p-2 transition flex flex-col gap-0.5 border text-text-main",
                                  n.lida
                                    ? "bg-transparent border-transparent opacity-60 hover:bg-bg-dark"
                                    : "bg-accent/5 border-accent/20 hover:bg-accent/10",
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
                                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                                  )}
                                </div>
                                <span className="text-[10px] text-text-muted leading-relaxed line-clamp-2">
                                  {n.mensagem}
                                </span>
                                <span className="text-[8px] text-text-muted mt-1 font-mono">
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
                      )}
                    </>
                  );
                })()}
              </div>

              <span className="text-[11px] text-text-muted block truncate max-w-[120px]">
                {profile?.nome}
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate({ to: "/" });
                }}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-red-400 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl w-full">
          <Outlet />
        </main>
        <BottomNav />
      </div>
      <PwaInstallPrompt />
    </DeviceGate>
  );
}

import { useState, useEffect, useMemo } from "react";
import { X, Globe, Wrench, type LucideIcon } from "lucide-react";
import { useNavItems, useModulos } from "./useNavItems";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { cn } from "~/lib/utils";
import { useAuth } from "~/lib/auth";
import { useManutencao } from "~/features/manutencao/ManutencaoContext";

type ModuleInfo = {
  key: string;
  nome: string;
  icon: LucideIcon;
};

export function ModuleDrawer({
  open,
  onClose,
  selectedModuleKey,
  onModuleChange,
  modulos,
}: {
  open: boolean;
  onClose: () => void;
  selectedModuleKey?: string;
  onModuleChange: (key: string | undefined) => void;
  modulos: ModuleInfo[];
}) {
  const { profile } = useAuth();
  const allSections = useNavItems();
  const location = useLocation();
  const navigate = useNavigate();
  const { modulosEmManutencao, rotasEmManutencao } = useManutencao();

  // Estado local para gerenciar o módulo sendo visualizado no drawer, permitindo que a lista
  // de rotas mude ao tocar no módulo sem fechar o drawer de imediato.
  const [localSelectedKey, setLocalSelectedKey] = useState<string | undefined>(
    selectedModuleKey,
  );

  // Sincroniza o estado local quando o drawer é aberto
  useEffect(() => {
    if (open) {
      setLocalSelectedKey(selectedModuleKey);
    }
  }, [open, selectedModuleKey]);

  const sections = useMemo(() => {
    if (!localSelectedKey) return allSections;
    return allSections.filter((s) => s.key === localSelectedKey);
  }, [allSections, localSelectedKey]);

  if (!open) return null;

  const mostrarGlobal = profile?.is_super_admin === true;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 bottom-0 w-72 max-w-[85vw] bg-card border-l border-border-subtle shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle shrink-0">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Módulos
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-text-main hover:bg-input-bg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-0.5 px-2 py-3 border-b border-border-subtle/50">
            {mostrarGlobal && modulos.length > 0 && (
              <button
                onClick={() => {
                  setLocalSelectedKey(undefined);
                  onModuleChange(undefined);
                }}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  localSelectedKey === undefined
                    ? "bg-accent/15 text-accent font-semibold"
                    : "text-text-main hover:bg-input-bg",
                )}
              >
                <Globe size={16} />
                Global
                {localSelectedKey === undefined && (
                  <span className="ml-auto text-xs text-accent">Ativo</span>
                )}
              </button>
            )}
            {modulos.map((mod) => {
              const Icon = mod.icon;
              const isSelected = localSelectedKey === mod.key;
              return (
                <button
                  key={mod.key}
                  onClick={() => {
                    setLocalSelectedKey(mod.key);
                    onModuleChange(mod.key);
                  }}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isSelected
                      ? "bg-accent/15 text-accent font-semibold"
                      : "text-text-main hover:bg-input-bg",
                  )}
                  >
                    <Icon size={16} />
                    {mod.nome}
                    {modulosEmManutencao.has(mod.key) && (
                      <Wrench
                        size={13}
                        className="text-amber-400"
                        aria-label="Em manutenção"
                      />
                    )}
                    {isSelected && (
                      <span className="ml-auto text-xs text-accent">Ativo</span>
                    )}
                  </button>
              );
            })}
          </div>

          <div className="px-2 py-3">
            {sections.map((section) => (
              <div key={section.key} className="mb-4 last:mb-0">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider px-3 mb-2">
                  {section.label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {section.items.map((item) => {
                    const isActive =
                      location.pathname === item.path ||
                      (item.matchPaths || []).includes(location.pathname) ||
                      (!item.noChildMatch &&
                        location.pathname.startsWith(item.path + "/"));
                    if (item.external) {
                      return (
                        <a
                          key={item.path}
                          href={item.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-main hover:bg-input-bg transition-colors"
                        >
                          <item.icon size={16} />
                          {item.label}
                        </a>
                      );
                    }
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate({ to: item.path });
                          onClose();
                        }}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                          isActive
                            ? "bg-accent/15 text-accent font-semibold"
                            : "text-text-muted hover:text-text-main hover:bg-input-bg",
                        )}
                        >
                          <item.icon size={16} />
                          {item.label}
                          {rotasEmManutencao.has(item.path) && (
                            <Wrench
                              size={13}
                              className="text-amber-400"
                              aria-label="Em manutenção"
                            />
                          )}
                        </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

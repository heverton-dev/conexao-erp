import { useState, useCallback } from "react";
import {
  Globe,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import {
  useNavItems,
  type NavModuleSection,
  type NavSubGroup,
} from "./useNavItems";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { cn } from "~/lib/utils";

import { useAuth } from "~/lib/auth";
import { useManutencao } from "~/features/manutencao/ManutencaoContext";

const COLLAPSED_MODULES_KEY = "sidebar_collapsed_modules";

function getCollapsedModules(): Record<string, boolean> {
  try {
    const stored = localStorage.getItem(COLLAPSED_MODULES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveCollapsedModules(state: Record<string, boolean>) {
  localStorage.setItem(COLLAPSED_MODULES_KEY, JSON.stringify(state));
}

function NavItemButton({
  item,
  collapsed,
  isActive,
  manutencao,
  onClick,
}: {
  item: {
    path: string;
    label: string;
    icon: LucideIcon;
    matchPaths?: string[];
    noChildMatch?: boolean;
    external?: boolean;
  };
  collapsed: boolean;
  isActive: boolean;
  manutencao?: boolean;
  onClick: () => void;
}) {
  if (item.external) {
    return (
      <a
        href={item.path}
        target="_blank"
        rel="noopener noreferrer"
        title={collapsed ? item.label : undefined}
        aria-label={item.label}
        className={cn(
          "flex items-center gap-3 rounded-xl text-sm transition-all duration-200 relative group",
          collapsed ? "justify-center p-2.5" : "px-3 py-2",
          "text-text-muted hover:text-text-main hover:bg-surface-hover",
        )}
      >
        <item.icon size={18} />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      aria-label={item.label}
      className={cn(
        "flex items-center gap-3 rounded-xl text-sm transition-all duration-200 relative group",
        collapsed ? "justify-center p-2.5" : "px-3 py-2",
        isActive
          ? "bg-accent/15 text-accent font-semibold"
          : "text-text-muted hover:text-text-main hover:bg-surface-hover",
      )}
    >
      {isActive && !collapsed && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full" />
      )}
      <item.icon size={18} className={cn(isActive && "text-accent")} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {manutencao && (
        <Wrench
          size={12}
          className="ml-auto shrink-0 text-amber-400"
          aria-label="Em manutenção"
        />
      )}
    </button>
  );
}

function SubGroupBlock({
  subGroup,
  navigate,
  location,
}: {
  subGroup: NavSubGroup;
  navigate: (opts: { to: string }) => void;
  location: { pathname: string };
}) {
  const { rotasEmManutencao } = useManutencao();
  const isActive = useCallback(
    (path: string, matchPaths?: string[], noChildMatch?: boolean) =>
      location.pathname === path ||
      (matchPaths || []).includes(location.pathname) ||
      (!noChildMatch && location.pathname.startsWith(path + "/")),
    [location.pathname],
  );

  return (
    <div>
      {subGroup.label && (
        <p className="text-[10px] font-semibold text-text-muted/40 uppercase tracking-wider px-3 mt-2 mb-1 first:mt-0">
          {subGroup.label}
        </p>
      )}
      <div className="flex flex-col gap-0.5">
        {subGroup.items.map((item) => (
          <NavItemButton
            key={item.path}
            item={item}
            collapsed={false}
            isActive={isActive(item.path, item.matchPaths, item.noChildMatch)}
            manutencao={rotasEmManutencao.has(item.path)}
            onClick={() => navigate({ to: item.path })}
          />
        ))}
      </div>
    </div>
  );
}

function ModuleSection({
  section,
  isExpanded,
  sidebarCollapsed,
  onToggle,
  selectedModuleKey,
  onModuleChange,
}: {
  section: NavModuleSection;
  isExpanded: boolean;
  sidebarCollapsed: boolean;
  onToggle: () => void;
  selectedModuleKey?: string;
  onModuleChange: (key: string | undefined) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { modulosEmManutencao, rotasEmManutencao } = useManutencao();
  const Icon = section.icon;
  const isSelected = selectedModuleKey === section.key;
  const hasSubGroups = section.subGroups && section.subGroups.length > 0;
  const moduloEmManutencao = modulosEmManutencao.has(section.key);

  const isActive = useCallback(
    (path: string, matchPaths?: string[], noChildMatch?: boolean) =>
      location.pathname === path ||
      (matchPaths || []).includes(location.pathname) ||
      (!noChildMatch && location.pathname.startsWith(path + "/")),
    [location.pathname],
  );

  const handleHeaderClick = () => {
    onModuleChange(section.key);
    onToggle();
  };

  if (sidebarCollapsed) {
    return (
      <div className="flex flex-col items-center mb-2">
        <button
          onClick={handleHeaderClick}
          title={section.label}
          aria-label={section.label}
          className={cn(
            "relative flex items-center justify-center p-2.5 rounded-xl transition-all duration-200",
            isSelected
              ? "bg-accent/15 text-accent"
              : "text-text-muted hover:text-text-main hover:bg-surface-hover",
          )}
        >
          <Icon size={18} />
          {moduloEmManutencao && (
            <Wrench
              size={11}
              className="absolute -right-0.5 -top-0.5 text-amber-400"
              aria-label="Em manutenção"
            />
          )}
        </button>
        {isExpanded && isSelected && (
          <div className="flex flex-col items-center gap-0.5 mt-1">
            {section.items.map((item) => (
              <NavItemButton
                key={item.path}
                item={item}
                collapsed
                isActive={isActive(
                  item.path,
                  item.matchPaths,
                  item.noChildMatch,
                )}
                manutencao={rotasEmManutencao.has(item.path)}
                onClick={() => navigate({ to: item.path })}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mb-3 last:mb-0 rounded-xl transition-colors duration-200",
        isExpanded && "bg-accent/[0.03]",
      )}
    >
      {/* Module header */}
      <button
        onClick={handleHeaderClick}
        className={cn(
          "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
          isSelected
            ? "bg-accent/15 text-accent shadow-sm shadow-accent/10"
            : "text-text-muted hover:text-text-main hover:bg-surface-hover",
        )}
      >
        <Icon size={18} />
        <span className="flex-1 text-left truncate">{section.label}</span>
        {moduloEmManutencao && (
          <Wrench size={14} className="text-amber-400" aria-label="Em manutenção" />
        )}
        <ChevronDown
          size={14}
          className={cn(
            "shrink-0 transition-transform duration-200",
            isSelected ? "text-accent/60" : "text-text-muted/40",
            !isExpanded && "-rotate-90",
          )}
        />
      </button>

      {/* Nav items */}
      {isExpanded && (
        <div className="flex flex-col gap-0.5 mt-1 pl-2">
          {hasSubGroups
            ? section.subGroups!.map((sub, subIdx) => (
                <div key={sub.label || subIdx}>
                  <SubGroupBlock
                    subGroup={sub}
                    navigate={navigate}
                    location={location}
                  />
                  {subIdx < section.subGroups!.length - 1 && (
                    <div className="border-b border-border/20 mx-3 mt-2" />
                  )}
                </div>
              ))
            : section.items.map((item) => (
                <NavItemButton
                  key={item.path}
                  item={item}
                  collapsed={false}
                  isActive={isActive(
                    item.path,
                    item.matchPaths,
                    item.noChildMatch,
                  )}
                  manutencao={rotasEmManutencao.has(item.path)}
                  onClick={() => navigate({ to: item.path })}
                />
              ))}
        </div>
      )}
    </div>
  );
}

export function NavSidebar({
  selectedModuleKey,
  onModuleChange,
  collapsed,
  onToggleCollapse,
}: {
  selectedModuleKey?: string;
  onModuleChange: (key: string | undefined) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const sections = useNavItems();
  const [collapsedModules, setCollapsedModules] =
    useState<Record<string, boolean>>(getCollapsedModules);

  const toggleModule = useCallback((key: string) => {
    setCollapsedModules((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveCollapsedModules(next);
      return next;
    });
  }, []);

  // A module is expanded if it's NOT in collapsedModules (default: expanded)
  const isExpanded = useCallback(
    (key: string) => !collapsedModules[key],
    [collapsedModules],
  );

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 border-r border-border/50 bg-card z-30 transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      {/* Logo area */}
      <div className="flex items-center h-[70px] px-4 border-b border-border/50">
        {collapsed ? (
          <div className="flex items-center justify-center w-full">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <span className="text-accent font-bold text-sm">C</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
              <span className="text-accent font-bold text-sm">C</span>
            </div>
            <span className="text-sm font-bold text-text-main truncate">
              Conexão ERP
            </span>
          </div>
        )}
      </div>

      {/* Modules + Nav Items */}
      <div
        className={cn(
          "flex-1 overflow-y-auto py-4 scrollbar-thin",
          collapsed ? "px-2" : "px-3",
        )}
      >
        {sections.map((section) => (
          <ModuleSection
            key={section.key}
            section={section}
            isExpanded={isExpanded(section.key)}
            sidebarCollapsed={collapsed}
            onToggle={() => toggleModule(section.key)}
            selectedModuleKey={selectedModuleKey}
            onModuleChange={onModuleChange}
          />
        ))}
      </div>

      {/* Toggle collapse */}
      <div
        className={cn(
          "border-t border-border/30 p-3",
          collapsed && "flex justify-center",
        )}
      >
        <button
          onClick={onToggleCollapse}
          className={cn(
            "flex items-center gap-2 rounded-xl text-xs font-medium text-text-muted hover:text-text-main hover:bg-surface-hover transition-all duration-200",
            collapsed ? "justify-center p-2.5" : "px-3 py-2.5 w-full",
          )}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? (
            <PanelLeft size={18} />
          ) : (
            <>
              <PanelLeftClose size={18} /> <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

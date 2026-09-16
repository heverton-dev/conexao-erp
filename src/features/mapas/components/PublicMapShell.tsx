import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { BrazilMap, type PresenceByState } from "./BrazilMap";
import { StateDetailSheet } from "./StateDetailSheet";
import { EntityDetailDialog } from "./EntityDetailDialog";
import {
  useMapasDistributors,
  useMapasConsultants,
} from "../hooks/useMapasData";
import {
  ALL_UFS,
  UF_NAMES,
  UF_REGION,
  type UF,
} from "../constants/brazil-states";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "~/components/ui/accordion";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";
import { Building2, Users, MapPin, BarChart3, Globe } from "lucide-react";
import type { Entity } from "../types";

type Variant = "distribuidores" | "consultores";
type Region = "N" | "NE" | "CO" | "SE" | "S";

const REGIONS: Region[] = ["N", "NE", "CO", "SE", "S"];
const REGION_NAMES: Record<Region, string> = {
  N: "Norte",
  NE: "Nordeste",
  CO: "Centro-Oeste",
  SE: "Sudeste",
  S: "Sul",
};

function getRegionColor(region: Region): string {
  const colors: Record<Region, string> = {
    N: "#22c55e",
    NE: "#f59e0b",
    CO: "#a78bfa",
    SE: "#ef4444",
    S: "#3b82f6",
  };
  return colors[region];
}

export function PublicMapShell({ variant }: { variant: Variant }) {
  const distQ = useMapasDistributors();
  const consQ = useMapasConsultants();
  const navigate = useNavigate();

  const distributors = distQ.data ?? [];
  const consultants = consQ.data ?? [];
  const loading = distQ.isLoading || consQ.isLoading;

  const presence: PresenceByState = useMemo(() => {
    const acc: PresenceByState = {};
    for (const d of distributors) {
      const uf = d.state as UF;
      acc[uf] = {
        distributors: (acc[uf]?.distributors ?? 0) + 1,
        consultants: acc[uf]?.consultants ?? 0,
      };
    }
    for (const c of consultants) {
      const uf = c.state as UF;
      acc[uf] = {
        distributors: acc[uf]?.distributors ?? 0,
        consultants: (acc[uf]?.consultants ?? 0) + 1,
      };
    }
    return acc;
  }, [distributors, consultants]);

  const [selUF, setSelUF] = useState<UF | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [filterRegion, setFilterRegion] = useState<string | null>(null);

  const entitiesForSel = useMemo(() => {
    if (!selUF) return [] as Entity[];
    if (variant === "distribuidores") {
      return distributors
        .filter((d) => d.state === selUF)
        .map((item) => ({ kind: "distributor" as const, item }));
    }
    return consultants
      .filter((c) => c.state === selUF)
      .map((item) => ({ kind: "consultant" as const, item }));
  }, [selUF, variant, distributors, consultants]);

  const pins = useMemo(() => {
    const list = variant === "distribuidores" ? distributors : consultants;
    return list.map((item) => ({
      id: item.id,
      lat: item.lat,
      lng: item.lng,
      pin_color: item.pin_color,
      name: item.name,
      state: item.state as UF,
    }));
  }, [variant, distributors, consultants]);

  const total =
    variant === "distribuidores" ? distributors.length : consultants.length;
  const coveredStates = ALL_UFS.filter((uf) => {
    const p = presence[uf];
    return variant === "distribuidores"
      ? (p?.distributors ?? 0) > 0
      : (p?.consultants ?? 0) > 0;
  });

  const regionStats = useMemo(() => {
    const acc = {} as Record<string, { total: number; covered: number }>;
    for (const region of REGIONS) {
      const ufs = ALL_UFS.filter((uf) => UF_REGION[uf] === region);
      const covered = ufs.filter((uf) => {
        const p = presence[uf];
        return variant === "distribuidores"
          ? (p?.distributors ?? 0) > 0
          : (p?.consultants ?? 0) > 0;
      });
      acc[region] = { total: ufs.length, covered: covered.length };
    }
    return acc;
  }, [presence, variant]);

  const filteredCoveredStates = useMemo(() => {
    if (!filterRegion) return coveredStates;
    return coveredStates.filter((uf) => UF_REGION[uf] === filterRegion);
  }, [coveredStates, filterRegion]);

  const mode =
    variant === "distribuidores"
      ? "presence-distributors"
      : "presence-consultants";
  const title = variant === "distribuidores" ? "Distribuidores" : "Consultores";
  const Icon = variant === "distribuidores" ? Building2 : Users;
  const maxDensity =
    coveredStates.length > 0
      ? Math.max(
          ...coveredStates.map((uf) =>
            variant === "distribuidores"
              ? (presence[uf]?.distributors ?? 0)
              : (presence[uf]?.consultants ?? 0),
          ),
        )
      : 1;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">
            Mapa de {title}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Toque em um estado para ver os detalhes
          </p>
        </div>
        <nav className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
          <button
            onClick={() => navigate({ to: "/mapas/distribuidores" })}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:text-sm ${
              variant === "distribuidores"
                ? "bg-accent text-accent-fg shadow-md shadow-accent/20"
                : "text-text-muted hover:text-text-main hover:bg-surface-hover"
            }`}
          >
            <Building2 size={14} />
            Distribuidores
          </button>
          <button
            onClick={() => navigate({ to: "/mapas/consultores" })}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:text-sm ${
              variant === "consultores"
                ? "bg-accent text-accent-fg shadow-md shadow-accent/20"
                : "text-text-muted hover:text-text-main hover:bg-surface-hover"
            }`}
          >
            <Users size={14} />
            Consultores
          </button>
        </nav>
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
          {/* Total */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/20 via-accent/10 to-transparent border border-accent/20 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:border-accent/40">
            <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-xl bg-accent/15 text-accent group-hover:scale-110 transition-transform duration-300">
              <Icon size={22} />
            </div>
            <p className="text-xs font-semibold text-accent/80 uppercase tracking-wider">
              Total
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-text-main mt-2">
              {total}
            </p>
            <p className="text-xs text-text-muted mt-2">
              {variant === "distribuidores"
                ? "Distribuidores cadastrados"
                : "Consultores cadastrados"}
            </p>
          </div>

          {/* Estados Cobertos */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 via-green-500/10 to-transparent border border-green-500/20 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 hover:border-green-500/40">
            <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/15 text-green-400 group-hover:scale-110 transition-transform duration-300">
              <MapPin size={22} />
            </div>
            <p className="text-xs font-semibold text-green-400/80 uppercase tracking-wider">
              Estados
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-text-main mt-2">
              {coveredStates.length}/{ALL_UFS.length}
            </p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-green-500/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-1000"
                style={{
                  width: `${(coveredStates.length / ALL_UFS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Norte */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent border border-blue-500/20 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/40">
            <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <Globe size={22} />
            </div>
            <p className="text-xs font-semibold text-blue-400/80 uppercase tracking-wider">
              Cobertura
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-text-main mt-2">
              {REGIONS.filter((r) => regionStats[r].covered > 0).length}/
              {REGIONS.length}
            </p>
            <p className="text-xs text-text-muted mt-2">Regiões ativas</p>
          </div>

          {/* Presença */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/20 via-yellow-500/10 to-transparent border border-yellow-500/20 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 hover:border-yellow-500/40">
            <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-500/15 text-yellow-400 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 size={22} />
            </div>
            <p className="text-xs font-semibold text-yellow-400/80 uppercase tracking-wider">
              Média
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-text-main mt-2">
              {coveredStates.length > 0
                ? Math.round(total / coveredStates.length)
                : 0}
            </p>
            <p className="text-xs text-text-muted mt-2">
              Por estado coberto
            </p>
          </div>
        </div>
      )}

      {/* Mapa */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-main">Mapa Interativo</h2>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface p-2 sm:p-4">
          <BrazilMap
            presenceByState={presence}
            mode={mode}
            selectedUF={selUF}
            pins={pins}
            filterRegion={filterRegion}
            onStateClick={(uf) => {
              setSelUF(uf);
              setSheetOpen(true);
            }}
            onPinClick={(pin) => {
              const dist = distributors.find((d) => d.id === pin.id);
              if (dist) {
                setSelectedEntity({ kind: "distributor", item: dist });
                setSelUF(pin.state as UF);
                return;
              }
              const cons = consultants.find((c) => c.id === pin.id);
              if (cons) {
                setSelectedEntity({ kind: "consultant", item: cons });
                setSelUF(pin.state as UF);
              }
            }}
          />
        </div>

        {/* Legenda */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 px-3 py-2">
            <span className="size-3 rounded-sm bg-green-500" />
            <span className="text-xs font-medium text-green-400">Com presença</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-surface border border-border px-3 py-2">
            <span className="size-3 rounded-sm bg-border" />
            <span className="text-xs font-medium text-text-muted">Sem presença</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/20 px-3 py-2">
            <MapPin size={12} className="text-accent" />
            <span className="text-xs font-medium text-accent">Pin no mapa</span>
          </div>
        </div>
      </div>

      {/* Estados cobertos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-main">Estados Cobertos</h2>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setFilterRegion(null)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                !filterRegion
                  ? "bg-accent text-accent-fg shadow-md shadow-accent/20"
                  : "bg-surface text-text-muted hover:text-text-main hover:bg-surface-hover"
              }`}
            >
              Todas
            </button>
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setFilterRegion(filterRegion === r ? null : r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  filterRegion === r
                    ? "text-white shadow-md"
                    : "bg-surface text-text-muted hover:text-text-main hover:bg-surface-hover"
                }`}
                style={
                  filterRegion === r
                    ? {
                        backgroundColor: getRegionColor(r),
                        boxShadow: `0 4px 12px ${getRegionColor(r)}40`,
                      }
                    : {}
                }
              >
                {REGION_NAMES[r]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : filteredCoveredStates.length === 0 ? (
          <EmptyState
            icon={<MapPin className="w-10 h-10 text-text-muted/30" />}
            title="Nenhum estado encontrado"
            description={
              filterRegion
                ? "Nenhum estado nesta região."
                : `Ainda não há ${variant === "distribuidores" ? "distribuidores" : "consultores"} cadastrados.`
            }
          />
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {filteredCoveredStates.map((uf) => {
              const p = presence[uf]!;
              const n =
                variant === "distribuidores" ? p.distributors : p.consultants;
              const items = (
                variant === "distribuidores" ? distributors : consultants
              ).filter((item) => item.state === uf);
              const region = UF_REGION[uf];
              const regionColor = getRegionColor(region);
              const density = n / maxDensity;

              return (
                <AccordionItem
                  key={uf}
                  value={uf}
                  className="group overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
                >
                  <AccordionTrigger className="hover:no-underline py-3.5 px-4">
                    <div className="flex w-full items-center justify-between pr-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-1 shrink-0 self-stretch rounded-full transition-all group-hover:w-1.5"
                          style={{ backgroundColor: regionColor }}
                        />
                        <span className="min-w-0 truncate text-sm">
                          <span className="font-bold text-text-main">
                            {uf}
                          </span>
                          <span className="ml-1 text-text-muted">
                            · {UF_NAMES[uf]}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-border sm:block">
                          <span
                            className="block h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${density * 100}%`,
                              backgroundColor: regionColor,
                            }}
                          />
                        </span>
                        <span
                          className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors"
                          style={{
                            backgroundColor: `${regionColor}15`,
                            color: regionColor,
                          }}
                        >
                          {n}{" "}
                          {variant === "distribuidores"
                            ? "distribuidor(es)"
                            : "consultor(es)"}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 border-t border-border px-4">
                    <ul className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                      {items.map((item) => {
                        const isDist = variant === "distribuidores";
                        const pinColor = item.pin_color ?? "#4169e1";
                        const badgeText = isDist
                          ? (item as any).code?.trim()
                          : (item as any).registration?.trim();
                        return (
                          <li
                            key={item.id}
                            className="group/card flex items-start gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5"
                          >
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent font-bold text-sm shrink-0 group-hover/card:bg-accent/20 transition-colors">
                              {isDist ? (
                                <Building2 size={16} />
                              ) : (
                                <Users size={16} />
                              )}
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-sm font-semibold text-text-main group-hover/card:text-accent transition-colors">
                                  {item.name}
                                </p>
                                {badgeText && (
                                  <span className="rounded-md bg-border px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
                                    {badgeText}
                                  </span>
                                )}
                              </div>
                              {isDist ? (
                                <div className="space-y-0.5 text-xs text-text-muted">
                                  <p>
                                    <span className="font-medium text-text-main">
                                      Localização:
                                    </span>{" "}
                                    {(item as any).city}
                                  </p>
                                  <p>
                                    <span className="font-medium text-text-main">
                                      Categoria:
                                    </span>{" "}
                                    {(item as any).category === "EXCLUSIVE"
                                      ? "Exclusivo"
                                      : "Não-exclusivo"}
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-0.5 text-xs text-text-muted">
                                  <p>
                                    <span className="font-medium text-text-main">
                                      Região:
                                    </span>{" "}
                                    {(item as any).region}
                                  </p>
                                  {(item as any).supervisor && (
                                    <p>
                                      <span className="font-medium text-text-main">
                                        Supervisor:
                                      </span>{" "}
                                      {(item as any).supervisor}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>

      <StateDetailSheet
        uf={selUF}
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setSelUF(null);
        }}
        entities={entitiesForSel}
      />
      <EntityDetailDialog
        entity={selectedEntity}
        open={!!selectedEntity}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEntity(null);
            if (!sheetOpen) setSelUF(null);
          }
        }}
      />
    </div>
  );
}

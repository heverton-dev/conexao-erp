import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection } from "geojson";
import { Building2, User, MapPin } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  GEOJSON_NAME_TO_UF,
  UF_NAMES,
  ALL_UFS,
  UF_REGION,
  type UF,
} from "../constants/brazil-states";
import type { StatePresence, MapPinData } from "../types";

export type PresenceByState = Partial<Record<UF, StatePresence>>;

type Mode =
  | "presence-distributors"
  | "presence-consultants"
  | "presence-both"
  | "heatmap";

interface TooltipData {
  uf: UF;
  x: number;
  y: number;
}

interface BrazilMapProps {
  presenceByState: PresenceByState;
  pins?: MapPinData[];
  mode?: Mode;
  onStateClick?: (uf: UF) => void;
  onPinClick?: (pin: MapPinData) => void;
  selectedUF?: UF | null;
  className?: string;
  heatmapMax?: number;
  filterRegion?: string | null;
}

const WIDTH = 800;
const HEIGHT = 800;
const ANIMATION_DELAY_STEP = 30;

export function BrazilMap({
  presenceByState,
  pins = [],
  mode = "presence-both",
  onStateClick,
  onPinClick,
  selectedUF = null,
  className,
  heatmapMax,
  filterRegion = null,
}: BrazilMapProps) {
  const [geo, setGeo] = useState<FeatureCollection | null>(null);
  const [hover, setHover] = useState<UF | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [mounted, setMounted] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/brazil-states.geojson", { cache: "force-cache" })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setGeo(d as FeatureCollection);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(id);
  }, []);

  const { pathGen, projection } = useMemo(() => {
    if (!geo) return { pathGen: null, projection: null };
    const proj = geoMercator().fitSize([WIDTH, HEIGHT], geo);
    return { pathGen: geoPath(proj), projection: proj };
  }, [geo]);

  const centroids = useMemo(() => {
    if (!geo || !pathGen) return {} as Record<UF, [number, number]>;
    const acc = {} as Record<UF, [number, number]>;
    for (const feature of geo.features) {
      const name = (feature.properties as { name?: string } | null)?.name ?? "";
      const uf = GEOJSON_NAME_TO_UF[name];
      if (uf) acc[uf] = pathGen.centroid(feature) as [number, number];
    }
    return acc;
  }, [geo, pathGen]);

  const maxCount = useMemo(() => {
    if (heatmapMax != null) return heatmapMax;
    let m = 1;
    for (const v of Object.values(presenceByState)) {
      const total = (v?.distributors ?? 0) + (v?.consultants ?? 0);
      if (total > m) m = total;
    }
    return m;
  }, [presenceByState, heatmapMax]);

  const ufOrder = useMemo(() => {
    return ALL_UFS.slice();
  }, []);

  function getCounts(uf: UF) {
    const p = presenceByState[uf];
    return { d: p?.distributors ?? 0, c: p?.consultants ?? 0 };
  }

  function fillFor(uf: UF): string {
    const { d, c } = getCounts(uf);
    if (mode === "presence-distributors")
      return d > 0 ? "url(#grad-exclusive)" : "var(--state-empty)";
    if (mode === "presence-consultants")
      return c > 0 ? "url(#grad-exclusive)" : "var(--state-empty)";
    if (mode === "heatmap") {
      const v = d + c;
      if (v === 0) return "var(--heat-1)";
      const ratio = v / maxCount;
      if (ratio < 0.2) return "var(--heat-2)";
      if (ratio < 0.4) return "var(--heat-3)";
      if (ratio < 0.7) return "var(--heat-4)";
      return "var(--heat-5)";
    }
    if (d > 0 && c > 0) return "url(#grad-exclusive)";
    if (d > 0 || c > 0) return "url(#grad-partial)";
    return "var(--state-empty)";
  }

  function isFaded(uf: UF): boolean {
    const { d, c } = getCounts(uf);
    if (filterRegion && UF_REGION[uf] !== filterRegion) return true;
    if (mode === "presence-distributors") return d === 0;
    if (mode === "presence-consultants") return c === 0;
    if (mode === "heatmap") return d + c === 0;
    return d === 0 && c === 0;
  }

  const handleMouseMove = useCallback((e: React.MouseEvent, uf: UF) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTooltip({ uf, x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHover(null);
    setTooltip(null);
  }, []);

  const selData = selectedUF ? getCounts(selectedUF) : null;

  if (!geo || !pathGen) {
    return (
      <div
        className={cn(
          "aspect-square w-full animate-pulse rounded-xl bg-surface",
          className,
        )}
      />
    );
  }

  const pinsByStateCount: Record<string, number> = {};
  const statePinClusters: Record<
    string,
    { pins: MapPinData[]; centroid: [number, number] }
  > = {};

  for (const p of pins) {
    const hasCoords =
      p.lat != null && p.lng != null && p.lat !== 0 && p.lng !== 0;
    if (!hasCoords) {
      if (!statePinClusters[p.state]) {
        const centroid = centroids[p.state as UF];
        if (centroid) {
          statePinClusters[p.state] = { pins: [], centroid };
        }
      }
      if (statePinClusters[p.state]) {
        statePinClusters[p.state].pins.push(p);
      }
    }
  }

  return (
    <div className={cn("relative w-full", className)}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full select-none"
        role="img"
        aria-label="Mapa do Brasil"
      >
        <defs>
          {/* Gradiente exclusivo (dourado vibrante) */}
          <linearGradient id="grad-exclusive" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--grad-exclusive-1)" />
            <stop offset="100%" stopColor="var(--grad-exclusive-2)" />
          </linearGradient>
          {/* Gradiente parcial (dourado suave) */}
          <linearGradient id="grad-partial" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--grad-partial-1)" />
            <stop offset="100%" stopColor="var(--grad-partial-2)" />
          </linearGradient>
          {/* Glow animado para estado selecionado */}
          <filter
            id="glow-selected"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feFlood floodColor="#d4a843" floodOpacity="0.6" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Glow pulsante para pins */}
          <filter id="pin-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feFlood floodOpacity="0.4" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {geo.features.map((feature: Feature, idx: number) => {
          const name =
            (feature.properties as { name?: string } | null)?.name ?? "";
          const uf = GEOJSON_NAME_TO_UF[name];
          if (!uf) return null;
          const d = pathGen(feature) ?? "";
          const faded = isFaded(uf);
          const isSel = selectedUF === uf;
          const isHover = hover === uf;
          const { d: distCount, c: consCount } = getCounts(uf);

          return (
            <path
              key={uf}
              d={d}
              fill={fillFor(uf)}
              stroke={
                isSel ? "var(--map-stroke-selected)" : "var(--map-stroke)"
              }
              strokeWidth={isSel ? 2 : 0.7}
              filter={isSel ? "url(#glow-selected)" : undefined}
              className={cn(
                "cursor-pointer transition-[opacity,filter,stroke] duration-200",
                faded && "state-faded",
                isHover && !faded && "brightness-110",
              )}
              style={{
                opacity: mounted ? undefined : 0,
                transform: mounted ? undefined : "translateY(-4px)",
                transition: `opacity 0.3s ease-out, transform 0.3s ease-out, filter 0.2s, stroke 0.2s`,
                transitionDelay: mounted
                  ? `${idx * ANIMATION_DELAY_STEP}ms`
                  : "0ms",
              }}
              onMouseEnter={() => setHover(uf)}
              onMouseMove={(e) => handleMouseMove(e, uf)}
              onMouseLeave={handleMouseLeave}
              onClick={() => onStateClick?.(uf)}
            >
              <title>{`${UF_NAMES[uf]} (${uf}) — ${distCount} distribuidor(es), ${consCount} consultor(es)`}</title>
            </path>
          );
        })}

        {pins.length > 0 && (
          <g>
            {pins.map((p, pinIdx) => {
              const hasCoords =
                p.lat != null && p.lng != null && p.lat !== 0 && p.lng !== 0;
              if (!hasCoords) return null;

              const color = p.pin_color ?? "#4169e1";
              const coords = projection ? projection([p.lng!, p.lat!]) : null;
              if (!coords) return null;
              const [x, y] = coords;

              return (
                <g
                  key={p.id}
                  transform={`translate(${x}, ${y})`}
                  style={{
                    opacity: mounted ? 1 : 0,
                    transition: `opacity 0.4s ease-out`,
                    transitionDelay: mounted
                      ? `${27 * ANIMATION_DELAY_STEP + pinIdx * 40}ms`
                      : "0ms",
                  }}
                >
                  {/* Pin gota com glow */}
                  <path
                    d="M0,-16 C-6,-10 -10,-4 -10,2 C-10,8 -4,14 0,18 C4,14 10,8 10,2 C10,-4 6,-10 0,-16Z"
                    fill={color}
                    stroke="#fff"
                    strokeWidth={1}
                    filter="url(#pin-glow)"
                    className="cursor-pointer transition-transform duration-150 hover:scale-125"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPinClick?.(p);
                    }}
                  />
                  <circle
                    cx="0"
                    cy="2"
                    r="3"
                    fill="#fff"
                    className="pointer-events-none"
                    opacity={0.9}
                  />
                  <title>{p.name}</title>
                </g>
              );
            })}

            {Object.entries(statePinClusters).map(([state, cluster]) => {
              const [cx, cy] = cluster.centroid;
              const count = cluster.pins.length;
              const firstColor = cluster.pins[0]?.pin_color ?? "#4169e1";
              return (
                <g
                  key={`cluster-${state}`}
                  transform={`translate(${cx}, ${cy})`}
                >
                  <circle
                    r={count > 9 ? 14 : 10}
                    fill={firstColor}
                    fillOpacity={0.2}
                    stroke={firstColor}
                    strokeWidth={2}
                  />
                  <circle
                    r={count > 9 ? 11 : 8}
                    fill={firstColor}
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPinClick?.(cluster.pins[0]);
                    }}
                  />
                  <text
                    textAnchor="middle"
                    dy="0.35em"
                    fill="#fff"
                    fontSize={count > 9 ? 11 : 10}
                    fontWeight={700}
                    className="pointer-events-none select-none"
                  >
                    {count}
                  </text>
                  <title>
                    {count} entidade(s) em {UF_NAMES[state as UF]}
                  </title>
                </g>
              );
            })}
          </g>
        )}
      </svg>

      {/* Tooltip flutuante com glassmorphism */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-50 rounded-xl border border-white/10 bg-card/80 px-3.5 py-3 shadow-2xl backdrop-blur-xl"
          style={{
            left: tooltip.x + 16,
            top: tooltip.y - 10,
            transform: "translateY(-100%)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <p className="whitespace-nowrap text-sm font-bold text-foreground tracking-tight">
            {UF_NAMES[tooltip.uf]}{" "}
            <span className="text-accent ml-0.5">({tooltip.uf})</span>
          </p>
          <div className="mt-2 space-y-1.5 border-t border-white/5 pt-2 text-xs text-muted-foreground">
            {mode !== "presence-consultants" && (
              <p className="flex items-center gap-2 whitespace-nowrap">
                <Building2 size={13} className="shrink-0 text-accent" />
                <span className="text-foreground font-semibold">
                  {getCounts(tooltip.uf).d}
                </span>
                <span>distribuidor(es)</span>
              </p>
            )}
            {mode !== "presence-distributors" && (
              <p className="flex items-center gap-2 whitespace-nowrap">
                <User size={13} className="shrink-0 text-accent" />
                <span className="text-foreground font-semibold">
                  {getCounts(tooltip.uf).c}
                </span>
                <span>consultor(es)</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

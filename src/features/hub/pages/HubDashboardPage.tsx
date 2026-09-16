import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "~/lib/auth";
import { supabase } from "~/core/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Search,
  Grid,
  FileText,
  Image as ImageIcon,
  Video,
  Filter,
  Layers,
  Sparkles,
  BookOpen,
  Tag,
  Star,
  Headphones,
  Globe,
  Trophy,
  Building2,
} from "lucide-react";
import { fetchHubMaterials } from "../services/materials";
import { fetchHubCollections } from "../services/collections";
import { fetchHubUserProgress } from "../services/progress";
import { MaterialCard } from "../components/materials/MaterialCard";
import { CollectionCard } from "../components/collections/CollectionCard";
import { getHubUserLevel, getHubNextLevelThreshold } from "../types";
import type { HubMaterialType, HubRole } from "../types";

interface HubDashboardPageProps {
  roleFilter?: "admin" | "manager" | "consultant" | "distributor" | "client";
  conquistasPath?: string;
  rankingPath?: string;
}

const ROLE_ALLOWED_MAP: Record<string, HubRole> = {
  manager: "manager",
  consultant: "consultant",
  distributor: "distributor",
  client: "client",
};

export function HubDashboardPage({
  roleFilter,
  conquistasPath = "/hub/conquistas",
  rankingPath,
}: HubDashboardPageProps = {}) {
  const { user, empresa, profile } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<HubMaterialType | "all">("all");
  const [filterTag, setFilterTag] = useState("");
  const [activeView, setActiveView] = useState<"materials" | "collections">("materials");

  const isSuperAdmin = profile?.is_super_admin === true;
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>(empresa?.id || "");
  const { data: empresas = [] } = useQuery({
    queryKey: ["empresas-list"],
    queryFn: async () => {
      const { data } = await supabase.from("empresas").select("id, nome").order("nome");
      return data || [];
    },
    enabled: !!isSuperAdmin,
  });
  const activeEmpresaId = isSuperAdmin ? selectedEmpresa : empresa?.id;

  const userPoints = (user as any)?.hub_points || 0;
  const userLevel = getHubUserLevel(userPoints);
  const nextThreshold = getHubNextLevelThreshold(userPoints);
  const levelProgress = nextThreshold > 0 ? Math.min(100, Math.round((userPoints / nextThreshold) * 100)) : 100;

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["hub-materials", activeEmpresaId],
    queryFn: () => fetchHubMaterials(activeEmpresaId!),
    enabled: isSuperAdmin || !!activeEmpresaId,
  });
  const { data: collections = [] } = useQuery({
    queryKey: ["hub-collections", activeEmpresaId],
    queryFn: () => fetchHubCollections(),
    enabled: isSuperAdmin || !!activeEmpresaId,
  });
  const { data: progress = [] } = useQuery({
    queryKey: ["hub-progress", user?.id, activeEmpresaId],
    queryFn: () => fetchHubUserProgress(user!.id, activeEmpresaId!),
    enabled: !!user?.id && (isSuperAdmin || !!activeEmpresaId),
  });

  const roleMapped = roleFilter ? ROLE_ALLOWED_MAP[roleFilter] : undefined;

  const filteredMaterials = useMemo(
    () =>
      materials.filter((m) => {
        if (roleMapped && m.allowedRoles && !m.allowedRoles.includes(roleMapped)) return false;
        const t = m.title?.["pt-br"] || "";
        return (
          t.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (filterType === "all" || m.type === filterType) &&
          (!filterTag || m.tags.includes(filterTag))
        );
      }),
    [materials, searchTerm, filterType, filterTag, roleMapped],
  );

  const allTags = useMemo(() => {
    const s = new Set<string>();
    materials.forEach((m) => m.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [materials]);

  const counts = useMemo(
    () => ({
      all: materials.length,
      pdf: materials.filter((m) => m.type === "pdf").length,
      image: materials.filter((m) => m.type === "image").length,
      video: materials.filter((m) => m.type === "video").length,
      audio: materials.filter((m) => m.type === "audio").length,
      html: materials.filter((m) => m.type === "html").length,
    }),
    [materials],
  );

  const MenuCategory = ({
    type,
    icon: Icon,
    label,
    count,
    active,
  }: {
    type: HubMaterialType | "all";
    icon: React.ComponentType<{ size?: number }>;
    label: string;
    count: number;
    active: boolean;
  }) => (
    <button
      onClick={() => setFilterType(type)}
      className={`group relative w-full text-left px-2.5 py-2.5 md:px-4 md:py-3.5 rounded-xl md:rounded-2xl flex items-center justify-between transition-all duration-300 overflow-hidden ${
        active
          ? "bg-gradient-to-br from-accent/20 via-accent/10 to-transparent border border-accent/30 md:translate-x-2"
          : "bg-surface/50 border border-border/20 hover:border-border/40"
      }`}
    >
      <div className="flex items-center gap-2 md:gap-4 relative z-10">
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${active ? "bg-accent/20 text-accent" : "bg-surface text-text-muted group-hover:bg-surface-hover"}`}>
          <Icon size={16} />
        </div>
        <span className={`text-xs md:text-sm tracking-wide whitespace-nowrap ${active ? "font-bold text-text-main" : "font-medium text-text-muted"}`}>
          {label}
        </span>
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg transition-all duration-300 ${active ? "bg-accent/15 text-accent border border-accent/20" : "bg-surface border border-border text-text-muted"}`}>
        {count}
      </span>
    </button>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="relative group rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
        <div className="absolute -right-20 -bottom-40 w-96 h-96 rounded-full blur-[100px] bg-accent/10 animate-pulse" />
        <div className="relative z-10 p-5 sm:p-8 md:p-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 sm:gap-8">
          <div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 text-text-main drop-shadow-sm">
              Materiais
            </h1>
            <p className="text-sm sm:text-base max-w-lg leading-relaxed font-medium text-text-muted">
              Explore, visualize e baixe todos os materiais disponíveis para o seu perfil.
            </p>
          </div>
          <div className="relative w-full xl:w-96">
            <div className="relative border border-border/30 rounded-2xl flex items-center shadow-sm bg-surface transition-all duration-300 focus-within:ring-2 focus-within:ring-accent/40 focus-within:border-accent">
              <div className="pl-4 sm:pl-5 text-text-muted">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Buscar materiais..."
                className="w-full bg-transparent border-none py-3 sm:py-4 px-3 sm:px-4 focus:ring-0 text-sm font-medium outline-none text-text-main placeholder:text-text-muted/60"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-72 shrink-0 z-30">
          <div className="sticky top-28 space-y-4">
            {/* Super Admin empresa filter */}
            {isSuperAdmin && empresas.length > 0 && (
              <div className="rounded-2xl p-3 bg-surface border border-border/20 flex items-center gap-2">
                <Building2 size={14} className="text-accent shrink-0" />
                <Select value={selectedEmpresa} onValueChange={setSelectedEmpresa}>
                  <SelectTrigger className="w-full h-8 text-xs bg-input-bg border-border">
                    <SelectValue placeholder="Filtrar por empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as empresas</SelectItem>
                    {empresas.map((e: any) => (
                      <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Level card */}
            {user && (
              <div className="rounded-2xl p-4 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent border border-accent/20">
                <div className="flex items-center gap-2 mb-3">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Nível {userLevel}</span>
                  <span className="ml-auto text-xs font-bold text-accent">{userPoints} XP</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface">
                  <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent/80 transition-all duration-500" style={{ width: `${levelProgress}%` }} />
                </div>
                <p className="text-[10px] mt-1.5 text-right text-text-muted">Próximo: {nextThreshold} XP</p>
              </div>
            )}

            {/* Conquistas link */}
            {user && (
              <div className="rounded-2xl p-4 bg-surface border border-border/20">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy size={14} className="text-accent" />
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Conquistas</span>
                </div>
                <button
                  onClick={() => navigate({ to: conquistasPath as any })}
                  className="text-xs font-bold text-accent transition-all hover:text-accent-hover"
                >
                  Ver conquistas →
                </button>
              </div>
            )}

            {/* View toggle */}
            <div className="flex rounded-xl overflow-hidden bg-surface border border-border/20 p-1">
              <button
                onClick={() => setActiveView("materials")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-all rounded-lg ${activeView === "materials" ? "bg-gradient-to-br from-accent/20 via-accent/10 to-transparent text-accent" : "text-text-muted hover:text-text-main"}`}
              >
                <Grid size={14} /> Materiais
              </button>
              <button
                onClick={() => setActiveView("collections")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-all rounded-lg ${activeView === "collections" ? "bg-gradient-to-br from-accent/20 via-accent/10 to-transparent text-accent" : "text-text-muted hover:text-text-main"}`}
              >
                <BookOpen size={14} /> Trilhas
              </button>
            </div>

            {/* Category menu */}
            {activeView === "materials" && (
              <div className="border border-border/20 p-2 sm:p-3 rounded-2xl bg-surface flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-1.5 sm:gap-2 no-scrollbar shadow-sm">
                <div className="hidden md:flex items-center justify-between px-4 py-3 mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-text-muted">
                    <Layers size={14} className="text-accent" /> Biblioteca
                  </h3>
                </div>
                <div className="shrink-0 md:shrink md:min-w-0 md:flex-1">
                  <MenuCategory type="all" icon={Grid} label="Todos" count={counts.all} active={filterType === "all"} />
                </div>
                <div className="shrink-0 md:shrink md:min-w-0 md:flex-1">
                  <MenuCategory type="pdf" icon={FileText} label="PDF" count={counts.pdf} active={filterType === "pdf"} />
                </div>
                <div className="shrink-0 md:shrink md:min-w-0 md:flex-1">
                  <MenuCategory type="image" icon={ImageIcon} label="Imagem" count={counts.image} active={filterType === "image"} />
                </div>
                <div className="shrink-0 md:shrink md:min-w-0 md:flex-1">
                  <MenuCategory type="video" icon={Video} label="Vídeo" count={counts.video} active={filterType === "video"} />
                </div>
                <div className="shrink-0 md:shrink md:min-w-0 md:flex-1">
                  <MenuCategory type="audio" icon={Headphones} label="Áudio" count={counts.audio} active={filterType === "audio"} />
                </div>
                <div className="shrink-0 md:shrink md:min-w-0 md:flex-1">
                  <MenuCategory type="html" icon={Globe} label="HTML" count={counts.html} active={filterType === "html"} />
                </div>

                {/* Tags */}
                {allTags.length > 0 && (
                  <div className="hidden md:block mt-2 pt-4 px-2 border-t border-border/20">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1 text-text-muted">
                      <Tag size={10} /> Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setFilterTag(filterTag === tag ? "" : tag)}
                          className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all ${
                            filterTag === tag
                              ? "bg-accent/15 text-accent border border-accent/20"
                              : "bg-accent/8 text-accent border border-accent/10 hover:bg-accent/15"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dica Pro */}
                <div className="hidden md:block mt-4 pt-4 px-2 border-t border-border/20">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/20 via-yellow-500/10 to-transparent border border-yellow-500/20 p-5 group transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2 text-yellow-400">
                        <Sparkles size={16} className="animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wide">Dica Pro</span>
                      </div>
                      <p className="text-xs leading-relaxed text-text-muted">
                        Use <span className="font-mono bg-surface px-1 rounded text-[10px] text-text-main">Ctrl+F</span> para focar na busca.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 z-0">
          {activeView === "materials" && (
            <>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} role="status" aria-label="Carregando" className="rounded-2xl animate-pulse bg-surface border border-border/20 min-h-[320px]" />
                  ))}
                </div>
              ) : filteredMaterials.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-surface/50 border border-border/20 border-dashed rounded-2xl animate-fade-in text-center px-4">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-surface border border-border/20 text-text-muted">
                    <Filter size={32} className="opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-text-main">Nenhum resultado encontrado</h3>
                  <p className="text-sm max-w-xs text-text-muted">Tente ajustar os filtros de busca.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
                  {filteredMaterials.map((mat, index) => (
                    <div key={mat.id} className="animate-slide-up" style={{ animationDelay: `${index * 70}ms` }}>
                      <MaterialCard material={mat} progress={progress.find((p) => p.material_id === mat.id)} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeView === "collections" && (
            <>
              {collections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-surface/50 border border-border/20 border-dashed rounded-2xl text-center px-4">
                  <BookOpen size={48} className="mb-4 opacity-30 text-text-muted" />
                  <h3 className="text-xl font-bold mb-2 text-text-main">Nenhuma trilha disponível</h3>
                  <p className="text-sm text-text-muted">As trilhas de aprendizagem serão exibidas aqui.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                  {collections.map((col, i) => (
                    <div key={col.id} className="animate-slide-up" style={{ animationDelay: `${i * 70}ms` }}>
                      <CollectionCard collection={col} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

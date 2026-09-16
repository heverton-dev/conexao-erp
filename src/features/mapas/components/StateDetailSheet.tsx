import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import { UF_NAMES, type UF } from "../constants/brazil-states";
import type { Entity } from "../types";
import { Search, Building2, Users, X, MapPin } from "lucide-react";
import { EmptyState } from "~/components/ui/empty-state";

interface Props {
  uf: UF | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entities: Entity[];
}

export function StateDetailSheet({ uf, open, onOpenChange, entities }: Props) {
  const ufName = uf ? UF_NAMES[uf] : "";
  const distCount = entities.filter((e) => e.kind === "distributor").length;
  const consCount = entities.filter((e) => e.kind === "consultant").length;
  const [tab, setTab] = useState<"all" | "distributors" | "consultants">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = entities;
    if (tab === "distributors")
      list = entities.filter((e) => e.kind === "distributor");
    if (tab === "consultants")
      list = entities.filter((e) => e.kind === "consultant");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => {
        const name = e.item.name.toLowerCase();
        const code =
          e.kind === "distributor"
            ? (e.item.code ?? "")
            : (e.item.registration ?? "");
        const city =
          e.kind === "distributor"
            ? (e.item.city ?? "")
            : (e.item.region ?? "");
        return (
          name.includes(q) ||
          code.toLowerCase().includes(q) ||
          city.toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [entities, tab, search]);

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setSearch("");
      setTab("all");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>{uf ? `${ufName} (${uf})` : ""}</DialogTitle>
              <DialogDescription>
                {distCount > 0 && `${distCount} distribuidor(es)`}
                {distCount > 0 && consCount > 0 && " · "}
                {consCount > 0 && `${consCount} consultor(es)`}
                {entities.length === 0 && "Sem registros"}
              </DialogDescription>
            </div>
          </div>

          {/* Abas com badges */}
          <div className="flex flex-wrap gap-2 text-xs mt-2">
            {distCount > 0 && (
              <button
                onClick={() =>
                  setTab(tab === "distributors" ? "all" : "distributors")
                }
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  tab === "distributors"
                    ? "bg-accent text-accent-fg shadow-md shadow-accent/20"
                    : "border border-border text-text-muted hover:bg-surface-hover"
                }`}
              >
                <Building2 size={12} />
                {distCount} distribuidor(es)
              </button>
            )}
            {consCount > 0 && (
              <button
                onClick={() =>
                  setTab(tab === "consultants" ? "all" : "consultants")
                }
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  tab === "consultants"
                    ? "bg-accent text-accent-fg shadow-md shadow-accent/20"
                    : "border border-border text-text-muted hover:bg-surface-hover"
                }`}
              >
                <Users size={12} />
                {consCount} consultor(es)
              </button>
            )}
          </div>

          {/* Campo de busca */}
          {entities.length > 0 && (
            <div className="relative mt-3">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, código ou cidade..."
                className="w-full h-10 rounded-xl border border-border bg-input-bg py-2 pl-9 pr-9 text-sm text-text-main placeholder:text-text-muted transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="px-6 py-6 flex-1 space-y-4">
        <ScrollArea className="max-h-[60vh]">
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Search className="w-8 h-8 text-text-muted/30" />}
              title={search ? "Nenhum resultado" : "Sem presença"}
              description={
                search
                  ? "Nenhum resultado encontrado."
                  : "Sem presença neste estado."
              }
            />
          ) : (
            <ul className="w-full space-y-2">
              {filtered.map((e) => {
                const badgeText =
                  e.kind === "distributor"
                    ? e.item.code?.trim()
                    : e.item.registration?.trim();
                return (
                  <li
                    key={`${e.kind}-${e.item.id}`}
                    className="group/card w-full flex items-start gap-3 rounded-xl border border-border bg-surface p-3.5 transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent font-bold text-sm shrink-0 group-hover/card:bg-accent/20 transition-colors">
                      {e.kind === "distributor" ? (
                        <Building2 size={16} />
                      ) : (
                        <Users size={16} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase"
                          style={{
                            backgroundColor: `${e.kind === "distributor" ? "#22c55e" : "#3b82f6"}15`,
                            color:
                              e.kind === "distributor" ? "#22c55e" : "#3b82f6",
                          }}
                        >
                          {e.kind === "distributor" ? "Dist" : "Cons"}
                        </span>
                        <p className="truncate text-sm font-semibold text-text-main group-hover/card:text-accent transition-colors">
                          {e.item.name}
                        </p>
                        {badgeText && (
                          <span className="shrink-0 rounded-md bg-border px-1.5 py-0.5 text-[10px] text-text-muted">
                            {badgeText}
                          </span>
                        )}
                      </div>
                      {e.kind === "distributor" ? (
                        <p className="mt-1 truncate text-xs text-text-muted">
                          {e.item.city ?? "—"} ·{" "}
                          {e.item.category === "EXCLUSIVE"
                            ? "Exclusivo"
                            : "Não-exclusivo"}
                        </p>
                      ) : (
                        <p className="mt-1 truncate text-xs text-text-muted">
                          {e.item.region ?? "—"}
                          {e.item.supervisor ? ` · ${e.item.supervisor}` : ""}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

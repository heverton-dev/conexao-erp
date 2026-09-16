import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";

import {
  MapPin,
  User,
  Building2,
  Hash,
  Award,
  Navigation,
} from "lucide-react";
import type { Entity } from "../types";

interface Props {
  entity: Entity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EntityDetailDialog({ entity, open, onOpenChange }: Props) {
  if (!entity) return null;

  const { kind, item } = entity;
  const isDist = kind === "distributor";
  const pinColor = item.pin_color ?? "#4169e1";

  const handleOpenRoute = () => {
    let url = "";
    if (
      item.lat != null &&
      item.lng != null &&
      item.lat !== 0 &&
      item.lng !== 0
    ) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`;
    } else {
      const query = encodeURIComponent(
        `${item.name} ${isDist ? (item.city ?? "") : (item.region ?? "")} ${item.state}`,
      );
      url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    }
    window.open(url, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              {isDist ? (
                <Building2 className="h-6 w-6" />
              ) : (
                <User className="h-6 w-6" />
              )}
            </div>
            <div>
              <DialogTitle>Detalhes</DialogTitle>
              <DialogDescription>
                {isDist ? "Distribuidor" : "Consultor"} — {item.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 flex-1 space-y-4">
          {/* Nome e Tipo */}
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase"
              style={{ backgroundColor: `${pinColor}15`, color: pinColor }}
            >
              {isDist ? "Distribuidor" : "Consultor"}
            </span>
            <p className="text-base font-bold text-text-main">{item.name}</p>
          </div>

          {/* Campos de informação */}
          <div className="space-y-4">
            {isDist
              ? item.code && (
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5">
                      Código
                    </label>
                    <div className="flex items-center gap-2 h-11 px-4 rounded-xl border border-border bg-background text-sm text-text-main font-semibold">
                      <Hash size={14} className="text-accent shrink-0" />
                      {item.code}
                    </div>
                  </div>
                )
              : item.registration && (
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5">
                      Matrícula
                    </label>
                    <div className="flex items-center gap-2 h-11 px-4 rounded-xl border border-border bg-background text-sm text-text-main font-semibold">
                      <Hash size={14} className="text-accent shrink-0" />
                      {item.registration}
                    </div>
                  </div>
                )}

            {isDist ? (
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">
                  Categoria
                </label>
                <div className="flex items-center gap-2 h-11 px-4 rounded-xl border border-border bg-background text-sm text-text-main font-semibold">
                  <Award size={14} className="text-accent shrink-0" />
                  {item.category === "EXCLUSIVE"
                    ? "Exclusivo"
                    : "Não-exclusivo"}
                </div>
              </div>
            ) : (
              (item as any).supervisor && (
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">
                    Supervisor
                  </label>
                  <div className="flex items-center gap-2 h-11 px-4 rounded-xl border border-border bg-background text-sm text-text-main font-semibold">
                    <User size={14} className="text-accent shrink-0" />
                    {(item as any).supervisor}
                  </div>
                </div>
              )
            )}

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">
                Localização
              </label>
              <div className="flex items-center gap-2 h-11 px-4 rounded-xl border border-border bg-background text-sm text-text-main font-semibold">
                <MapPin size={14} className="text-accent shrink-0" />
                {isDist ? item.city : item.region} — {item.state}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]"
          >
            <MapPin size={14} className="mr-1.5 text-accent inline" />
            Ver no Mapa
          </button>
          <button
            type="button"
            onClick={handleOpenRoute}
            className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]"
          >
            <Navigation size={14} className="mr-1.5 inline" />
            Abrir Rota
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

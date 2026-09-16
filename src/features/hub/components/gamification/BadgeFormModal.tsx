import { useState } from "react";
import { Award } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { HUB_BADGE_ICONS } from "../../constants";
import type { HubBadge, HubBadgeTrigger } from "../../types";

interface BadgeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (badge: Partial<HubBadge>) => void;
  badge?: HubBadge;
}

const triggerTypes: { value: HubBadgeTrigger; label: string }[] = [
  { value: "material_completed", label: "Material Concluído" },
  { value: "collection_completed", label: "Trilha Concluída" },
  { value: "points_reached", label: "XP Atingido" },
  { value: "streak_days", label: "Sequência de Dias" },
  { value: "ranking_position", label: "Posição no Ranking" },
  { value: "login_count", label: "Número de Logins" },
];

export function BadgeFormModal({
  open,
  onClose,
  onSave,
  badge,
}: BadgeFormModalProps) {
  const [name, setName] = useState(badge?.name || "");
  const [description, setDescription] = useState(badge?.description || "");
  const [iconName, setIconName] = useState(badge?.icon_name || "star");
  const [triggerType, setTriggerType] = useState<HubBadgeTrigger>(
    badge?.trigger_type || "material_completed",
  );
  const [triggerValue, setTriggerValue] = useState(badge?.trigger_value || 1);
  const [pointsReward, setPointsReward] = useState(badge?.points_reward || 0);
  const [color, setColor] = useState(badge?.color || "#6366f1");

  const handleSave = () => {
    onSave({
      ...badge,
      name,
      description,
      icon_name: iconName,
      trigger_type: triggerType,
      trigger_value: triggerValue,
      points_reward: pointsReward,
      color,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>{badge ? "Editar Badge" : "Novo Badge"}</DialogTitle>
              <DialogDescription>Configure as regras e aparência do badge.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="px-6 py-6 flex-1 min-h-0 overflow-y-auto space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">Nome *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">Descrição</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">Ícone</label>
              <Select value={iconName} onValueChange={setIconName}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HUB_BADGE_ICONS.map((ic) => (
                    <SelectItem key={ic} value={ic}>
                      {ic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">Cor</label>
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">Gatilho</label>
              <Select
                value={triggerType}
                onValueChange={(v) => setTriggerType(v as HubBadgeTrigger)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {triggerTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">
                Valor do Gatilho
              </label>
              <Input
                type="number"
                value={triggerValue}
                onChange={(e) => setTriggerValue(Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">
              Recompensa XP
            </label>
            <Input
              type="number"
              value={pointsReward}
              onChange={(e) => setPointsReward(Number(e.target.value))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-surface shrink-0">
            <button type="button" onClick={onClose} className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">
              Cancelar
            </button>
            <button type="button" onClick={handleSave} className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]">{badge ? "Salvar" : "Criar"}</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

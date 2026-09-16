import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import type { HubCollection, HubLanguage } from "../../types";

interface CollectionFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (collection: Partial<HubCollection>) => void;
  collection?: HubCollection;
}

export function CollectionFormModal({
  open,
  onClose,
  onSave,
  collection,
}: CollectionFormModalProps) {
  const [title, setTitle] = useState<Record<HubLanguage, string>>({
    "pt-br": "",
    "en-us": "",
    "es-es": "",
    ...collection?.title,
  });
  const [description, setDescription] = useState<Record<HubLanguage, string>>({
    "pt-br": "",
    "en-us": "",
    "es-es": "",
    ...collection?.description,
  });
  const [points, setPoints] = useState(collection?.points || 50);
  const [coverImage, setCoverImage] = useState(collection?.cover_image || "");

  const handleSave = () => {
    onSave({
      ...collection,
      title,
      description,
      points,
      cover_image: coverImage || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>
                {collection ? "Editar Trilha" : "Nova Trilha"}
              </DialogTitle>
              <DialogDescription>Configure os dados da trilha de aprendizado.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="px-6 py-6 flex-1 min-h-0 overflow-y-auto space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">
              Título (PT-BR) *
            </label>
            <Input
              value={title["pt-br"]}
              onChange={(e) => setTitle({ ...title, "pt-br": e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">
                Título (EN-US)
              </label>
              <Input
                value={title["en-us"]}
                onChange={(e) =>
                  setTitle({ ...title, "en-us": e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">
                Título (ES-ES)
              </label>
              <Input
                value={title["es-es"]}
                onChange={(e) =>
                  setTitle({ ...title, "es-es": e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">
              Descrição (PT-BR)
            </label>
            <Textarea
              value={description["pt-br"]}
              onChange={(e) =>
                setDescription({ ...description, "pt-br": e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">
                XP da Trilha
              </label>
              <Input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">
                URL da Capa
              </label>
              <Input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-surface shrink-0">
            <button type="button" onClick={onClose} className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">
              Cancelar
            </button>
            <button type="button" onClick={handleSave} className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]">
              {collection ? "Salvar" : "Criar"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

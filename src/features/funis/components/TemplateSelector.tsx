import { useState } from "react";
import { FileText, Plus, Layout } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { useTemplates } from "../hooks/useTemplates";
import type { Template } from "../types";

type TemplateSelectorProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (template: Template | null) => void;
};

export function TemplateSelector({
  open,
  onClose,
  onSelect,
}: TemplateSelectorProps) {
  const { data: templates = [], isLoading } = useTemplates();
  const [selected, setSelected] = useState<Template | null>(null);

  const handleSelect = () => {
    onSelect(selected);
    onClose();
  };

  const handleFromScratch = () => {
    onSelect(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card max-h-[90dvh] overflow-hidden flex flex-col max-w-lg">
        <DialogHeader className="bg-gradient-to-br from-accent/20 via-accent/10 to-transparent px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Layout className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>Criar funil</DialogTitle>
              <DialogDescription>Escolha um template ou comece do zero</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 flex-1 space-y-4">
          <button
            onClick={handleFromScratch}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              selected === null
                ? "border-primary bg-primary/5"
                : "border-border/40 hover:border-primary/40"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Começar do zero</p>
                <p className="text-xs text-muted-foreground">
                  Criar funil com colunas personalizadas
                </p>
              </div>
            </div>
          </button>

          {isLoading ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              Carregando templates...
            </div>
          ) : templates.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelected(template)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selected?.id === template.id
                      ? "border-primary bg-primary/5"
                      : "border-border/40 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {template.nome}
                        </p>
                        {template.is_public && (
                          <Badge variant="secondary" className="text-[9px]">
                            Público
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {template.descricao || "Sem descrição"}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground">
                          {template.colunas?.length ?? 0} colunas
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {template.tarefas?.length ?? 0} tarefas
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Layout className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                Nenhum template disponível.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 pb-6 pt-4 border-t border-border/50 gap-3">
          <button type="button" onClick={onClose} className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">
            Cancelar
          </button>
          <button type="button" onClick={handleSelect} className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]">
            {selected ? `Usar "${selected.nome}"` : "Criar do zero"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

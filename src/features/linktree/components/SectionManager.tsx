import { useRef, useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, Check, X, Upload, Loader2, Image } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import toast from "react-hot-toast";
import type { EmpresaLinktreeSection } from "../types-empresa";
import { compressImage } from "~/features/linktree/lib/image-utils";
import {
  useCriarSecao,
  useAtualizarSecao,
  useDeletarSecao,
} from "../hooks/useEmpresaLinktree";

interface Props {
  sections: EmpresaLinktreeSection[];
  empresaId?: string | null;
}

export function SectionManager({ sections, empresaId }: Props) {
  const [newTitulo, setNewTitulo] = useState("");
  const [newImagem, setNewImagem] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editImagem, setEditImagem] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const criar = useCriarSecao(empresaId);
  const atualizar = useAtualizarSecao();
  const deletar = useDeletarSecao();

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      toast.error("Imagem muito grande (max 8MB)");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await compressImage(f, 800, 0.85);
      setter(dataUrl);
    } catch {
      toast.error("Falha ao processar imagem");
    } finally {
      setUploading(false);
    }
  }

  function handleCreate() {
    if (!newTitulo.trim()) return;
    criar.mutate(
      { titulo: newTitulo.trim(), imagem_url: newImagem || null, ordem: sections.length },
      {
        onSuccess: () => {
          setNewTitulo("");
          setNewImagem("");
        },
      },
    );
  }

  function handleUpdate(id: string) {
    if (!editTitulo.trim()) return;
    atualizar.mutate(
      { id, input: { titulo: editTitulo.trim(), imagem_url: editImagem || null } },
      {
        onSuccess: () => setEditingId(null),
      },
    );
  }

  function handleDelete() {
    if (!deletingId) return;
    deletar.mutate(deletingId, {
      onSuccess: () => setDeletingId(null),
    });
  }

  function startEdit(sec: EmpresaLinktreeSection) {
    setEditingId(sec.id);
    setEditTitulo(sec.titulo);
    setEditImagem(sec.imagem_url ?? "");
  }

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Secoes</Label>

      {sections.map((sec) => (
        <div
          key={sec.id}
          className="rounded-lg border border-border bg-surface"
        >
          {editingId === sec.id ? (
            <div className="space-y-3 p-3">
              <div className="flex items-center gap-2">
                <Input
                  value={editTitulo}
                  onChange={(e) => setEditTitulo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdate(sec.id)}
                  className="h-8"
                  autoFocus
                />
                <Button size="sm" variant="ghost" onClick={() => handleUpdate(sec.id)}>
                  <Check className="size-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                  <X className="size-4" />
                </Button>
              </div>

              {editImagem && (
                <div className="relative">
                  <img src={editImagem} alt="Preview" className="h-20 w-full rounded object-cover" />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="absolute right-1 top-1"
                    onClick={() => setEditImagem("")}
                  >
                    <Trash2 className="size-3 text-error" />
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
                  {editImagem ? "Trocar" : "Imagem"}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, setEditImagem)}
                />
                <p className="self-center text-xs text-muted-foreground">Opcional. Gradiente automatico.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3">
              <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" />

              {sec.imagem_url && (
                <div className="size-10 shrink-0 overflow-hidden rounded">
                  <img src={sec.imagem_url} alt="" className="size-full object-cover" />
                </div>
              )}

              <span className="flex-1 text-sm font-medium">{sec.titulo}</span>

              {sec.imagem_url && (
                <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent">
                  <Image className="inline size-3" />
                </span>
              )}

              <Button size="sm" variant="ghost" onClick={() => startEdit(sec)}>
                <Pencil className="size-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDeletingId(sec.id)}>
                <Trash2 className="size-4 text-error" />
              </Button>
            </div>
          )}
        </div>
      ))}

      {/* Criar nova seção */}
      <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Nova secao..."
            value={newTitulo}
            onChange={(e) => setNewTitulo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="h-9"
          />
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={!newTitulo.trim() || criar.isPending}
          >
            <Plus className="size-4" />
          </Button>
        </div>

        {newImagem && (
          <div className="relative">
            <img src={newImagem} alt="Preview" className="h-16 w-full rounded object-cover" />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1"
              onClick={() => setNewImagem("")}
            >
              <Trash2 className="size-3 text-error" />
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => handleImageUpload(e as any, setNewImagem);
              input.click();
            }}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="size-3 animate-spin" /> : <Image className="size-3" />}
            Imagem (opcional)
          </Button>
          <span className="self-center text-xs text-muted-foreground">
            Aparece com gradiente sobre o titulo
          </span>
        </div>
      </div>

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(o) => !o && setDeletingId(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir secao?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os links desta secao serao excluidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

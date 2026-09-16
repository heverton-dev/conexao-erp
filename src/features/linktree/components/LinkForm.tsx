import { useRef, useState } from "react";
import { Loader2, Upload, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { IconPicker } from "./IconPicker";
import { compressImage } from "~/features/linktree/lib/image-utils";
import type {
  EmpresaLinktreeLink,
  EmpresaLinktreeSection,
  EmpresaLinkInput,
  EmpresaLinkTipo,
} from "../types-empresa";

interface Props {
  sections: EmpresaLinktreeSection[];
  link?: EmpresaLinktreeLink | null;
  onSave: (input: EmpresaLinkInput, sectionId: string) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

const TIPO_OPTIONS: { value: EmpresaLinkTipo; label: string }[] = [
  { value: "link", label: "Link (texto + icone)" },
  { value: "image", label: "Imagem + texto" },
  { value: "inline_image", label: "Imagem inline (banner)" },
];

export function LinkForm({ sections, link, onSave, onCancel, saving }: Props) {
  const [titulo, setTitulo] = useState(link?.titulo ?? "");
  const [descricao, setDescricao] = useState(link?.descricao ?? "");
  const [url, setUrl] = useState(link?.url ?? "");
  const [icone, setIcone] = useState(link?.icone ?? "");
  const [tipo, setTipo] = useState<EmpresaLinkTipo>(link?.tipo ?? "link");
  const [imagemUrl, setImagemUrl] = useState(link?.imagem_url ?? "");
  const [pinned, setPinned] = useState(link?.pinned ?? false);
  const [destaque, setDestaque] = useState(link?.destaque ?? false);
  const [sectionId, setSectionId] = useState(
    link?.section_id ?? sections[0]?.id ?? "",
  );
  const [agendadoInicio, setAgendadoInicio] = useState(
    link?.agendado_inicio?.slice(0, 16) ?? "",
  );
  const [agendadoFim, setAgendadoFim] = useState(
    link?.agendado_fim?.slice(0, 16) ?? "",
  );
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      toast.error("Imagem muito grande (max 8MB)");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await compressImage(f, 800, 0.85);
      setImagemUrl(dataUrl);
    } catch {
      toast.error("Falha ao processar imagem");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !url.trim() || !sectionId) return;

    const input: EmpresaLinkInput = {
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      url: url.trim(),
      icone: icone || undefined,
      imagem_url: imagemUrl || null,
      tipo,
      pinned,
      destaque,
      agendado_inicio: agendadoInicio || null,
      agendado_fim: agendadoFim || null,
    };
    await onSave(input, sectionId);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Tipo de botao</Label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as EmpresaLinkTipo)}
          className="h-9 w-full rounded-md border border-border bg-surface-hover px-2 text-sm"
        >
          {TIPO_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label>Titulo *</Label>
        <Input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Meu link"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Descricao (opcional)</Label>
        <Input
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Texto descritivo embaixo do titulo"
        />
      </div>

      <div className="space-y-1.5">
        <Label>URL *</Label>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Secao *</Label>
        <select
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          className="h-9 w-full rounded-md border border-border bg-surface-hover px-2 text-sm"
          required
        >
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.titulo}
            </option>
          ))}
        </select>
      </div>

      {tipo === "link" && <IconPicker value={icone} onChange={setIcone} />}

      {(tipo === "image" || tipo === "inline_image") && (
        <div className="space-y-1.5">
          <Label>Imagem</Label>
          {imagemUrl && (
            <div className="relative inline-block">
              <img
                src={imagemUrl}
                alt="Preview"
                className="h-20 rounded-lg object-cover"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="absolute -right-2 -top-2"
                onClick={() => setImagemUrl("")}
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
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}{" "}
              Enviar imagem
            </Button>
            <Input
              value={imagemUrl}
              onChange={(e) => setImagemUrl(e.target.value)}
              placeholder="ou cole a URL da imagem"
              className="text-sm"
            />
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label>Pinned (fixar no topo)</Label>
        <Switch checked={pinned} onCheckedChange={setPinned} />
      </div>

      <div className="flex items-center justify-between">
        <Label>Destaque</Label>
        <Switch checked={destaque} onCheckedChange={setDestaque} />
      </div>

      <div className="space-y-1.5">
        <Label>Agendamento (inicio)</Label>
        <Input
          type="datetime-local"
          value={agendadoInicio}
          onChange={(e) => setAgendadoInicio(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Agendamento (fim)</Label>
        <Input
          type="datetime-local"
          value={agendadoFim}
          onChange={(e) => setAgendadoFim(e.target.value)}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={saving || !titulo.trim() || !url.trim()}
          className="flex-1"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          {link ? "Salvar" : "Adicionar"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

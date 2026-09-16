import { useState } from "react";
import {
  Pencil,
  Trash2,
  ExternalLink,
  Star,
  Pin,
  ToggleLeft,
  ToggleRight,
  Image,
} from "lucide-react";
import { Button } from "~/components/ui/button";
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
import type {
  EmpresaLinktreeLink,
  EmpresaLinktreeSection,
  EmpresaLinkInput,
} from "../types-empresa";
import {
  useDeletarLink,
  useAtualizarLink,
  useCriarLink,
} from "../hooks/useEmpresaLinktree";
import { LinkForm } from "./LinkForm";
import { DynamicIcon } from "./DynamicIcon";

interface Props {
  sections: EmpresaLinktreeSection[];
  links: EmpresaLinktreeLink[];
  empresaId?: string | null;
}

const TIPO_LABELS = {
  link: "Link",
  image: "Imagem",
  inline_image: "Banner",
};

export function LinksList({ sections, links, empresaId }: Props) {
  const [editingLink, setEditingLink] = useState<EmpresaLinktreeLink | null>(
    null,
  );
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deletar = useDeletarLink();
  const atualizar = useAtualizarLink();
  const criar = useCriarLink(empresaId);

  const linksBySection = new Map<string, EmpresaLinktreeLink[]>();
  for (const link of links) {
    const arr = linksBySection.get(link.section_id) ?? [];
    arr.push(link);
    linksBySection.set(link.section_id, arr);
  }

  async function handleCreate(input: EmpresaLinkInput, sectionId: string) {
    await new Promise<void>((resolve, reject) => {
      criar.mutate(
        { sectionId, input },
        { onSuccess: () => resolve(), onError: reject },
      );
    });
    setShowCreate(false);
  }

  async function handleUpdate(input: EmpresaLinkInput) {
    if (!editingLink) return;
    await new Promise<void>((resolve, reject) => {
      atualizar.mutate(
        { id: editingLink.id, input },
        { onSuccess: () => resolve(), onError: reject },
      );
    });
    setEditingLink(null);
  }

  function handleDelete() {
    if (!deletingId) return;
    deletar.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
  }

  function toggleAtivo(link: EmpresaLinktreeLink) {
    atualizar.mutate({ id: link.id, input: { ativo: !link.ativo } });
  }

  function togglePinned(link: EmpresaLinktreeLink) {
    atualizar.mutate({ id: link.id, input: { pinned: !link.pinned } });
  }

  if (showCreate) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <h3 className="mb-3 font-semibold">Novo Link</h3>
        <LinkForm
          sections={sections}
          onSave={handleCreate}
          onCancel={() => setShowCreate(false)}
          saving={criar.isPending}
        />
      </div>
    );
  }

  if (editingLink) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <h3 className="mb-3 font-semibold">Editar Link</h3>
        <LinkForm
          sections={sections}
          link={editingLink}
          onSave={handleUpdate}
          onCancel={() => setEditingLink(null)}
          saving={atualizar.isPending}
        />
      </div>
    );
  }

  const pinnedLinks = links.filter((l) => l.pinned);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Links</h3>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          Novo Link
        </Button>
      </div>

      {pinnedLinks.length > 0 && (
        <div className="space-y-2">
          <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Pin className="size-3" /> Pinned
          </h4>
          {pinnedLinks.map((link) => renderLinkRow(link))}
        </div>
      )}

      {sections.map((sec) => {
        const secLinks = (linksBySection.get(sec.id) ?? []).filter(
          (l) => !l.pinned,
        );
        if (secLinks.length === 0) return null;

        return (
          <div key={sec.id} className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {sec.titulo}
            </h4>
            {secLinks.map((link) => renderLinkRow(link))}
          </div>
        );
      })}

      {links.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum link criado ainda.
        </p>
      )}

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(o) => !o && setDeletingId(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir link?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao nao pode ser desfeita.
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

  function renderLinkRow(link: EmpresaLinktreeLink) {
    return (
      <div
        key={link.id}
        className={`flex items-center gap-2 rounded-lg border p-3 ${
          link.ativo
            ? "border-border bg-surface"
            : "border-border/50 bg-surface/50 opacity-60"
        }`}
      >
        {link.imagem_url && (link.tipo === "image" || link.tipo === "inline_image") ? (
          <div className="size-10 shrink-0 overflow-hidden rounded-lg">
            <img
              src={link.imagem_url}
              alt=""
              className="size-full object-cover"
            />
          </div>
        ) : link.icone ? (
          <span className="text-sm">
            <DynamicIcon name={link.icone} size={14} />
          </span>
        ) : null}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{link.titulo}</span>
            {link.pinned && (
              <Pin className="size-3 shrink-0 text-accent" />
            )}
            {link.destaque && (
              <Star className="size-3 shrink-0 fill-current text-yellow-500" />
            )}
            <span className="rounded bg-surface-hover px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {TIPO_LABELS[link.tipo]}
            </span>
          </div>
          {link.descricao && (
            <p className="truncate text-xs text-muted-foreground">
              {link.descricao}
            </p>
          )}
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:underline"
          >
            <ExternalLink className="size-3" />
            <span className="truncate">{link.url}</span>
          </a>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => togglePinned(link)}
          title={link.pinned ? "Desafixar" : "Fixar no topo"}
        >
          <Pin
            className={`size-4 ${link.pinned ? "fill-accent text-accent" : ""}`}
          />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => toggleAtivo(link)}
          title={link.ativo ? "Inativar" : "Ativar"}
        >
          {link.ativo ? (
            <ToggleRight className="size-4 text-green-500" />
          ) : (
            <ToggleLeft className="size-4" />
          )}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setEditingLink(link)}
        >
          <Pencil className="size-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setDeletingId(link.id)}
        >
          <Trash2 className="size-4 text-error" />
        </Button>
      </div>
    );
  }
}

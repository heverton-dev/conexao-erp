import { useState } from "react";
import { PenLine, Plus, Search, Instagram, Facebook, Clock, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "~/lib/auth";
import { PageHeader } from "~/components/ui/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { useMetaPosts, useCriarMetaPost, useDeletarMetaPost } from "../hooks/useMetaBm";
import type { MetaPost } from "../types";
import { EMPRESA_ID } from "~/config/empresa";
const STATUS_COLORS: Record<string, string> = {
  rascunho: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  agendado: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  publicado: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelado: "bg-red-500/10 text-red-400 border-red-500/20",
};

const PLATAFORMA_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
};

export function MetaPostsList() {
  const { profile } = useAuth();
  const empresaId = EMPRESA_ID ?? "";
  const { data: posts = [], isLoading } = useMetaPosts(empresaId);
  const criarPost = useCriarMetaPost();
  const deletarPost = useDeletarMetaPost();

  const [busca, setBusca] = useState("");
  const [paraExcluir, setParaExcluir] = useState<MetaPost | null>(null);

  const [novoPostOpen, setNovoPostOpen] = useState(false);
  const [formConteudo, setFormConteudo] = useState("");
  const [formPlataforma, setFormPlataforma] = useState<"facebook" | "instagram" | "both">("instagram");
  const [formMidiaUrl, setFormMidiaUrl] = useState("");

  const filtrados = posts.filter(
    (p) => !busca || (p.conteudo || "").toLowerCase().includes(busca.toLowerCase())
  );

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    if (!empresaId || !formConteudo.trim()) return;
    try {
      await criarPost.mutateAsync({
        empresa_id: empresaId,
        conteudo: formConteudo.trim(),
        midia_url: formMidiaUrl.trim() || undefined,
        plataforma: formPlataforma,
      });
      toast.success("Post criado!");
      setNovoPostOpen(false);
      setFormConteudo("");
      setFormPlataforma("instagram");
      setFormMidiaUrl("");
    } catch {
      toast.error("Erro ao criar post");
    }
  }

  async function handleExcluir() {
    if (!paraExcluir) return;
    try {
      await deletarPost.mutateAsync(paraExcluir.id);
      toast.success("Post excluído");
    } catch {
      toast.error("Erro ao excluir post");
    }
    setParaExcluir(null);
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <PageHeader
          title="Posts Meta"
          description="Gerencie seus posts agendados e publicados"
        />
        <Button size="sm" onClick={() => setNovoPostOpen(true)}>
          <Plus className="w-4 h-4" />
          Novo Post
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <Input
          placeholder="Buscar posts..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9"
        />
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={<PenLine className="w-8 h-8 text-text-muted" />}
          title="Nenhum post cadastrado"
          description="Conecte sua conta Meta Business Manager para sincronizar posts e agendamentos."
        />
      ) : (
        <div className="space-y-3">
          {filtrados.map((post) => {
            const PlataformaIcon = post.plataforma ? PLATAFORMA_ICONS[post.plataforma] : null;
            return (
              <Card key={post.id} className="hover:border-accent/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {post.midia_url && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface shrink-0">
                        <img src={post.midia_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {PlataformaIcon && (
                          <PlataformaIcon size={14} className="text-blue-400" />
                        )}
                        {post.plataforma && (
                          <span className="text-xs capitalize text-text-muted">{post.plataforma}</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[post.status] || "bg-surface text-text-muted border-border"}`}>
                          {post.status}
                        </span>
                      </div>
                      {post.conteudo && (
                        <p className="text-sm text-text-main line-clamp-2">{post.conteudo}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        {post.agendado_para && post.status === "agendado" && (
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(post.agendado_para).toLocaleString("pt-BR")}
                          </span>
                        )}
                        {post.publicado_em && (
                          <span>Publicado: {new Date(post.publicado_em).toLocaleDateString("pt-BR")}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setParaExcluir(post)}
                        className="text-text-muted hover:text-error transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filtrados.length === 0 && busca && (
            <EmptyState title="Nenhum resultado" description="Nenhum post encontrado." />
          )}
        </div>
      )}

      <Dialog open={novoPostOpen} onOpenChange={setNovoPostOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent"><PenLine className="h-6 w-6" /></div>
              <div><DialogTitle>Novo Post</DialogTitle><DialogDescription>Crie um post para Facebook/Instagram.</DialogDescription></div>
            </div>
          </DialogHeader>
          <div className="px-6 py-6 flex-1 space-y-4">
          <form onSubmit={handleCriar} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-medium">Conteúdo *</label>
              <Textarea
                required
                value={formConteudo}
                onChange={(e) => setFormConteudo(e.target.value)}
                placeholder="Escreva o texto do post..."
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-medium">URL da Mídia</label>
              <Input
                value={formMidiaUrl}
                onChange={(e) => setFormMidiaUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-medium">Plataforma</label>
              <Select value={formPlataforma} onValueChange={(v: string) => setFormPlataforma(v as "facebook" | "instagram" | "both")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="both">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <button type="button" onClick={() => setNovoPostOpen(false)} className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">
                Cancelar
              </button>
              <button type="submit" disabled={criarPost.isPending} className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]">
                {criarPost.isPending ? "Criando..." : "Criar Post"}
              </button>
            </DialogFooter>
          </form>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!paraExcluir} onOpenChange={(o: boolean) => !o && setParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive"><Trash2 className="h-6 w-6" /></div>
              <div><AlertDialogTitle>Excluir Post?</AlertDialogTitle><AlertDialogDescription>O post selecionado será removido permanentemente.</AlertDialogDescription></div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluir} className="flex-1 sm:flex-none rounded-xl bg-destructive px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-destructive/20 hover:bg-destructive/90 disabled:opacity-50 transition-all duration-200 min-h-[44px]">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

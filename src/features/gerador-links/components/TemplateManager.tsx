import { useState } from "react";
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "~/components/ui/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useTemplates, useCriarTemplate, useAtualizarTemplate, useDeletarTemplate } from "../hooks/useTemplates";
import type { TemplateMensagem } from "../types";
import { useEmpresaSuperAdmin } from "~/components/shared/useEmpresaSuperAdmin";
import { EmpresaSuperAdminSelector } from "~/components/shared/EmpresaSuperAdminSelector";
import { useCan } from "~/core/auth";

const TIPO_TEMPLATE_LABEL: Record<string, string> = {
  whatsapp_msg: "Mensagem WhatsApp",
  utm_preset: "Preset UTM",
};

export function TemplateManager() {
  const { empresaId, empresas, empresaSelecionada, setEmpresaSelecionada, isSuperAdmin } = useEmpresaSuperAdmin();
  const podeGerenciarTemplates = useCan("lk_gerenciar_templates");
  const { data: templates, isLoading } = useTemplates();
  const criarTemplate = useCriarTemplate();
  const atualizarTemplate = useAtualizarTemplate();
  const deletarTemplate = useDeletarTemplate();

  const [modalOpen, setModalOpen] = useState(false);
  const [tipo, setTipo] = useState<"whatsapp_msg" | "utm_preset">("whatsapp_msg");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [campoExtra, setCampoExtra] = useState("");
  const [itemParaDeletar, setItemParaDeletar] = useState<TemplateMensagem | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [editando, setEditando] = useState<TemplateMensagem | null>(null);

  function resetForm() {
    setNome("");
    setTelefone("");
    setMensagem("");
    setCampoExtra("");
  }

  function openCreate() {
    resetForm();
    setEditando(null);
    setModalOpen(true);
  }

  function openEdit(t: TemplateMensagem) {
    setTipo(t.tipo as "whatsapp_msg" | "utm_preset");
    setNome(t.nome);
    setTelefone((t.conteudo as any)?.telefone ?? "");
    setMensagem((t.conteudo as any)?.mensagem ?? "");
    setCampoExtra((t.conteudo as any)?.campoExtra ?? "");
    setEditando(t);
    setModalOpen(true);
  }

  async function handleSalvar() {
    if (!nome) {
      toast.error("Informe o nome do template");
      return;
    }
    setSalvando(true);
    try {
      if (editando) {
        await atualizarTemplate.mutateAsync({
          id: editando.id,
          nome,
          conteudo: tipo === "whatsapp_msg" ? { telefone, mensagem } : { campoExtra },
        });
      } else {
        await criarTemplate.mutateAsync({
          tipo,
          nome,
          conteudo: tipo === "whatsapp_msg" ? { telefone, mensagem } : { campoExtra },
        });
      }
      toast.success("Template salvo!");
      setModalOpen(false);
      resetForm();
    } catch {
      toast.error("Erro ao salvar template");
    }
    setSalvando(false);
  }

  async function handleConfirmDelete() {
    if (!itemParaDeletar) return;
    try {
      await deletarTemplate.mutateAsync(itemParaDeletar.id);
      toast.success("Template excluído");
    } catch {
      toast.error("Erro ao excluir");
    }
    setItemParaDeletar(null);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full rounded-xl" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader title="Templates" description="Modelos de mensagem e presets UTM" />
        <div className="flex items-center gap-2">
          {isSuperAdmin && empresas.length > 0 && (
            <EmpresaSuperAdminSelector
              empresas={empresas}
              value={empresaSelecionada}
              onChange={setEmpresaSelecionada}
            />
          )}
          {podeGerenciarTemplates && (
            <Button size="sm" onClick={openCreate}>
              <Plus className="w-4 h-4" /> Novo Template
            </Button>
          )}
        </div>
      </div>

      {!templates || templates.length === 0 ? (
        <EmptyState
          title="Nenhum template"
          description="Crie templates para agilizar a geração de links."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold bg-accent/10 text-accent">
                        {TIPO_TEMPLATE_LABEL[t.tipo] || t.tipo}
                      </span>
                      <p className="font-semibold text-text-main truncate">{t.nome}</p>
                    </div>
                    <p className="text-xs text-text-muted truncate">
                      {JSON.stringify(t.conteudo)}
                    </p>
                    <p className="text-[11px] text-text-muted/60 mt-1">
                      {new Date(t.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  {podeGerenciarTemplates && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(t)}
                        className="text-text-muted hover:text-accent transition-colors p-1 shrink-0"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setItemParaDeletar(t)}
                        className="text-text-muted hover:text-error transition-colors p-1 shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={(o) => { if (!o) { setModalOpen(false); resetForm(); setEditando(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                {editando ? <Pencil className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
              </div>
              <div>
                <DialogTitle>{editando ? "Editar Template" : "Novo Template"}</DialogTitle>
                <DialogDescription>{editando ? "Atualize os dados do template." : "Crie um novo template de mensagem ou preset UTM."}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="px-6 py-6 flex-1 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-main">Tipo</label>
              <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp_msg">Mensagem WhatsApp</SelectItem>
                  <SelectItem value="utm_preset">Preset UTM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-main">Nome *</label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Meu template" />
            </div>
            {tipo === "whatsapp_msg" ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-main">Telefone</label>
                  <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="5511999999999" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-main">Mensagem</label>
                  <textarea
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Olá! Tudo bem?"
                    className="w-full min-h-[80px] rounded-xl bg-surface border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted resize-y"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-main">Valor extra</label>
                <Input value={campoExtra} onChange={(e) => setCampoExtra(e.target.value)} placeholder="..." />
              </div>
            )}
          </div>
          <DialogFooter>
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">Cancelar</button>
            <button type="button" onClick={handleSalvar} disabled={salvando} className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]">Salvar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!itemParaDeletar}
        onOpenChange={(o) => !o && setItemParaDeletar(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir template?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

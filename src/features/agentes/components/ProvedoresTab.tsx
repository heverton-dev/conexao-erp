import { useState, type CSSProperties } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Loader2,
  Check,
  X,
  Cpu,
  Zap,
  Brain,
  Globe,
  Sparkles,
  Server,
  Network,
  Palette,
  Eye,
  EyeOff,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  useProvedores,
  useCriarProvedor,
  useAtualizarProvedor,
  useDeletarProvedor,
  useReordenarProvedores,
} from "../hooks/useAgentes";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "~/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { toast } from "react-hot-toast";
import type { ProvedorIA, CriarProvedorInput, UpdateProvedorInput } from "../types";

const ICONES_LUCIDE: Record<string, LucideIcon> = {
  cpu: Cpu,
  zap: Zap,
  brain: Brain,
  globe: Globe,
  sparkles: Sparkles,
  server: Server,
  network: Network,
  palette: Palette,
};

function IconeLucide({ nome, className, style, size = 16 }: { nome: string; className?: string; style?: CSSProperties; size?: number }) {
  const IconComponent = ICONES_LUCIDE[nome] || Cpu;
  return <IconComponent className={className} style={style} size={size} />;
}

interface ProvedorFormProps {
  provedor?: ProvedorIA | null;
  onClose: () => void;
}

function ProvedorForm({ provedor, onClose }: ProvedorFormProps) {
  const isEdit = !!provedor;
  const criar = useCriarProvedor();
  const atualizar = useAtualizarProvedor();

  const [nome, setNome] = useState(provedor?.nome ?? "");
  const [url, setUrl] = useState(provedor?.url ?? "");
  const [apiKeyGlobal, setApiKeyGlobal] = useState(provedor?.api_key_global ?? "");
  const [modelos, setModelos] = useState<string[]>(provedor?.modelos ?? [""]);
  const [cor, setCor] = useState(provedor?.cor ?? "#c9a655");
  const [icone, setIcone] = useState(provedor?.icone ?? "cpu");
  const [ativo, setAtivo] = useState(provedor?.ativo ?? true);
  const [ordem, setOrdem] = useState(provedor?.ordem ?? 0);
  const [erro, setErro] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    const modelosValidos = modelos.filter((m) => m.trim().length > 0);
    if (!nome.trim() || !url.trim() || modelosValidos.length === 0) {
      setErro("Preencha nome, URL e pelo menos um modelo");
      return;
    }

    const input: CriarProvedorInput = {
      nome: nome.trim(),
      url: url.trim(),
      api_key_global: apiKeyGlobal.trim() || undefined,
      modelos: modelosValidos,
      cor,
      icone,
      ativo,
      ordem,
    };

    const mutation = isEdit
      ? atualizar.mutateAsync({ id: provedor!.id, ...input })
      : criar.mutateAsync(input);

    mutation
      .then(() => {
        toast.success(isEdit ? "Provedor atualizado!" : "Provedor criado!");
        onClose();
      })
      .catch((err: any) => {
        setErro(err?.message || "Erro ao salvar");
      });
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Provedor" : "Novo Provedor"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Atualize as configuracoes do provedor" : "Configure um novo provedor de IA"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {erro && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              {erro}
            </div>
          )}

          <div>
            <Label htmlFor="nome" className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">
              Nome *
            </Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: OpenAI, Groq, Ollama"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="url" className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">
              URL Base da API *
            </Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.exemplo.com/v1"
              className="w-full font-mono"
            />
          </div>

          <div>
            <Label htmlFor="apiKeyGlobal" className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">
              API Key Global (opcional)
            </Label>
            <Input
              id="apiKeyGlobal"
              type="password"
              value={apiKeyGlobal}
              onChange={(e) => setApiKeyGlobal(e.target.value)}
              placeholder="Chave default para todos os agentes (opcional)"
              className="w-full font-mono"
            />
            <p className="text-[10px] text-text-muted mt-1">
              Deixe em branco para cada agente definir a propria chave
            </p>
          </div>

          <div>
            <Label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">
              Modelos *
            </Label>
            <div className="space-y-2">
              {modelos.map((m, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={m}
                    onChange={(e) => {
                      const arr = [...modelos];
                      arr[i] = e.target.value;
                      setModelos(arr);
                    }}
                    placeholder={`Modelo ${i + 1}`}
                    className="flex-1 font-mono"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const arr = [...modelos];
                      arr.splice(i, 1);
                      setModelos(arr);
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModelos([...modelos, ""])}
                className="w-full"
              >
                <Plus size={14} className="mr-1" />
                Adicionar Modelo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cor" className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">
                Cor
              </Label>
              <Input
                id="cor"
                type="color"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className="w-full h-10 cursor-pointer"
              />
            </div>
            <div>
              <Label htmlFor="icone" className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">
                Icone
              </Label>
              <Select value={icone} onValueChange={setIcone}>
                <SelectTrigger id="icone" className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ICONES_LUCIDE).map(([key]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <IconeLucide nome={key} className="text-text-muted" />
                        <span className="capitalize">{key}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="ativo"
                checked={ativo}
                onCheckedChange={setAtivo}
              />
              <Label htmlFor="ativo" className="text-sm font-medium text-text-main cursor-pointer">
                Ativo
              </Label>
            </div>
            <div>
              <Label htmlFor="ordem" className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">
                Ordem
              </Label>
              <Input
                id="ordem"
                type="number"
                min="0"
                value={ordem}
                onChange={(e) => setOrdem(parseInt(e.target.value) || 0)}
                className="w-full"
              />
            </div>
          </div>
        </form>
        <DialogFooter className="border-t border-border p-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={criar.isPending || atualizar.isPending}>
            Cancelar
          </Button>
          <Button type="submit" form="provedor-form" disabled={criar.isPending || atualizar.isPending}>
            {criar.isPending || atualizar.isPending ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProvedoresTab() {
  const { data: provedores = [], isLoading, refetch } = useProvedores();
  const deletar = useDeletarProvedor();
  const reordenar = useReordenarProvedores();
  const atualizar = useAtualizarProvedor();

  const [showForm, setShowForm] = useState(false);
  const [editingProvedor, setEditingProvedor] = useState<ProvedorIA | null>(null);
  const [deletingProvedor, setDeletingProvedor] = useState<ProvedorIA | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== draggedId) setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);
    if (!draggedId || draggedId === targetId) return;

    const ids = provedores.map((p) => p.id);
    const fromIndex = ids.indexOf(draggedId);
    const toIndex = ids.indexOf(targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const newIds = [...ids];
    const [removed] = newIds.splice(fromIndex, 1);
    newIds.splice(toIndex, 0, removed);

    reordenar.mutateAsync(newIds).then(() => {
      toast.success("Ordem atualizada!");
      refetch();
    }).catch(() => {
      toast.error("Erro ao reordenar");
    });

    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const openCreate = () => {
    setEditingProvedor(null);
    setShowForm(true);
  };

  const openEdit = (p: ProvedorIA) => {
    setEditingProvedor(p);
    setShowForm(true);
  };

  const confirmDelete = (p: ProvedorIA) => {
    setDeletingProvedor(p);
  };

  const executeDelete = async () => {
    if (!deletingProvedor) return;
    try {
      await deletar.mutateAsync(deletingProvedor.id);
      toast.success("Provedor excluido!");
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao excluir");
    } finally {
      setDeletingProvedor(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu size={22} className="text-accent" />
            Provedores de IA
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Gerencie provedores e modelos disponiveis para os agentes
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2" style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)", color: "#0f172a" }}>
          <Plus size={16} />
          Novo Provedor
        </Button>
      </div>

      {provedores.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-8 text-center">
          <Cpu size={48} className="mx-auto mb-3 text-text-muted" />
          <h3 className="text-lg font-semibold text-text-main mb-1">Nenhum provedor cadastrado</h3>
          <p className="text-sm text-text-muted mb-4">Crie o primeiro provedor para comecar a configurar agentes</p>
          <Button onClick={openCreate} style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)", color: "#0f172a" }}>
            <Plus size={16} className="mr-1" />
            Criar Provedor
          </Button>
        </div>
      ) : (
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-10" />
                  <th className="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Provedor</th>
                  <th className="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">URL</th>
                  <th className="text-left p-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Modelos</th>
                  <th className="text-center p-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-24">Status</th>
                  <th className="text-center p-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-20">Ordem</th>
                  <th className="text-right p-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-40">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {provedores.map((p) => (
                  <tr
                    key={p.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, p.id)}
                    onDragOver={(e) => handleDragOver(e, p.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, p.id)}
                    onDragEnd={handleDragEnd}
                    className={`hover:bg-surface-hover transition-colors ${dragOverId === p.id ? "bg-accent/5" : ""} ${draggedId === p.id ? "opacity-50" : ""}`}
                  >
                    <td className="p-3 text-text-muted">
                      <GripVertical size={16} className="cursor-grab active:cursor-grabbing" />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: p.cor + "20" }}
                        >
                          <IconeLucide nome={p.icone} className="text-text-main" style={{ color: p.cor }} size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-text-main">{p.nome}</p>
                          <p className="text-[10px] text-text-muted capitalize">{p.icone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-text-muted font-mono text-xs truncate max-w-xs">{p.url}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {p.modelos.slice(0, 4).map((m) => (
                          <span
                            key={m}
                            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent"
                            style={{ borderColor: p.cor }}
                          >
                            {m}
                          </span>
                        ))}
                        {p.modelos.length > 4 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-surface-hover text-text-muted">
                            +{p.modelos.length - 4}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <Switch
                        checked={p.ativo}
                        onCheckedChange={(checked) => {
                          atualizar.mutate({ id: p.id, ativo: checked }, {
                            onSuccess: () => { toast.success(`Provedor ${checked ? "ativado" : "desativado"}`); refetch(); },
                            onError: () => toast.error("Erro ao alterar status"),
                          });
                        }}
                        disabled={deletar.isPending}
                      />
                    </td>
                    <td className="p-3 text-center text-text-muted font-mono text-xs">{p.ordem}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(p)}
                          className="text-text-muted hover:text-accent"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(p)}
                          className="text-text-muted hover:text-red-400"
                          title="Excluir"
                          disabled={deletar.isPending}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <ProvedorForm
          provedor={editingProvedor}
          onClose={() => {
            setShowForm(false);
            setEditingProvedor(null);
          }}
        />
      )}

      <AlertDialog open={!!deletingProvedor} onOpenChange={(open) => !open && setDeletingProvedor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Provedor</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deletingProvedor?.nome}</strong>? Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

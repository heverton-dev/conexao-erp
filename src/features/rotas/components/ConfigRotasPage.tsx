import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
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
  Loader2,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Upload,
  Download,
  ChevronUp,
  ChevronDown,
  Eye,
} from "lucide-react";
import { useEmpresaSuperAdmin } from "~/components/shared/useEmpresaSuperAdmin";
import { EmpresaSuperAdminSelector } from "~/components/shared/EmpresaSuperAdminSelector";
import { useAuth } from "~/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { getConfig, upsertConfig } from "../services/config.service";
import {
  listarPerguntas,
  criarPergunta,
  atualizarPergunta,
  excluirPergunta,
  reordenarPerguntas,
} from "../services/form.service";
import { useCriarClientesBaseEmLote } from "../hooks/useClientesBase";
import { FORM_PERGUNTA_TIPO_LABEL } from "../types";
import type {
  RotasConfig,
  RotasFormPergunta,
  FormPerguntaTipo,
} from "../types";
import toast from "react-hot-toast";

export function ConfigRotasPage() {
  const {
    empresaId,
    empresas,
    empresaSelecionada,
    setEmpresaSelecionada,
    isSuperAdmin,
  } = useEmpresaSuperAdmin();
  const { user } = useAuth();
  const uploadEmLote = useCriarClientesBaseEmLote();

  const [config, setConfig] = useState<RotasConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Formulário
  const [perguntas, setPerguntas] = useState<RotasFormPergunta[]>([]);
  const [novaPergunta, setNovaPergunta] = useState({
    titulo: "",
    tipo: "texto_curto" as FormPerguntaTipo,
    opcoes: [] as string[],
    obrigatorio: true,
  });
  const [showExcluir, setShowExcluir] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  async function handleMoverPergunta(index: number, direcao: "cima" | "baixo") {
    const novas = [...perguntas];
    const targetIndex = direcao === "cima" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= novas.length) return;

    const temp = novas[index];
    novas[index] = novas[targetIndex];
    novas[targetIndex] = temp;

    const atualizadas = novas.map((p, idx) => ({ ...p, ordem: idx + 1 }));
    setPerguntas(atualizadas);

    try {
      await reordenarPerguntas(
        atualizadas.map((p) => ({ id: p.id, ordem: p.ordem })),
      );
      toast.success("Ordem atualizada!");
    } catch (err) {
      toast.error("Erro ao reordenar: " + (err as Error).message);
    }
  }

  useEffect(() => {
    async function load() {
      if (!empresaId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [configData, perguntasData] = await Promise.all([
          getConfig(empresaId),
          listarPerguntas(empresaId),
        ]);
        setConfig(configData);
        setPerguntas(perguntasData);
      } catch (err) {
        console.error("Erro ao carregar config:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [empresaId]);

  async function handleSaveConfig() {
    if (!empresaId) return;
    setSaving(true);
    try {
      const saved = await upsertConfig(empresaId, {
        valor_km_reembolso: config?.valor_km_reembolso ?? 0,
        raio_permitido_metros: config?.raio_permitido_metros ?? 300,
      });
      setConfig(saved);
      toast.success("Configurações salvas!");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddPergunta() {
    if (!empresaId) return;
    if (!novaPergunta.titulo.trim()) {
      toast.error("Digite o título da pergunta");
      return;
    }

    if (
      ["multipla_escolha", "selecao", "radio"].includes(novaPergunta.tipo) &&
      novaPergunta.opcoes.length === 0
    ) {
      toast.error("Adicione pelo menos uma opção");
      return;
    }

    try {
      const pergunta = await criarPergunta({
        empresa_id: empresaId,
        titulo: novaPergunta.titulo,
        tipo: novaPergunta.tipo,
        opcoes: novaPergunta.opcoes,
        obrigatorio: novaPergunta.obrigatorio,
        ordem: perguntas.length + 1,
        ativo: true,
      });
      setPerguntas((prev) => [...prev, pergunta]);
      setNovaPergunta({
        titulo: "",
        tipo: "texto_curto",
        opcoes: [],
        obrigatorio: true,
      });
      toast.success("Pergunta adicionada!");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function handleExcluirPergunta(id: string) {
    try {
      await excluirPergunta(id);
      setPerguntas((prev) => prev.filter((p) => p.id !== id));
      setShowExcluir(null);
      toast.success("Pergunta excluída!");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  function handleDownloadTemplate() {
    const csv =
      "nome,telefone,cidade,estado,bairro,rua,numero,cep,ticket_medio,categoria\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "template_base_clientes.csv";
    link.click();
  }

  async function handleUploadCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !empresaId || !user?.id) return;

    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) {
      toast.error("CSV vazio ou sem dados");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const required = ["nome"];
    const missing = required.filter((r) => !headers.includes(r));
    if (missing.length > 0) {
      toast.error(`Colunas obrigatórias faltando: ${missing.join(", ")}`);
      return;
    }

    const clientes = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, i) => (row[h] = values[i] ?? ""));

      return {
        empresa_id: empresaId,
        usuario_id: user.id,
        nome: row.nome,
        telefone: row.telefone || null,
        cidade: row.cidade || null,
        estado: row.estado || null,
        bairro: row.bairro || null,
        rua: row.rua || null,
        numero: row.numero || null,
        cep: row.cep || null,
        endereco_completo: null,
        latitude: null,
        longitude: null,
        ticket_medio: row.ticket_medio ? Number(row.ticket_medio) : null,
        categoria: row.categoria || null,
        ultima_visita: null,
        fonte: "csv" as const,
        fonte_id: null,
        ativo: true,
      };
    });

    try {
      const result = await uploadEmLote.mutateAsync(clientes);
      toast.success(`${result.inseridos} clientes importados!`);
      if (result.erros.length > 0) {
        toast.error(`${result.erros.length} erros na importação`);
      }
    } catch (err) {
      toast.error((err as Error).message);
    }

    e.target.value = "";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!empresaId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Configurações das Rotas</h1>
          <p className="text-muted-foreground">
            Configure valores, formulário e importação de clientes
          </p>
        </div>
        {isSuperAdmin && empresas.length > 0 && (
          <div className="p-4 bg-surface border border-border/30 rounded-xl">
            <EmpresaSuperAdminSelector
              empresas={empresas}
              value={empresaSelecionada}
              onChange={setEmpresaSelecionada}
            />
          </div>
        )}
        <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground">
          Nenhuma empresa selecionada ou vinculada ao seu usuário.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Configurações das Rotas</h1>
          <p className="text-muted-foreground">
            Configure valores, formulário e importação de clientes
          </p>
        </div>
        {isSuperAdmin && empresas.length > 0 && (
          <EmpresaSuperAdminSelector
            empresas={empresas}
            value={empresaSelecionada}
            onChange={setEmpresaSelecionada}
          />
        )}
      </div>

      <Tabs defaultValue="geral">
        <TabsList>
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="formulario">Formulário</TabsTrigger>
          <TabsTrigger value="importacao">Importação</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Valores de Reembolso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Valor por KM (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={config?.valor_km_reembolso ?? 0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...(prev ?? {
                          id: "",
                          empresa_id: "",
                          created_at: "",
                          updated_at: "",
                          valor_km_reembolso: 0,
                          raio_permitido_metros: 300,
                          google_maps_api_key: "",
                        }),
                        valor_km_reembolso: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Raio Permitido (metros)</Label>
                  <Input
                    type="number"
                    min="50"
                    max="1000"
                    value={config?.raio_permitido_metros ?? 300}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...(prev ?? {
                          id: "",
                          empresa_id: "",
                          created_at: "",
                          updated_at: "",
                          valor_km_reembolso: 0,
                          raio_permitido_metros: 300,
                          google_maps_api_key: "",
                        }),
                        raio_permitido_metros: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="border-t border-border/30 pt-4 space-y-4">
                <h3 className="font-semibold">Google Maps</h3>
                <div className="space-y-1.5">
                  <Label>Chave da API Google Maps</Label>
                  <Input
                    type="text"
                    placeholder="AIzaSy..."
                    value={config?.google_maps_api_key ?? ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...(prev ?? {
                          id: "",
                          empresa_id: "",
                          created_at: "",
                          updated_at: "",
                          valor_km_reembolso: 0,
                          raio_permitido_metros: 300,
                          google_maps_api_key: "",
                        }),
                        google_maps_api_key: e.target.value,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Chave usada para calcular distâncias entre clientes nas
                    rotas. Esta chave nunca é exposta ao navegador.
                  </p>
                </div>
              </div>

              <Button onClick={handleSaveConfig} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formulario" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Formulário Pós-Visita</CardTitle>
              {perguntas.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(true)}
                  className="gap-1.5"
                >
                  <Eye className="h-4 w-4" />
                  Visualizar Preview
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {perguntas.map((pergunta, index) => (
                  <div
                    key={pergunta.id}
                    className="flex items-center justify-between p-4 border border-border/30 rounded-xl bg-surface/50 hover:bg-surface/80 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      {/* Botões de Ordenação */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-text-muted hover:text-text-main hover:bg-surface-hover"
                          disabled={index === 0}
                          onClick={() => handleMoverPergunta(index, "cima")}
                          title="Mover para cima"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-text-muted hover:text-text-main hover:bg-surface-hover"
                          disabled={index === perguntas.length - 1}
                          onClick={() => handleMoverPergunta(index, "baixo")}
                          title="Mover para baixo"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>

                      <div>
                        <div className="font-medium">{pergunta.titulo}</div>
                        <div className="text-sm text-muted-foreground">
                          {FORM_PERGUNTA_TIPO_LABEL[pergunta.tipo]}
                          {pergunta.obrigatorio && " • Obrigatória"}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowExcluir(pergunta.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/30 pt-4 space-y-3">
                <h4 className="font-medium">Nova Pergunta</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Título</Label>
                    <Input
                      value={novaPergunta.titulo}
                      onChange={(e) =>
                        setNovaPergunta((prev) => ({
                          ...prev,
                          titulo: e.target.value,
                        }))
                      }
                      placeholder="Ex: Observações gerais"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tipo</Label>
                    <Select
                      value={novaPergunta.tipo}
                      onValueChange={(v) =>
                        setNovaPergunta((prev) => ({
                          ...prev,
                          tipo: v as FormPerguntaTipo,
                          opcoes: [
                            "multipla_escolha",
                            "selecao",
                            "radio",
                          ].includes(v)
                            ? prev.opcoes
                            : [],
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(FORM_PERGUNTA_TIPO_LABEL).map(
                          ([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {["multipla_escolha", "selecao", "radio"].includes(
                  novaPergunta.tipo,
                ) && (
                  <div className="space-y-1.5">
                    <Label>Opções (uma por linha)</Label>
                    <Textarea
                      value={novaPergunta.opcoes.join("\n")}
                      onChange={(e) =>
                        setNovaPergunta((prev) => ({
                          ...prev,
                          opcoes: e.target.value
                            .split("\n")
                            .filter((o) => o.trim()),
                        }))
                      }
                      placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                      rows={3}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Switch
                    checked={novaPergunta.obrigatorio}
                    onCheckedChange={(v) =>
                      setNovaPergunta((prev) => ({ ...prev, obrigatorio: v }))
                    }
                  />
                  <Label className="font-normal">Obrigatória</Label>
                </div>

                <Button onClick={handleAddPergunta}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Pergunta
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="importacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Importar Base de Clientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Template CSV
                </Button>
                <div>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleUploadCSV}
                    className="hidden"
                    id="csv-upload"
                  />
                  <Button asChild>
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Importar CSV
                    </label>
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                O template CSV contém as colunas: nome, telefone, cidade,
                estado, bairro, rua, numero, cep, ticket_medio, categoria.
                Apenas a coluna "nome" é obrigatória.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={!!showExcluir}
        onOpenChange={(o) => !o && setShowExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pergunta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showExcluir && handleExcluirPergunta(showExcluir)}
              className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Preview do Formulário */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Preview do Formulário</DialogTitle>
            <DialogDescription>
              Veja como o formulário pós-visita será exibido no celular do
              consultor.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-6 flex-1 space-y-4">
            {perguntas.map((pergunta) => (
              <div
                key={pergunta.id}
                className="space-y-2 p-4 border border-border/30 rounded-xl bg-surface/30"
              >
                <Label className="text-sm font-semibold flex items-center gap-1.5 text-text-main">
                  {pergunta.titulo}
                  {pergunta.obrigatorio && (
                    <span className="text-destructive font-bold">*</span>
                  )}
                </Label>
                <div className="text-[10px] text-text-muted font-mono uppercase tracking-wider mb-2">
                  Tipo: {FORM_PERGUNTA_TIPO_LABEL[pergunta.tipo]}
                </div>
                <PreviewInput tipo={pergunta.tipo} opcoes={pergunta.opcoes} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowPreview(false)} className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]">
              Fechar Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PreviewInput({
  tipo,
  opcoes,
}: {
  tipo: FormPerguntaTipo;
  opcoes: string[];
}) {
  switch (tipo) {
    case "texto_curto":
      return (
        <Input
          disabled
          placeholder="Resposta curta..."
          className="bg-surface-hover/20 cursor-not-allowed"
        />
      );
    case "texto_longo":
      return (
        <Textarea
          disabled
          placeholder="Resposta detalhada..."
          rows={2}
          className="bg-surface-hover/20 cursor-not-allowed resize-none"
        />
      );
    case "data":
      return (
        <Input
          type="date"
          disabled
          className="bg-surface-hover/20 cursor-not-allowed"
        />
      );
    case "selecao":
      return (
        <Select disabled>
          <SelectTrigger className="bg-surface-hover/20 cursor-not-allowed">
            <SelectValue placeholder="Selecione uma opção..." />
          </SelectTrigger>
        </Select>
      );
    case "radio":
      return (
        <div className="space-y-2 pl-1">
          {opcoes.map((op) => (
            <div key={op} className="flex items-center space-x-2.5">
              <input
                type="radio"
                disabled
                className="h-4 w-4 accent-accent opacity-50 cursor-not-allowed"
              />
              <span className="text-sm text-text-muted select-none">{op}</span>
            </div>
          ))}
        </div>
      );
    case "multipla_escolha":
      return (
        <div className="space-y-2 pl-1">
          {opcoes.map((op) => (
            <div key={op} className="flex items-center space-x-2.5">
              <input
                type="checkbox"
                disabled
                className="h-4 w-4 rounded border-border/50 accent-accent opacity-50 cursor-not-allowed"
              />
              <span className="text-sm text-text-muted select-none">{op}</span>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

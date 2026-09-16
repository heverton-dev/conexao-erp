import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Upload,
  Link as LinkIcon,
  Camera,
  Scan,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { compressImage } from "~/lib/image-compress";
import { lerComprovante } from "~/lib/ocr";
import { useCriarDespesa } from "../../hooks/useDespesas";
import { useTiposDespesaAtivos } from "../../hooks/useTiposDespesa";
import { usePeriodoAtual } from "../../hooks/usePeriodoAtual";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const schema = z.object({
  tipo_id: z.string().min(1, "Tipo é obrigatório"),
  data_despesa: z.string().min(1, "Data é obrigatória"),
  valor: z.coerce.number().positive("Valor deve ser positivo"),
  descricao: z.string().optional(),
  comprovante_tipo: z.enum(["upload", "link"]),
  comprovante_url: z.string().optional(),
  periodo_id: z.string().min(1, "Período é obrigatório"),
});

type FormData = z.infer<typeof schema>;

function formatarData(data: string) {
  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
}

export function NovaDespesaModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const criar = useCriarDespesa();
  const { data: tipos } = useTiposDespesaAtivos();
  const { data: periodoAtual, isLoading: loadingPeriodo } = usePeriodoAtual();
  const [file, setFile] = useState<File | null>(null);
  const [comprovanteMode, setComprovanteMode] = useState<"upload" | "link">(
    "upload",
  );
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrFeito, setOcrFeito] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      comprovante_tipo: "upload",
      comprovante_url: "",
      descricao: "",
      periodo_id: "",
    },
  });

  async function handleOcr() {
    if (!file || !tipos) return;
    setOcrLoading(true);
    setOcrFeito(false);
    try {
      const result = await lerComprovante(file, tipos);
      if (result.valor) setValue("valor", result.valor);
      if (result.data) setValue("data_despesa", result.data);
      if (result.descricao) setValue("descricao", result.descricao);
      if (result.tipoSugestao) setValue("tipo_id", result.tipoSugestao);
      setOcrFeito(true);
    } catch {
      setOcrFeito(false);
    } finally {
      setOcrLoading(false);
    }
  }

  useEffect(() => {
    if (periodoAtual?.id) {
      setValue("periodo_id", periodoAtual.id);
    }
  }, [periodoAtual, setValue]);

  async function onSubmit(data: FormData) {
    if (!periodoAtual) return;

    let uploadFile =
      comprovanteMode === "upload" ? (file ?? undefined) : undefined;
    if (uploadFile) {
      uploadFile = await compressImage(uploadFile);
    }

    await criar.mutateAsync({
      despesa: {
        tipo_id: data.tipo_id,
        data_despesa: data.data_despesa,
        valor: data.valor,
        descricao: data.descricao ?? "",
        comprovante_url: data.comprovante_url ?? "",
        comprovante_tipo: comprovanteMode,
      },
      file: uploadFile,
    });
    reset();
    setFile(null);
    setComprovanteMode("upload");
    setOcrFeito(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card max-w-lg max-h-[90dvh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent"><Upload className="h-6 w-6" /></div>
            <div><DialogTitle>Nova Despesa</DialogTitle><DialogDescription>Preencha os dados da nova despesa.</DialogDescription></div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 flex-1 space-y-4">
        {loadingPeriodo ? (
          <div className="text-text-muted text-sm py-4">
            Carregando período...
          </div>
        ) : !periodoAtual ? (
          <div className="text-center py-6">
            <p className="text-text-muted text-sm">
              Nenhum período aberto no momento.
            </p>
            <p className="text-xs text-text-muted/60 mt-1">
              Entre em contato com o administrador.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="rounded-lg bg-accent/5 border border-accent/20 px-3 py-2">
              <p className="text-xs font-semibold text-accent uppercase">
                Período
              </p>
              <p className="text-sm text-text-main">
                {formatarData(periodoAtual.data_inicio)} —{" "}
                {formatarData(periodoAtual.data_fim)}
              </p>
              <input type="hidden" {...register("periodo_id")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_id">Tipo de Despesa *</Label>
              <select
                id="tipo_id"
                {...register("tipo_id")}
                className="w-full rounded-lg border border-input-border bg-input-bg px-3 py-2.5 text-sm text-text-main"
              >
                <option value="">Selecione o tipo</option>
                {tipos?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome} — máx.{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(t.valor_maximo)}
                  </option>
                ))}
              </select>
              {errors.tipo_id && (
                <p className="text-xs text-error">{errors.tipo_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="data_despesa">Data *</Label>
                <Input
                  id="data_despesa"
                  type="date"
                  {...register("data_despesa")}
                />
                {errors.data_despesa && (
                  <p className="text-xs text-error">
                    {errors.data_despesa.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$) *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("valor")}
                />
                {errors.valor && (
                  <p className="text-xs text-error">{errors.valor.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Input
                id="descricao"
                placeholder="Ex: Jantar com cliente XPTO"
                {...register("descricao")}
              />
            </div>

            <div className="space-y-2">
              <Label>Comprovante</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setComprovanteMode("upload");
                    setValue("comprovante_tipo", "upload");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${comprovanteMode === "upload" ? "bg-accent/10 text-accent border border-accent/20" : "bg-input-bg text-text-muted border border-transparent"}`}
                >
                  <Camera size={14} /> Upload
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setComprovanteMode("link");
                    setValue("comprovante_tipo", "link");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${comprovanteMode === "link" ? "bg-accent/10 text-accent border border-accent/20" : "bg-input-bg text-text-muted border border-transparent"}`}
                >
                  <LinkIcon size={14} /> Link
                </button>
              </div>

              {comprovanteMode === "upload" ? (
                <>
                  <label className="flex flex-col items-center gap-2 p-5 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent/50 transition-colors">
                    <Upload size={20} className="text-text-muted" />
                    <span className="text-xs text-text-muted">
                      {file ? file.name : "Selecionar foto"}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        setFile(e.target.files?.[0] ?? null);
                        setOcrFeito(false);
                      }}
                    />
                  </label>
                  {file && file.type.startsWith("image/") && (
                    <button
                      type="button"
                      onClick={handleOcr}
                      disabled={ocrLoading}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-accent/20 bg-accent/5 text-accent text-sm font-medium hover:bg-accent/10 transition-colors disabled:opacity-50"
                    >
                      {ocrLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Lendo
                          comprovante...
                        </>
                      ) : ocrFeito ? (
                        <>
                          <CheckCircle2 size={16} /> Comprovante lido
                        </>
                      ) : (
                        <>
                          <Scan size={16} /> Ler comprovante
                        </>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <Input
                  placeholder="https://exemplo.com/comprovante.jpg"
                  {...register("comprovante_url")}
                />
              )}
            </div>

          </form>
        )}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]"
          >
            Cancelar
          </button>
          <button type="submit" disabled={criar.isPending} className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]">
            {criar.isPending ? "Salvando..." : "Salvar"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

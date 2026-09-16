import { useState, useEffect } from "react";
import { supabase } from "~/core/supabase";
import { EMPRESA_ID } from "~/config/empresa";
import { useAuth } from "~/lib/auth";
import { carregarSchema, type CampoSchema } from "~/shared/form-schema";
import { listarEmpresas } from "~/shared/empresas";
import type { Empresa } from "~/core/empresa";
import {
  Loader2,
  CheckCircle,
  AlertTriangle,
  Upload,
  Eye,
  Smartphone,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

type Step = "tipo" | "dados" | "endereco" | "documentos";

const STEPS: { key: Step; label: string }[] = [
  { key: "tipo", label: "Tipo" },
  { key: "dados", label: "Dados" },
  { key: "endereco", label: "Endereço" },
  { key: "documentos", label: "Documentos" },
];

export default function PrevisualizacaoPage() {
  const { profile } = useAuth();
  const isSuperAdmin = profile?.is_super_admin === true;
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>(
    EMPRESA_ID,
  );
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [step, setStep] = useState<Step>("tipo");
  const [tipoPessoa, setTipoPessoa] = useState<"PF" | "PJ" | null>(null);
  const [schemaLoading, setSchemaLoading] = useState(false);

  const [schemaDados, setSchemaDados] = useState<CampoSchema[]>([]);
  const [schemaEndEmpresa, setSchemaEndEmpresa] = useState<CampoSchema[]>([]);
  const [schemaEndEntrega, setSchemaEndEntrega] = useState<CampoSchema[]>([]);
  const [schemaEndCobranca, setSchemaEndCobranca] = useState<CampoSchema[]>([]);
  const [schemaDocs, setSchemaDocs] = useState<CampoSchema[]>([]);

  useEffect(() => {
    if (isSuperAdmin) {
      listarEmpresas()
        .then((emp) => {
          setEmpresas(emp.filter((e) => e.ativo));
          setLoadingEmpresas(false);
        })
    } else if (EMPRESA_ID) {
      setSelectedEmpresaId(EMPRESA_ID);
      setLoadingEmpresas(false);
    } else {
      setLoadingEmpresas(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (!tipoPessoa || !selectedEmpresaId) return;
    setSchemaLoading(true);
    Promise.all([
      carregarSchema(tipoPessoa, "dados"),
      carregarSchema(tipoPessoa, "endereco_empresa"),
      carregarSchema(tipoPessoa, "endereco_entrega"),
      carregarSchema(tipoPessoa, "endereco_cobranca"),
      carregarSchema(tipoPessoa, "documentos"),
    ]).then(([dados, endEmpresa, endEntrega, endCobranca, docs]) => {
      setSchemaDados(dados);
      setSchemaEndEmpresa(endEmpresa);
      setSchemaEndEntrega(endEntrega);
      setSchemaEndCobranca(endCobranca);
      setSchemaDocs(docs);
      setSchemaLoading(false);
    });
  }, [tipoPessoa, selectedEmpresaId]);

  const currentIdx = STEPS.findIndex((s) => s.key === step);
  const isReady = !loadingEmpresas && selectedEmpresaId;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center border border-accent/20">
            <Eye className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-main tracking-tight">
              Pré-visualização do Formulário
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Visualize como o lead verá o formulário de pré-cadastro
            </p>
          </div>
        </div>

        {isSuperAdmin && (
          <div className="flex items-center gap-3 bg-surface rounded-xl px-4 py-2.5 border border-border">
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Empresa
            </label>
            <Select
              value={selectedEmpresaId}
              onValueChange={setSelectedEmpresaId}
              disabled={loadingEmpresas}
            >
              <SelectTrigger className="w-[200px] h-9 bg-surface border-border text-sm rounded-lg">
                <SelectValue
                  placeholder={loadingEmpresas ? "Carregando..." : "Selecione"}
                />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {empresas.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id} className="text-xs">
                    {emp.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Layout dividido: sidebar + preview + info */}
      {isReady && (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6 items-start">
          {/* Sidebar esquerda - Passos */}
          <div className="hidden lg:block bg-surface rounded-2xl border border-border/60 p-4 sticky top-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
              <Smartphone className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-text-main">
                Etapas
              </span>
            </div>
            <div className="space-y-2">
              {STEPS.map((s, idx) => {
                const isActive = idx === currentIdx;
                const isCompleted = idx < currentIdx;
                return (
                  <button
                    key={s.key}
                    onClick={() => {
                      if (s.key === "tipo" || (tipoPessoa && idx <= currentIdx + 1 && idx >= currentIdx - 1))
                        setStep(s.key);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-accent/10 border border-accent/30 shadow-sm"
                        : isCompleted
                          ? "bg-green-500/5 border border-green-500/20"
                          : "hover:bg-surface border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          isActive
                            ? "bg-accent text-accent-fg"
                            : isCompleted
                              ? "bg-green-500/20 text-green-400"
                              : "bg-surface text-text-muted"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          isActive ? "text-text-main" : "text-text-muted"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Centro - Preview do formulário dentro de um celular */}
          <div className="flex flex-col items-center gap-4">
            {/* Steps indicator (fora do celular) */}
            <div className="flex items-center gap-3 bg-surface px-4 py-3 rounded-xl border border-border w-full max-w-[360px]">
              {STEPS.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => {
                    if (s.key === "tipo" || (tipoPessoa && i <= currentIdx + 1 && i >= currentIdx - 1))
                      setStep(s.key);
                  }}
                  className={`text-xs font-semibold px-2 py-1 rounded-lg transition ${
                    i <= currentIdx
                      ? "text-accent bg-accent/10"
                      : "text-text-muted"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Celular mockup */}
            <div className="relative bg-zinc-900 rounded-[40px] p-3 shadow-2xl border border-zinc-700/50">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-10" />
              <div className="w-[320px] h-[580px] rounded-[28px] overflow-hidden bg-zinc-950 relative">
                {/* Status bar */}
                <div className="h-10 bg-transparent flex items-end justify-between px-6 pb-1 relative z-20">
                  <span className="text-[10px] text-accent-fg/60 font-medium">9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-2.5 border border-white/40 rounded-sm relative">
                      <div className="absolute inset-0.5 bg-white/60 rounded-[1px]" style={{ width: "70%" }} />
                    </div>
                  </div>
                </div>

                {/* Conteúdo do formulário */}
                <div className="absolute inset-0 top-10 overflow-y-auto" style={{ backgroundColor: "#141414" }}>
                  <div className="relative h-full flex flex-col p-4">
                    {/* Header */}
                    <div className="text-center py-4">
                      <h1 className="text-base font-bold" style={{ color: "#fff" }}>
                        ERP Odonto
                      </h1>
                      <p className="text-[10px]" style={{ color: "#a0a0a0" }}>
                        Pré-cadastro de Clientes
                      </p>
                    </div>

                    {/* Step indicator dentro do celular */}
                    {tipoPessoa && step !== "tipo" && (
                      <div className="text-center mb-3">
                        <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: "#a0a0a0" }}>
                          {currentIdx} de {STEPS.length - 1}
                        </span>
                      </div>
                    )}

                    {/* Tipo Step */}
                    {step === "tipo" && (
                      <div className="flex flex-col gap-3">
                        <p className="text-center text-xs" style={{ color: "#ccc" }}>
                          Que tipo de cadastro deseja realizar?
                        </p>
                        <button
                          onClick={() => setTipoPessoa("PF")}
                          className={`rounded-xl border-2 p-5 text-center transition ${
                            tipoPessoa === "PF"
                              ? "border-[#3b82f6] bg-[#3b82f6]/10"
                              : "border-zinc-700 bg-zinc-800"
                          }`}
                        >
                          <span className="text-xl font-bold text-[#3b82f6]">PF</span>
                          <p className="text-[10px] mt-1" style={{ color: "#a0a0a0" }}>
                            Pessoa Física
                          </p>
                        </button>
                        <button
                          onClick={() => setTipoPessoa("PJ")}
                          className={`rounded-xl border-2 p-5 text-center transition ${
                            tipoPessoa === "PJ"
                              ? "border-[#3b82f6] bg-[#3b82f6]/10"
                              : "border-zinc-700 bg-zinc-800"
                          }`}
                        >
                          <span className="text-xl font-bold text-[#3b82f6]">PJ</span>
                          <p className="text-[10px] mt-1" style={{ color: "#a0a0a0" }}>
                            Pessoa Jurídica
                          </p>
                        </button>
                        <button
                          disabled={!tipoPessoa}
                          onClick={() => setStep("dados")}
                          className="mt-2 rounded-xl bg-[#3b82f6] py-2.5 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          Continuar
                        </button>
                      </div>
                    )}

                    {/* Dados Step */}
                    {step === "dados" && tipoPessoa && (
                      <PreviewDadosStep
                        tipoPessoa={tipoPessoa}
                        schema={schemaDados}
                        loading={schemaLoading}
                        onBack={() => setStep("tipo")}
                        onNext={() => setStep("endereco")}
                      />
                    )}

                    {/* Endereco Step */}
                    {step === "endereco" && (
                      <PreviewEnderecoStep
                        schemaEmpresa={schemaEndEmpresa}
                        schemaEntrega={schemaEndEntrega}
                        schemaCobranca={schemaEndCobranca}
                        loading={schemaLoading}
                        onBack={() => setStep("dados")}
                        onNext={() => setStep("documentos")}
                      />
                    )}

                    {/* Documentos Step */}
                    {step === "documentos" && (
                      <PreviewDocumentosStep
                        schema={schemaDocs}
                        loading={schemaLoading}
                        onBack={() => setStep("endereco")}
                      />
                    )}

                    {/* Home indicator */}
                    <div className="flex justify-center pt-3 pb-1 mt-auto">
                      <div className="w-24 h-1 bg-white/20 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar direita - Info */}
          <div className="hidden lg:block bg-surface rounded-2xl border border-border/60 p-4 sticky top-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
              <Eye className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-text-main">
                Informações
              </span>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-surface border border-border/50">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
                  Tipo selecionado
                </p>
                <p className="text-sm font-medium text-text-main">
                  {tipoPessoa === "PF"
                    ? "Pessoa Física"
                    : tipoPessoa === "PJ"
                      ? "Pessoa Jurídica"
                      : "Nenhum"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border/50">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
                  Etapa atual
                </p>
                <p className="text-sm font-medium text-text-main">
                  {step === "tipo"
                    ? "Tipo de Cadastro"
                    : step === "dados"
                      ? "Dados do Cadastro"
                      : step === "endereco"
                        ? "Endereços"
                        : "Documentos"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border/50">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
                  Campos no formulário
                </p>
                <p className="text-sm font-medium text-text-main">
                  {schemaDados.length + schemaEndEmpresa.length + schemaDocs.length}
                </p>
              </div>

              <div className="pt-2">
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <p className="text-[10px] text-cyan-400">
                    Esta é apenas uma pré-visualização. Nenhum dado é salvo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isReady && loadingEmpresas && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      )}
    </div>
  );
}

// ─── Dados Step ──────────────────────────────────────────────────────────────
function PreviewDadosStep({
  tipoPessoa,
  schema,
  loading,
  onBack,
  onNext,
}: {
  tipoPessoa: "PF" | "PJ";
  schema: CampoSchema[];
  loading: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      ) : schema.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-surface mb-4 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-text-muted/30" />
          </div>
          <p className="text-lg font-semibold text-text-main mb-1">
            Nenhum campo configurado
          </p>
          <p className="text-sm text-text-muted">
            Configure os campos do formulário na seção de Formulários.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-text-muted mb-2">
            Campos exibidos para{" "}
            <strong className="text-accent">
              {tipoPessoa === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
            </strong>
          </p>
          {schema.map((c) => (
            <CampoPreview key={c.id} schema={c} />
          ))}
        </>
      )}
      <div className="flex gap-3 mt-4">
        <button
          onClick={onBack}
          className="flex-1 rounded-xl bg-surface border border-border py-2.5 px-5 text-sm font-semibold text-text-muted hover:text-text-main hover:border-accent/30 transition-all duration-200 min-h-[44px]"
        >
          Voltar
        </button>
        <button
          onClick={onNext}
          className="flex-1 rounded-xl bg-accent py-2.5 px-5 text-sm font-semibold text-accent-fg inline-flex items-center justify-center gap-2 hover:brightness-110 transition-all duration-200 min-h-[44px]"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}

// ─── Endereco Step ───────────────────────────────────────────────────────────
function PreviewEnderecoStep({
  schemaEmpresa,
  schemaEntrega,
  schemaCobranca,
  loading,
  onBack,
  onNext,
}: {
  schemaEmpresa: CampoSchema[];
  schemaEntrega: CampoSchema[];
  schemaCobranca: CampoSchema[];
  loading: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const [mesmoEndEntrega, setMesmoEndEntrega] = useState(true);
  const [mesmoEndCobranca, setMesmoEndCobranca] = useState(true);

  return (
    <div className="flex flex-col gap-5">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 border-b border-border pb-4">
            <h3 className="text-sm font-bold text-accent">
              Endereço da Empresa
            </h3>
            {schemaEmpresa.length === 0 ? (
              <p className="text-xs text-text-muted">
                Nenhum campo configurado.
              </p>
            ) : (
              schemaEmpresa.map((c) => <CampoPreview key={c.id} schema={c} />)
            )}
          </div>

          <div className="flex flex-col gap-3 border-b border-border pb-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-text-main cursor-pointer select-none">
              <input
                type="checkbox"
                checked={mesmoEndEntrega}
                onChange={(e) => setMesmoEndEntrega(e.target.checked)}
                className="rounded border-border text-accent focus:ring-accent"
              />
              <span>Usar mesmo endereço para entrega</span>
            </label>
            {!mesmoEndEntrega && (
              <div className="flex flex-col gap-3 mt-2">
                <h4 className="text-xs font-bold text-text-muted">
                  Endereço de Entrega
                </h4>
                {schemaEntrega.map((c) => (
                  <CampoPreview key={c.id} schema={c} />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 pb-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-text-main cursor-pointer select-none">
              <input
                type="checkbox"
                checked={mesmoEndCobranca}
                onChange={(e) => setMesmoEndCobranca(e.target.checked)}
                className="rounded border-border text-accent focus:ring-accent"
              />
              <span>Usar mesmo endereço para cobrança</span>
            </label>
            {!mesmoEndCobranca && (
              <div className="flex flex-col gap-3 mt-2">
                <h4 className="text-xs font-bold text-text-muted">
                  Endereço de Cobrança
                </h4>
                {schemaCobranca.map((c) => (
                  <CampoPreview key={c.id} schema={c} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
      <div className="flex gap-3 mt-4">
        <button
          onClick={onBack}
          className="flex-1 rounded-xl bg-surface border border-border py-2.5 px-5 text-sm font-semibold text-text-muted hover:text-text-main hover:border-accent/30 transition-all duration-200 min-h-[44px]"
        >
          Voltar
        </button>
        <button
          onClick={onNext}
          className="flex-1 rounded-xl bg-accent py-2.5 px-5 text-sm font-semibold text-accent-fg inline-flex items-center justify-center gap-2 hover:brightness-110 transition-all duration-200 min-h-[44px]"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}

// ─── Documentos Step ─────────────────────────────────────────────────────────
function PreviewDocumentosStep({
  schema,
  loading,
  onBack,
}: {
  schema: CampoSchema[];
  loading: boolean;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      ) : schema.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-surface mb-4 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-text-muted/30" />
          </div>
          <p className="text-lg font-semibold text-text-main mb-1">
            Nenhum documento configurado
          </p>
          <p className="text-sm text-text-muted">
            Configure os campos de documento na seção de Formulários.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-text-muted mb-2">
            Formatos permitidos: .jpeg | .jpg | .png | .pdf
          </p>
          {schema.map((c) => (
            <DocPreview key={c.id} schema={c} />
          ))}
        </>
      )}
      <div className="flex gap-3 mt-4">
        <button
          onClick={onBack}
          className="flex-1 rounded-xl bg-surface border border-border py-2.5 px-5 text-sm font-semibold text-text-muted hover:text-text-main hover:border-accent/30 transition-all duration-200 min-h-[44px]"
        >
          Voltar
        </button>
        <button
          onClick={() => toast.success("Prévia concluída! (dados não salvos)")}
          className="flex-1 rounded-xl bg-accent py-2.5 px-5 text-sm font-semibold text-accent-fg inline-flex items-center justify-center gap-2 hover:brightness-110 transition-all duration-200 min-h-[44px]"
        >
          <CheckCircle size={16} />
          Finalizar Preview
        </button>
      </div>
    </div>
  );
}

// ─── Campo Preview ────────────────────────────────────────────────────────────
function CampoPreview({ schema }: { schema: CampoSchema }) {
  const label = schema.label + (schema.obrigatorio ? " *" : "");

  if (schema.tipo_input === "select") {
    return (
      <div>
        <p className="mb-1 text-xs font-medium text-text-muted">{label}</p>
        <div className="w-full rounded-xl border border-border bg-input-bg px-4 py-2.5 text-sm text-text-muted shadow-sm min-h-[44px] flex items-center">
          {schema.opcoes?.[0] ?? "Selecione…"}
        </div>
      </div>
    );
  }

  if (schema.tipo_input === "multiselect" || schema.tipo_input === "checkbox") {
    return (
      <div>
        <p className="mb-1 text-xs font-medium text-text-muted">{label}</p>
        <div className="flex flex-col gap-1.5">
          {(schema.opcoes ?? []).map((op) => (
            <div
              key={op}
              className="flex items-center gap-2 rounded-lg border border-border bg-input-bg px-3 py-2.5 text-xs text-text-muted"
            >
              <div className="h-4 w-4 rounded border-2 border-border flex-shrink-0" />
              {op}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (schema.tipo_input === "textarea") {
    return (
      <div>
        <p className="mb-1 text-xs font-medium text-text-muted">{label}</p>
        <div className="w-full rounded-xl border border-border bg-input-bg px-4 py-2.5 text-sm text-text-muted shadow-sm min-h-[60px]" />
      </div>
    );
  }

  return (
    <div>
      <p className="mb-1 text-xs font-medium text-text-muted">{label}</p>
      <div className="w-full rounded-xl border border-border bg-input-bg px-4 py-2.5 text-sm text-text-muted shadow-sm min-h-[44px] flex items-center">
        {schema.tipo_input === "tel"
          ? schema.campo_key === "cpf"
            ? "000.000.000-00"
            : schema.campo_key === "cnpj"
              ? "00.000.000/0000-00"
              : "(00) 00000-0000"
          : schema.tipo_input === "cep"
            ? "00000-000"
            : schema.tipo_input === "date"
              ? "dd/mm/aaaa"
              : schema.tipo_input === "email"
                ? "email@exemplo.com"
                : "Campo de texto"}
      </div>
    </div>
  );
}

// ─── Doc Preview ──────────────────────────────────────────────────────────────
function DocPreview({ schema }: { schema: CampoSchema }) {
  const label =
    schema.label +
    (schema.obrigatorio ? " *" : "") +
    " (jpeg, jpg, png, pdf)";
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-text-muted">{label}</p>
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-input-bg px-4 py-3 cursor-not-allowed">
        <Upload size={16} className="text-text-muted" />
        <span className="flex-1 text-sm text-text-muted">
          Clique para anexar
        </span>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import {
  listarTodosCampos,
  salvarCampo,
  excluirCampo,
  reordenarCampos,
  toggleCampo,
  editarLabel,
  type CampoSchema,
  type Etapa,
  type TipoInput,
  type TipoPessoa,
} from "~/shared/form-schema";
import {
  Eye,
  EyeOff,
  Star,
  StarOff,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Plus,
  X,
  Check,
  ChevronDown,
  GripVertical,
  FileText,
  FormInput,
} from "lucide-react";
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
import toast from "react-hot-toast";

// ─── Constantes ───────────────────────────────────────────────────────────────

type SecaoKey = "pf_dados" | "pj_dados" | "endereco_empresa" | "endereco_entrega" | "endereco_cobranca" | "pf_docs" | "pj_docs";

const SECOES: {
  key: SecaoKey;
  label: string;
  tipo_pessoa: TipoPessoa;
  etapa: Etapa;
}[] = [
  { key: "pf_dados", label: "Dados — PF", tipo_pessoa: "PF", etapa: "dados" },
  { key: "pj_dados", label: "Dados — PJ", tipo_pessoa: "PJ", etapa: "dados" },
  {
    key: "endereco_empresa",
    label: "End. Empresa",
    tipo_pessoa: "ambos",
    etapa: "endereco_empresa",
  },
  {
    key: "endereco_entrega",
    label: "End. Entrega",
    tipo_pessoa: "ambos",
    etapa: "endereco_entrega",
  },
  {
    key: "endereco_cobranca",
    label: "End. Cobrança",
    tipo_pessoa: "ambos",
    etapa: "endereco_cobranca",
  },
  {
    key: "pf_docs",
    label: "Docs — PF",
    tipo_pessoa: "PF",
    etapa: "documentos",
  },
  {
    key: "pj_docs",
    label: "Docs — PJ",
    tipo_pessoa: "PJ",
    etapa: "documentos",
  },
];

const TIPOS_INPUT: { value: TipoInput; label: string }[] = [
  { value: "text", label: "Texto curto" },
  { value: "textarea", label: "Texto longo" },
  { value: "email", label: "E-mail" },
  { value: "tel", label: "Telefone" },
  { value: "date", label: "Data" },
  { value: "select", label: "Select (escolha única)" },
  { value: "multiselect", label: "Múltipla escolha" },
  { value: "checkbox", label: "Checkbox" },
  { value: "documento", label: "Upload de Documento" },
];

// ─── Sub-componente: linha de campo ──────────────────────────────────────────

function LinhaCampo({
  campo,
  onToggleVisivel,
  onToggleObrigatorio,
  onMoverCima,
  onMoverBaixo,
  onEditarLabel,
  onExcluir,
  isPrimeiro,
  isUltimo,
  isSuper,
}: {
  campo: CampoSchema;
  onToggleVisivel: () => void;
  onToggleObrigatorio: () => void;
  onMoverCima: () => void;
  onMoverBaixo: () => void;
  onEditarLabel: (label: string) => void;
  onExcluir: () => void;
  isPrimeiro: boolean;
  isUltimo: boolean;
  isSuper?: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const [labelTemp, setLabelTemp] = useState(campo.label);

  function salvar() {
    if (labelTemp.trim()) {
      onEditarLabel(labelTemp.trim());
    }
    setEditando(false);
  }

  return (
    <div
      className={`group flex items-center gap-4 rounded-xl border p-4 transition-all duration-200 ${
        campo.visivel
          ? "bg-surface border-border hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5"
          : "bg-surface/40 border-border/40 opacity-60"
      }`}
    >
      {/* Avatar / Icone */}
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent shrink-0">
        <GripVertical size={14} />
      </div>

      {/* Label / Edit inline */}
      <div className="flex-1 min-w-0">
        {editando ? (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              value={labelTemp}
              onChange={(e) => setLabelTemp(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") salvar();
                if (e.key === "Escape") setEditando(false);
              }}
              className="flex-1 rounded-xl border border-accent bg-input-bg px-3 py-1.5 text-sm text-text-main font-medium outline-none focus:ring-2 focus:ring-accent/40 transition-all duration-200"
            />
            <button
              onClick={salvar}
              className="p-1.5 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors"
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => setEditando(false)}
              className="p-1.5 rounded-lg text-text-muted hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-text-main truncate group-hover:text-accent transition-colors">
              {campo.label}
            </span>
            {campo.is_custom && (
              <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                custom
              </span>
            )}
            {campo.obrigatorio && (
              <span className="text-accent text-xs font-bold leading-none">
                *
              </span>
            )}
          </div>
        )}
        <span className="text-xs text-text-muted mt-0.5 block">
          {campo.tipo_input} · {campo.campo_key}
        </span>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {/* Editar label (só super admin ou campo custom) */}
        {(isSuper || campo.is_custom) && (
          <button
            onClick={() => {
              setLabelTemp(campo.label);
              setEditando(true);
            }}
            title="Editar rótulo"
            className="rounded-lg p-1.5 text-text-muted hover:bg-accent/10 hover:text-accent transition-colors"
          >
            <Pencil size={13} />
          </button>
        )}

        {/* Toggle obrigatório */}
        <button
          onClick={onToggleObrigatorio}
          title={campo.obrigatorio ? "Tornar opcional" : "Tornar obrigatório"}
          className={`rounded-lg p-1.5 transition-colors ${
            campo.obrigatorio
              ? "text-accent hover:text-text-muted"
              : "text-text-muted hover:text-accent"
          }`}
        >
          {campo.obrigatorio ? <Star size={13} /> : <StarOff size={13} />}
        </button>

        {/* Toggle visível */}
        <button
          onClick={onToggleVisivel}
          title={campo.visivel ? "Ocultar campo" : "Exibir campo"}
          className={`rounded-lg p-1.5 transition-colors ${
            campo.visivel
              ? "text-green-400 hover:text-text-muted"
              : "text-text-muted hover:text-green-400"
          }`}
        >
          {campo.visivel ? <Eye size={13} /> : <EyeOff size={13} />}
        </button>

        {/* Mover cima */}
        <button
          onClick={onMoverCima}
          disabled={isPrimeiro}
          className="rounded-lg p-1.5 text-text-muted hover:text-accent disabled:opacity-25 transition-colors"
        >
          <ArrowUp size={13} />
        </button>

        {/* Mover baixo */}
        <button
          onClick={onMoverBaixo}
          disabled={isUltimo}
          className="rounded-lg p-1.5 text-text-muted hover:text-accent disabled:opacity-25 transition-colors"
        >
          <ArrowDown size={13} />
        </button>

        {/* Excluir (só custom ou super admin) */}
        {(isSuper || campo.is_custom) && (
          <button
            onClick={onExcluir}
            title="Excluir campo"
            className="rounded-lg p-1.5 text-text-muted hover:text-destructive transition-colors"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Modal Novo Campo ──────────────────────────────────────────────────────────

function ModalNovoCampo({
  onClose,
  onSalvar,
}: {
  onClose: () => void;
  onSalvar: (campo: Partial<CampoSchema>) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>("PF");
  const [etapa, setEtapa] = useState<Etapa>("dados");
  const [label, setLabel] = useState("");
  const [tipoInput, setTipoInput] = useState<TipoInput>("text");
  const [obrigatorio, setObrigatorio] = useState(false);
  const [opcoes, setOpcoes] = useState<string[]>([""]);

  const temOpcoes = ["select", "multiselect", "checkbox"].includes(tipoInput);

  function gerarCampoKey(texto: string): string {
    const slug = texto
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
    return `custom_${slug}`;
  }

  async function handleSalvar() {
    if (!label.trim()) {
      toast.error("Preencha o rótulo do campo");
      return;
    }
    setSaving(true);
    await onSalvar({
      tipo_pessoa: tipoPessoa,
      etapa,
      campo_key: gerarCampoKey(label),
      label: label.trim(),
      tipo_input: tipoInput,
      opcoes: temOpcoes ? opcoes.filter((o) => o.trim()) : [],
      obrigatorio,
      visivel: true,
      ordem: 99,
    });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-card border border-border/50 p-0 shadow-2xl shadow-black/40 max-h-[90dvh] overflow-hidden flex flex-col">
        {/* Header gradiente */}
        <div className="bg-gradient-to-br from-accent/20 via-accent/10 to-transparent px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <FormInput className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-main tracking-tight">
                  Novo Campo
                </h2>
                <p className="text-sm text-text-muted mt-0.5">
                  Adicione um campo ao formulário
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute right-4 top-5 rounded-lg p-1.5 text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex-1 space-y-4">
          {/* Tipo de Pessoa */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-text-muted">
              Tipo de Pessoa
            </p>
            <div className="flex gap-2">
              {(["PF", "PJ", "ambos"] as TipoPessoa[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTipoPessoa(t)}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition-all duration-200 min-h-[44px] ${
                    tipoPessoa === t
                      ? "bg-accent text-accent-fg shadow-md shadow-accent/20"
                      : "bg-surface border border-border text-text-muted hover:border-accent/30 hover:text-text-main"
                  }`}
                >
                  {t === "ambos" ? "Ambos" : t}
                </button>
              ))}
            </div>
          </div>

          {/* Etapa */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-text-muted">Etapa</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(["dados", "endereco_empresa", "endereco_entrega", "endereco_cobranca", "documentos"] as const).map((e) => (
                <button
                  key={e}
                  onClick={() => setEtapa(e)}
                  className={`rounded-xl py-2.5 px-1 text-xs font-semibold text-center transition-all duration-200 min-h-[44px] ${
                    etapa === e
                      ? "bg-accent text-accent-fg shadow-md shadow-accent/20"
                      : "bg-surface border border-border text-text-muted hover:border-accent/30 hover:text-text-main"
                  }`}
                >
                  {e === "endereco_empresa" ? "End. Empresa" :
                   e === "endereco_entrega" ? "End. Entrega" :
                   e === "endereco_cobranca" ? "End. Cobrança" :
                   e === "documentos" ? "Docs" :
                   e === "dados" ? "Dados" : e}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de Input */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-text-muted">
              Tipo de Campo
            </p>
            <div className="relative">
              <select
                value={tipoInput}
                onChange={(e) => setTipoInput(e.target.value as TipoInput)}
                className="w-full appearance-none h-11 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200 pr-8"
              >
                {TIPOS_INPUT.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              />
            </div>
          </div>

          {/* Label */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-text-muted">
              Rótulo (exibido ao lead)
            </p>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: Especialidade Clínica"
              className="w-full h-11 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
            />
          </div>

          {/* Opções (para select/multiselect/checkbox) */}
          {temOpcoes && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-text-muted">Opções</p>
              <div className="flex flex-col gap-1.5">
                {opcoes.map((op, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={op}
                      onChange={(e) => {
                        const novas = [...opcoes];
                        novas[i] = e.target.value;
                        setOpcoes(novas);
                      }}
                      placeholder={`Opção ${i + 1}`}
                      className="flex-1 h-10 rounded-xl border border-border bg-input-bg px-3 text-sm text-text-main font-medium placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
                    />
                    {opcoes.length > 1 && (
                      <button
                        onClick={() =>
                          setOpcoes(opcoes.filter((_, j) => j !== i))
                        }
                        className="text-text-muted hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 p-1"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setOpcoes([...opcoes, ""])}
                  className="text-xs text-accent hover:underline text-left"
                >
                  + Adicionar opção
                </button>
              </div>
            </div>
          )}

          {/* Obrigatório */}
          <button
            onClick={() => setObrigatorio(!obrigatorio)}
            className="flex items-center gap-2 text-xs text-text-muted hover:text-text-main transition-colors"
          >
            <div
              className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                obrigatorio ? "border-accent bg-accent" : "border-border"
              }`}
            >
              {obrigatorio && <Check size={10} className="text-accent-fg" />}
            </div>
            Campo obrigatório
          </button>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end px-6 pb-6 pt-4 border-t border-border/50">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={saving || !label.trim()}
            className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]"
          >
            {saving ? "Salvando…" : "Criar Campo"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export function FormBuilderTab({ empresaId, isSuper }: { empresaId?: string; isSuper?: boolean }) {
  const [secao, setSecao] = useState<SecaoKey>("pf_dados");
  const [campos, setCampos] = useState<CampoSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modo, setModo] = useState<"predefinidos" | "empresa">("empresa");
  const [campoParaDeletar, setCampoParaDeletar] = useState<CampoSchema | null>(null);

  const secaoAtual = SECOES.find((s) => s.key === secao)!;

  async function carregar() {
    setLoading(true);
    const data = await listarTodosCampos({
      etapa: secaoAtual.etapa,
      tipo_pessoa:
        secaoAtual.tipo_pessoa === "ambos" ? undefined : secaoAtual.tipo_pessoa,
    });

    // Para endereço, filtra só os de tipo_pessoa = 'ambos'
    const tipoPessoaFiltro =
      secaoAtual.tipo_pessoa === "ambos" ? null : secaoAtual.tipo_pessoa;
    const filtrado = tipoPessoaFiltro
      ? data.filter((c) => c.tipo_pessoa === tipoPessoaFiltro)
      : data.filter((c) => c.tipo_pessoa === "ambos");
    setCampos(filtrado);
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, [secao, modo]);

  async function handleToggleVisivel(campo: CampoSchema) {
    const novoValor = !campo.visivel;
    await toggleCampo(campo.id, "visivel", novoValor);
    setCampos((prev) =>
      prev.map((c) => (c.id === campo.id ? { ...c, visivel: novoValor } : c)),
    );
    toast.success(novoValor ? "Campo visível" : "Campo ocultado");
  }

  async function handleToggleObrigatorio(campo: CampoSchema) {
    const novoValor = !campo.obrigatorio;
    await toggleCampo(campo.id, "obrigatorio", novoValor);
    setCampos((prev) =>
      prev.map((c) =>
        c.id === campo.id ? { ...c, obrigatorio: novoValor } : c,
      ),
    );
    toast.success(novoValor ? "Campo obrigatório" : "Campo opcional");
  }

  async function handleEditarLabel(campo: CampoSchema, novoLabel: string) {
    await editarLabel(campo.id, novoLabel);
    setCampos((prev) =>
      prev.map((c) => (c.id === campo.id ? { ...c, label: novoLabel } : c)),
    );
    toast.success("Rótulo atualizado");
  }

  async function handleConfirmarExclusao() {
    if (!campoParaDeletar) return;
    const ok = await excluirCampo(campoParaDeletar.id, isSuper);
    if (ok) {
      setCampos((prev) => prev.filter((c) => c.id !== campoParaDeletar.id));
      toast.success("Campo excluído");
    } else {
      toast.error("Erro ao excluir campo");
    }
    setCampoParaDeletar(null);
  }

  async function handleMover(index: number, direcao: "cima" | "baixo") {
    const novoIndex = direcao === "cima" ? index - 1 : index + 1;
    if (novoIndex < 0 || novoIndex >= campos.length) return;

    const novos = [...campos];
    [novos[index], novos[novoIndex]] = [novos[novoIndex], novos[index]];

    // Recalcula ordens
    const atualizacoes = novos.map((c, i) => ({ id: c.id, ordem: i + 1 }));
    await reordenarCampos(atualizacoes);
    setCampos(novos.map((c, i) => ({ ...c, ordem: i + 1 })));
  }

  async function handleNovoCampo(dados: Partial<CampoSchema>) {
    const result = await salvarCampo(dados);
    if (result?.data) {
      toast.success("Campo criado com sucesso!");
      setShowModal(false);
      await carregar();
    } else {
      toast.error(result?.erro || "Erro ao criar campo.");
    }
  }

  // Filtragem final por seção para garantir consistência
  const camposFiltrados = campos.filter((c) => {
    if (secaoAtual.tipo_pessoa === "ambos") return c.tipo_pessoa === "ambos";
    return c.tipo_pessoa === secaoAtual.tipo_pessoa;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent shrink-0">
            <FormInput size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-text-main">
              Formulário do Lead
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Configure campos e documentos por seção
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg hover:bg-accent-hover transition-all duration-200 min-h-[44px] shadow-lg shadow-accent/20"
        >
          <Plus size={16} />
          Novo Campo
        </button>
      </div>

      {/* Alternador Pré-definidos / Empresa (só Super Admin) */}
      {isSuper && (
        <div className="flex items-center gap-2 rounded-xl bg-surface border border-border p-1 w-fit">
          <button
            onClick={() => setModo("predefinidos")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 ${
              modo === "predefinidos"
                ? "bg-accent text-accent-fg shadow-md shadow-accent/20"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            Campos Pré-definidos
          </button>
          <button
            onClick={() => setModo("empresa")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 ${
              modo === "empresa"
                ? "bg-accent text-accent-fg shadow-md shadow-accent/20"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            Campos da Empresa
          </button>
        </div>
      )}

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 rounded-xl bg-surface border border-border p-3 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <Eye size={11} className="text-green-400" /> visível
        </span>
        <span className="flex items-center gap-1">
          <EyeOff size={11} /> oculto
        </span>
        <span className="flex items-center gap-1">
          <Star size={11} className="text-accent" /> obrigatório
        </span>
        <span className="flex items-center gap-1">
          <StarOff size={11} /> opcional
        </span>
        <span className="flex items-center gap-1">
          <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-accent font-semibold">
            custom
          </span>{" "}
          campo criado pelo admin
        </span>
      </div>

      {/* Navegação de seções */}
      <div className="flex flex-wrap gap-2">
        {SECOES.map((s) => (
          <button
            key={s.key}
            onClick={() => setSecao(s.key)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 min-h-[44px] ${
              secao === s.key
                ? "bg-accent text-accent-fg shadow-md shadow-accent/20"
                : "bg-surface border border-border text-text-muted hover:border-accent/30 hover:text-text-main"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Lista de campos */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : camposFiltrados.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-10 h-10 text-text-muted/30" />}
          title="Nenhum campo nesta seção"
          description="Crie o primeiro campo para começar a configurar."
          action={
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover transition-all duration-200 min-h-[44px] mt-4"
            >
              <Plus size={14} />
              Criar campo
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {camposFiltrados.map((campo, i) => (
            <LinhaCampo
              key={campo.id}
              campo={campo}
              isPrimeiro={i === 0}
              isUltimo={i === camposFiltrados.length - 1}
              isSuper={isSuper}
              onToggleVisivel={() => handleToggleVisivel(campo)}
              onToggleObrigatorio={() => handleToggleObrigatorio(campo)}
              onMoverCima={() => handleMover(i, "cima")}
              onMoverBaixo={() => handleMover(i, "baixo")}
              onEditarLabel={(novoLabel) => handleEditarLabel(campo, novoLabel)}
              onExcluir={() => setCampoParaDeletar(campo)}
            />
          ))}
        </div>
      )}

      {/* Contador */}
      {!loading && camposFiltrados.length > 0 && (
        <p className="text-center text-xs text-text-muted">
          {camposFiltrados.filter((c) => c.visivel).length} visíveis ·{" "}
          {camposFiltrados.filter((c) => !c.visivel).length} ocultos ·{" "}
          {camposFiltrados.filter((c) => c.is_custom).length} custom
        </p>
      )}

      {/* Modal */}
      {showModal && (
        <ModalNovoCampo
          onClose={() => setShowModal(false)}
          onSalvar={handleNovoCampo}
        />
      )}

      {/* Confirmação de exclusão */}
      <AlertDialog
        open={!!campoParaDeletar}
        onOpenChange={(o) => !o && setCampoParaDeletar(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir campo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O campo{" "}
              <strong>{campoParaDeletar?.label}</strong> será removido
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmarExclusao}
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

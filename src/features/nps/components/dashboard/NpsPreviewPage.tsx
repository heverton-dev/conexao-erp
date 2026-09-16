import { useEffect, useState } from "react";
import { supabase } from "~/core/supabase";
import { EMPRESA_ID } from "~/config/empresa";
import { useAuth } from "~/lib/auth";
import type { NpsPergunta } from "~/features/nps/types";
import type { Empresa, EmpresaDesign } from "~/core/empresa";
import {
  buscarEmpresa,
  buscarEmpresaDesign,
  listarEmpresas,
} from "~/shared/empresas";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Eye,
  Sparkles,
  Smartphone,
  RotateCcw,
  MessageSquare,
  Star,
} from "lucide-react";
import {
  getNpsThemeVars,
  getNpsNoBorders,
  getNpsShowCompanyName,
  getNpsLogoHeight,
  getNpsBackgroundStyle,
  getNpsBlobs,
} from "~/features/nps/theme";
import { NpsBackground } from "~/features/nps/NpsBackground";

function getNpsColor(score: number): string {
  if (score <= 6) return "#ef4444"; // detractor - red
  if (score <= 8) return "#f59e0b"; // passive - amber
  return "#22c55e"; // promoter - green
}

function getNpsLabel(score: number): string {
  if (score <= 6) return "Detrator";
  if (score <= 8) return "Neutro";
  return "Promotor";
}

export default function NpsPreviewPage() {
  const { profile } = useAuth();
  const isSuperAdmin = profile?.is_super_admin === true;

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>("");
  const [questions, setQuestions] = useState<NpsPergunta[]>([]);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [empresaConfig, setEmpresaConfig] = useState<EmpresaDesign | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showRequiredAlert, setShowRequiredAlert] = useState(false);

  useEffect(() => {
    if (isSuperAdmin) {
      listarEmpresas()
        .then((emp) => {
          setEmpresas(emp.filter((e) => e.ativo));
          setLoadingEmpresas(false);
        })
        .catch(() => setLoadingEmpresas(false));
    } else if (EMPRESA_ID) {
      setSelectedEmpresaId(EMPRESA_ID);
      setLoadingEmpresas(false);
    } else {
      setLoadingEmpresas(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (!selectedEmpresaId) {
      setQuestions([]);
      setEmpresa(null);
      setEmpresaConfig(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setStep(0);
    setAnswers({});

    Promise.all([
      buscarEmpresa(selectedEmpresaId).catch(() => null),
      buscarEmpresaDesign(selectedEmpresaId).catch(() => null),
      supabase
        .from("nps_perguntas")
        .select("*")
        .eq("empresa_id", selectedEmpresaId)
        .eq("active", true)
        .order("order_index", { ascending: true }),
    ]).then(([empData, configData, { data: perguntas }]) => {
      setEmpresa(empData);
      setEmpresaConfig(configData);
      const normalizadas =
        (perguntas as NpsPergunta[])?.map((q) => {
          let opts: string[] = [];
          if (Array.isArray(q.options)) opts = q.options;
          else if (typeof q.options === "string")
            try {
              opts = JSON.parse(q.options);
            } catch {
              opts = [];
            }
          return { ...q, options: opts };
        }) || [];
      setQuestions(normalizadas);
      setLoading(false);
    });
  }, [selectedEmpresaId]);

  const currentQ = questions[step];
  const isLast = step === questions.length;
  const logoUrl = empresaConfig?.logo_app_url || empresaConfig?.logo_index_url;
  const npsTheme = getNpsThemeVars(empresaConfig) as React.CSSProperties;
  const noBorders = getNpsNoBorders(empresaConfig);
  const showCompanyName = getNpsShowCompanyName(empresaConfig);
  const logoHeight = getNpsLogoHeight(empresaConfig);
  const bgStyle = getNpsBackgroundStyle(empresaConfig);
  const bgBlobs = getNpsBlobs(empresaConfig);

  const handleNext = () => {
    if (currentQ?.required && answers[currentQ.id] === undefined) {
      setShowRequiredAlert(true);
      return;
    }
    setStep((s) => s + 1);
  };

  const handleRestart = () => {
    setStep(0);
    setAnswers({});
  };

  const setAnswer = (val: any) => {
    setAnswers((p) => ({ ...p, [currentQ.id]: val }));
  };

  const isReady = !loadingEmpresas && selectedEmpresaId;
  const hasQuestions = questions.length > 0;
  const progress = questions.length > 0 ? ((step) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              <Eye className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Preview da Pesquisa
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Visualize como o cliente verá a pesquisa
              </p>
            </div>
          </div>

          {/* Seletor de empresa */}
          {isSuperAdmin && (
            <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-border/50">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Empresa
              </label>
              <Select
                value={selectedEmpresaId}
                onValueChange={setSelectedEmpresaId}
                disabled={loadingEmpresas}
              >
                <SelectTrigger className="w-[200px] h-9 bg-secondary/50 border-border/30 text-sm rounded-lg">
                  <SelectValue
                    placeholder={
                      loadingEmpresas ? "Carregando..." : "Selecione"
                    }
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

        {/* Conteúdo principal - Layout dividido */}
        {isReady && (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6 items-start">
            {/* Sidebar esquerda - Lista de perguntas */}
            <div className="hidden lg:block bg-card/80 backdrop-blur-sm rounded-2xl border border-border/40 p-4 sticky top-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Perguntas
                </span>
                <span className="ml-auto text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                  {questions.length}
                </span>
              </div>

              {!hasQuestions && !loading ? (
                <div className="text-center py-8">
                  <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Nenhuma pergunta ativa
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {questions.map((q, idx) => {
                    const isActive = idx === step && !isLast;
                    const isCompleted = idx < step;
                    return (
                      <button
                        key={q.id}
                        onClick={() => !isLast && setStep(idx)}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-primary/10 border border-primary/30 shadow-sm"
                            : isCompleted
                              ? "bg-green-500/5 border border-green-500/20"
                              : "hover:bg-secondary/50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : isCompleted
                                  ? "bg-green-500/20 text-green-600 dark:text-green-400"
                                  : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-xs font-medium truncate ${
                                isActive
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {q.question_text}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5 capitalize">
                              {q.type === "nps"
                                ? "NPS 0-10"
                                : q.type === "text"
                                  ? "Texto"
                                  : q.type === "single_choice"
                                    ? "Escolha única"
                                    : "Múltipla"}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Centro - Mockup do celular */}
            <div className="flex flex-col items-center">
              {/* Barra de progresso */}
              {hasQuestions && !isLast && (
                <div className="w-full max-w-[380px] mb-4 px-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">
                      Progresso
                    </span>
                    <span className="text-xs font-medium text-primary">
                      {step + 1}/{questions.length}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Frame do celular */}
              <div className="relative">
                {/* Brilho atrás do celular */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 blur-3xl scale-110" />

                {/* Celular */}
                <div className="relative bg-zinc-900 rounded-[40px] p-3 shadow-2xl border border-zinc-700/50">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-10" />

                  {/* Tela */}
                  <div className="w-[320px] h-[580px] rounded-[28px] overflow-hidden bg-zinc-950 relative">
                    {/* Status bar fake */}
                    <div className="h-10 bg-transparent flex items-end justify-between px-6 pb-1 relative z-20">
                      <span className="text-[10px] text-white/60 font-medium">
                        9:41
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2.5 border border-white/40 rounded-sm relative">
                          <div className="absolute inset-0.5 bg-white/60 rounded-[1px]" style={{ width: "70%" }} />
                        </div>
                      </div>
                    </div>

                    {/* Conteúdo da survey */}
                    <NpsBackground
                      bgStyle={bgStyle}
                      blobs={bgBlobs}
                      className="absolute inset-0 top-10 !min-h-0"
                    >
                      <div className="relative h-full flex flex-col p-4 overflow-y-auto">
                        {/* Logo/Header */}
                        {logoUrl || empresa?.nome ? (
                          <div className="flex items-center justify-center gap-2 mb-4 pt-2">
                            {logoUrl && (
                              <img
                                src={logoUrl}
                                alt={empresa?.nome || "Logo"}
                                style={{ height: `${Math.min(logoHeight, 28)}px` }}
                                className="w-auto object-contain"
                              />
                            )}
                            {showCompanyName && empresa?.nome && (
                              <>
                                {logoUrl && (
                                  <div
                                    className="w-px h-4"
                                    style={{ backgroundColor: "var(--nps-header-divider)" }}
                                  />
                                )}
                                <span
                                  className="text-xs font-bold tracking-tight"
                                  style={{ color: "var(--nps-header-logo-text)" }}
                                >
                                  {empresa.nome}
                                </span>
                              </>
                            )}
                          </div>
                        ) : null}

                        {/* Card da survey */}
                        {hasQuestions ? (
                          <div
                            className="flex-1 rounded-2xl overflow-hidden flex flex-col"
                            style={{
                              backgroundColor: "var(--nps-card-bg)",
                              borderColor: "var(--nps-card-border)",
                              borderWidth: noBorders ? 0 : 1,
                            }}
                          >
                            {isLast ? (
                              /* Tela de conclusão */
                              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-500">
                                <div
                                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                                  style={{
                                    backgroundColor: "var(--nps-complete-icon-bg)",
                                    borderColor: "var(--nps-complete-icon-border)",
                                    borderWidth: noBorders ? 0 : 1,
                                  }}
                                >
                                  <CheckCircle2
                                    className="w-8 h-8"
                                    style={{ color: "var(--nps-complete-icon-color)" }}
                                  />
                                </div>
                                <h2
                                  className="text-xl font-bold mb-2"
                                  style={{ color: "var(--nps-complete-title)" }}
                                >
                                  Obrigado!
                                </h2>
                                <p
                                  className="text-xs leading-relaxed"
                                  style={{ color: "var(--nps-complete-subtitle)" }}
                                >
                                  Seu feedback é muito importante para nós.
                                </p>
                                <div className="mt-6 pt-4 w-full" style={{ borderTopColor: "var(--nps-divider-footer)", borderTopWidth: noBorders ? 0 : 1 }}>
                                  <p className="text-[10px] italic" style={{ color: "var(--nps-complete-subtitle)" }}>
                                    (Preview — sem gravação)
                                  </p>
                                </div>
                                <button
                                  onClick={handleRestart}
                                  className="mt-4 flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                                  style={{ color: "var(--nps-survey-accent)" }}
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  Reiniciar preview
                                </button>
                              </div>
                            ) : (
                              /* Pergunta */
                              <div className="flex-1 flex flex-col p-4" key={currentQ.id}>
                                {/* Etapa */}
                                <div className="text-center mb-4">
                                  <span
                                    className="text-[9px] uppercase tracking-[0.15em] font-semibold"
                                    style={{ color: "var(--nps-step-text)" }}
                                  >
                                    {step + 1} de {questions.length}
                                  </span>
                                </div>

                                {/* Pergunta */}
                                <h3
                                  className="text-sm font-semibold text-center leading-snug mb-4 px-2"
                                  style={{ color: "var(--nps-question-text)" }}
                                >
                                  {currentQ.question_text}
                                </h3>

                                {/* Conteúdo da pergunta */}
                                <div className="flex-1 flex flex-col justify-center">
                                  {/* NPS Score */}
                                  {currentQ.type === "nps" && (
                                    <div className="space-y-3">
                                      <div className="grid grid-cols-11 gap-1">
                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                                          const isSelected = answers[currentQ.id] === num;
                                          const color = getNpsColor(num);
                                          return (
                                            <button
                                              key={num}
                                              onClick={() => setAnswer(num)}
                                              className="aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200"
                                              style={{
                                                backgroundColor: isSelected
                                                  ? color
                                                  : "var(--nps-nps-btn-bg)",
                                                color: isSelected
                                                  ? "#fff"
                                                  : "var(--nps-nps-btn-text)",
                                                boxShadow: isSelected
                                                  ? `0 0 0 2px ${color}, 0 4px 12px ${color}40`
                                                  : "none",
                                                transform: isSelected ? "scale(1.1)" : "scale(1)",
                                              }}
                                            >
                                              {num}
                                            </button>
                                          );
                                        })}
                                      </div>
                                      <div className="flex justify-between px-0.5">
                                        <span className="text-[9px]" style={{ color: "var(--nps-step-text)" }}>
                                          Nada provável
                                        </span>
                                        <span className="text-[9px]" style={{ color: "var(--nps-step-text)" }}>
                                          Muito provável
                                        </span>
                                      </div>
                                      {/* Indicador de categoria */}
                                      {answers[currentQ.id] !== undefined && (
                                        <div className="flex items-center justify-center gap-2 pt-2 animate-in fade-in duration-300">
                                          <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: getNpsColor(answers[currentQ.id]) }}
                                          />
                                          <span className="text-[10px] font-medium" style={{ color: getNpsColor(answers[currentQ.id]) }}>
                                            {getNpsLabel(answers[currentQ.id])}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Texto */}
                                  {currentQ.type === "text" && (
                                    <textarea
                                      value={answers[currentQ.id] || ""}
                                      onChange={(e) =>
                                        setAnswers((p) => ({ ...p, [currentQ.id]: e.target.value }))
                                      }
                                      className="w-full rounded-xl px-3 py-3 text-xs focus-visible:outline-none min-h-[100px] resize-none"
                                      style={{
                                        backgroundColor: "var(--nps-input-bg)",
                                        color: "var(--nps-input-text)",
                                        borderColor: "var(--nps-input-border)",
                                        borderWidth: noBorders ? 0 : 1,
                                      }}
                                      placeholder="Digite sua resposta..."
                                    />
                                  )}

                                  {/* Escolha única */}
                                  {currentQ.type === "single_choice" && (
                                    <div className="space-y-2">
                                      {(currentQ.options || []).map((opt, i) => {
                                        const isSelected = answers[currentQ.id] === opt;
                                        return (
                                          <label
                                            key={i}
                                            className="flex items-center gap-2.5 p-3 rounded-xl cursor-pointer transition-all"
                                            style={{
                                              backgroundColor: isSelected
                                                ? "var(--nps-option-selected-bg)"
                                                : "var(--nps-option-bg)",
                                              borderColor: isSelected
                                                ? "var(--nps-option-selected-border)"
                                                : "var(--nps-option-border)",
                                              borderWidth: noBorders ? 0 : 1,
                                            }}
                                          >
                                            <div
                                              className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                                              style={{
                                                borderColor: isSelected
                                                  ? "var(--nps-radio-selected)"
                                                  : "var(--nps-radio-border)",
                                              }}
                                            >
                                              {isSelected && (
                                                <div
                                                  className="w-2 h-2 rounded-full"
                                                  style={{ backgroundColor: "var(--nps-radio-selected)" }}
                                                />
                                              )}
                                            </div>
                                            <input
                                              type="radio"
                                              name={`q-${currentQ.id}`}
                                              checked={isSelected}
                                              onChange={() => setAnswer(opt)}
                                              className="hidden"
                                            />
                                            <span
                                              className="text-xs"
                                              style={{
                                                color: isSelected
                                                  ? "var(--nps-option-text-selected)"
                                                  : "var(--nps-option-text)",
                                              }}
                                            >
                                              {opt}
                                            </span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* Múltipla escolha */}
                                  {currentQ.type === "multi_choice" && (
                                    <div className="space-y-2">
                                      {(currentQ.options || []).map((opt, i) => {
                                        const isChecked = (answers[currentQ.id] || []).includes(opt);
                                        return (
                                          <label
                                            key={i}
                                            className="flex items-center gap-2.5 p-3 rounded-xl cursor-pointer transition-all"
                                            style={{
                                              backgroundColor: isChecked
                                                ? "var(--nps-option-selected-bg)"
                                                : "var(--nps-option-bg)",
                                              borderColor: isChecked
                                                ? "var(--nps-option-selected-border)"
                                                : "var(--nps-option-border)",
                                              borderWidth: noBorders ? 0 : 1,
                                            }}
                                          >
                                            <div
                                              className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0"
                                              style={{
                                                borderColor: isChecked
                                                  ? "var(--nps-radio-selected)"
                                                  : "var(--nps-radio-border)",
                                                backgroundColor: isChecked
                                                  ? "var(--nps-radio-selected)"
                                                  : "transparent",
                                              }}
                                            >
                                              {isChecked && (
                                                <svg className="w-2.5 h-2.5" style={{ color: "var(--nps-nps-btn-selected-text)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                              )}
                                            </div>
                                            <input
                                              type="checkbox"
                                              checked={isChecked}
                                              onChange={(e) => {
                                                const list = answers[currentQ.id] || [];
                                                if (e.target.checked) setAnswer([...list, opt]);
                                                else setAnswer(list.filter((x: string) => x !== opt));
                                              }}
                                              className="hidden"
                                            />
                                            <span
                                              className="text-xs"
                                              style={{
                                                color: isChecked
                                                  ? "var(--nps-option-text-selected)"
                                                  : "var(--nps-option-text)",
                                              }}
                                            >
                                              {opt}
                                            </span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* Botões de navegação */}
                                <div
                                  className="flex justify-between items-center mt-4 pt-3"
                                  style={{
                                    borderTopColor: "var(--nps-divider-footer)",
                                    borderTopWidth: noBorders ? 0 : 1,
                                  }}
                                >
                                  {step > 0 ? (
                                    <button
                                      onClick={() => setStep((s) => s - 1)}
                                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                                      style={{ color: "var(--nps-btn-back-text)" }}
                                    >
                                      <ArrowLeft className="w-3.5 h-3.5" />
                                      Voltar
                                    </button>
                                  ) : (
                                    <div />
                                  )}
                                  <button
                                    onClick={handleNext}
                                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-all"
                                    style={{
                                      backgroundColor: "var(--nps-btn-next-bg)",
                                      color: "var(--nps-btn-next-text)",
                                    }}
                                  >
                                    {isLast ? "Finalizar" : "Próxima"}
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Estado vazio */
                          <div
                            className="flex-1 rounded-2xl flex flex-col items-center justify-center p-6 text-center"
                            style={{
                              backgroundColor: "var(--nps-card-bg)",
                              borderColor: "var(--nps-card-border)",
                              borderWidth: noBorders ? 0 : 1,
                            }}
                          >
                            <Sparkles className="w-10 h-10 mb-3" style={{ color: "var(--nps-survey-accent)" }} />
                            <p className="text-xs font-medium" style={{ color: "var(--nps-step-text)" }}>
                              Nenhuma pergunta ativa
                            </p>
                          </div>
                        )}

                        {/* Home indicator fake */}
                        <div className="flex justify-center pt-3 pb-1">
                          <div className="w-24 h-1 bg-white/20 rounded-full" />
                        </div>
                      </div>
                    </NpsBackground>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar direita - Info e ações */}
            <div className="hidden lg:block bg-card/80 backdrop-blur-sm rounded-2xl border border-border/40 p-4 sticky top-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Informações
                </span>
              </div>

              {/* Status da survey */}
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-secondary/30 border border-border/20">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Status
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {isLast ? (
                      <span className="text-green-500">Concluída</span>
                    ) : hasQuestions ? (
                      <span className="text-primary">Em andamento</span>
                    ) : (
                      <span className="text-muted-foreground">Sem perguntas</span>
                    )}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-secondary/30 border border-border/20">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Perguntas ativas
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {questions.length}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-secondary/30 border border-border/20">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Respostas coletadas
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {Object.keys(answers).length}
                  </p>
                </div>

                {/* Legenda NPS */}
                <div className="p-3 rounded-xl bg-secondary/30 border border-border/20">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                    Legenda NPS
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-500" />
                      <span className="text-[10px] text-muted-foreground">0-6 Detrator</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-amber-500" />
                      <span className="text-[10px] text-muted-foreground">7-8 Neutro</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500" />
                      <span className="text-[10px] text-muted-foreground">9-10 Promotor</span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="pt-2 space-y-2">
                  {isLast && (
                    <button
                      onClick={handleRestart}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reiniciar preview
                    </button>
                  )}
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-[10px] text-amber-600 dark:text-amber-400">
                      Esta é apenas uma visualização. Nenhuma resposta é gravada.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de pergunta obrigatória */}
        {showRequiredAlert && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowRequiredAlert(false)}
          >
            <div
              className="bg-card rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-border/50 animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Pergunta obrigatória
                </h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Por favor, responda a pergunta antes de continuar.
                </p>
                <button
                  onClick={() => setShowRequiredAlert(false)}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

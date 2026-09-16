import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { supabase } from "~/core/supabase";
import type { NpsPergunta } from "~/features/nps/types";
import type { Empresa, EmpresaConfig } from "~/core/empresa";
import { buscarEmpresa, buscarEmpresaConfig } from "~/shared/empresas";
import {
  getNpsThemeVars,
  getNpsNoBorders,
  getNpsShowCompanyName,
  getNpsLogoHeight,
  getNpsHeaderAlign,
  getNpsBackgroundStyle,
  getNpsBlobs,
} from "~/features/nps/theme";
import { NpsBackground } from "~/features/nps/NpsBackground";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export const npsSurveyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nps-survey",
  component: NpsSurveyPage,
});

function NpsSurveyPage() {
  const [questions, setQuestions] = useState<NpsPergunta[]>([]);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [empresaConfig, setEmpresaConfig] = useState<EmpresaConfig | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showRequiredAlert, setShowRequiredAlert] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const e = searchParams.get("e");
    setEmpresaId(e);

    async function load() {
      if (!e) {
        setLoading(false);
        return;
      }

      const [empData, configData, { data: perguntas }] = await Promise.all([
        buscarEmpresa(e).catch(() => null),
        buscarEmpresaConfig(e).catch(() => null),
        supabase
          .from("nps_perguntas")
          .select("*")
          .eq("empresa_id", e)
          .eq("active", true)
          .order("order_index", { ascending: true }),
      ]);

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
    }
    load();
  }, []);

  const currentQ = questions[step];
  const isLast = step === questions.length;
  const logoUrl = empresaConfig?.logo_app_url || empresaConfig?.logo_index_url;
  const npsTheme = getNpsThemeVars(empresaConfig) as React.CSSProperties;
  const noBorders = getNpsNoBorders(empresaConfig);
  const showCompanyName = getNpsShowCompanyName(empresaConfig);
  const logoHeight = getNpsLogoHeight(empresaConfig);
  const bgStyle = getNpsBackgroundStyle(empresaConfig);
  const bgBlobs = getNpsBlobs(empresaConfig);

  if (loading)
    return (
      <NpsBackground
        bgStyle={bgStyle}
        blobs={bgBlobs}
        className="flex items-center justify-center"
      >
        <div
          className="w-10 h-10 border-4 rounded-full animate-spin"
          style={{
            borderColor: "var(--nps-card-border)",
            borderTopColor: "var(--nps-survey-accent)",
          }}
        ></div>
      </NpsBackground>
    );

  if (!empresaId || questions.length === 0)
    return (
      <NpsBackground
        bgStyle={bgStyle}
        blobs={bgBlobs}
        className="flex flex-col items-center justify-center p-4"
      >
        <div
          className="p-10 rounded-2xl max-w-md text-center backdrop-blur-lg"
          style={{
            backgroundColor: "var(--nps-card-bg)",
            borderColor: "var(--nps-card-border)",
            borderWidth: noBorders ? 0 : 1,
          }}
        >
          <p className="font-medium" style={{ color: "var(--nps-step-text)" }}>
            Esta pesquisa não está disponível no momento.
          </p>
        </div>
      </NpsBackground>
    );

  const handleNext = () => {
    if (currentQ?.required && answers[currentQ.id] === undefined) {
      setShowRequiredAlert(true);
      return;
    }
    setStep((s) => s + 1);
  };

  const setAnswer = (val: any) => {
    setAnswers((p) => ({ ...p, [currentQ.id]: val }));
  };

  return (
    <NpsBackground
      bgStyle={bgStyle}
      blobs={bgBlobs}
      className={`flex flex-col items-center justify-center px-4 py-8 md:py-12 font-sans selection:bg-[var(--nps-option-selected-bg)] selection:text-[var(--nps-option-text-selected)] ${noBorders ? "nps-no-borders" : ""}`}
    >
      <div style={npsTheme}>
        <div
          className="w-full max-w-md backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
          style={{
            backgroundColor: "var(--nps-card-bg)",
            borderColor: "var(--nps-card-border)",
            borderWidth: noBorders ? 0 : 1,
          }}
        >
          {/* Glow effect */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[var(--nps-survey-glow)]/20 to-transparent"
            style={{ opacity: noBorders ? 0 : 1 }}
          ></div>

          {logoUrl || empresa?.nome ? (
            <div className="flex items-center justify-center gap-3 mb-6">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt={empresa?.nome || "Logo"}
                  style={{ height: `${logoHeight}px` }}
                  className="w-auto object-contain flex-shrink-0"
                />
              )}
              {logoUrl && showCompanyName && empresa?.nome && (
                <div
                  className="w-px flex-shrink-0"
                  style={{
                    height: `${logoHeight}px`,
                    backgroundColor: "var(--nps-header-divider)",
                    opacity: noBorders ? 0 : 1,
                  }}
                />
              )}
              {showCompanyName && empresa?.nome && (
                <h2
                  className="text-lg font-bold tracking-tight truncate"
                  style={{ color: "var(--nps-header-logo-text)" }}
                >
                  {empresa.nome}
                </h2>
              )}
            </div>
          ) : null}

          {isLast ? (
            <div className="text-center animate-in zoom-in-95 duration-700 py-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
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
              <h1
                className="text-2xl font-semibold mb-3 tracking-tight"
                style={{ color: "var(--nps-complete-title)" }}
              >
                Obrigado!
              </h1>
              <p
                className="text-sm md:text-base leading-relaxed"
                style={{ color: "var(--nps-complete-subtitle)" }}
              >
                Seu feedback é muito importante para nós.
              </p>
            </div>
          ) : (
            <div
              key={currentQ.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="mb-6 flex flex-col items-center gap-1">
                <span
                  className="text-xs uppercase tracking-widest font-semibold"
                  style={{ color: "var(--nps-step-text)" }}
                >
                  Etapa {step + 1} de {questions.length}
                </span>
                <h1
                  className="text-xl md:text-2xl font-semibold text-center tracking-tight mt-2"
                  style={{ color: "var(--nps-question-text)" }}
                >
                  {currentQ.question_text}
                </h1>
              </div>

              {currentQ.type === "nps" && (
                <div className="mt-8 mb-4">
                  <div className="flex w-full justify-between items-center gap-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                      const isSelected = answers[currentQ.id] === num;
                      return (
                        <button
                          key={num}
                          onClick={() => setAnswer(num)}
                          className={`aspect-square w-full max-w-[36px] flex items-center justify-center rounded-md md:rounded-lg font-medium text-[13px] md:text-sm transition-all duration-200 outline-none
                          ${isSelected ? "font-bold scale-110 z-10" : ""}
                          ${noBorders ? "" : "border border-transparent"}
                        `}
                          style={{
                            backgroundColor: isSelected
                              ? "var(--nps-nps-btn-selected-bg)"
                              : "var(--nps-nps-btn-bg)",
                            color: isSelected
                              ? "var(--nps-nps-btn-selected-text)"
                              : "var(--nps-nps-btn-text)",
                          }}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                  <div
                    className="flex justify-between text-xs mt-4 px-1"
                    style={{ color: "var(--nps-step-text)" }}
                  >
                    <span>Nada provável</span>
                    <span>Extremamente provável</span>
                  </div>
                </div>
              )}

              {currentQ.type === "text" && (
                <div className="mt-6">
                  <textarea
                    value={answers[currentQ.id] || ""}
                    onChange={(e) =>
                      setAnswers((p) => ({
                        ...p,
                        [currentQ.id]: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl px-4 py-4 text-sm focus-visible:outline-none min-h-[120px] resize-y transition-colors"
                    style={{
                      backgroundColor: "var(--nps-input-bg)",
                      color: "var(--nps-input-text)",
                      borderColor: "var(--nps-input-border)",
                      borderWidth: noBorders ? 0 : 1,
                    }}
                    placeholder="Sinta-se livre para detalhar..."
                  ></textarea>
                </div>
              )}

              {currentQ.type === "single_choice" && (
                <div className="space-y-3 mt-6">
                  {(currentQ.options || []).map((opt, i) => {
                    const isSelected = answers[currentQ.id] === opt;
                    return (
                      <label
                        key={i}
                        className="flex items-center gap-3 p-4 rounded-xl transition-all cursor-pointer group"
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
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${noBorders ? "" : "border-2"}`}
                          style={{
                            borderColor: isSelected
                              ? "var(--nps-radio-selected)"
                              : "var(--nps-radio-border)",
                          }}
                        >
                          {isSelected && (
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{
                                backgroundColor: "var(--nps-radio-selected)",
                              }}
                            />
                          )}
                        </div>
                        <input
                          type="radio"
                          name={`q-${currentQ.id}`}
                          value={opt}
                          checked={isSelected}
                          onChange={(e) => setAnswer(e.target.value)}
                          className="hidden"
                        />
                        <span
                          className={`text-sm flex-1 transition-colors ${isSelected ? "font-medium" : ""}`}
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

              {currentQ.type === "multi_choice" && (
                <div className="space-y-3 mt-6">
                  {(currentQ.options || []).map((opt, i) => {
                    const isChecked = (answers[currentQ.id] || []).includes(
                      opt,
                    );
                    return (
                      <label
                        key={i}
                        className="flex items-center gap-3 p-4 rounded-xl transition-all cursor-pointer group"
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
                          className={`w-5 h-5 rounded-[4px] flex items-center justify-center transition-colors ${noBorders ? "" : "border-2"}`}
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
                            <svg
                              className="w-3.5 h-3.5"
                              style={{
                                color: "var(--nps-nps-btn-selected-text)",
                              }}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const list = answers[currentQ.id] || [];
                            if (e.target.checked) setAnswer([...list, opt]);
                            else
                              setAnswer(list.filter((x: string) => x !== opt));
                          }}
                          className="hidden"
                        />
                        <span
                          className={`text-sm flex-1 transition-colors ${isChecked ? "font-medium" : ""}`}
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

              <div
                className="flex justify-between items-center mt-8 pt-6"
                style={{
                  borderTopColor: "var(--nps-divider-footer)",
                  borderTopWidth: noBorders ? 0 : 1,
                }}
              >
                {step > 0 ? (
                  <Button
                    variant="ghost"
                    onClick={() => setStep((s) => s - 1)}
                    className="rounded-lg px-4 h-10 font-medium text-sm transition-colors"
                    style={{ color: "var(--nps-btn-back-text)" }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                  </Button>
                ) : (
                  <div />
                )}

                <Button
                  onClick={handleNext}
                  className="rounded-lg px-6 h-10 font-bold text-sm transition-colors"
                  style={{
                    backgroundColor: "var(--nps-btn-next-bg)",
                    color: "var(--nps-btn-next-text)",
                  }}
                >
                  {step === questions.length - 1 ? "Finalizar" : "Próxima"}{" "}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modal de pergunta obrigatória */}
        {showRequiredAlert && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
            style={{ backgroundColor: "var(--nps-modal-overlay)" }}
            onClick={() => setShowRequiredAlert(false)}
          >
            <div
              className="rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl"
              style={{
                backgroundColor: "var(--nps-modal-bg)",
                borderColor: "var(--nps-modal-border)",
                borderWidth: noBorders ? 0 : 1,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{
                    backgroundColor: "var(--nps-modal-icon-bg)",
                    borderColor: "var(--nps-modal-icon-border)",
                    borderWidth: noBorders ? 0 : 1,
                  }}
                >
                  <svg
                    className="w-6 h-6"
                    style={{ color: "var(--nps-modal-icon-color)" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "var(--nps-modal-title)" }}
                >
                  Pergunta obrigatória
                </h3>
                <p
                  className="text-sm mb-6"
                  style={{ color: "var(--nps-modal-subtitle)" }}
                >
                  Por favor, responda a pergunta antes de continuar.
                </p>
                <button
                  onClick={() => setShowRequiredAlert(false)}
                  className="w-full rounded-lg px-6 py-2.5 text-sm font-bold transition-colors"
                  style={{
                    backgroundColor: "var(--nps-modal-btn-bg)",
                    color: "var(--nps-modal-btn-text)",
                  }}
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </NpsBackground>
  );
}

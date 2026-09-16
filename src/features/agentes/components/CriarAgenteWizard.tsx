import { useState, useEffect } from "react";
import { X, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { useCriarAgente, useAtualizarAgente } from "../hooks/useAgentes";
import { EtapaApiConfig } from "./EtapaApiConfig";
import { EtapaModuloNome } from "./EtapaModuloNome";
import { EtapaKnowledgeBase } from "./EtapaKnowledgeBase";
import { EtapaRevisao } from "./EtapaRevisao";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { AgenteIA, WizardStep, CriarAgenteInput } from "../types";

const MODULO_KEY = "agentes-ia";

const STEPS: { key: WizardStep; label: string }[] = [
  { key: "api", label: "API" },
  { key: "modulo", label: "Modulo" },
  { key: "knowledge", label: "Base de Conhecimento" },
  { key: "revisao", label: "Revisao" },
];

interface Props {
  agenteParaEditar?: AgenteIA | null;
  onClose: () => void;
}

export function CriarAgenteWizard({ agenteParaEditar, onClose }: Props) {
  const [step, setStep] = useState<WizardStep>("api");
  const stepIdx = STEPS.findIndex((s) => s.key === step);

  const [apiUrl, setApiUrl] = useState(agenteParaEditar?.provedor_url ?? "");
  const [apiKey, setApiKey] = useState(agenteParaEditar?.provedor_api_key ?? "");
  const [modelo, setModelo] = useState(agenteParaEditar?.modelo ?? "gpt-4o");
  const [nome, setNome] = useState(agenteParaEditar?.nome ?? "");
  const [moduloKey, setModuloKey] = useState(agenteParaEditar?.modulo_key ?? "");
  const [route, setRoute] = useState(agenteParaEditar?.route ?? "");
  const [systemPrompt, setSystemPrompt] = useState(agenteParaEditar?.system_prompt ?? "");
  const [renderMode, setRenderMode] = useState<"floating" | "header_icon">(
    agenteParaEditar?.render_mode ?? "floating"
  );
  const [executionMode, setExecutionMode] = useState<"ai_provider" | "webhook">(
    agenteParaEditar?.execution_mode ?? "ai_provider"
  );
  const [webhookUrl, setWebhookUrl] = useState(agenteParaEditar?.webhook_url ?? "");
  const [agenteId, setAgenteId] = useState(agenteParaEditar?.id ?? "");
  const [redesSociais, setRedesSociais] = useState<Record<string, string>>(
    agenteParaEditar?.redes_sociais ?? {}
  );
  const [googleDriveUrl, setGoogleDriveUrl] = useState(
    agenteParaEditar?.google_drive_folder_url ?? ""
  );

  const criar = useCriarAgente();
  const atualizar = useAtualizarAgente();
  const [erro, setErro] = useState<string | null>(null);

  const isEdit = !!agenteParaEditar;
  const agenteCriado = !!agenteId;

  function canAdvance(): boolean {
    switch (step) {
      case "api":
        if (executionMode === "webhook") return webhookUrl.trim().length > 0;
        return apiUrl.trim().length > 0 && apiKey.trim().length > 0 && modelo.trim().length > 0;
      case "modulo":
        return nome.trim().length > 0 && moduloKey.length > 0 && route.length > 0;
      case "knowledge":
        return true;
      case "revisao":
        return true;
    }
  }

  async function handleNext() {
    setErro(null);
    if (step === "modulo" && !isEdit && !agenteCriado) {
      const input: CriarAgenteInput = {
        nome,
        modulo_key: moduloKey,
        route: route || undefined,
        provedor_url: apiUrl,
        provedor_api_key: apiKey,
        modelo,
        system_prompt: systemPrompt || undefined,
        render_mode: renderMode,
        execution_mode: executionMode,
        webhook_url: webhookUrl || undefined,
        redes_sociais: redesSociais,
        google_drive_folder_url: googleDriveUrl || undefined,
      };
      try {
        const novoAgente = await criar.mutateAsync(input);
        setAgenteId(novoAgente.id);
        setStep("knowledge");
      } catch (err: any) {
        const msg = err?.message || err?.error?.message || "Erro ao criar agente. Verifique os dados e tente novamente.";
        setErro(msg);
        return;
      }
    } else if (stepIdx < STEPS.length - 1) {
      setStep(STEPS[stepIdx + 1].key);
    }
  }

  function handlePrev() {
    if (stepIdx > 0) {
      setStep(STEPS[stepIdx - 1].key);
    }
  }

  async function handleCriar() {
    const input: CriarAgenteInput = {
      nome,
      modulo_key: moduloKey,
      route: route || undefined,
      provedor_url: apiUrl,
      provedor_api_key: apiKey,
      modelo,
      system_prompt: systemPrompt || undefined,
      render_mode: renderMode,
      execution_mode: executionMode,
      webhook_url: webhookUrl || undefined,
      redes_sociais: redesSociais,
      google_drive_folder_url: googleDriveUrl || undefined,
    };

    if (isEdit && agenteParaEditar) {
      atualizar.mutate(
        { id: agenteParaEditar.id, ...input },
        {
          onSuccess: () => {
            dispararEventoModulo(MODULO_KEY, "agente.editado", {
              agente_id: agenteParaEditar.id,
            }).catch(() => {});
            onClose();
          },
        }
      );
    } else {
      dispararEventoModulo(MODULO_KEY, "agente.criado", {
        agente_id: agenteId,
      }).catch(() => {});
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-[var(--color-border-subtle)] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between p-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-lg font-bold text-white">
            {isEdit ? "Editar Agente" : "Criar Agente"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="shrink-0 flex items-center justify-center gap-2 px-6 py-3 border-b border-[var(--color-border-subtle)]">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i === stepIdx
                    ? "bg-accent text-accent-fg"
                    : i < stepIdx
                      ? "bg-green-500/20 text-green-400"
                      : "bg-white/10 text-gray-500"
                }`}
              >
                {i < stepIdx ? <Check size={12} /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  i === stepIdx ? "text-white" : "text-gray-500"
                }`}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 ${i < stepIdx ? "bg-green-500/30" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
          {erro && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              {erro}
            </div>
          )}
          {step === "api" && (
            <EtapaApiConfig
              apiUrl={apiUrl}
              setApiUrl={setApiUrl}
              apiKey={apiKey}
              setApiKey={setApiKey}
              modelo={modelo}
              setModelo={setModelo}
              executionMode={executionMode}
              setExecutionMode={setExecutionMode}
              webhookUrl={webhookUrl}
              setWebhookUrl={setWebhookUrl}
            />
          )}
          {step === "modulo" && (
            <EtapaModuloNome
              nome={nome}
              setNome={setNome}
              moduloKey={moduloKey}
              setModuloKey={setModuloKey}
              route={route}
              setRoute={setRoute}
              systemPrompt={systemPrompt}
              setSystemPrompt={setSystemPrompt}
              renderMode={renderMode}
              setRenderMode={setRenderMode}
            />
          )}
          {step === "knowledge" && (
            <EtapaKnowledgeBase
              agenteId={agenteId}
              moduloKey={moduloKey}
              redesSociais={redesSociais}
              setRedesSociais={setRedesSociais}
              googleDriveUrl={googleDriveUrl}
              setGoogleDriveUrl={setGoogleDriveUrl}
            />
          )}
          {step === "revisao" && (
            <EtapaRevisao
              nome={nome}
              moduloKey={moduloKey}
              route={route}
              modelo={modelo}
              apiUrl={apiUrl}
              renderMode={renderMode}
            />
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between p-4 border-t border-[var(--color-border-subtle)]">
          <button
            onClick={stepIdx > 0 ? handlePrev : onClose}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
          >
            <ChevronLeft size={14} />
            {stepIdx > 0 ? "Anterior" : "Cancelar"}
          </button>

          {step === "revisao" ? (
            <button
              onClick={handleCriar}
              disabled={criar.isPending || atualizar.isPending}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)", color: "#0f172a" }}
            >
              {criar.isPending || atualizar.isPending ? "Salvando..." : isEdit ? "Salvar Alteracoes" : "Criar Agente"}
              <Check size={14} />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canAdvance() || criar.isPending}
              className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-xs font-black transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #c9a655, #e8d48b)", color: "#0f172a" }}
            >
              {criar.isPending ? "Criando..." : "Proximo"} <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

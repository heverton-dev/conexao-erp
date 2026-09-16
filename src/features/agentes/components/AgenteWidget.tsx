import { useState, useEffect, useRef } from "react";
import { useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, X, Send, Loader2, Bot } from "lucide-react";
import DOMPurify from "dompurify";
import { supabase } from "~/core/supabase/client";
import type { AgenteIA } from "../types";

function renderMarkdown(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // List items with •
    .replace(/^• (.+)$/gm, '<div class="flex gap-2 my-0.5"><span class="text-accent shrink-0">•</span><span>$1</span></div>')
    // Numbered lists
    .replace(/^(\d+)\. (.+)$/gm, '<div class="flex gap-2 my-0.5"><span class="text-accent font-semibold shrink-0">$1.</span><span>$2</span></div>')
    // Line breaks
    .replace(/\n/g, '<br/>');
}

async function fetchAgentesPorRota(
  route: string
): Promise<AgenteIA[]> {
  const { data, error } = await supabase
    .from("agentes_ia")
    .select("*")
    .eq("ativo", true)
    .eq("route", route);

  if (error) throw error;
  return (data ?? []) as AgenteIA[];
}

export function AgenteWidget() {
  const location = useLocation();
  const currentRoute = location.pathname;

  const { data: agentes = [] } = useQuery({
    queryKey: ["agentes-widget", currentRoute],
    queryFn: () => fetchAgentesPorRota(currentRoute),
    enabled: !!currentRoute,
    staleTime: 30_000,
  });

  if (agentes.length === 0) return null;

  return (
    <>
      {agentes.map((agente) => (
        <AgenteFloatingButton key={agente.id} agente={agente} />
      ))}
    </>
  );
}

function AgenteFloatingButton({ agente }: { agente: AgenteIA }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {agente.render_mode === "floating" ? (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent shadow-lg shadow-accent/30 flex items-center justify-center hover:scale-110 transition-transform"
          title={agente.nome}
        >
          <MessageSquare size={24} className="text-white" />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-bold hover:bg-accent/20 transition-colors"
          title={agente.nome}
        >
          <Bot size={14} />
          {agente.nome}
        </button>
      )}

      {open && (
        <AgenteChatDialog agente={agente} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function AgenteChatDialog({
  agente,
  onClose,
}: {
  agente: AgenteIA;
  onClose: () => void;
}) {
  const [mensagem, setMensagem] = useState("");
  const [historico, setHistorico] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [enviando, setEnviando] = useState(false);

  async function handleEnviar() {
    if (!mensagem.trim() || enviando) return;
    const msg = mensagem.trim();
    setMensagem("");
    setHistorico((prev) => [...prev, { role: "user", content: msg }]);
    setEnviando(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Nao autenticado");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(
        `${supabaseUrl}/functions/v1/agentes-ia-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            agente_id: agente.id,
            mensagem: msg,
            historico,
          }),
          signal: AbortSignal.timeout(60000),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Erro ${res.status}`);
      }

      const result = await res.json();
      setHistorico((prev) => [
        ...prev,
        { role: "assistant", content: result.resposta },
      ]);
    } catch (err: any) {
      setHistorico((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err?.message || "Erro ao responder. Tente novamente.",
        },
      ]);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div role="dialog" className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-6rem)] bg-[#0f172a] border border-[var(--color-border-subtle)] rounded-2xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between p-4 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
            <Bot size={18} className="text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{agente.nome}</h3>
            <span className="text-[10px] text-green-400">Online</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {historico.length === 0 && (
          <div className="text-center py-8">
            <Bot size={32} className="mx-auto text-accent/30 mb-2" />
            <p className="text-xs text-gray-400">
              Ola! Como posso ajudar?
            </p>
          </div>
        )}
        {historico.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "user" ? (
              <div className="max-w-[80%] px-3 py-2 rounded-xl text-sm bg-accent text-white">
                {msg.content}
              </div>
            ) : (
              <div className="max-w-[85%] px-3 py-2.5 rounded-xl text-sm bg-white/5 text-gray-300 border border-white/10 leading-relaxed">
                <div
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderMarkdown(msg.content), { ALLOWED_TAGS: ["strong", "em", "div", "span", "br"], ALLOWED_ATTR: ["class"] }) }}
                />
              </div>
            )}
          </div>
        ))}
        {enviando && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl">
              <div className="flex items-center gap-1">
                <span className="typing-dot w-2 h-2 rounded-full bg-accent" />
                <span className="typing-dot w-2 h-2 rounded-full bg-accent" />
                <span className="typing-dot w-2 h-2 rounded-full bg-accent" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 p-3 border-t border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEnviar()}
            placeholder="Digite sua mensagem..."
            disabled={enviando}
            className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-white/20 focus:ring-0 placeholder:text-gray-500 disabled:opacity-50 transition-colors"
          />
          <button
            onClick={handleEnviar}
            disabled={!mensagem.trim() || enviando}
            className="p-2 rounded-xl bg-accent text-white hover:bg-accent/80 transition-colors disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

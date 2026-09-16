import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Trash2, Loader2, Bot, User } from "lucide-react";
import { useEnviarMensagem, useDeletarConversas } from "../hooks/useAgentes";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { AgenteIA, ChatMessage } from "../types";

const MODULO_KEY = "agentes-ia";

interface Props {
  agente: AgenteIA;
  onVoltar: () => void;
}

export function Playground({ agente, onVoltar }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const enviar = useEnviarMensagem();
  const limpar = useDeletarConversas();

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || enviar.isPending) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    try {
      const { resposta } = await enviar.mutateAsync({
        agenteId: agente.id,
        mensagem: userMsg,
        historico: messages,
      });
      setMessages((prev) => [...prev, { role: "assistant", content: resposta }]);
      dispararEventoModulo(MODULO_KEY, "agente.testado", {
        agente_id: agente.id,
      }).catch(() => {});
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erro ao processar mensagem. Tente novamente." },
      ]);
    }
  }

  function handleLimpar() {
    setMessages([]);
    limpar.mutate(agente.id);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border p-4 flex items-center gap-3">
        <button
          onClick={onVoltar}
          className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-main transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Bot size={16} className="text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-main">{agente.nome}</h2>
            <p className="text-[10px] text-text-muted">Playground de teste</p>
          </div>
        </div>
        <button
          onClick={handleLimpar}
          className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-main transition-colors"
          title="Limpar conversa"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot size={40} className="text-text-muted mb-3" />
            <p className="text-sm text-text-muted">
              Envie uma mensagem para testar o agente
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-accent text-white"
                  : "bg-surface text-text-main"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {enviar.isPending && (
          <div className="flex justify-start">
            <div className="rounded-xl bg-surface px-3 py-2 text-sm text-text-muted flex items-center gap-2">
              <Loader2 size={12} className="animate-spin" />
              Processando...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Digite sua mensagem..."
            disabled={enviar.isPending}
            className="flex-1 px-3 py-2 rounded-lg bg-card border border-input-border text-text-main text-sm outline-none focus:border-accent/40"
          />
          <button
            onClick={handleSend}
            disabled={enviar.isPending || !input.trim()}
            className="p-2 rounded-lg bg-accent text-accent-fg hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

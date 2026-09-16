import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "~/lib/auth";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Bot, Save } from "lucide-react";
import { useState, useEffect } from "react";
import {
  fetchHubChatbotConfig,
  upsertHubChatbotConfig,
} from "../../services/chatbot";

function colorMix(c1: string, w: number, c2: string) {
  return `color-mix(in srgb, ${c1} ${w}%, ${c2})`;
}

export function AdminChatbotPage() {
  const { empresa } = useAuth();
  const queryClient = useQueryClient();
  const { data: config } = useQuery({
    queryKey: ["hub-chatbot", empresa?.id],
    queryFn: () => fetchHubChatbotConfig(),
    enabled: !!empresa?.id,
  });

  const [enabled, setEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    if (config) {
      setEnabled(config.enabled);
      setWebhookUrl(config.webhook_url || "");
    }
  }, [config]);

  const save = useMutation({
    mutationFn: () =>
      upsertHubChatbotConfig({
        empresa_id: empresa!.id,
        enabled,
        webhook_url: webhookUrl || undefined,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["hub-chatbot"] }),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1
          className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2"
          style={{ color: "var(--color-text-main)" }}
        >
          <Bot size={24} /> Chatbot
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Configuração do chatbot (exclusivo Super Admin)
        </p>
      </div>

      <div
        className="rounded-2xl p-6 border space-y-4"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: colorMix(
            "var(--color-surface)",
            40,
            "rgba(30,41,59,0.4)",
          ),
        }}
      >
        <div
          className="flex items-center justify-between py-3 px-4 rounded-xl"
          style={{ backgroundColor: "var(--color-bg)" }}
        >
          <div>
            <p
              className="font-bold"
              style={{ color: "var(--color-text-main)" }}
            >
              Chatbot Ativo
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Habilitar chatbot para usuários do Hub
            </p>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`w-14 h-8 rounded-full transition-colors relative ${enabled ? "" : "opacity-50"}`}
            style={{
              backgroundColor: enabled
                ? "var(--color-accent)"
                : "var(--color-surface)",
            }}
          >
            <div
              className="absolute top-1 w-4 h-4 rounded-full transition-transform"
              style={{
                backgroundColor: "white",
                left: enabled ? "30px" : "4px",
              }}
            />
          </button>
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-bold"
            style={{ color: "var(--color-text-main)" }}
          >
            Webhook URL (n8n)
          </label>
          <Input
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://seu-n8n.com/webhook/chatbot"
            className="h-11 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
          />
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            URL do webhook n8n para processar mensagens do chatbot.
          </p>
        </div>

        <Button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="gap-2"
        >
          <Save size={14} />{" "}
          {save.isPending ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
}

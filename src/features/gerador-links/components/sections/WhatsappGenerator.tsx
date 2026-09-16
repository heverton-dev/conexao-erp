import { useState, useMemo } from "react";
import { Copy, Check, Save, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { gerarWhatsApp } from "../../services/geradores.service";
import { useCriarLink } from "../../hooks/useLinks";
import { useTemplates } from "../../hooks/useTemplates";
import { LinkSavedDialog } from "../LinkSavedDialog";
import { useAuth, useCan } from "~/lib/auth";
import { EMPRESA_ID } from "~/config/empresa";
import { dispararEventoModulo } from "~/core/services/webhooks";

const MODULO_KEY = "gerador-links";

export function WhatsappGenerator() {
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [linkSalvoId, setLinkSalvoId] = useState<string | null>(null);

  const criarLink = useCriarLink();
  const podeSalvar = useCan("lk_salvar");
  const { data: templates } = useTemplates();
  const templatesWhats = (templates || []).filter((t) => t.tipo === "whatsapp_msg");

  const urlGerada = useMemo(() => {
    if (!telefone) return "";
    return gerarWhatsApp(telefone, mensagem || undefined);
  }, [telefone, mensagem]);

  async function handleCopiar() {
    if (!urlGerada) return;
    await navigator.clipboard.writeText(urlGerada);
    setCopiado(true);
    toast.success("URL copiada!");
    setTimeout(() => setCopiado(false), 2000);
  }

  async function handleSalvar() {
    if (!urlGerada) return;
    setSalvando(true);
    try {
      const saved = await criarLink.mutateAsync({
        tipo: "whatsapp",
        titulo: `WhatsApp ${telefone.replace(/\D/g, "").slice(-4)}`,
        url_gerada: urlGerada,
        params: { telefone, mensagem: mensagem || "" },
      });
      setLinkSalvoId(saved.id);
      dispararEventoModulo(MODULO_KEY, "link.gerado_whatsapp", { link_id: saved.id, telefone }).catch(() => {});
    } catch {
      toast.error("Erro ao salvar");
    }
    setSalvando(false);
  }

  function aplicarTemplate(conteudo: Record<string, string>) {
    if (conteudo.telefone) setTelefone(conteudo.telefone);
    if (conteudo.mensagem) setMensagem(conteudo.mensagem);
  }

  return (
    <div className="space-y-5">
      {templatesWhats.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-semibold text-text-muted self-center">Templates:</span>
          {templatesWhats.map((t) => (
            <button
              key={t.id}
              onClick={() => aplicarTemplate(t.conteudo)}
              className="rounded-lg bg-surface border border-border px-3 py-1.5 text-xs font-medium text-text-main hover:border-accent/30 transition-colors"
            >
              {t.nome}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-semibold text-text-main">Telefone (com DDD e país) *</label>
        <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="5511999999999" />
        <p className="text-xs text-text-muted">Formato: 55 + DDD + número (sem espaços ou caracteres especiais)</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-text-main">Mensagem (opcional)</label>
        <textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Olá! Tudo bem?"
          className="w-full min-h-[100px] rounded-xl bg-surface border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted resize-y"
        />
      </div>

      {urlGerada && (
        <div className="rounded-xl bg-surface border border-border p-4 space-y-3">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">URL gerada</p>
          <p className="text-sm font-mono text-text-main break-all bg-card rounded-lg p-3 border border-border/60">{urlGerada}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopiar}>
              {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiado ? "Copiado" : "Copiar"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open(urlGerada, "_blank")}>
              <ExternalLink className="w-4 h-4" /> Abrir
            </Button>
            {podeSalvar && (
              <Button size="sm" onClick={handleSalvar} disabled={salvando}>
                <Save className="w-4 h-4" /> Salvar
              </Button>
            )}
          </div>
        </div>
      )}

      {linkSalvoId && (
        <LinkSavedDialog
          linkId={linkSalvoId}
          urlOriginal={urlGerada}
          open={!!linkSalvoId}
          onOpenChange={(o) => !o && setLinkSalvoId(null)}
        />
      )}
    </div>
  );
}

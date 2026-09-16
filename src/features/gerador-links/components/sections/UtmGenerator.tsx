import { useState, useMemo } from "react";
import { Copy, Check, Save, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { gerarUtm } from "../../services/geradores.service";
import { useCriarLink } from "../../hooks/useLinks";
import { LinkSavedDialog } from "../LinkSavedDialog";
import { useAuth, useCan } from "~/lib/auth";

export function UtmGenerator() {
  const [url, setUrl] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [term, setTerm] = useState("");
  const [content, setContent] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [linkSalvoId, setLinkSalvoId] = useState<string | null>(null);

  const criarLink = useCriarLink();
  const podeSalvar = useCan("lk_salvar");

  const urlGerada = useMemo(() => {
    if (!url || !source || !medium || !campaign) return "";
    return gerarUtm({ url, utm_source: source, utm_medium: medium, utm_campaign: campaign, utm_term: term || undefined, utm_content: content || undefined });
  }, [url, source, medium, campaign, term, content]);

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
        tipo: "utm",
        titulo: `${source} / ${campaign}`,
        url_gerada: urlGerada,
        params: { url, utm_source: source, utm_medium: medium, utm_campaign: campaign, utm_term: term, utm_content: content },
      });
      setLinkSalvoId(saved.id);
    } catch {
      toast.error("Erro ao salvar");
    }
    setSalvando(false);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-text-main">URL de destino *</label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://exemplo.com/pagina" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-main">utm_source *</label>
          <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="google" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-main">utm_medium *</label>
          <Input value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="cpc" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-main">utm_campaign *</label>
          <Input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="lancamento" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-main">utm_term</label>
          <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="palavra-chave" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-text-main">utm_content</label>
          <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder="banner-topo" />
        </div>
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

import { useState, useMemo } from "react";
import { Copy, Check, Save, ExternalLink, HelpCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { gerarGoogleReview } from "../../services/geradores.service";
import { useCriarLink } from "../../hooks/useLinks";
import { LinkSavedDialog } from "../LinkSavedDialog";
import { useAuth, useCan } from "~/lib/auth";

export function GoogleReviewGenerator() {
  const [placeId, setPlaceId] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [linkSalvoId, setLinkSalvoId] = useState<string | null>(null);

  const criarLink = useCriarLink();
  const podeSalvar = useCan("lk_salvar");

  const urlGerada = useMemo(() => {
    if (!placeId) return "";
    return gerarGoogleReview(placeId);
  }, [placeId]);

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
        tipo: "google_review",
        titulo: `Avaliação Google ${placeId.slice(0, 12)}...`,
        url_gerada: urlGerada,
        params: { placeId },
      });
      setLinkSalvoId(saved.id);
    } catch {
      toast.error("Erro ao salvar");
    }
    setSalvando(false);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm text-text-muted">
          <p className="font-semibold text-text-main mb-1">Como encontrar o Place ID</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Acesse <a href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Google Place ID Finder</a></li>
            <li>Pesquise pelo nome da sua empresa</li>
            <li>Copie o Place ID exibido</li>
          </ol>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-text-main">Google Place ID *</label>
        <Input
          value={placeId}
          onChange={(e) => setPlaceId(e.target.value)}
          placeholder="ChIJN1t_tDeuEmsRU..."
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

import { useState, useMemo } from "react";
import { Copy, Check, Save, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { gerarWaze } from "../../services/geradores.service";
import { useCriarLink } from "../../hooks/useLinks";
import { LinkSavedDialog } from "../LinkSavedDialog";
import { useAuth, useCan } from "~/lib/auth";

export function WazeGenerator() {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [linkSalvoId, setLinkSalvoId] = useState<string | null>(null);

  const criarLink = useCriarLink();
  const podeSalvar = useCan("lk_salvar");

  const urlGerada = useMemo(() => {
    if (!lat || !lng) return "";
    return gerarWaze(lat, lng);
  }, [lat, lng]);

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
        tipo: "waze",
        titulo: `Waze ${lat},${lng}`,
        url_gerada: urlGerada,
        params: { lat, lng },
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
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-main">Latitude *</label>
          <Input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="-23.550520" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-main">Longitude *</label>
          <Input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="-46.633308" />
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

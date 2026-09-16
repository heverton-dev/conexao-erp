import { useState } from "react";
import { Download, Save } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { QRCodeCanvas } from "qrcode.react";
import { useCriarLink } from "../../hooks/useLinks";
import { LinkSavedDialog } from "../LinkSavedDialog";
import { useAuth, useCan } from "~/lib/auth";
import { EMPRESA_ID } from "~/config/empresa";
import { dispararEventoModulo } from "~/core/services/webhooks";

const MODULO_KEY = "gerador-links";

export function QrCodeGenerator() {
  const [url, setUrl] = useState("");
  const [tamanho, setTamanho] = useState(256);
  const [salvando, setSalvando] = useState(false);
  const [linkSalvoId, setLinkSalvoId] = useState<string | null>(null);

  const criarLink = useCriarLink();
  const podeSalvar = useCan("lk_salvar");

  function handleDownload() {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("QR Code baixado!");
  }

  async function handleSalvar() {
    if (!url) return;
    setSalvando(true);
    try {
      const saved = await criarLink.mutateAsync({
        tipo: "qrcode",
        titulo: `QR Code ${url.slice(0, 30)}`,
        url_gerada: url,
        params: { url },
      });
      setLinkSalvoId(saved.id);
      dispararEventoModulo(MODULO_KEY, "link.gerado_qrcode", { link_id: saved.id, url }).catch(() => {});
    } catch {
      toast.error("Erro ao salvar");
    }
    setSalvando(false);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-text-main">URL para o QR Code *</label>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://exemplo.com"
        />
      </div>

      {url && (
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-xl bg-white p-4 border border-border inline-block">
            <QRCodeCanvas value={url} size={tamanho} level="M" />
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <label className="text-sm text-text-muted">Tamanho:</label>
            <select
              value={tamanho}
              onChange={(e) => setTamanho(Number(e.target.value))}
              className="h-11 rounded-xl border border-border bg-input-bg px-4 text-sm text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
            >
              <option value={128}>128px</option>
              <option value={256}>256px</option>
              <option value={384}>384px</option>
              <option value={512}>512px</option>
            </select>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4" /> Download PNG
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
          urlOriginal={url}
          open={!!linkSalvoId}
          onOpenChange={(o) => !o && setLinkSalvoId(null)}
        />
      )}
    </div>
  );
}

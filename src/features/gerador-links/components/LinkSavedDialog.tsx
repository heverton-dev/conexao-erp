import { useState } from "react";
import { Copy, Check, ExternalLink, QrCode as QrIcon } from "lucide-react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { QRCodeCanvas } from "qrcode.react";

type Props = {
  linkId: string;
  urlOriginal: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LinkSavedDialog({ linkId, urlOriginal, open, onOpenChange }: Props) {
  const trackingUrl = `${window.location.origin}/r/${linkId}`;
  const [copiouTracking, setCopiouTracking] = useState(false);
  const [copiouOriginal, setCopiouOriginal] = useState(false);
  const [mostrarQr, setMostrarQr] = useState(false);

  async function copiarTracking() {
    await navigator.clipboard.writeText(trackingUrl);
    setCopiouTracking(true);
    toast.success("URL de tracking copiada!");
    setTimeout(() => setCopiouTracking(false), 2000);
  }

  async function copiarOriginal() {
    await navigator.clipboard.writeText(urlOriginal);
    setCopiouOriginal(true);
    toast.success("URL original copiada!");
    setTimeout(() => setCopiouOriginal(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <QrIcon className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>Link salvo com sucesso!</DialogTitle>
              <DialogDescription>
                Use a URL de tracking para monitorar cliques, ou compartilhe a URL original.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 flex-1 space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              URL de Tracking
            </p>
            <p className="text-xs font-mono text-accent break-all bg-surface rounded-lg p-3 border border-border/60">
              {trackingUrl}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={copiarTracking}>
                {copiouTracking ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiouTracking ? "Copiado" : "Copiar"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(trackingUrl, "_blank")}>
                <ExternalLink className="w-4 h-4" /> Testar
              </Button>
              <Button variant="outline" size="sm" onClick={() => setMostrarQr(!mostrarQr)}>
                <QrIcon className="w-4 h-4" /> QR Code
              </Button>
            </div>
            {mostrarQr && (
              <div className="flex justify-center pt-2">
                <div className="rounded-xl bg-white p-3 border border-border inline-block">
                  <QRCodeCanvas value={trackingUrl} size={160} level="M" />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              URL Original
            </p>
            <p className="text-xs font-mono text-text-main break-all bg-surface rounded-lg p-3 border border-border/60">
              {urlOriginal}
            </p>
            <Button variant="outline" size="sm" onClick={copiarOriginal}>
              {copiouOriginal ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiouOriginal ? "Copiado" : "Copiar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

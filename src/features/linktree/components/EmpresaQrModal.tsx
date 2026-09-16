import { QRCodeCanvas } from "qrcode.react";
import { Download, Link2, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { buildEmpresaLinktreeUrl } from "../services/empresa";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
}

export function EmpresaQrModal({ open, onOpenChange, slug }: Props) {
  const url = buildEmpresaLinktreeUrl(slug);

  function handleDownload() {
    const canvas =
      document.querySelector<HTMLCanvasElement>("#empresa-qr-canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `qrcode-${slug}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>QR Code do Linktree</DialogTitle>
              <DialogDescription>Compartilhe o QR Code do linktree da empresa</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 flex-1 space-y-4 flex flex-col items-center">
          <div className="rounded-xl bg-white p-4">
            <QRCodeCanvas
              id="empresa-qr-canvas"
              value={url}
              size={200}
              marginSize={2}
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link2 className="size-4" />
            <span className="font-mono">{url}</span>
          </div>

          <Button onClick={handleDownload} className="w-full">
            <Download className="size-4" />
            Baixar PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

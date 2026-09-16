import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Download, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { buildCardUrl } from "~/features/linktree/index";
import type { LinktreeColaborador } from "~/features/linktree/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  collaborator: LinktreeColaborador | null;
}

export function LinktreeQrModal({ open, onOpenChange, collaborator }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas || !collaborator) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qrcode-${collaborator.nome.toLowerCase().replace(/\s+/g, "-")}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>QR Code — {collaborator?.nome}</DialogTitle>
              <DialogDescription>Compartilhe este QR Code do colaborador</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="px-6 py-6 flex-1 space-y-4 flex flex-col items-center">
          {collaborator && (
            <div className="rounded-lg bg-white p-3">
              <QRCodeCanvas
                ref={canvasRef}
                value={buildCardUrl(collaborator.id)}
                size={256}
                marginSize={2}
                fgColor="#0f172a"
                bgColor="#ffffff"
                level="H"
              />
            </div>
          )}
          {collaborator && (
            <p className="break-all text-center text-xs text-muted-foreground">
              {buildCardUrl(collaborator.id)}
            </p>
          )}
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={!collaborator}
          >
            <Download className="size-4" /> Baixar PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

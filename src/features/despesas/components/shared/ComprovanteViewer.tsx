import { ExternalLink, Image as ImageIcon } from "lucide-react";

export function ComprovanteViewer({
  url,
  tipo,
}: {
  url: string;
  tipo: string;
}) {
  if (!url) {
    return (
      <div className="flex items-center gap-2 text-text-muted text-sm">
        <ImageIcon size={16} />
        <span>Sem comprovante</span>
      </div>
    );
  }

  const isImage = tipo === "upload" && /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

  if (isImage) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <img
          src={url}
          alt="Comprovante"
          className="max-w-full max-h-48 rounded-lg border border-border object-contain group-hover:border-accent transition-colors"
        />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-accent hover:text-accent/80 text-sm transition-colors"
    >
      <ExternalLink size={16} />
      <span>Ver comprovante</span>
    </a>
  );
}

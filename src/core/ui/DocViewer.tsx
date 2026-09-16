import { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export type CoreDocumento = {
  id: string;
  tipo: string;
  url: string;
  status: string;
};

type DocViewerProps = {
  docs: CoreDocumento[];
  open: boolean;
  initialIdx?: number;
  onClose: () => void;
  getTipoLabel?: (tipo: string) => string;
};

export function DocViewer({
  docs,
  open,
  initialIdx = 0,
  onClose,
  getTipoLabel,
}: DocViewerProps) {
  const [idx, setIdx] = useState(initialIdx);

  if (!open) return null;
  const doc = docs[idx];
  if (!doc) return null;

  const isImage = /\.(png|jpe?g|webp)$/i.test(doc.url);
  const label = getTipoLabel ? getTipoLabel(doc.tipo) : doc.tipo;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/90"
      onClick={onClose}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="text-white/70 hover:text-white">
          <X size={22} />
        </button>
        <span className="text-xs text-white/60">{label}</span>
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/70 hover:text-white"
        >
          <Download size={20} />
        </a>
      </div>

      <div
        className="flex flex-1 items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {isImage ? (
          <img
            src={doc.url}
            alt={doc.tipo}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        ) : (
          <iframe
            src={doc.url}
            className="h-full w-full rounded-lg"
            title={doc.tipo}
          />
        )}
      </div>

      {docs.length > 1 && (
        <div
          className="flex items-center justify-center gap-4 px-4 py-4"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="text-white/70 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-xs text-white/60">
            {idx + 1} / {docs.length}
          </span>
          <button
            onClick={() => setIdx((i) => Math.min(docs.length - 1, i + 1))}
            disabled={idx === docs.length - 1}
            className="text-white/70 hover:text-white disabled:opacity-30"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
}

type DocListProps = {
  docs: CoreDocumento[];
  podeVisualizar?: boolean;
  podeAcao?: boolean;
  onAprovar?: (id: string) => void;
  onReprovar?: (id: string, motivo: string) => void;
  onCorrigir?: (id: string, comentario: string) => void;
  onRefresh?: () => void;
  getTipoLabel?: (tipo: string) => string;
  getStatusLabel?: (status: string) => string;
  getStatusColor?: (status: string) => string;
};

const STATUS_DOC_ICON: Record<string, typeof CheckCircle> = {
  ok: CheckCircle,
  reprovado: XCircle,
  em_correcao: AlertTriangle,
  pendente: AlertTriangle,
};

export function DocList({
  docs,
  podeVisualizar = false,
  podeAcao = false,
  onAprovar,
  onReprovar,
  onCorrigir,
  onRefresh,
  getTipoLabel,
  getStatusLabel,
  getStatusColor,
}: DocListProps) {
  const [viewerIdx, setViewerIdx] = useState(0);
  const [showViewer, setShowViewer] = useState(false);
  const [actionDocId, setActionDocId] = useState<string | null>(null);
  const [actionTipo, setActionTipo] = useState<
    "aprovar" | "reprovar" | "corrigir" | null
  >(null);
  const [actionMotivo, setActionMotivo] = useState("");
  const [revisandoDocs, setRevisandoDocs] = useState<Record<string, boolean>>(
    {},
  );

  if (docs.length === 0)
    return <p className="text-sm text-text-muted">Nenhum documento anexado</p>;

  function handleAction(docId: string) {
    if (actionTipo === "aprovar") {
      onAprovar?.(docId);
    } else if (actionTipo === "reprovar") {
      onReprovar?.(docId, actionMotivo);
    } else if (actionTipo === "corrigir") {
      onCorrigir?.(docId, actionMotivo);
    }
    setRevisandoDocs((prev) => ({ ...prev, [docId]: false }));
    setActionDocId(null);
    setActionTipo(null);
    setActionMotivo("");
    onRefresh?.();
  }

  const tipoLabel = getTipoLabel || ((t: string) => t);
  const statusLabel = getStatusLabel || ((s: string) => s);
  const statusColor = getStatusColor || (() => "text-text-muted");

  return (
    <>
      <div className="flex flex-col gap-2">
        {docs.map((d, i) => {
          const Icon = STATUS_DOC_ICON[d.status] || FileText;
          return (
            <div
              key={d.id}
              className={`flex items-center gap-3 rounded-lg bg-input-bg p-3 transition ${podeAcao || podeVisualizar ? "cursor-pointer hover:bg-white/5" : ""}`}
              onClick={() => {
                if (podeAcao || podeVisualizar) {
                  setViewerIdx(i);
                  setShowViewer(true);
                }
              }}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/10">
                <FileText size={16} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-main truncate">
                  {tipoLabel(d.tipo)}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {!revisandoDocs[d.id] && (
                    <>
                      <Icon
                        size={11}
                        className={
                          statusColor(d.status).split(" ")[1] ||
                          "text-text-muted"
                        }
                      />
                      <span
                        className={`text-[10px] font-medium ${statusColor(d.status)}`}
                      >
                        {statusLabel(d.status)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              {podeAcao && (
                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {d.status !== "pendente" && !revisandoDocs[d.id] ? (
                    <button
                      onClick={() =>
                        setRevisandoDocs((prev) => ({ ...prev, [d.id]: true }))
                      }
                      className="rounded-lg px-2 py-1 text-[10px] font-medium text-accent hover:bg-accent/10 transition border border-accent/20"
                    >
                      Revisar
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setActionDocId(d.id);
                          setActionTipo("aprovar");
                          setActionMotivo("");
                        }}
                        className="rounded-lg p-1.5 text-green-400 hover:bg-green-500/10 transition"
                        title="Aprovar"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setActionDocId(d.id);
                          setActionTipo("reprovar");
                          setActionMotivo("");
                        }}
                        className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10 transition"
                        title="Reprovar"
                      >
                        <XCircle size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setActionDocId(d.id);
                          setActionTipo("corrigir");
                          setActionMotivo("");
                        }}
                        className="rounded-lg p-1.5 text-orange-400 hover:bg-orange-500/10 transition"
                        title="Solicitar Correção"
                      >
                        <AlertTriangle size={16} />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <DocViewer
        docs={docs}
        open={showViewer}
        initialIdx={viewerIdx}
        onClose={() => setShowViewer(false)}
        getTipoLabel={getTipoLabel}
      />

      {actionDocId && actionTipo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            <h2 className="text-base font-bold text-text-main mb-2">
              {actionTipo === "aprovar"
                ? "Aprovar Documento"
                : actionTipo === "reprovar"
                  ? "Reprovar Documento"
                  : "Solicitar Correção"}
            </h2>
            <p className="text-xs text-text-muted mb-4">
              {actionTipo === "aprovar"
                ? "Confirma a aprovação deste documento?"
                : actionTipo === "reprovar"
                  ? "Descreva o motivo da reprovação:"
                  : "Descreva o que precisa ser corrigido:"}
            </p>
            {actionTipo !== "aprovar" && (
              <textarea
                value={actionMotivo}
                onChange={(e) => setActionMotivo(e.target.value)}
                rows={3}
                placeholder="Motivo..."
                autoFocus
                className="mb-4 w-full rounded-lg border border-input-border bg-input-bg px-4 py-3 text-sm text-text-main outline-none focus:border-accent resize-none min-h-[80px]"
              />
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setActionDocId(null);
                  setActionTipo(null);
                  setActionMotivo("");
                }}
                className="flex-1 rounded-xl border border-input-border py-3 text-sm font-medium text-text-muted"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleAction(actionDocId!)}
                disabled={actionTipo !== "aprovar" && !actionMotivo.trim()}
                className={`flex-1 rounded-xl py-3 text-sm font-medium text-white disabled:opacity-50 ${
                  actionTipo === "aprovar"
                    ? "bg-green-600"
                    : actionTipo === "reprovar"
                      ? "bg-red-600"
                      : "bg-orange-600"
                }`}
              >
                {actionTipo === "aprovar"
                  ? "Aprovar"
                  : actionTipo === "reprovar"
                    ? "Reprovar"
                    : "Solicitar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

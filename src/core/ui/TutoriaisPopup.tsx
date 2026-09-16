import { useState } from "react";
import { X, Play, BookOpen, ChevronRight } from "lucide-react";

type Tutorial = {
  id: string;
  title: string;
  desc: string;
  url?: string;
};

const TUTORIAIS: Tutorial[] = [
  {
    id: "gerar-link",
    title: "Como gerar um link de cadastro",
    desc: "Aprenda a criar e compartilhar links de pré-cadastro com seus clientes.",
    url: "#",
  },
  {
    id: "analisar-cadastro",
    title: "Como analisar um cadastro",
    desc: "Veja como revisar documentos e aprovar ou solicitar correções.",
    url: "#",
  },
  {
    id: "credenciais",
    title: "Gerenciar credenciais da equipe",
    desc: "Saiba como adicionar e gerenciar usuários do sistema.",
    url: "#",
  },
  {
    id: "relatorios",
    title: "Exportar relatórios",
    desc: "Aprenda a gerar relatórios em PDF do sistema.",
    url: "#",
  },
  {
    id: "pre-cadastro",
    title: "Fluxo de pré-cadastro",
    desc: "Entenda o passo a passo que o cliente percorre no pré-cadastro.",
    url: "#",
  },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export function TutoriaisPopup({ open, onClose }: Props) {
  const [selected, setSelected] = useState<Tutorial | null>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-accent" />
            <h2 className="text-base font-bold text-text-main">Tutoriais</h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-main"
          >
            <X size={20} />
          </button>
        </div>

        {selected ? (
          <div>
            <button
              onClick={() => setSelected(null)}
              className="mb-3 text-xs text-accent hover:underline"
            >
              &larr; Voltar
            </button>
            <h3 className="mb-2 text-sm font-bold text-text-main">
              {selected.title}
            </h3>
            <p className="mb-4 text-xs text-text-muted">{selected.desc}</p>
            {selected.url && (
              <a
                href={selected.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-medium text-white"
              >
                <Play size={16} /> Assistir Tutorial
              </a>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {TUTORIAIS.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
                className="flex items-center gap-3 rounded-lg bg-input-bg p-3 text-left transition active:scale-[0.98]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                  <Play size={14} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-main">
                    {t.title}
                  </p>
                  <p className="text-xs text-text-muted truncate">{t.desc}</p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-text-muted" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

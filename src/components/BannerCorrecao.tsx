import { AlertTriangle } from "lucide-react";

type BannerCorrecaoProps = {
  comentarioGeral?: string | null;
};

export function BannerCorrecao({ comentarioGeral }: BannerCorrecaoProps) {
  return (
    <div className="mb-6 rounded-2xl bg-orange-500/10 border border-orange-500/25 p-5 text-orange-400 shadow-lg shadow-orange-500/5 animate-fade-in">
      <div className="flex items-start gap-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
          <AlertTriangle size={20} className="animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-orange-400 leading-none mb-1">
            Ajustes Necessários no seu Cadastro
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Alguns dados ou documentos enviados anteriormente precisam de
            correção para prosseguirmos com a sua aprovação. Por favor, revise
            os campos destacados em{" "}
            <span className="text-orange-400 font-semibold">laranja</span>{" "}
            abaixo.
          </p>
          {comentarioGeral && (
            <div className="mt-3.5 rounded-xl bg-orange-950/20 border border-orange-500/15 p-3 text-xs text-orange-300/90 leading-relaxed font-mono">
              <span className="font-bold text-xs uppercase tracking-wider block mb-1 text-orange-400">
                Mensagem da Equipe de Cadastro:
              </span>
              {comentarioGeral}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

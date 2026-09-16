import { Bot, Globe, Cpu, Layers, MessageSquare, FileText, Database } from "lucide-react";


const MODULO_LABELS: Record<string, string> = {
  cadastros: "Cadastros",
  nps: "NPS",
  hub: "Hub",
  crm: "CRM",
  funis: "Funis",
  despesas: "Despesas",
  rotas: "Rotas",
  linktree: "LinkTree",
  "mapas-interativos": "Mapas",
  "gerador-links": "Links",
  catalogo: "Catalogo",
  marketing: "Marketing",
  "empresas-core": "Empresa",
};

interface Props {
  nome: string;
  moduloKey: string;
  route: string;
  modelo: string;
  apiUrl: string;
  renderMode: "floating" | "header_icon";
}

export function EtapaRevisao({ nome, moduloKey, route, modelo, apiUrl, renderMode }: Props) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
          <Check size={24} className="h-6 w-6 text-accent" />
        </div>
        <h3 className="text-lg font-bold text-white">Revisao Final</h3>
        <p className="text-sm text-gray-400">
          Confirme as configuracoes antes de criar
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl bg-card border border-border-subtle p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Bot size={20} className="text-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-text-main">{nome || "Sem nome"}</h4>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                {(MODULO_LABELS[moduloKey] ?? moduloKey) || "Nenhum"}
              </span>
              {route && (
                <span className="text-[10px] text-text-muted mt-1 block">
                  Rota: {route}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-card border border-border-subtle p-3">
            <div className="flex items-center gap-2 mb-1">
              <Globe size={12} className="text-text-muted" />
              <span className="text-[10px] font-bold text-text-muted uppercase">API</span>
            </div>
            <p className="text-xs text-text-main font-mono truncate">
              {apiUrl || "Nao configurado"}
            </p>
          </div>

          <div className="rounded-xl bg-card border border-border-subtle p-3">
            <div className="flex items-center gap-2 mb-1">
              <Cpu size={12} className="text-text-muted" />
              <span className="text-[10px] font-bold text-text-muted uppercase">Modelo</span>
            </div>
            <p className="text-xs text-text-main font-mono">{modelo}</p>
          </div>

          <div className="rounded-xl bg-card border border-border-subtle p-3">
            <div className="flex items-center gap-2 mb-1">
              {renderMode === "floating" ? (
                <MessageSquare size={12} className="text-text-muted" />
              ) : (
                <Layers size={12} className="text-text-muted" />
              )}
              <span className="text-[10px] font-bold text-text-muted uppercase">Render</span>
            </div>
            <p className="text-xs text-text-main">
              {renderMode === "floating" ? "Botao Flutuante" : "Icone no Header"}
            </p>
          </div>

          <div className="rounded-xl bg-card border border-border-subtle p-3">
            <div className="flex items-center gap-2 mb-1">
              <Database size={12} className="text-text-muted" />
              <span className="text-[10px] font-bold text-text-muted uppercase">Modulo</span>
            </div>
            <p className="text-xs text-text-main">
              {(MODULO_LABELS[moduloKey] ?? moduloKey) || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Check({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

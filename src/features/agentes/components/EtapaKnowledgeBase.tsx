import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Trash2,
  Loader2,
  Database,
  Check,
  X,
  Globe,
  FolderOpen,
  Infinity as InfinityIcon,
} from "lucide-react";
import { useAuth } from "~/lib/auth";
import {
  useKnowledgeDocs,
  useUploadKnowledgeDoc,
  useDeletarKnowledgeDoc,
  useKnowledgeTabelas,
  useToggleTabela,
  useAtualizarAgente,
} from "../hooks/useAgentes";
import { getLimitesUsuario, isTableAllowed } from "../security";

const ACCEPTED_TYPES = ".txt,.json,.html,.htm,.csv,.pdf";

const REDES_SOCIAIS = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/..." },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/..." },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/..." },
  { key: "site", label: "Site", placeholder: "https://..." },
];

// Tabelas conhecidas por modulo (apenas seguras)
const TABELAS_POR_MODULO: Record<string, string[]> = {
  cadastros: ["cadastros", "cadastros_pf", "cadastros_pj", "cadastros_enderecos"],
  nps: ["nps_perguntas", "nps_respostas"],
  hub: ["hub_materials", "hub_collections", "hub_badges", "hub_user_progress"],
  crm: ["clientes", "pipeline_estagios", "tarefas", "visitas"],
  funis: ["funis", "funis_colunas", "funis_templates", "funis_tarefas"],
  despesas: ["despesas", "despesas_tipos", "despesas_periodos"],
  rotas: ["rotas", "rotas_clientes", "rotas_config", "rotas_visitas"],
  linktree: ["linktree_empresa_config", "linktree_empresa_links"],
  "mapas-interativos": ["mapas_distributors", "mapas_consultants"],
  "gerador-links": ["gerador_links", "gerador_templates"],
  catalogo: [
    "catalogo_implantes",
    "catalogo_categorias",
    "catalogo_familias",
    "catalogo_linhas",
    "catalogo_kits",
    "catalogo_acessorios",
    "catalogo_conexoes",
    "catalogo_abutments",
  ],
  marketing: ["mktg_campanhas_email", "mktg_leads", "mktg_criativos", "mktg_landing_pages"],
};

// Tabelas globais disponíveis apenas para Super Admin
const TABELAS_GLOBAIS = [
  "empresas",
  "empresa_modulos",
  "cadastros",
  "nps_perguntas",
  "nps_respostas",
  "hub_materiais",
  "hub_trilhas",
  "catalogo_produtos",
  "catalogo_categorias",
];

interface Props {
  agenteId: string;
  moduloKey: string;
  redesSociais: Record<string, string>;
  setRedesSociais: (v: Record<string, string>) => void;
  googleDriveUrl: string;
  setGoogleDriveUrl: (v: string) => void;
}

export function EtapaKnowledgeBase({
  agenteId,
  moduloKey,
  redesSociais,
  setRedesSociais,
  googleDriveUrl,
  setGoogleDriveUrl,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { profile } = useAuth();
  const isSuperAdmin = profile?.is_super_admin === true;
  const limites = getLimitesUsuario(isSuperAdmin);

  const { data: docs = [] } = useKnowledgeDocs(agenteId || undefined);
  const { data: tabelas = [] } = useKnowledgeTabelas(agenteId || undefined);
  const uploadDoc = useUploadKnowledgeDoc();
  const deletarDoc = useDeletarKnowledgeDoc();
  const toggleTabela = useToggleTabela();
  const atualizar = useAtualizarAgente();

  // Tabelas disponíveis: módulo + globais (se super admin), filtradas pela blocklist
  const tabelasModulo = (TABELAS_POR_MODULO[moduloKey] ?? [])
    .filter(isTableAllowed);
  const tabelasDisponiveis = isSuperAdmin
    ? [...new Set([...tabelasModulo, ...TABELAS_GLOBAIS])].filter(isTableAllowed)
    : tabelasModulo;

  const maxArquivos = limites.maxArquivos === Infinity ? null : limites.maxArquivos;
  const isLimitReached = maxArquivos !== null && docs.length >= maxArquivos;

  function handleRedeSocialChange(key: string, value: string) {
    const updated = { ...redesSociais, [key]: value };
    setRedesSociais(updated);
    if (agenteId) {
      atualizar.mutate({ id: agenteId, redes_sociais: updated });
    }
  }

  function handleGoogleDriveChange(value: string) {
    setGoogleDriveUrl(value);
    if (agenteId) {
      atualizar.mutate({ id: agenteId, google_drive_folder_url: value || undefined });
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploading(true);

    const filesArray = Array.from(files);
    const filesToSend = maxArquivos !== null
      ? filesArray.slice(0, maxArquivos - docs.length)
      : filesArray;

    if (maxArquivos !== null && filesToSend.length < filesArray.length) {
      setUploadError(`Apenas ${maxArquivos - docs.length} arquivo(s) restante(s). Limite: ${maxArquivos}`);
    }

    for (const file of filesToSend) {
      const maxSize = limites.maxTamanhoArquivo;
      if (maxSize !== Infinity && file.size > maxSize) {
        const limitMB = Math.round(maxSize / (1024 * 1024));
        setUploadError(`${file.name} excede o limite de ${limitMB}MB`);
        continue;
      }

      try {
        await uploadDoc.mutateAsync({ agenteId: agenteId || "pending", file });
      } catch (err) {
        setUploadError(`Erro ao enviar ${file.name}`);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
          <Database className="h-6 w-6 text-accent" />
        </div>
        <h3 className="text-lg font-bold text-white">Base de Conhecimento</h3>
        <p className="text-sm text-gray-400">
          Adicione documentos, redes sociais e tabelas do modulo
        </p>
        {isSuperAdmin && (
          <p className="text-[10px] text-accent mt-1">
            Modo Super Admin: sem limites de arquivos ou tamanho
          </p>
        )}
      </div>

      {/* Redes Sociais */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
          <Globe size={12} />
          Redes Sociais (opcional)
        </h4>
        <p className="text-[10px] text-text-muted">
          Links publicos para o agente usar como referencia
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {REDES_SOCIAIS.map((rede) => (
            <div key={rede.key} className="flex items-center gap-2">
              <span className="text-[10px] text-text-muted w-16 shrink-0">{rede.label}</span>
              <input
                type="url"
                value={redesSociais[rede.key] ?? ""}
                onChange={(e) => handleRedeSocialChange(rede.key, e.target.value)}
                placeholder={rede.placeholder}
                className="flex-1 px-2 py-1.5 rounded-lg bg-card border border-input-border text-text-main text-xs outline-none focus:border-accent/40"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Google Drive */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
          <FolderOpen size={12} />
          Google Drive (opcional)
        </h4>
        <p className="text-[10px] text-text-muted">
          Cole o link compartilhavel da pasta do Google Drive
        </p>
        <input
          type="url"
          value={googleDriveUrl}
          onChange={(e) => handleGoogleDriveChange(e.target.value)}
          placeholder="https://drive.google.com/drive/folders/..."
          className="w-full px-3 py-2 rounded-lg bg-card border border-input-border text-text-main text-sm outline-none focus:border-accent/40"
        />
      </div>

      {/* Upload de documentos */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
          Documentos
        </h4>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || !agenteId || isLimitReached}
          className="w-full p-4 rounded-xl border-2 border-dashed border-border-subtle hover:border-accent/50 transition-colors flex flex-col items-center gap-2 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 size={20} className="animate-spin text-accent" />
          ) : isLimitReached ? (
            <InfinityIcon size={20} className="text-accent" />
          ) : (
            <Upload size={20} className="text-text-muted" />
          )}
          <span className="text-xs text-text-muted">
            {uploading
              ? "Enviando..."
              : isLimitReached
                ? "Limite atingido"
                : "Clique para enviar arquivos (TXT, JSON, HTML, CSV, PDF)"}
          </span>
          <span className="text-[10px] text-text-muted/60">
            {maxArquivos !== null
              ? `${docs.length}/${maxArquivos} arquivos · ${Math.round(limites.maxTamanhoArquivo / (1024 * 1024))}MB por arquivo`
              : `${docs.length} arquivos · sem limite de tamanho`}
          </span>
        </button>

        {uploadError && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <X size={12} /> {uploadError}
          </p>
        )}

        {docs.length > 0 && (
          <div className="space-y-1.5">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-2 rounded-lg bg-card border border-border-subtle"
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-accent" />
                  <div>
                    <p className="text-xs text-text-main">{doc.nome_arquivo}</p>
                    <p className="text-[10px] text-text-muted">
                      {doc.tipo.toUpperCase()} · {formatBytes(doc.tamanho_bytes)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deletarDoc.mutate({ id: doc.id, agenteId })}
                  className="p-1 rounded hover:bg-destructive/10 text-text-muted hover:text-destructive transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabelas do modulo */}
      {tabelasDisponiveis.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Tabelas do Modulo
          </h4>
          <p className="text-[10px] text-text-muted">
            Selecione as tabelas que o agente deve conhecer
            {isSuperAdmin && " (Super Admin: acesso global)"}
          </p>
          <div className="space-y-1.5">
            {tabelasDisponiveis.map((tabelaNome) => {
              const tabela = tabelas.find((t) => t.tabela_nome === tabelaNome);
              const incluida = tabela?.incluida ?? false;

              return (
                <button
                  key={tabelaNome}
                  onClick={() => {
                    if (agenteId) {
                      toggleTabela.mutate({
                        agenteId,
                        tabelaNome,
                        incluida: !incluida,
                      });
                    }
                  }}
                  disabled={!agenteId}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all disabled:opacity-50 ${
                    incluida
                      ? "border-accent/30 bg-accent/5"
                      : "border-border-subtle hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Database size={14} className={incluida ? "text-accent" : "text-text-muted"} />
                    <span className="text-xs text-text-main font-mono">{tabelaNome}</span>
                  </div>
                  {incluida && <Check size={14} className="text-accent" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!agenteId && (
        <p className="text-xs text-yellow-400/80 text-center">
          Salve o agente primeiro para poder adicionar documentos e tabelas
        </p>
      )}
    </div>
  );
}

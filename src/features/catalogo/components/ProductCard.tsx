import React from 'react';
import { ArrowRight, Box } from 'lucide-react';
import '../styles/theme.css';
import { CATALOGO_TIPO_LABEL, type ProductSheetTipo } from '../types';
import { useCatalogoConfig } from '../hooks/useCatalogo';
import { EstoqueBadge } from './admin/produtos/EstoqueBadge';

interface Props {
  sku: string;
  nome: string;
  corIdentificacao: string;
  tipo: string;
  /** Rótulo específico da categoria (ex: nome do tipo de kit/abutment/família). Se omitido, cai no rótulo genérico do tipo. */
  badge?: string;
  imageUrl?: string;
  onClick?: () => void;
  qtdDisponivel?: number | null;
  qtdMinimaAviso?: number | null;
}

export function ProductCard({ sku, nome, corIdentificacao, tipo, badge, imageUrl, onClick, qtdDisponivel, qtdMinimaAviso }: Props) {
  const cor = corIdentificacao || '#c9a655';
  const badgeLabel = badge || CATALOGO_TIPO_LABEL[tipo as ProductSheetTipo] || tipo;
const { data: config } = useCatalogoConfig();
  const exibirEstoque = config?.exibir_estoque ?? true;

  return (
    <div
      className="group relative h-full rounded-2xl bg-[var(--color-surface)]/50 backdrop-blur-md border border-[var(--color-border-subtle)] transition-all duration-300 overflow-hidden p-5 min-h-[88px] hover:border-[var(--card-color,var(--color-accent))]/40 cursor-pointer"
      style={{ "--card-color": cor, borderWidth: "0.5px" } as React.CSSProperties}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.() } : undefined}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at top left, ${cor}10 0%, transparent 70%)` }}
      />

      <div className="flex items-center gap-4 relative z-10">
        <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-[var(--color-surface)] to-[#0f172a] border border-[var(--color-border-subtle)] flex items-center justify-center">
          {imageUrl ? (
            <img src={imageUrl} alt={nome} className="w-full h-full object-contain p-2" loading="lazy" decoding="async" draggable={false} />
          ) : (
            <Box className="w-6 h-6 opacity-30" style={{ color: cor }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white leading-tight mb-1 transition-colors line-clamp-1 group-hover:text-[var(--card-color,var(--color-accent))]">
            {nome}
          </h3>
          <p className="text-[10px] font-mono text-[var(--color-text-muted)] tracking-widest truncate mb-1.5">
            SKU: {sku}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border"
              style={{ color: cor, borderColor: `${cor}40`, backgroundColor: `${cor}10` }}
            >
              {badgeLabel}
            </span>
            <EstoqueBadge qtdDisponivel={qtdDisponivel} qtdMinimaAviso={qtdMinimaAviso} compacto exibirEstoque={exibirEstoque} />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
           <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
}

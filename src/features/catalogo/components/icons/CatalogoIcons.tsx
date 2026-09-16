/**
 * Ícones customizados para o catálogo odontológico.
 * Cada ícone é um SVG React component em tamanho 24×24.
 * Mantém stroke-width 1.5 e cores herdadas do pai (currentColor).
 */
import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement>

/** Ficha técnica — dente com prancheta */
export function IconFicha(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Dente */}
      <path d="M12 2C9.5 2 7.5 3.5 7 5.5C6.5 7.5 5 8.5 4 10C3 11.5 3 14 4.5 16C5.5 17.5 6.5 18.5 7.5 20C8 21 9 22 9.5 22C10 22 10.5 21 11 20C11.3 19.4 11.6 19 12 19C12.4 19 12.7 19.4 13 20C13.5 21 14 22 14.5 22C15 22 16 21 16.5 20C17.5 18.5 18.5 17.5 19.5 16C21 14 21 11.5 20 10C19 8.5 17.5 7.5 17 5.5C16.5 3.5 14.5 2 12 2Z" />
      {/* Linhas da ficha */}
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="10" x2="14" y2="10" />
      <line x1="8" y1="13" x2="12" y2="13" />
    </svg>
  )
}

/** Protocolos — dente com seta de procedimento/cronograma */
export function IconProtocolo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Linha do tempo vertical */}
      <line x1="5" y1="3" x2="5" y2="21" />
      {/* Etapas */}
      <circle cx="5" cy="5" r="1.5" fill="currentColor" />
      <line x1="8" y1="5" x2="14" y2="5" />
      <circle cx="5" cy="12" r="1.5" fill="currentColor" />
      <line x1="8" y1="12" x2="17" y2="12" />
      <circle cx="5" cy="19" r="1.5" fill="currentColor" />
      <line x1="8" y1="19" x2="12" y2="19" />
      {/* Dente mini */}
      <path d="M18 16C17 16 16.3 16.7 16 17.5C15.7 18.3 15 18.8 14.5 19.5C14 20.2 14 21 14.5 21.5C14.8 21.8 15.2 22 15.5 22C15.8 22 16 21.8 16.2 21.5C16.4 21.1 16.6 20.8 17 20.8C17.4 20.8 17.6 21.1 17.8 21.5C18 21.8 18.2 22 18.5 22C18.8 22 19.2 21.5 19.5 20.5C20 19 20 17.5 19.5 16.5C19.2 16 18.6 16 18 16Z" />
    </svg>
  )
}

/** Chaves — chave de fenda/retentor dental */
export function IconChave(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Cabo da chave */}
      <line x1="3" y1="21" x2="8" y2="16" />
      {/* Corpo da chave */}
      <line x1="8" y1="16" x2="18" y2="6" />
      {/* Ponta — dupla */}
      <line x1="16" y1="4" x2="20" y2="8" />
      <line x1="20" y1="4" x2="16" y2="8" />
      {/* Anel na base */}
      <circle cx="4" cy="20" r="1" fill="currentColor" />
    </svg>
  )
}

/** Kits — caixa com instrumentos dentários */
export function IconKit(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Caixa base */}
      <rect x="3" y="10" width="18" height="11" rx="2" />
      {/* Alça */}
      <path d="M8 10V7C8 5.3 9.8 4 12 4C14.2 4 16 5.3 16 7V10" />
      {/* Instrumentos internos */}
      <line x1="8" y1="15" x2="8" y2="17" />
      <line x1="12" y1="14" x2="12" y2="18" />
      <line x1="16" y1="15" x2="16" y2="17" />
    </svg>
  )
}

/** Cicatrizadores — gengiva com processo de cicatrização */
export function IconCicatrizador(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Corpo do cicatrizador */}
      <rect x="9" y="3" width="6" height="8" rx="3" />
      {/* Base larga (flange) */}
      <rect x="7" y="11" width="10" height="2" rx="1" />
      {/* Gengiva / tecido */}
      <path d="M4 17C4 17 7 14 12 14C17 14 20 17 20 17" />
      <path d="M4 17C4 17 5 20 8 20C11 20 12 17 12 17" />
      <path d="M12 17C12 17 13 20 16 20C19 20 20 17 20 17" />
      {/* Setas de cicatrização */}
      <path d="M6 22L7 21L8 22" />
      <path d="M16 22L17 21L18 22" />
    </svg>
  )
}

/** Abutments — conexão implante-abutment */
export function IconAbutment(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Parte superior (abutment) */}
      <path d="M10 3L14 3L13 10L11 10Z" />
      {/* Conexão hexagonal */}
      <rect x="10" y="10" width="4" height="3" rx="0.5" />
      {/* Implante (rosca) */}
      <path d="M11 13L10.5 14L11.5 15L10.5 16L11.5 17L10.5 18L11.5 19L11 20L13 20L12.5 19L13.5 18L12.5 17L13.5 16L12.5 15L13.5 14L13 13" />
      {/* Linhas de referência */}
      <line x1="6" y1="10" x2="9" y2="10" strokeDasharray="2 2" />
      <line x1="15" y1="10" x2="18" y2="10" strokeDasharray="2 2" />
    </svg>
  )
}

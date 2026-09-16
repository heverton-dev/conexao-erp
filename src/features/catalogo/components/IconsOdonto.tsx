import type { LucideProps } from "lucide-react"

export const IconImplante = ({ size = 24, className = "", color = "currentColor", ...props }: LucideProps) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 3h6v2H9z" />
    <path d="M8 5h8v2l-1 2H9L8 7z" />
    <path d="M9 9h6v11l-3 2-3-2z" />
    <path d="M8 11h8" />
    <path d="M8 14h8" />
    <path d="M9 17h6" />
    <path d="M10 20h4" />
  </svg>
)

export const IconComponente = ({ size = 24, className = "", color = "currentColor", ...props }: LucideProps) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10 3h4v4h-4z" />
    <path d="M8 7h8l-1 5H9z" />
    <path d="M9 12h6v5H9z" />
    <path d="M7 17h10l-1 4H8z" />
  </svg>
)

export const IconKit = ({ size = 24, className = "", color = "currentColor", ...props }: LucideProps) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="7" width="20" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M10 12h4v4h-4z" />
    <path d="M5 12h2v4H5z" />
    <path d="M17 12h2v4h-2z" />
  </svg>
)

export const IconPromocao = ({ size = 24, className = "", color = "currentColor", ...props }: LucideProps) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="2" strokeLinecap="round" />
    <path d="M15 7c-1.5 0-2 1-2 2.5 0 1 .5 2 .5 3 0 .5-.5 1-.5 1.5.5 0 1-.5 1.5-1 .5.5 1 1 1.5 1 0-.5-.5-1-.5-1.5 0-1 .5-2 .5-3 0-1.5-.5-2.5-2-2.5z" />
  </svg>
)

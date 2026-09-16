import { Lock } from "lucide-react"

interface PrecoPlaceholderProps {
  /** Preço real (null para visitante) */
  preco: number | null
  /** Se pode ver preços */
  podeVerPrecos: boolean
  /** Se é colaborador (preço base) */
  isColaborador?: boolean
  /** Classe CSS adicional */
  className?: string
}

/**
 * Renderiza preço ou placeholder baseado no contexto.
 * - visitante: "****" com ícone de cadeado
 * - cliente/colaborador: valor formatado
 */
export function PrecoPlaceholder({
  preco,
  podeVerPrecos,
  isColaborador = false,
  className = "",
}: PrecoPlaceholderProps) {
  if (!podeVerPrecos || preco === null || preco === undefined) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <span className="text-muted-foreground font-semibold tracking-wider">****</span>
        <Lock className="w-3 h-3 text-muted-foreground" />
      </div>
    )
  }

  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(preco)

  return (
    <span className={className}>
      {formatted}
    </span>
  )
}

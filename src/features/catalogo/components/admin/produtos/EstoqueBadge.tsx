import { AlertTriangle, Package, PackageX } from "lucide-react"

/**
 * Badge visual de estoque para exibição em cards/listas.
 * Mostra a quantidade disponível e um indicador de alerta quando estoque baixo.
 *
 * Regra de override: quando qtdDisponivel < 1, o badge "Sem Estoque" é SEMPRE
 * renderizado, mesmo que exibirEstoque seja false.
 */
export function EstoqueBadge({
  qtdDisponivel,
  qtdMinimaAviso,
  compacto = false,
  exibirEstoque = true,
}: {
  qtdDisponivel: number | null | undefined
  qtdMinimaAviso: number | null | undefined
  /** Modo compacto: mostra só ícone + número, sem texto extra */
  compacto?: boolean
  /** Controla exibição do badge. Quando false, só renderiza se estoque < 1 (override). */
  exibirEstoque?: boolean
}) {
  const qtd = qtdDisponivel ?? 0
  const minima = qtdMinimaAviso ?? 0

  const isZerado = qtd < 1
  const isBaixo = qtd > 0 && minima > 0 && qtd <= minima
  const isOk = !isZerado && !isBaixo

  // Regra: se exibirEstoque=false e estoque > 0, NÃO renderiza
  if (!exibirEstoque && !isZerado) return null

  const bgColor = isZerado
    ? "bg-red-500/15 border-red-500/30"
    : isBaixo
      ? "bg-amber-500/15 border-amber-500/30"
      : "bg-emerald-500/15 border-emerald-500/30"

  const textColor = isZerado
    ? "text-red-400"
    : isBaixo
      ? "text-amber-400"
      : "text-emerald-400"

  const Icon = isZerado ? PackageX : isBaixo ? AlertTriangle : Package

  if (compacto) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${bgColor} ${textColor}`}>
        <Icon className="h-3 w-3" />
        {qtd}
      </span>
    )
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${bgColor} ${textColor}`}>
      <Icon className="h-3.5 w-3.5" />
      <span>
        {qtd} {isZerado ? "em estoque" : isBaixo ? `disponível${qtd === 1 ? "" : "s"}` : `em estoque`}
      </span>
      {isBaixo && (
        <span className="text-[10px] opacity-75">(mín: {minima})</span>
      )}
    </div>
  )
}

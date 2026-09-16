import { createRoute, useNavigate, useParams } from "@tanstack/react-router"
import { rootRoute } from "./__root"
import { useAuth } from "~/lib/auth"
import { useEffect, useRef, useState } from "react"
import { validarLinkTeste, registrarAcessoLinkTeste, type ValidacaoLinkTeste } from "~/features/catalogo/services/links-teste.service"
import { marcarModoVisitanteForcado } from "~/features/catalogo/contexts/cliente-ativo"
import { Loader2, ShieldAlert } from "lucide-react"

export const catalogoLinkTesteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/catalogo/teste/$token",
  component: CatalogoLinkTestePage,
})

const MOTIVO_LABEL: Record<Exclude<ValidacaoLinkTeste, { valido: true }>["motivo"], string> = {
  nao_encontrado: "Este link não existe.",
  inativo: "Este link foi revogado.",
  expirado: "Este link expirou.",
  esgotado: "Este link atingiu o limite de usos.",
}

function CatalogoLinkTestePage() {
  const { token } = useParams({ strict: false }) as { token: string }
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [erro, setErro] = useState<string | null>(null)
  const [precisaLogin, setPrecisaLogin] = useState(false)
  const processado = useRef(false)

  useEffect(() => {
    if (authLoading || processado.current) return

    validarLinkTeste(token).then(async (resultado) => {
      if (!resultado.valido) {
        setErro(MOTIVO_LABEL[resultado.motivo])
        return
      }
      const { link } = resultado

      if (link.nivel_acesso === "logado" && !user) {
        setPrecisaLogin(true)
        return
      }

      processado.current = true
      if (link.nivel_acesso === "visitante") marcarModoVisitanteForcado()
      await registrarAcessoLinkTeste(link, user?.id ?? null)
      navigate({ to: "/catalogo" })
    })
  }, [token, user, authLoading])

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center space-y-3">
          <ShieldAlert size={32} className="mx-auto text-error" />
          <p className="text-sm font-medium text-text-main">{erro}</p>
        </div>
      </div>
    )
  }

  if (precisaLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center space-y-4">
          <ShieldAlert size={32} className="mx-auto text-accent" />
          <p className="text-sm font-medium text-text-main">Este link requer login para acessar o catálogo.</p>
          <p className="text-xs text-text-muted">Faça login e volte a abrir este mesmo link para continuar.</p>
          <a
            href="/"
            className="inline-flex px-4 py-2 rounded-lg bg-accent text-accent-fg text-sm font-bold hover:bg-accent-hover transition-colors"
          >
            Ir para o login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-accent" />
    </div>
  )
}

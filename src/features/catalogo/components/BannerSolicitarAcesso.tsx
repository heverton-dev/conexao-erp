import { ExternalLink, MessageCircle, Mail, Send } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useState } from "react"
import { criarSolicitacao } from "../services/solicitacoes.service"
import { useTranslation } from "react-i18next"

interface BannerSolicitarAcessoProps {
  empresaId: string
  empresaNome?: string
  tipo?: "whatsapp" | "email" | "formulario"
  telefone?: string
  email?: string
  showForm?: boolean
}

export function BannerSolicitarAcesso({
  empresaId,
  empresaNome = "esta empresa",
  tipo = "formulario",
  telefone,
  email,
  showForm = true,
}: BannerSolicitarAcessoProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", mensagem: "" })
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  async function handleSubmit() {
    if (!form.nome || !form.email) return
    setLoading(true)
    try {
      await criarSolicitacao({
        nome: form.nome,
        email: form.email,
        telefone: form.telefone || undefined,
        mensagem: form.mensagem || undefined,
      })
      setEnviado(true)
    } catch {
      alert("Erro ao enviar solicitação. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (tipo === "whatsapp" && telefone) {
    const cleanPhone = telefone.replace(/\D/g, "")
    return (
      <div className="bg-gradient-to-r from-green-900/30 to-green-800/20 border border-green-500/20 rounded-xl p-4 flex items-center justify-between">
        <p className="text-sm text-green-200">
          {t("catalogo.banner.wantPrices")} <strong>{empresaNome}</strong>
        </p>
        <a
          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Olá, gostaria de solicitar acesso ao catálogo de produtos.`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <MessageCircle className="w-4 h-4 mr-2" /> {t("catalogo.banner.requestWhatsApp")}
          </Button>
        </a>
      </div>
    )
  }

  if (tipo === "email" && email) {
    return (
      <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/20 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
        <p className="text-sm text-blue-200">
          {t("catalogo.banner.wantPrices")} <strong>{empresaNome}</strong>
        </p>
        <a href={`mailto:${email}?subject=${encodeURIComponent("Solicitação de acesso ao catálogo")}`}>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Mail className="w-4 h-4 mr-2" /> {t("catalogo.banner.sendEmail")}
          </Button>
        </a>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 rounded-xl p-4">
      {!formOpen && !enviado && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--color-text-muted)]">
            {t("catalogo.banner.wantPrices")} <strong>{empresaNome}</strong>
          </p>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Send className="w-4 h-4 mr-2" /> {t("catalogo.banner.requestAccess")}
          </Button>
        </div>
      )}

      {enviado && (
        <div className="text-center py-2">
          <p className="text-sm text-green-400">
            {t("catalogo.banner.requestSent")}
          </p>
        </div>
      )}

      {formOpen && !enviado && (
        <div className="space-y-3">
          <p className="text-sm font-medium">{t("catalogo.banner.formTitle")}</p>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder={t("catalogo.banner.name")}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
            <input
              type="email"
              placeholder={t("catalogo.banner.email")}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              placeholder={t("catalogo.banner.phone")}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            />
            <input
              placeholder={t("catalogo.banner.message")}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={form.mensagem}
              onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit} disabled={loading || !form.nome || !form.email}>
              {loading ? t("catalogo.banner.sending") : t("catalogo.banner.sendRequest")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setFormOpen(false)}>
              {t("catalogo.banner.cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

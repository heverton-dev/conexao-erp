import type { CatalogoDesignFooter } from "../../services/design.service"
import { Instagram, Facebook, Twitter, Youtube, Linkedin, MessageCircle, Globe, Mail, Phone, MapPin } from "lucide-react"
import { Switch } from "~/components/ui/switch"

interface FooterSectionProps {
  footer: CatalogoDesignFooter
  onChange: (footer: CatalogoDesignFooter) => void
}

const SOCIAL_NETWORKS: {
  key: keyof CatalogoDesignFooter["socialLinks"]
  label: string
  icon: typeof Instagram
  color: string
  placeholder: string
}[] = [
  { key: "instagram", label: "Instagram", icon: Instagram, color: "#E4405F", placeholder: "https://instagram.com/sua-pagina" },
  { key: "facebook", label: "Facebook", icon: Facebook, color: "#1877F2", placeholder: "https://facebook.com/sua-pagina" },
  { key: "twitter", label: "Twitter / X", icon: Twitter, color: "#1DA1F2", placeholder: "https://x.com/seu-perfil" },
  { key: "youtube", label: "YouTube", icon: Youtube, color: "#FF0000", placeholder: "https://youtube.com/@seu-canal" },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin, color: "#0A66C2", placeholder: "https://linkedin.com/company/sua-empresa" },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "#25D366", placeholder: "5511999999999" },
  { key: "site", label: "Site", icon: Globe, color: "#c9a655", placeholder: "https://sua-empresa.com.br" },
  { key: "email", label: "E-mail", icon: Mail, color: "#EA4335", placeholder: "contato@sua-empresa.com.br" },
  { key: "telefone", label: "Telefone", icon: Phone, color: "#6366f1", placeholder: "+55 11 9999-9999" },
  { key: "endereco", label: "Endereço", icon: MapPin, color: "#F59E0B", placeholder: "Rua Exemplo, 123 - São Paulo, SP" },
]

export function FooterSection({ footer, onChange }: FooterSectionProps) {
  function updateSocial(key: keyof CatalogoDesignFooter["socialLinks"], value: string) {
    onChange({ ...footer, socialLinks: { ...footer.socialLinks, [key]: value } })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-text-main mb-1">Footer</h3>
        <p className="text-xs text-text-muted">Personalize o rodapé da loja</p>
      </div>

      {/* Texto */}
      <div className="p-4 rounded-xl bg-card border border-border-subtle space-y-3">
        <div>
          <label className="text-[10px] text-text-muted block mb-1">Texto do footer</label>
          <input
            type="text"
            value={footer.text}
            onChange={(e) => onChange({ ...footer, text: e.target.value })}
            className="w-full px-2 py-1.5 rounded-lg bg-input-bg border border-input-border text-text-main text-xs"
            placeholder="Sua empresa"
          />
        </div>

        {/* Cores */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] text-text-muted block mb-1">Fundo</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={footer.bgColor}
                onChange={(e) => onChange({ ...footer, bgColor: e.target.value })}
                className="w-8 h-8 rounded border border-input-border cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={footer.bgColor}
                onChange={(e) => onChange({ ...footer, bgColor: e.target.value })}
                className="flex-1 px-2 py-1 rounded-lg bg-input-bg border border-input-border text-text-main text-xs font-mono"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-text-muted block mb-1">Texto</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={footer.textColor}
                onChange={(e) => onChange({ ...footer, textColor: e.target.value })}
                className="w-8 h-8 rounded border border-input-border cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={footer.textColor}
                onChange={(e) => onChange({ ...footer, textColor: e.target.value })}
                className="flex-1 px-2 py-1 rounded-lg bg-input-bg border border-input-border text-text-main text-xs font-mono"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-text-muted block mb-1">Borda</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={footer.borderColor}
                onChange={(e) => onChange({ ...footer, borderColor: e.target.value })}
                className="w-8 h-8 rounded border border-input-border cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={footer.borderColor}
                onChange={(e) => onChange({ ...footer, borderColor: e.target.value })}
                className="flex-1 px-2 py-1 rounded-lg bg-input-bg border border-input-border text-text-main text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Cores dos ícones */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] text-text-muted block mb-1">Cor dos ícones</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={footer.iconColor}
                onChange={(e) => onChange({ ...footer, iconColor: e.target.value })}
                className="w-8 h-8 rounded border border-input-border cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={footer.iconColor}
                onChange={(e) => onChange({ ...footer, iconColor: e.target.value })}
                className="flex-1 px-2 py-1 rounded-lg bg-input-bg border border-input-border text-text-main text-xs font-mono"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-text-muted block mb-1">Fundo ícones</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={footer.iconBgColor === "transparent" ? "#000000" : footer.iconBgColor}
                onChange={(e) => onChange({ ...footer, iconBgColor: e.target.value })}
                className="w-8 h-8 rounded border border-input-border cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={footer.iconBgColor}
                onChange={(e) => onChange({ ...footer, iconBgColor: e.target.value })}
                className="flex-1 px-2 py-1 rounded-lg bg-input-bg border border-input-border text-text-main text-xs font-mono"
                placeholder="transparent"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-text-muted block mb-1">Borda ícones</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={footer.iconBorderColor === "transparent" ? "#000000" : footer.iconBorderColor}
                onChange={(e) => onChange({ ...footer, iconBorderColor: e.target.value })}
                className="w-8 h-8 rounded border border-input-border cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={footer.iconBorderColor}
                onChange={(e) => onChange({ ...footer, iconBorderColor: e.target.value })}
                className="flex-1 px-2 py-1 rounded-lg bg-input-bg border border-input-border text-text-main text-xs font-mono"
                placeholder="transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Redes sociais */}
      <div className="p-4 rounded-xl bg-card border border-border-subtle space-y-3">
        <p className="text-xs font-medium text-text-main">Redes Sociais & Contato</p>
        <p className="text-[10px] text-text-muted">Configure os links exibidos no rodapé da loja</p>
        <div className="space-y-2">
          {SOCIAL_NETWORKS.map(({ key, label, icon: Icon, color, placeholder }) => {
            const isActive = !!footer.socialLinks[key]
            return (
              <div
                key={key}
                className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${
                  isActive
                    ? "border-accent/30 bg-accent/5"
                    : "border-border-subtle bg-transparent opacity-60"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}15`, color }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] text-text-muted">{label}</label>
                    <Switch
                      checked={isActive}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateSocial(key, placeholder)
                        } else {
                          updateSocial(key, "")
                        }
                      }}
                      className="scale-75"
                    />
                  </div>
                  {isActive && (
                    <input
                      type="text"
                      value={footer.socialLinks[key]}
                      onChange={(e) => updateSocial(key, e.target.value)}
                      className="w-full px-2 py-1 rounded-lg bg-input-bg border border-input-border text-text-main text-xs mt-1"
                      placeholder={placeholder}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

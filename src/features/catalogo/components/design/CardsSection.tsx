import { useState } from "react"
import type { CatalogoDesignCards, CatalogoCategoryCard, WatermarkShape } from "../../services/design.service"
import { AVAILABLE_ICONS } from "../../services/design.service"
import {
  Crosshair, ShieldCheck, Box, Tag,
  Package, Layers, ShoppingBag, Percent,
  Star, Heart, Diamond, Circle,
  Hexagon, Pentagon, Triangle, Square,
  Zap, Target, Award, Gem,
  type LucideIcon,
} from "lucide-react"
import { IconImplante, IconComponente, IconKit, IconPromocao } from "../IconsOdonto"

const ICON_MAP: Record<string, any> = {
  IconImplante, IconComponente, IconKit, IconPromocao,
  Crosshair, ShieldCheck, Box, Tag,
  Package, Layers, ShoppingBag, Percent,
  Star, Heart, Diamond, Circle,
  Hexagon, Pentagon, Triangle, Square,
  Zap, Target, Award, Gem,
}

function IconPreview({ name, size = 16, className = "" }: { name: string; size?: number; className?: string }) {
  const Icon = ICON_MAP[name]
  if (!Icon) return <span className="text-xs">?</span>
  return <Icon size={size} className={className} />
}

interface CardsSectionProps {
  cards: CatalogoDesignCards
  onChange: (cards: CatalogoDesignCards) => void
  isSuperAdmin?: boolean
}

const CARD_KEYS = ["implantes", "componentes", "kits", "promocionais"] as const

const WATERMARK_SHAPES: { value: WatermarkShape; label: string; icon: string }[] = [
  { value: "diamond", label: "Losango", icon: "◇" },
  { value: "circle", label: "Círculo", icon: "○" },
  { value: "hexagon", label: "Hexágono", icon: "⬡" },
  { value: "ring", label: "Anel", icon: "◎" },
  { value: "square", label: "Quadrado", icon: "□" },
]

export function CardsSection({ cards, onChange, isSuperAdmin = false }: CardsSectionProps) {
  const [editingCard, setEditingCard] = useState<string | null>(null)

  function updateCard(key: string, updates: Partial<CatalogoCategoryCard>) {
    onChange({
      ...cards,
      [key]: { ...(cards as any)[key], ...updates },
    })
  }

  function updateAllCards(updates: Partial<CatalogoCategoryCard>) {
    const next = { ...cards }
    for (const key of CARD_KEYS) {
      next[key] = { ...next[key], ...updates }
    }
    onChange(next)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-text-main mb-1">Cards de Categoria</h3>
        <p className="text-xs text-text-muted">
          {isSuperAdmin
            ? "Personalize cores, ícones e textos dos cards"
            : "Ative ou desative a visibilidade dos cards na loja"}
        </p>
      </div>

      {/* Alterar todos de uma vez — apenas Super Admin */}
      {isSuperAdmin && (
        <div className="p-4 rounded-xl bg-card border border-border-subtle">
          <p className="text-xs font-medium text-text-main mb-3">Alterar todos os cards</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-text-muted block mb-1">Cor do ícone</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cards.implantes.iconColor}
                  onChange={(e) => updateAllCards({ iconColor: e.target.value })}
                  className="w-8 h-8 rounded border border-input-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={cards.implantes.iconColor}
                  onChange={(e) => updateAllCards({ iconColor: e.target.value })}
                  className="flex-1 px-2 py-1 rounded-lg bg-input-bg border border-input-border text-text-main text-xs font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-text-muted block mb-1">Cor do card</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cards.implantes.cardBg}
                  onChange={(e) => updateAllCards({ cardBg: e.target.value })}
                  className="w-8 h-8 rounded border border-input-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={cards.implantes.cardBg}
                  onChange={(e) => updateAllCards({ cardBg: e.target.value })}
                  className="flex-1 px-2 py-1 rounded-lg bg-input-bg border border-input-border text-text-main text-xs font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-text-muted block mb-1">Cor do título</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cards.implantes.titleColor}
                  onChange={(e) => updateAllCards({ titleColor: e.target.value })}
                  className="w-8 h-8 rounded border border-input-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={cards.implantes.titleColor}
                  onChange={(e) => updateAllCards({ titleColor: e.target.value })}
                  className="flex-1 px-2 py-1 rounded-lg bg-input-bg border border-input-border text-text-main text-xs font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-text-muted block mb-1">Cor da borda</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cards.implantes.cardBorder}
                  onChange={(e) => updateAllCards({ cardBorder: e.target.value })}
                  className="w-8 h-8 rounded border border-input-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={cards.implantes.cardBorder}
                  onChange={(e) => updateAllCards({ cardBorder: e.target.value })}
                  className="flex-1 px-2 py-1 rounded-lg bg-input-bg border border-input-border text-text-main text-xs font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-text-muted block mb-1">Cor do watermark</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cards.implantes.watermarkColor}
                  onChange={(e) => updateAllCards({ watermarkColor: e.target.value })}
                  className="w-8 h-8 rounded border border-input-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={cards.implantes.watermarkColor}
                  onChange={(e) => updateAllCards({ watermarkColor: e.target.value })}
                  className="flex-1 px-2 py-1 rounded-lg bg-input-bg border border-input-border text-text-main text-xs font-mono"
                />
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-text-muted block mb-1">Forma do watermark</label>
              <div className="flex gap-2">
                {WATERMARK_SHAPES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => onChange({ ...cards, watermarkShape: s.value })}
                    className={`flex-1 py-2 rounded-lg text-center text-lg transition-colors ${
                      cards.watermarkShape === s.value
                        ? "bg-accent/20 border border-accent/50 text-accent"
                        : "bg-input-bg border border-input-border text-text-muted hover:text-text-main"
                    }`}
                    title={s.label}
                  >
                    {s.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards individuais */}
      <div className="space-y-3">
        {CARD_KEYS.map((key) => {
          const card = cards[key]
          const isEditing = editingCard === key

          return (
            <div key={key} className="rounded-xl bg-card border border-border-subtle overflow-hidden">
              {/* Header do card — sempre visível */}
              <div className="flex items-center gap-3 p-4">
                <div style={{ color: card.iconColor }}><IconPreview name={card.icon} size={20} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-main">{card.title}</p>
                  <p className="text-xs text-text-muted truncate">{card.description}</p>
                </div>

                {/* Toggle — Admin e Super Admin */}
                <button
                  onClick={() => updateCard(key, { enabled: !card.enabled })}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                    card.enabled ? "bg-accent" : "bg-input-border"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      card.enabled ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </button>

                {/* Seta de expand — apenas Super Admin */}
                {isSuperAdmin && (
                  <button
                    onClick={() => setEditingCard(isEditing ? null : key)}
                    className="text-xs text-text-muted hover:text-text-main transition-colors shrink-0"
                  >
                    <span className={`inline-block transition-transform ${isEditing ? "rotate-90" : ""}`}>▶</span>
                  </button>
                )}
              </div>

              {/* Painel de edição — apenas Super Admin */}
              {isSuperAdmin && isEditing && (
                <div className="px-4 pb-4 space-y-3 border-t border-border-subtle pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-text-muted block mb-1">Título</label>
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => updateCard(key, { title: e.target.value })}
                        className="w-full px-2 py-1.5 rounded-lg bg-input-bg border border-input-border text-text-main text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-text-muted block mb-1">Descrição</label>
                      <input
                        type="text"
                        value={card.description}
                        onChange={(e) => updateCard(key, { description: e.target.value })}
                        className="w-full px-2 py-1.5 rounded-lg bg-input-bg border border-input-border text-text-main text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-text-muted block mb-1">Ícone</label>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_ICONS.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => updateCard(key, { icon })}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            card.icon === icon
                              ? "bg-accent/20 text-accent border border-accent/50"
                              : "bg-input-bg border border-input-border text-text-muted hover:text-text-main"
                          }`}
                          title={icon}
                        >
                          <IconPreview name={icon} size={14} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-text-muted block mb-1">Cor do ícone</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={card.iconColor}
                          onChange={(e) => updateCard(key, { iconColor: e.target.value })}
                          className="w-8 h-8 rounded border border-input-border cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={card.iconColor}
                          onChange={(e) => updateCard(key, { iconColor: e.target.value })}
                          className="flex-1 px-2 py-1 rounded-lg bg-input-bg border border-input-border text-text-main text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-text-muted block mb-1">Cor do card</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={card.cardBg}
                          onChange={(e) => updateCard(key, { cardBg: e.target.value })}
                          className="w-8 h-8 rounded border border-input-border cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={card.cardBg}
                          onChange={(e) => updateCard(key, { cardBg: e.target.value })}
                          className="flex-1 px-2 py-1 rounded-lg bg-input-bg border border-input-border text-text-main text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-text-muted block mb-1">Cor do título</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={card.titleColor}
                          onChange={(e) => updateCard(key, { titleColor: e.target.value })}
                          className="w-8 h-8 rounded border border-input-border cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={card.titleColor}
                          onChange={(e) => updateCard(key, { titleColor: e.target.value })}
                          className="flex-1 px-2 py-1 rounded-lg bg-input-bg border border-input-border text-text-main text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-text-muted block mb-1">Cor da descrição</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={card.descColor}
                          onChange={(e) => updateCard(key, { descColor: e.target.value })}
                          className="w-8 h-8 rounded border border-input-border cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={card.descColor}
                          onChange={(e) => updateCard(key, { descColor: e.target.value })}
                          className="flex-1 px-2 py-1 rounded-lg bg-input-bg border border-input-border text-text-main text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-text-muted block mb-1">Cor do watermark</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={card.watermarkColor}
                          onChange={(e) => updateCard(key, { watermarkColor: e.target.value })}
                          className="w-8 h-8 rounded border border-input-border cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={card.watermarkColor}
                          onChange={(e) => updateCard(key, { watermarkColor: e.target.value })}
                          className="flex-1 px-2 py-1 rounded-lg bg-input-bg border border-input-border text-text-main text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { describe, it, expect } from "vitest"
import {
  DEFAULT_CATALOGO_CONFIG,
  getTranslatedText,
  getTranslatedCard,
  type CatalogoDesignConfig,
} from "~/features/catalogo/services/design.service"

function withTranslations(translations: CatalogoDesignConfig["translations"]): CatalogoDesignConfig {
  return { ...DEFAULT_CATALOGO_CONFIG, translations }
}

function emptyCardsTranslation() {
  return {
    implantes: { title: "", description: "" },
    componentes: { title: "", description: "" },
    kits: { title: "", description: "" },
    promocionais: { title: "", description: "" },
  }
}

describe("Catalogo - getTranslatedText", () => {
  it("lang null retorna o texto em PT-BR", () => {
    const result = getTranslatedText(DEFAULT_CATALOGO_CONFIG, null, "heroTitle")
    expect(result).toBe(DEFAULT_CATALOGO_CONFIG.texts.heroTitle)
  })

  it("lang pt-BR retorna o texto em PT-BR mesmo com traducoes presentes", () => {
    const config = withTranslations({
      "en-US": { storeTagline: "x", heroTitle: "x", heroSubtitle: "x", cards: emptyCardsTranslation() },
    })
    const result = getTranslatedText(config, "pt-BR", "heroTitle")
    expect(result).toBe(DEFAULT_CATALOGO_CONFIG.texts.heroTitle)
  })

  it("lang sem entrada em translations cai no fallback PT-BR", () => {
    const result = getTranslatedText(DEFAULT_CATALOGO_CONFIG, "en-US", "heroTitle")
    expect(result).toBe(DEFAULT_CATALOGO_CONFIG.texts.heroTitle)
  })

  it("lang com traducao preenchida retorna o texto traduzido", () => {
    const config = withTranslations({
      "en-US": {
        storeTagline: "New Dental Standard",
        heroTitle: "Precision & Performance",
        heroSubtitle: "x",
        cards: emptyCardsTranslation(),
      },
    })
    expect(getTranslatedText(config, "en-US", "heroTitle")).toBe("Precision & Performance")
  })

  it("lang com campo de traducao vazio cai no fallback PT-BR (cascata por campo)", () => {
    const config = withTranslations({
      "en-US": { storeTagline: "New Dental Standard", heroTitle: "", heroSubtitle: "x", cards: emptyCardsTranslation() },
    })
    expect(getTranslatedText(config, "en-US", "heroTitle")).toBe(DEFAULT_CATALOGO_CONFIG.texts.heroTitle)
    expect(getTranslatedText(config, "en-US", "storeTagline")).toBe("New Dental Standard")
  })
})

describe("Catalogo - getTranslatedCard", () => {
  it("lang null retorna o card em PT-BR", () => {
    const result = getTranslatedCard(DEFAULT_CATALOGO_CONFIG, null, "implantes")
    expect(result).toEqual({
      title: DEFAULT_CATALOGO_CONFIG.cards.implantes.title,
      description: DEFAULT_CATALOGO_CONFIG.cards.implantes.description,
    })
  })

  it("lang sem entrada em translations cai no fallback PT-BR", () => {
    const result = getTranslatedCard(DEFAULT_CATALOGO_CONFIG, "es-ES", "implantes")
    expect(result.title).toBe(DEFAULT_CATALOGO_CONFIG.cards.implantes.title)
  })

  it("lang com card parcialmente traduzido cai no fallback so no campo faltante", () => {
    const config = withTranslations({
      "es-ES": {
        storeTagline: "x",
        heroTitle: "x",
        heroSubtitle: "x",
        cards: {
          implantes: { title: "Implantes ES", description: "" },
          componentes: { title: "", description: "" },
          kits: { title: "", description: "" },
          promocionais: { title: "", description: "" },
        },
      },
    })
    const result = getTranslatedCard(config, "es-ES", "implantes")
    expect(result.title).toBe("Implantes ES")
    expect(result.description).toBe(DEFAULT_CATALOGO_CONFIG.cards.implantes.description)
  })
})

import { describe, it, expect, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { PublicLangWrapper } from "~/features/catalogo/components/PublicLangWrapper"

const STORAGE_KEY = "catalogo-lang"

describe("Catalogo - language-context", () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY)
  })

  it("sem idioma salvo, PublicLangWrapper mostra o splash e nao renderiza os filhos", () => {
    render(
      <PublicLangWrapper>
        <div data-testid="conteudo">Loja</div>
      </PublicLangWrapper>,
    )
    expect(screen.queryByTestId("conteudo")).not.toBeInTheDocument()
    expect(screen.getByText("English")).toBeInTheDocument()
  })

  it("com idioma ja salvo no localStorage, pula o splash e renderiza os filhos direto", () => {
    localStorage.setItem(STORAGE_KEY, "en-US")
    render(
      <PublicLangWrapper>
        <div data-testid="conteudo">Loja</div>
      </PublicLangWrapper>,
    )
    expect(screen.getByTestId("conteudo")).toBeInTheDocument()
    expect(screen.queryByText("English")).not.toBeInTheDocument()
  })

  it("escolher um idioma no splash persiste no localStorage e libera o conteudo", async () => {
    render(
      <PublicLangWrapper>
        <div data-testid="conteudo">Loja</div>
      </PublicLangWrapper>,
    )
    fireEvent.click(screen.getByText("English"))
    await waitFor(() => expect(screen.getByTestId("conteudo")).toBeInTheDocument())
    expect(localStorage.getItem(STORAGE_KEY)).toBe("en-US")
  })

  it("idioma invalido no localStorage e ignorado (splash aparece)", () => {
    localStorage.setItem(STORAGE_KEY, "fr-FR")
    render(
      <PublicLangWrapper>
        <div data-testid="conteudo">Loja</div>
      </PublicLangWrapper>,
    )
    expect(screen.queryByTestId("conteudo")).not.toBeInTheDocument()
  })
})

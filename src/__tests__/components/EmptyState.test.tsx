import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "~/components/ui/empty-state";

describe("EmptyState", () => {
  it("renderiza titulo", () => {
    render(<EmptyState title="Nenhum registro" />);
    expect(screen.getByText("Nenhum registro")).toBeInTheDocument();
  });

  it("renderiza descricao quando fornecida", () => {
    render(<EmptyState title="Vazio" description="Nao ha itens para exibir" />);
    expect(screen.getByText("Nao ha itens para exibir")).toBeInTheDocument();
  });

  it("renderiza action quando fornecida", () => {
    render(<EmptyState title="Vazio" action={<button>Criar</button>} />);
    expect(screen.getByRole("button", { name: "Criar" })).toBeInTheDocument();
  });

  it("renderiza icone padrao quando nenhum icone e fornecido", () => {
    const { container } = render(<EmptyState title="Vazio" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renderiza icone customizado", () => {
    const { container } = render(
      <EmptyState
        title="Vazio"
        icon={<span data-testid="custom-icon">*</span>}
      />,
    );
    expect(
      container.querySelector('[data-testid="custom-icon"]'),
    ).toBeInTheDocument();
  });

  it("nao renderiza descricao quando ausente", () => {
    const { container } = render(<EmptyState title="Vazio" />);
    expect(container.querySelector("p")).not.toBeInTheDocument();
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingState } from "~/components/ui/loading-state";

describe("LoadingState", () => {
  it("renderiza mensagem padrao", () => {
    render(<LoadingState />);
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("renderiza mensagem personalizada", () => {
    render(<LoadingState message="Aguarde..." />);
    expect(screen.getByText("Aguarde...")).toBeInTheDocument();
  });

  it("renderiza spinner", () => {
    const { container } = render(<LoadingState />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("animate-spin");
  });
});

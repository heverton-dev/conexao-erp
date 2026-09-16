import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "~/components/ui/button";

describe("Button", () => {
  it("renderiza com texto", () => {
    render(<Button>Clique</Button>);
    expect(screen.getByRole("button", { name: "Clique" })).toBeInTheDocument();
  });

  it("renderiza variante destructive", () => {
    const { container } = render(
      <Button variant="destructive">Excluir</Button>,
    );
    expect(container.querySelector("button")).toHaveClass("bg-destructive");
  });

  it("renderiza variante outline", () => {
    const { container } = render(<Button variant="outline">Outline</Button>);
    expect(container.querySelector("button")).toHaveClass("border-border");
  });

  it("renderiza variante ghost", () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>);
    expect(container.querySelector("button")).toHaveClass(
      "hover:bg-surface-hover",
    );
  });

  it("renderiza variante link", () => {
    render(<Button variant="link">Link</Button>);
    expect(screen.getByRole("button", { name: "Link" })).toHaveClass(
      "hover:underline",
    );
  });

  it("renderiza variante secondary", () => {
    const { container } = render(<Button variant="secondary">Sec</Button>);
    expect(container.querySelector("button")).toHaveClass("bg-secondary");
  });

  it("renderiza size sm", () => {
    const { container } = render(<Button size="sm">Pequeno</Button>);
    expect(container.querySelector("button")).toHaveClass("h-9");
  });

  it("renderiza size lg", () => {
    const { container } = render(<Button size="lg">Grande</Button>);
    expect(container.querySelector("button")).toHaveClass("h-12");
  });

  it("renderiza size icon", () => {
    const { container } = render(
      <Button size="icon">
        <span>X</span>
      </Button>,
    );
    expect(container.querySelector("button")).toHaveClass("w-10");
  });

  it("renderiza disabled", () => {
    render(<Button disabled>Desabilitado</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("chama onClick ao clicar", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Clique</Button>);
    await userEvent.setup().click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renderiza loading com spinner", () => {
    render(<Button loading>Salvando</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });

  it("nao chama onClick quando disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Bloqueado
      </Button>,
    );
    await userEvent.setup().click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "~/components/ui/page-header";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, className, ...props }: any) => (
    <a href={to} className={className} {...props}>
      {children}
    </a>
  ),
}));

describe("PageHeader", () => {
  it("renderiza titulo", () => {
    render(<PageHeader title="Meu Titulo" />);
    expect(
      screen.getByRole("heading", { name: "Meu Titulo" }),
    ).toBeInTheDocument();
  });

  it("renderiza descricao quando fornecida", () => {
    render(<PageHeader title="Titulo" description="Descricao aqui" />);
    expect(screen.getByText("Descricao aqui")).toBeInTheDocument();
  });

  it("renderiza actions quando fornecidas", () => {
    render(<PageHeader title="Titulo" actions={<button>Action</button>} />);
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });

  it("nao renderiza descricao quando ausente", () => {
    const { container } = render(<PageHeader title="Titulo" />);
    expect(container.querySelector("p")).not.toBeInTheDocument();
  });

  it("renderiza breadcrumbs", () => {
    const breadcrumbs = [
      { label: "Home", href: "/" },
      { label: "Pagina Atual" },
    ];
    render(<PageHeader title="Titulo" breadcrumbs={breadcrumbs} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Pagina Atual")).toBeInTheDocument();
  });

  it("tem aria-label no nav de breadcrumbs", () => {
    const breadcrumbs = [{ label: "Home", href: "/" }];
    render(<PageHeader title="Titulo" breadcrumbs={breadcrumbs} />);
    expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
  });

  it("aplica className customizada", () => {
    const { container } = render(
      <PageHeader title="Titulo" className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

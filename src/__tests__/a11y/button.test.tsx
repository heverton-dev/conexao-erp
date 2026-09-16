import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

declare module "vitest" {
  interface Assertion<T = any> {
    toHaveNoViolations(): T;
  }
}

expect.extend(toHaveNoViolations);

describe("Button A11y", () => {
  it("deve ter zero violacoes de acessibilidade", async () => {
    const { container } = render(<button>Clique aqui</button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("botao disabled nao deve ter violacoes", async () => {
    const { container } = render(<button disabled>Desabilitado</button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("botao com aria-label deve passar", async () => {
    const { container } = render(<button aria-label="Fechar">X</button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

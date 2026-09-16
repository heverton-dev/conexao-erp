import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

declare module "vitest" {
  interface Assertion<T = any> {
    toHaveNoViolations(): T;
  }
}

expect.extend(toHaveNoViolations);

describe("A11y - Componentes simples", () => {
  it("heading com paragrafo deve ser acessivel", async () => {
    const { container } = render(
      <div>
        <h1>Titulo</h1>
        <p>Descricao</p>
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("form com label e input deve ser acessivel", async () => {
    const { container } = render(
      <form>
        <label htmlFor="nome">Nome</label>
        <input id="nome" type="text" />
      </form>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("navegacao com lista deve ser acessivel", async () => {
    const { container } = render(
      <nav aria-label="Principal">
        <ul>
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/sobre">Sobre</a>
          </li>
        </ul>
      </nav>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("tabela simples deve ser acessivel", async () => {
    const { container } = render(
      <table>
        <caption>Dados</caption>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Idade</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Joao</td>
            <td>30</td>
          </tr>
        </tbody>
      </table>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("alerta com role alert deve ser acessivel", async () => {
    const { container } = render(<div role="alert">Erro ao salvar</div>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

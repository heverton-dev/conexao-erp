import type { Meta, StoryObj } from "@storybook/react";
import { PageHeader } from "./page-header";

const meta: Meta<typeof PageHeader> = {
  title: "UI/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: "Clientes",
    description: "Gerencie seus clientes cadastrados no sistema.",
  },
};

export const WithBreadcrumbs: Story = {
  args: {
    title: "Editar Cliente",
    breadcrumbs: [
      { label: "Dashboard", href: "/cadastros/dashboard" },
      { label: "Solicitações", href: "/cadastros/solicitacoes" },
      { label: "Editar" },
    ],
  },
};

export const WithActions: Story = {
  args: {
    title: "Relatórios",
    description: "Visualize e exporte relatórios do sistema.",
    actions: (
      <button className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
        Novo Relatório
      </button>
    ),
  },
};

export const Full: Story = {
  args: {
    title: "Configurações Avançadas",
    description: "Configure parâmetros avançados do sistema.",
    breadcrumbs: [
      { label: "Dashboard", href: "/cadastros/dashboard" },
      { label: "Configurações", href: "/config" },
      { label: "Avançado" },
    ],
    actions: (
      <div className="flex gap-2">
        <button className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-main">
          Cancelar
        </button>
        <button className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Salvar
        </button>
      </div>
    ),
  },
};

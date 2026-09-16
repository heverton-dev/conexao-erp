import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: "Ativo",
    variant: "default",
  },
};

export const Secondary: Story = {
  args: {
    children: "Pendente",
    variant: "secondary",
  },
};

export const Destructive: Story = {
  args: {
    children: "Inativo",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Rascunho",
    variant: "outline",
  },
};

export const Success: Story = {
  args: {
    children: "Concluído",
    variant: "success",
  },
};

export const Warning: Story = {
  args: {
    children: "Atenção",
    variant: "warning",
  },
};

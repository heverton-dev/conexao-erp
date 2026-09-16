import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Digite algo...",
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: "Valor preenchido",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Input desabilitado",
    disabled: true,
  },
};

export const Invalid: Story = {
  args: {
    placeholder: "Campo inválido",
    "aria-invalid": true,
  },
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Senha",
    defaultValue: "123456",
  },
};

export const File: Story = {
  args: {
    type: "file",
  },
};

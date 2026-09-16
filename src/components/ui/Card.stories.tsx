import type { Meta, StoryObj } from "@storybook/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Título do Card</CardTitle>
        <CardDescription>
          Descrição do card com informações adicionais.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-text-main">Conteúdo principal do card.</p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card com Ações</CardTitle>
        <CardDescription>Card com footer de ações.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-text-main">Conteúdo do card com footer.</p>
      </CardContent>
      <CardFooter>
        <button className="text-sm font-semibold text-primary">Cancelar</button>
        <button className="text-sm font-semibold text-primary">Salvar</button>
      </CardFooter>
    </Card>
  ),
};

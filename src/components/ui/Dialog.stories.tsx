import type { Meta, StoryObj } from "@storybook/react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./dialog";

const meta: Meta<typeof Dialog> = {
  title: "UI/Dialog",
  component: Dialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog open>
      <DialogTrigger asChild>
        <button className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Abrir Dialog
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Título do Dialog</DialogTitle>
          <DialogDescription>
            Esta é uma descrição do dialog com informações relevantes para o
            usuário.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-text-main">
          Conteúdo do dialog pode ser qualquer coisa — formulários, detalhes,
          confirmações.
        </p>
        <DialogFooter>
          <DialogClose asChild>
            <button className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-main">
              Cancelar
            </button>
          </DialogClose>
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Confirmar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

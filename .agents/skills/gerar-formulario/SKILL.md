---
name: gerar-formulario
description: >
  Gera formulário React completo com React Hook Form + Zod, validação completa,
  campos condicionais, máscaras, upload de arquivo e layout responsivo mobile-first.
  Segue tokens do Design System e padrões de acessibilidade.
  Trigger: "gerar formulário", "criar formulário", "novo formulário"
---

# Gerar Formulário — ERP Odonto

Gera formulário completo e validado com validação de negócio.

## Pré-requisitos

- Módulo deve existir em `src/features/<modulo>/`
- Lista de campos com tipos e regras

## Workflow

### Step 1: Coletar informações

- **Nome:** PascalCase (ex: `FormCadastro`)
- **Módulo:** kebab-case (ex: `cadastros`)
- **Campos:** array com `{ name, type, label, required, options? }`
- **Submit:** função de callback

### Step 2: Gerar schema Zod

```typescript
// src/features/<modulo>/components/<Form>.schema.ts
import { z } from "zod";

export const {{FORMULARIO}}Schema = z.object({
  // ═══ TEXT ═══
  nome: z.string().min(1, "Nome é obrigatório").max(255),

  // ═══ EMAIL ═══
  email: z.string().email("Email inválido"),

  // ═══ TELEFONE (com máscara) ═══
  telefone: z.string().min(14, "Telefone inválido").max(15),

  // ═══ CPF/CNPJ (com máscara) ═══
  documento: z.string().min(14, "Documento inválido").max(18),

  // ═══ NÚMERO ═══
  valor: z.coerce.number().min(0, "Valor deve ser positivo"),

  // ═══ DATA ═══
  dataNascimento: z.string().min(1, "Data é obrigatória"),

  // ═══ SELECT ═══
  status: z.enum(["ativo", "inativo"], {
    required_error: "Status é obrigatório",
  }),

  // ═══ TEXTAREA ═══
  observacoes: z.string().optional(),

  // ═══ BOOLEAN ═══
  aceitoTermos: z.literal(true, {
    errorMap: () => ({ message: "Você deve aceitar os termos" }),
  }),

  // ═══ ARRAY ═══
  tags: z.array(z.string()).min(1, "Selecione pelo menos uma tag"),

  // ═══ CAMPO CONDICIONAL ═══
  tipoPessoa: z.enum(["fisica", "juridica"]),
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
}).refine(
  (data) => {
    if (data.tipoPessoa === "fisica") return !!data.cpf;
    if (data.tipoPessoa === "juridica") return !!data.cnpj;
    return true;
  },
  { message: "Documento é obrigatório", path: ["cpf"] }
);

export type {{FORMULARIO}}FormData = z.infer<typeof {{FORMULARIO}}Schema>;
```

### Step 3: Gerar componente de formulário

```typescript
// src/features/<modulo>/components/<Form>.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { {{FORMULARIO}}Schema, type {{FORMULARIO}}FormData } from "./{{FORMULARIO}}.schema";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Loader2 } from "lucide-react";

interface {{FORMULARIO}}Props {
  defaultValues?: Partial<{{FORMULARIO}}FormData>;
  onSubmit: (data: {{FORMULARIO}}FormData) => Promise<void>;
  onCancel?: () => void;
}

export function {{FORMULARIO}}({ defaultValues, onSubmit, onCancel }: {{FORMULARIO}}Props) {
  const form = useForm<{{FORMULARIO}}FormData>({
    resolver: zodResolver({{FORMULARIO}}Schema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      status: "ativo",
      ...defaultValues,
    },
  });

  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* ═══ GRID RESPONSIVO ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ═══ CAMPO TEXTO ═══ */}
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ═══ CAMPO EMAIL ═══ */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ═══ CAMPO TELEFONE (com máscara) ═══ */}
          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="(00) 00000-0000"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .replace(/(\d{2})(\d)/, "($1) $2")
                        .replace(/(\d{5})(\d)/, "$1-$2")
                        .replace(/(-\d{4})\d+?$/, "$1");
                      field.onChange(value);
                    }}
                    maxLength={15}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ═══ CAMPO SELECT ═══ */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ═══ CAMPO TEXTOAREA ═══ */}
        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Digite observações..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ═══ CAMPO CONDICIONAL ═══ */}
        <FormField
          control={form.control}
          name="tipoPessoa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Pessoa *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="fisica">Pessoa Física</SelectItem>
                  <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ═══ CAMPOS CONDICIONAIS ═══ */}
        {form.watch("tipoPessoa") === "fisica" && (
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="000.000.000-00"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .replace(/(\d{3})(\d)/, "$1.$2")
                        .replace(/(\d{3})(\d)/, "$1.$2")
                        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
                        .replace(/(-\d{2})\d+?$/, "$1");
                      field.onChange(value);
                    }}
                    maxLength={14}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch("tipoPessoa") === "juridica" && (
          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="00.000.000/0000-00"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .replace(/(\d{2})(\d)/, "$1.$2")
                        .replace(/(\d{3})(\d)/, "$1.$2")
                        .replace(/(\d{3})(\d)/, "$1/$2")
                        .replace(/(\d{4})(\d{1,2})/, "$1-$2")
                        .replace(/(-\d{2})\d+?$/, "$1");
                      field.onChange(value);
                    }}
                    maxLength={18}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* ═══ BOTÕES ═══ */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-4 border-t border-border/50">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### Step 4: Validar

```bash
npm run lint    # deve passar
npm run build   # deve passar sem erros
```

### Step 5: Commit

```bash
git add src/features/<modulo>/components/<Form>*
git commit -m "feat(<modulo>): gerar formulário <Form>"
```

## Tipos de Campo Disponíveis

| Tipo | Componente | Exemplo |
|------|------------|---------|
| text | `<Input />` | Nome, Descrição |
| email | `<Input type="email" />` | Email |
| password | `<Input type="password" />` | Senha |
| number | `<Input type="number" />` | Valor, Quantidade |
| tel | `<Input />` + máscara | Telefone |
| cpf | `<Input />` + máscara | CPF |
| cnpj | `<Input />` + máscara | CNPJ |
| date | `<Input type="date" />` | Data |
| select | `<Select />` | Status, Tipo |
| textarea | `<Textarea />` | Observações |
| checkbox | `<Checkbox />` | Aceito termos |
| switch | `<Switch />` | Ativo/Inativo |
| file | `<Input type="file" />` | Upload |

## Regras Obrigatórias

1. **Zod schema** — sempre usar para validação
2. **FormMessage** — sempre exibir mensagens de erro
3. **Loading state** — botão desabilitado durante submit
4. **Máscaras** — CPF, CNPJ, Telefone
5. **Campos condicionais** — usar watch() do RHF
6. **Mobile-first** — grid começa em 1 coluna
7. **Touch targets** — botões com min-h-[44px]
8. **Acessibilidade** — labels associados via htmlFor

## Economia de Tokens

- **Lean-CTX:** Ler apenas schema da tabela
- **Caveman:** Template reutilizável
- **Pre-flight:** Rodar lint e build após cada alteração

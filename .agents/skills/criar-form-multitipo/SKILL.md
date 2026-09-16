---
name: criar-form-multitipo
description: >
  Cria um FormModal que alterna entre múltiplos sub-formulários conforme um
  "tipo" selecionado (ex: catalogo.admin.produtos.ProdutoFormModal alternando
  entre AbutmentForm/ImplanteForm/KitForm), incluindo composições N:N reutilizáveis
  via CompositionSection. Segue o padrão real do módulo catalogo.
  Trigger: "criar formulário multi-tipo", "form modal com tipos", "modal com abas de tipo de produto"
---

# Criar Form Multi-Tipo — ERP Odonto

Padrão verificado em `src/features/catalogo/components/admin/produtos/ProdutoFormModal.tsx`
+ `forms/{AbutmentForm,ImplanteForm,KitForm}.tsx`. Use quando uma entidade tem
variantes estruturalmente diferentes (campos e relações distintas por tipo),
não apenas campos opcionais.

## Quando usar isto e não `gerar-formulario`

- `gerar-formulario`: um formulário, um schema Zod, um shape de dados
- `criar-form-multitipo`: N formulários diferentes atrás de um seletor de tipo, cada um com seu próprio estado, validação e mutations

## Workflow

### Step 1: Modal pai — um `useState` por tipo, não union type

```tsx
const [tipo, setTipo] = useState<"implante" | "abutment" | "kit">("implante");
const [dataImplante, setDataImplante] = useState<ImplanteFormData>(initialImplante);
const [dataAbutment, setDataAbutment] = useState<AbutmentFormData>(initialAbutment);
const [dataKit, setDataKit] = useState<KitFormData>(initialKit);
```

- Não modele como `data: ImplanteFormData | AbutmentFormData | KitFormData` — o projeto usa um state separado por tipo para não perder o que o usuário já preencheu ao trocar de aba antes de salvar.
- Botões de seleção de tipo ficam `disabled={!!editingItem}` — tipo é imutável depois de criado.

### Step 2: Fetch condicional — só a query do tipo ativo roda

```tsx
const { data: implanteDetalhe } = useImplanteDetalhe(editingItem?.sku, {
  enabled: !!editingItem && tipo === "implante",
});
const { data: abutmentDetalhe } = useAbutmentDetalhe(editingItem?.sku, {
  enabled: !!editingItem && tipo === "abutment",
});
```

```tsx
useEffect(() => {
  if (implanteDetalhe) setDataImplante(mapDetalheToForm(implanteDetalhe));
}, [implanteDetalhe]);
```

### Step 3: Render — switch JSX, não `React.createElement` dinâmico

```tsx
{tipo === "implante" && (
  <ImplanteForm data={dataImplante} onChange={setDataImplante} familias={familias} chaves={chaves} />
)}
{tipo === "abutment" && (
  <AbutmentForm data={dataAbutment} onChange={setDataAbutment} kitsIds={kitsIds} onKitsChange={setKitsIds} />
)}
{tipo === "kit" && (
  <KitForm data={dataKit} onChange={setDataKit} />
)}
```

### Step 4: Sub-form — RHF + Zod só para validação, valor controlado pelo pai

```tsx
interface XFormProps {
  data: XFormData;
  onChange: (d: XFormData) => void;
  // listas de opções e pares Ids/onChange para composições N:N
}

export function XForm({ data, onChange }: XFormProps) {
  const { formState: { errors }, trigger } = useForm({ resolver: zodResolver(xSchema), values: data });
  // inputs: value={data.campo} onChange={e => onChange({ ...data, campo: e.target.value })}
}
```

Não usar `form.handleSubmit` para submeter — o submit real acontece no modal pai (`handleSave`), o RHF aqui só produz `errors` para exibir mensagens.

### Step 5: Composição N:N reutilizável — `CompositionSection`

Para relações tipo "implante tem N chaves", "abutment compõe N kits": um sub-componente local no próprio arquivo do form —

```tsx
function CompositionSection({ label, options, selectedIds, onChange }: {
  label: string; options: {id: string; nome: string}[];
  selectedIds: string[]; onChange: (ids: string[]) => void;
}) {
  // select + botão "Adicionar" + lista de chips removíveis (X no chip remove do array)
}
```

### Step 6: Salvar — if/else por tipo, service `salvarXRelacao` para pivots

```tsx
async function handleSave() {
  if (!validateRequired()) return;
  if (tipo === "implante") {
    const { data } = editingItem
      ? await atualizarImplante.mutateAsync({ sku: editingItem.sku, ...dataImplante })
      : await criarImplante.mutateAsync(dataImplante);
    await catalogoService.salvarImplanteChaves(data.sku, chavesIds);
  } else if (tipo === "abutment") {
    // idem para abutment + kitsIds/parafusosIds
  } else if (tipo === "kit") {
    // idem para kit
  }
  onClose();
}
```

`salvar<Relacao>` no service segue delete-then-insert (ver `criar-migration` / padrão de pivot).

### Step 7: Dialog/scroll — padrão obrigatório do projeto

```tsx
<DialogContent className="max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
  <DialogHeader className="shrink-0">...</DialogHeader>
  <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
    {/* switch de tipo aqui */}
  </div>
  <DialogFooter className="shrink-0">...</DialogFooter>
</DialogContent>
```

Nunca `window.confirm`/`alert`/`prompt` — exclusão usa `AlertDialog` (ver `~/components/ui/alert-dialog`).

## Regras obrigatórias

1. State separado por tipo — nunca union type único para os dados do form
2. Tipo imutável em edição — desabilitar seletor quando `editingItem` existe
3. Fetch condicional — só a query do tipo ativo com `enabled`
4. RHF+Zod só valida, o dado real é controlado pelo pai
5. Dialog com scroll segue `flex flex-col max-h-[85vh] overflow-hidden` + body `overflow-y-auto flex-1 min-h-0`
6. Pivots N:N salvos via `salvar<Relacao>` delete-then-insert, nunca diff manual

## Economia de Tokens

- **Lean-CTX:** ler `ProdutoFormModal.tsx` + um `*Form.tsx` de referência antes de criar um novo, não os três
- **Pre-flight:** `npm run build` após adicionar o novo tipo ao switch

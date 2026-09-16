# Eventos e webhooks

Todo módulo registrado declara seus eventos e os dispara. É por eles que a
empresa configura webhooks, notificações e conectores de API sem alterar código.

## 1. Declarar em `module.ts`

```ts
events: [
  {
    key: "despesa.criada",           // <entidade>.<acao_no_particípio>
    label: "Despesa Criada",
    descricao: "Quando uma despesa é lançada",
    type: "status_change",           // ou "button_action"
  },
],
```

Regras:

- Mínimo **2 eventos** por módulo registrado.
- `key` em `snake_case` com ponto separando entidade e ação: `cliente.criado`,
  `pedido.enviado`, `tarefa.movida`. Prefixo do módulo só quando houver ambiguidade
  global (`mapas.pin.clicado`).
- `type: "status_change"` = mudança de estado do dado; `"button_action"` = ação
  explícita do usuário.

## 2. Disparar no service

```ts
import { dispararEventoModulo } from "~/core/services/webhooks";

const MODULO_KEY = "despesas";

export async function criarDespesa(input: DespesaFormData): Promise<Despesa> {
  const { data, error } = await supabase.from("despesas").insert(input).select().single();
  if (error) throw error;

  dispararEventoModulo(MODULO_KEY, "despesa.criada", { despesa_id: data.id, valor: input.valor })
    .catch(() => {});

  return data as Despesa;
}
```

Invioláveis:

- **Exatamente 3 argumentos**: `(moduloKey, eventoKey, payload)`. Não existe 4º.
- **Fire-and-forget**: nunca `await`. Sempre `.catch(() => {})` — falha de webhook
  não pode derrubar a operação de negócio.
- Disparar no **service**, depois do sucesso da escrita, nunca no componente.
- `payload` = objeto plano com ids e campos relevantes. `evento` e `modulo` são
  adicionados automaticamente ao body enviado.
- A `eventoKey` disparada **tem que existir** em `events[]` do `module.ts`, senão
  nada é entregue.

## O que `dispararEventoModulo` faz

Busca em paralelo, filtrando por `modulo_key` + `evento_key` + ativo:

| Tabela | Destino |
| --- | --- |
| `webhooks` | HTTP POST para URL externa |
| `notificacoes_modelos` | notificação in-app / e-mail |
| `conectores_api` | conector configurado em `~/features/api-connectors` |

Se nenhum dos três estiver configurado, retorna sem efeito.

> ⚠ **Hoje 2 dos 3 destinos não funcionam.** `notificacoes_modelos` e
> `conectores_api` não existem no banco — a renomeação `20260705000000` nunca foi
> aplicada e as tabelas ainda se chamam `notificacoes_templates` e
> `api_connectors`. **`webhooks` existe, então webhook HTTP continua entregando**;
> notificação e conector de API, não. O código só faz `console.error` e segue com
> lista vazia, então a falha é invisível na UI. Ver
> [drift-banco-vs-migrations.md](drift-banco-vs-migrations.md).

## Referência

Catálogos `EVENTOS_STATUS_CHANGE` e `EVENTOS_BUTTON_ACTION` em
`src/core/services/webhooks.ts`. Documentação por evento e botão em
`docs-projeto/doc-eventos-botoes-triggers/`.

## Exceção: eventos de status em `cadastros`

`cadastros` tem 6 eventos cujo nome **é o valor da coluna `status`**
(`link_gerado`, `dados_enviados`, `em_analise`, `em_correcao`, `aprovado`,
`reprovado`) e 5 com prefixo `botao_*`. São as duas famílias de
`EVENTOS_STATUS_CHANGE`/`EVENTOS_BUTTON_ACTION` — intencionais, não legado a
padronizar. Por isso `link.gerado` (button_action) e `link_gerado` (status_change)
coexistem: são gatilhos diferentes.

Renomear `evento_key` é **breaking change** — `webhooks`, `notificacoes_modelos` e
`conectores_api` guardam a chave como texto e o disparo falha em silêncio se não
casar. Evento novo usa `entidade.acao`.

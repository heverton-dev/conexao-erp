---
name: adicionar-permissao
description: >
  Adiciona permissão ao sistema de permissões do ERP Odonto com validação
  de naming, verificação de duplicatas, atualização automática de defaults
  por ambiente e documentação.
  Trigger: "adicionar permissão", "criar permissão", "nova permissão"
---

# Adicionar Permissão — ERP Odonto

Adiciona permissão completa e validada ao sistema.

## Pré-requisitos

- Módulo deve existir em `src/features/<modulo>/`
- Nome da permissão em snake_case

## Workflow

### Step 1: Validar nome

```
Formato: ^[a-z][a-z0-9_]*$
Exemplo: cadastros_aprovar

Check: não existe em src/core/permissions/types.ts
Check: não existe em src/registry/permissions-registry.ts
Check: não existe no module.ts do módulo
```

### Step 2: (removido)

~~Editar `src/core/permissions/types.ts`~~ — **não fazer isso**. O tipo real
hoje é `export type Permissoes = Record<string, boolean>` (ver
`src/core/permissions/types.ts`), não uma interface com campos nomeados.
Adicionar um campo lá não tem efeito algum em runtime nem em type-checking
de chave específica — é passo morto que só sobrevivia na doc antiga desta
skill. Pule direto para o Step 3.

### Step 3: Registrar em permissions-registry.ts

```typescript
// src/registry/permissions-registry.ts

registerPermission({
  key: "{{PERMISSAO_KEY}}",
  label: "{{PERMISSAO_LABEL}}",
  description: "{{PERMISSAO_DESCRICAO}}",
  group: "{{MODULO_KEY}}",
});
```

### Step 4: Associar ao módulo

```typescript
// src/features/<modulo>/module.ts

export const {{MODULO_CAMEL}}Module: ModuleDefinition = {
  // ...
  permissions: [
    // ... permissões existentes
    "{{PERMISSAO_KEY}}",
  ],
};
```

### Step 5: Adicionar permissão padrão por ambiente

```typescript
// src/features/<modulo>/module.ts

registerPermissionDefaults("{{MODULO_KEY}}", {
  cadastro: {
    // ... outras permissões
    {{PERMISSAO_KEY}}: false,  // padrão: desabilitado
  },
  consultor: {
    // ... outras permissões
    {{PERMISSAO_KEY}}: false,
  },
  tecnologia: {
    // ... outras permissões
    {{PERMISSAO_KEY}}: true,  // tecnologia sempre tem acesso
  },
  suporte: {
    // ... outras permissões
    {{PERMISSAO_KEY}}: false,
  },
});
```

### Step 6: Atualizar permissões existentes (se necessário)

Se a permissão afeta outras permissões, atualizar:

```typescript
// Exemplo: permissão de "aprovar" requer "ver"
const permissoesDependentes = [
  "{{MODULO_KEY}}_aprovar",  // requer {{MODULO_KEY}}_ver
];
```

### Step 7: Documentar

Adicionar em `docs-projeto/docs-design-system/ds-{{MODULO_KEY}}.md`:

```markdown
## Permissões

| Chave | Descrição | Grupo |
|-------|-----------|-------|
| {{PERMISSAO_KEY}} | {{PERMISSAO_LABEL}} | {{MODULO_KEY}} |
```

### Step 8: Validar

```bash
npm run build   # deve passar sem erros
npm run lint    # deve passar
```

### Step 9: Commit

```bash
git add src/core/permissions/types.ts src/registry/permissions-registry.ts src/features/<modulo>/module.ts
git commit -m "feat(<modulo>): adicionar permissão {{PERMISSAO_KEY}}"
```

## Regras Obrigatórias

1. **snake_case** — sem acentos, sem caracteres especiais
2. **Grupo** — sempre vincular ao módulo
3. **Defaults** — sempre definir por ambiente
4. **Documentação** — sempre documentar
5. **Build** — sempre rodar build antes de commitar

## Padrões de Naming

| Ação | Prefixo | Exemplo |
|------|---------|---------|
| Ver/Listar | `<modulo>_ver` | `cadastros_ver` |
| Criar | `<modulo>_criar` | `cadastros_criar` |
| Editar | `<modulo>_editar` | `cadastros_editar` |
| Excluir | `<modulo>_excluir` | `cadastros_excluir` |
| Aprovar | `<modulo>_aprovar` | `cadastros_aprovar` |
| Reprovar | `<modulo>_reprovar` | `cadastros_reprovar` |
| Exportar | `<modulo>_exportar` | `cadastros_exportar` |
| Configurar | `<modulo>_configurar` | `cadastros_configurar` |

## Economia de Tokens

- **Lean-CTX:** Ler apenas arquivos necessários
- **Caveman:** Alterações cirúrgicas
- **Pre-flight:** Rodar build após cada alteração

## Estado atual (checagem de permissão em runtime)

### Guards de rota — qual usar

Toda rota em `src/routes/*.tsx` precisa de um destes três guards
(`src/components/guards/`):

| Guard | Quando usar |
|---|---|
| `RequirePermission` | Rota condicionada a permissão(ões) granular(es) e/ou acesso a módulo. Aceita `permissions` (OR por padrão, `requireAll` para AND), `modulo`, `paginas`. Super admin sempre passa. |
| `RequireSuperAdmin` | Rota exclusiva de super admin (telas globais, `/global/*`). |
| `RequireEmpresaAdmin` | Rota liberada para super admin OU `profile.role === "admin"` — não é sobre permissão granular, é sobre papel administrativo da empresa. |

Rotas sem nenhum dos três guards devem estar deliberadamente na allowlist de
`scripts/check-route-guards.mjs` (login, pré-cadastro, catálogo público,
shells de redirect) — ver Tarefa de CI abaixo.

### Checagem de permissão em componentes — use `useCan`/`useCanAny`/`useCanAll`

Além dos guards de rota, é comum precisar esconder/desabilitar um botão ou
trecho de UI dentro de uma página já protegida. Antes disso era feito
ad-hoc em cada componente, duplicando a checagem de super-admin:

```typescript
// padrão antigo, evitar em código novo
const podeSalvar = profile?.is_super_admin === true || permissoes?.lk_salvar === true;
```

Forma preferida agora — hook central em `src/core/auth/usePermission.ts`
(re-exportado por `~/core/auth` e `~/lib/auth`):

```typescript
import { useCan, useCanAny, useCanAll } from "~/lib/auth";

const podeSalvar = useCan("lk_salvar");                       // uma chave
const podeVer = useCanAny(["catalogo_colab_ver_produtos", "catalogo_colab_criar_orcamento"]); // OR
const podeGerenciar = useCanAll(["hub_ver_analytics", "hub_gerenciar_config"]);               // AND
```

Os três já embutem o bypass de super admin — não repita
`profile?.is_super_admin === true ||` na frente. Migração dos ~196 pontos de
checagem ad-hoc existentes no código é gradual; uma primeira leva de ~12
arquivos já foi convertida (rotas de `cadastros`, `catalogo` colaborador e
`gerador-links`) como prova de conceito — não assuma que a migração está
completa, sempre cheque se o arquivo que você está tocando ainda usa o
padrão antigo antes de replicá-lo.

### Aviso: duas telas de gestão de permissão

Hoje existem **duas** telas que editam a mesma tabela `permissoes` de formas
distintas: `/credenciais` e `/empresa/permissoes`. Isso é drift conhecido —
há uma fase futura planejada para consolidar as duas em uma única tela.
Até lá, ao mexer em permissões via UI, confirme em qual das duas o usuário
está para não presumir que só existe uma.

### Invalidação reativa

`AuthProvider` (`src/core/auth/AuthProvider.tsx`) assina Supabase Realtime na
tabela `permissoes` filtrada pelo usuário logado — uma alteração feita por um
admin é refletida na sessão já aberta do usuário afetado, sem precisar
deslogar/logar. Depende de Realtime habilitado na tabela (ver migration
`supabase/migrations/20260724000000_enable_realtime_permissoes.sql`).

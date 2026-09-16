---
name: responsividade
description: >
  Analisa a responsividade de um módulo do ERP Odonto, gera documentação completa
  e IMPLEMENTA o plano de correção sem quebrar o funcionamento do módulo ou aplicação.
  Trigger: /responsividade <nome_modulo>
  Use quando o usuario quiser analisar e corrigir a responsividade de qualquer modulo do projeto.
---

# Skill: Análise e Correção de Responsividade

Analisa responsividade, gera documentação e implementa correções em `docs-projeto/doc-responsividade/resp-{modulo}/`.

## Uso

```
/responsividade <nome_modulo>
```

Exemplo: `/responsividade cadastros`

## Workflow

### Fase A: Análise

#### Passo 1: Localizar rotas do módulo

1. Ler `src/features/<modulo>/module.ts` para extrair array `routes`
2. Mapear cada rota para seu arquivo em `src/routes/`:
   - Convenção: `/modulo/sub` → `src/routes/modulo.sub.tsx`
3. Ler também o `AppLayout` em `src/components/layout/AppLayout.tsx` para entender o layout global

#### Passo 2: Analisar cada rota

Para cada arquivo de rota, extrair:

1. **Container principal** — classes de layout raiz
2. **Header** — padrão de empilhamento (flex-col → flex-row)
3. **Grids** — padrões de colunas por breakpoint (grid-cols-1 → md: → lg:)
4. **Cards** — padding, touch targets, hover states
5. **Filtros** — empilhamento em mobile
6. **Modais** — largura, padding, scroll
7. **Botões** — min-h, min-w, touch targets
8. **Estados vazios** — EmptyState, Skeleton

#### Passo 3: Verificar padrões problemáticos

Buscar por padrões que causam problemas em touch:

| Padrão | Problema | Solução |
|--------|----------|---------|
| `opacity-0 group-hover:opacity-100` | Invisível em touch | `md:opacity-0 md:group-hover:opacity-100` |
| `text-4xl` sem responsivo | Overflow em mobile | `text-3xl sm:text-4xl` |
| `min-h` ausente em botões | Touch target pequeno | Adicionar `min-h-[44px]` |
| `grid-cols-6` em lg | Colunas apertadas | `lg:grid-cols-5 xl:grid-cols-6` |
| Skeleton sem `role` | Acessibilidade | Adicionar `role="status"` |

#### Passo 4: Criar diretório de saída

```bash
mkdir -p docs-projeto/doc-responsividade/resp-{modulo}
```

#### Passo 5: Gerar documento de análise

Salvar em `docs-projeto/doc-responsividade/resp-{modulo}/cadastros.md` com a estrutura:

1. **Objetivo** — escopo da análise
2. **Rotas Analisadas** — tabela de rotas
3. **Framework de Responsividade** — breakpoints Tailwind
4. **Análise por Rota** — seção por rota com:
   - Padrões de layout (classes Tailwind)
   - Tabela de verificação (Critério | Status | Observação)
5. **Padrões de Layout Global** — AppLayout
6. **Problemas Identificados** — classificados por severidade
7. **Checklist de Responsividade** — mobile/tablet/desktop
8. **Plano de Correção** — tarefas por fase com:
   - Arquivo afetado + linha
   - Código atual → código corrigido
   - Critério de aceite
   - Matriz de priorização
   - Estimativa de tempo
9. **Testes Pós-Implementação** — viewports e checklist

---

### Fase B: Implementação das Correções

#### Passo 6: Perguntar ao usuário se deseja implementar

Exibir resumo da análise e perguntar:
- "Deseja implementar as correções identificadas?"
- Opções: "Sim, implementar tudo" / "Sim, apenas fase {N}" / "Não, apenas documentar"

#### Passo 7: Implementar correções (se aprovado)

**REGRAS ABSOLUTAS — NUNCA VIOLAR:**

1. **NUNCA alterar lógica de negócio** — apenas classes CSS/Tailwind
2. **NUNCA remover elementos JSX** — apenas reaplicar classes
3. **NUNCA alterar nomes de funções ou variáveis**
4. **NUNCA modificar handlers, callbacks ou useEffect**
5. **NUNCA alterar imports de componentes UI** (AlertDialog, Dialog, Input, etc.)
6. **NUNCA alterar a estrutura HTML/JSX** — apenas atributos className
7. **NUNCA remover props existentes** — apenas adicionar/modificar classes
8. **NUNCA alterar a lógica de rotas ou navegação**
9. **MANTER todos os modais intactos**
10. **MANTER todas as permissões e condicionais**

**Padrão de implementação seguro:**

```tsx
// ANTES (problema identificado)
<div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">

// DEPOIS (correção aplicada — APENAS classes modificadas)
<div className="flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100">
```

**Ordem de implementação por fase:**

| Fase | Tipo | Ação |
|------|------|------|
| 1 | Crítica | Editar classes de touch/hover |
| 2 | Média | Editar classes de tipografia/grid |
| 3 | Baixa | Editar classes de acessibilidade |

**Para cada tarefa:**

1. Ler o arquivo atual
2. Identificar a linha exata com o problema
3. Aplicar a correção (apenas classes Tailwind)
4. Verificar que NENHUMA outra linha foi alterada
5. Confirmar que a lógica permanece idêntica

#### Passo 8: Validação pós-implementação

Após cada edição, verificar:

1. **Sem erros TypeScript**: `npx tsc --noEmit 2>&1 | grep {arquivo}`
2. **Sem mudanças em lógica**: Comparar linhas alteradas — apenas classes
3. **Preservação de props**: Todas as props originais mantidas
4. **Estrutura JSX intacta**: Nenhum elemento adicionado/removido

#### Passo 9: Atualizar documento de análise

Adicionar ao final do documento:

```markdown
---

## 12. Implementação Realizada

| Data | Fase | Tarefas | Status |
|------|------|---------|--------|
| {data} | 1 | {tarefas} | ✅ Concluído |

### Alterações Aplicadas

| Arquivo | Linha | Antes | Depois |
|---------|-------|-------|--------|
| `{arquivo}` | {L} | `{antes}` | `{depois}` |

### Validação

- [x] TypeScript sem erros
- [x] Lógica preservada
- [x] JSX intacto
- [x] Apenas classes modificadas
```

#### Passo 10: Retornar resumo final

Exibir ao usuário:
- Caminho do arquivo atualizado
- Número de correções aplicadas
- Status da validação (erros TypeScript)
- Arquivos modificados

---

## Template de Saída (Documento)

```markdown
# Análise de Responsividade — Módulo {Nome}

> Documento de análise de responsividade do módulo {Nome} do ERP Odonto.
> Data da análise: {data}

---

## 1. Objetivo

Verificar se todas as rotas do módulo {Nome} seguem o padrão **Mobile-First** e garantem
usabilidade em qualquer tamanho de tela, desde dispositivos móveis compactos (320px) até
desktops amplos (1920px+).

---

## 2. Rotas Analisadas

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/{modulo}/` | `{modulo}.tsx` | {descrição} |

---

## 3. Framework de Responsividade

A aplicação utiliza **Tailwind CSS** com breakpoints padrão:

| Breakpoint | Prefixo | Largura | Uso |
|------------|---------|---------|-----|
| Mobile | (sem prefixo) | 0px — 639px | Mobile-First (padrão) |
| SM | `sm:` | 640px+ | Mobile landscape |
| MD | `md:` | 768px+ | Tablets |
| LG | `lg:` | 1024px+ | Desktops |
| XL | `xl:` | 1280px+ | Desktops amplos |

---

## 4. Análise por Rota

### 4.1 `/{modulo}/`

#### Layout Principal
- **Container**: `{classes}`
- **Header**: `{classes}`

#### Grids
- `{elemento}`: `{classes}`
  - Mobile: {x} colunas
  - MD: {y} colunas
  - LG: {z} colunas

#### Verificação de Responsividade

| Critério | Status | Observação |
|----------|--------|------------|
| {critério} | ✅/⚠️/❌ | {observação} |

---

## 5. Problemas Identificados

### 5.1 Críticos
- {problema}: {impacto}

### 5.2 Médios
- {problema}: {sugestão}

### 5.3 Baixos
- {problema}: {sugestão}

---

## 6. Plano de Correção

### Fase 1 — Bugs Críticos
#### Tarefa 1.1: {nome}
- **Arquivo**: {caminho}:{linha}
- **Problema**: `{código atual}`
- **Solução**: `{código corrigido}`
- **Critério**: {critério de aceite}

### Fase 2 — Adequações
...

### Fase 3 — Melhorias
...

### Matriz de Priorização

| Fase | Tarefa | Prioridade | Esforço | Impacto |
|------|--------|------------|---------|---------|
| 1 | 1.1 | Crítica | Baixo | Alto |

### Estimativa de Tempo

| Fase | Tarefas | Tempo |
|------|---------|-------|
| Total | N tarefas | ~Xmin |

---

## 7. Testes Pós-Implementação

### Viewports

| Dispositivo | Largura | Alto | Testar |
|-------------|---------|------|--------|
| iPhone SE | 375px | 667px | {itens} |
| iPad Mini | 768px | 1024px | {itens} |
| Desktop | 1280px | 800px | {itens} |

### Checklist

- [ ] Nenhum overflow horizontal
- [ ] Todos os botões com min-h 44px
- [ ] Textos não vazam em 320px
- [ ] Touch funciona corretamente
```

---

## Regras

### Para Análise
1. **NUNCA inventar problemas** — apenas reportar o que existe no código
2. Ler TODOS os arquivos de rota antes de gerar o documento
3. Classificar problemas por severidade: Crítico/Médio/Baixo
4. Incluir código atual e corrigido em cada tarefa
5. Estimar tempo realista (não subestimar)
6. Validar que o diretório de saída existe antes de escrever
7. Usar a data atual no cabeçalho do documento

### Para Implementação
1. **NUNCA alterar lógica de negócio** — apenas classes CSS/Tailwind
2. **NUNCA remover elementos JSX** — apenas reaplicar classes
3. **NUNCA alterar nomes de funções ou variáveis**
4. **NUNCA modificar handlers, callbacks ou useEffect**
5. **NUNCA alterar imports de componentes UI**
6. **NUNCA alterar a estrutura HTML/JSX**
7. **NUNCA remover props existentes**
8. **NUNCA alterar a lógica de rotas ou navegação**
9. MANTER todos os modais intactos
10. MANTER todas as permissões e condicionais
11. Validar TypeScript após cada edição
12. Confirmar que apenas classes foram alteradas

# Skill: Implementar Mapa Dark Premium

**Trigger:** Usuário disser "Implementar" no contexto de mapa de presença / dark premium.

## Workflow Automático

### Passo 1: Branch

- Verificar se está em `main` ou `master`
- Criar branch `feature/mapa-dark-premium` (se não existir)
- Alternar para ela

### Passo 2: Documento de Design

- Salvar `docs-projeto/2026-06-30-mapa-dark-premium-design.md`

### Passo 3: Tokens CSS

- Editar `src/styles/globals.css`:
  - Atualizar `--state-exclusive` para `#d4a843`
  - Atualizar `--state-nonexclusive` para `#b8944a`
  - Atualizar `--state-empty` para `#0f1724`
  - Atualizar `--map-stroke` para `#1e2d45`
  - Atualizar `--map-stroke-selected` para `#f0d080`
  - Adicionar `--state-glow`
  - Adicionar `--grad-exclusive-1`, `--grad-exclusive-2`, `--grad-partial-1`, `--grad-partial-2`
  - Atualizar `--heat-1` a `--heat-5`
  - Adicionar classe `.state-glow`

### Passo 4: BrazilMap.tsx

- Adicionar `<defs>` com gradientes no SVG
- Implementar tooltip flutuante com Lucide icons
- Substituir `<circle>` pins por SVG pin shape
- Adicionar animação de entrada em cascata
- Adicionar glow no estado selecionado
- Implementar cluster de pins sem lat/lng

### Passo 5: PublicMapShell.tsx

- Adicionar stats por região no header
- Substituir legenda por legenda contextual
- Adicionar filtro por região
- Aprimorar accordion com borda e barra de densidade

### Passo 6: StateDetailSheet.tsx

- Adicionar abas (Distribuidores / Consultores)
- Adicionar campo de busca com filtro
- Grid de cards com borda esquerda colorida
- Drawer mode mobile

### Passo 7: EntityDetailDialog.tsx

- Avatar circular com ícone + cor do pin
- Grid 2 colunas
- Botões "Ver no mapa" e "Abrir rota"

### Passo 8: Verificação

- Rodar `npm run lint`
- Rodar `npm run format`
- Se tudo OK: mensagem de sucesso

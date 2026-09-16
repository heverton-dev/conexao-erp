# Skill: Implementar Plan

Salva o plano, cria branch de trabalho e executa a implementação completa.

## Trigger

Quando o usuário disser "IMPLEMENTAR", "IMPLEMENTAR PLANO", "EXECUTAR PLANO" ou qualquer variação similar.

## Workflow

### Step 1: Salvar plano em docs-projeto

1. Ler o plano atual do arquivo `.mimocode/plans/*.md`
2. Criar diretório `docs-projeto/` se não existir
3. Copiar o plano para `docs-projeto/<nome-do-plano>.md` (usar o nome do arquivo plan ou slug do título)

```bash
# Exemplo
cp .mimocode/plans/1784030646500-neon-engine.md docs-projeto/imagem-produtos-catalogo.md
```

### Step 2: Criar branch de trabalho

1. Verificar se há changes não commitados (`git status`)
2. Se houver, fazer stash (`git stash`)
3. Criar branch a partir da branch atual:
   - Nome da branch: slug do plano (ex: `feat/imagem-produtos-catalogo`)
   - Usar prefixo `feat/` para features, `fix/` para bugs, `refactor/` para refatorações

```bash
git checkout -b feat/imagem-produtos-catalogo
```

### Step 3: Sair do modo Plan

Chamar `plan_exit` para sair do modo plan e entrar no modo build.

### Step 4: Executar implementação

1. Ler o plano salvo em `docs-projeto/`
2. Executar cada passo do plano sequencialmente
3. Rodar `npm run build` após cada alteração significativa para validar
4. Ao final, commitar todas as alterações na branch

### Step 5: Commit final

```bash
git add .
git commit -m "feat(catalogo): implementar imagens de produtos

- Tabela unificada catalogo_imagens_produto
- Upload Supabase Storage (max 5MB)
- URL externa (S3)
- Google Drive URL conversion
- Componente ImageUploader com drag-and-drop
- Integracao no ProdutoFormModal
- Queries atualizadas para implante/abutment/kit"
```

## Formato do arquivo salvo

O plano deve ser salvo com:
- **Nome**: slug do título do plano ou nome do arquivo original
- **Extensão**: `.md`
- **Localização**: `docs-projeto/`

Exemplo: `docs-projeto/imagem-produtos-catalogo.md`

## Regras

1. **SEMPRE salvar o plano ANTES de começar a implementar**
2. **SEMPRE criar branch ANTES de modificar código**
3. **SEMPRE rodar build após alterações para validar**
4. **Commit com mensagem descritiva no final**
5. **Não pular passos do plano**
6. **Se um passo falhar, bloquear e reportar ao usuário**

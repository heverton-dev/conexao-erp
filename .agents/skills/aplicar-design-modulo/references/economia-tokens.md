# Técnicas de Economia de Tokens

> Referência: AGENTS.md - Seção "Eficiência de Tokens"

## 1. Skill-First

**Antes de tarefa complexa, checar skills disponíveis.**

```bash
# Verificar skills em
.agents/skills/
.codex/skills/
.opencode/skills/
```

## 2. Caveman

**Estilo ultra-condensado - sem markdown decorativo.**

```markdown
# ❌ Ruído
Aqui está a correção que você pediu para o componente Button...

# ✅ Caveman
Button.tsx alterado. Variante ghost-edit adicionada.
```

**Regas:**
- SEM greetings ou explicações desnecessárias
- SEM re-emitir arquivos inteiros
- Apenas diffs unificados ou chunks cirúrgicos
- Direto ao ponto: "[Arquivo] alterado. [Razão]"
- Explicações SOMENTE com "?"

## 3. Headroom

**Filtro para logs longos - remove ruído.**

```bash
# Usar headroom-filter.js para processar logs
node headroom-filter.js < log-output.txt
```

## 4. Lean-CTX

**Estratégia para limitação de contexto.**

### Regras:
- **Não usar ferramentas genéricas:** Evitar `cat` ou `grep` em diretórios grandes
- **Ler assinaturas primeiro:** Priorizar interfaces TypeScript e `index.d.ts`
- **Agrupar edições:** Usar multi-file writes em vez de trocas incrementais
- **Executar com cache interno:** Consolidar subtarefas em comando único

### Exemplo:
```bash
# ❌ Ruim - ler arquivo inteiro
read src/components/ui/button.tsx

# ✅ Bom - ler apenas interface
grep "export interface" src/components/ui/button.tsx
```

## 5. Pre-flight Check

**Verificação antes de modificações estruturais.**

```bash
# Rodar antes de mudanças
npm run check:types
npm run test:safe
npm run build
```

## 6. Lazy Reading

**Ler arquivos somente quando necessário.**

```bash
# ❌ Ruim - ler tudo
read src/features/cadastros/**/*.tsx

# ✅ Bom - ler sob demanda
read src/features/cadastros/module.ts  # Só o necessário
```

## 7. Context Clearing

**Sugerir /clear ao finalizar etapas longas.**

```
/clear
```

## 8. RTK (Real-Time Knowledge)

**Manter lições aprendidas.**

```markdown
### 📝 SCRATCHPAD RTK

- **Learnt**: [descoberta importante]
- **Regra**: [regra identificada]
```

## Aplicação na Skill

Ao aplicar design system:

1. **Lean-CTX:** Ler apenas `ds-<modulo>.md` e CSS próprio
2. **Caveman:** Alterações cirúrgicas, sem re-emitir arquivos
3. **Pre-flight:** Rodar `npm run build` após cada alteração
4. **Lazy Reading:** Não ler componentes UI existentes se já conhecidos
5. **RTK:** Documentar padrões descobertos

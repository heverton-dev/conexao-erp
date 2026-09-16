# Skill: criar-componente-modulo

## Descrição
Cria componente React seguindo padrões shadcn/ui do ERP Odonto.

## Trigger
- "criar componente"
- "novo componente"

## Steps

### 1. Validar nome
- PascalCase (ex: `ListaClientes`)
- Verificar se já existe

### 2. Gerar componente
- Usar template com CVA
- Incluir variantes (variant, size)
- Exportar via forwardRef

### 3. Adicionar exportação
- Atualizar index.ts do módulo

### 4. Commit
```bash
git add src/features/<modulo>/components/<Componente>.tsx
git commit -m "feat(<modulo>): criar componente <Componente>"
```

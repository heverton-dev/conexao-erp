#!/bin/bash
# Validação pré-design: verifica se módulo está pronto para receber design system

MODULO=$1
FEAT_PATH="src/features/$MODULO"

echo "=== Validação do Módulo: $MODULO ==="

# Verificar se diretório existe
if [ ! -d "$FEAT_PATH" ]; then
  echo "❌ Diretório não encontrado: $FEAT_PATH"
  exit 1
fi

# Verificar module.ts
if [ ! -f "$FEAT_PATH/module.ts" ]; then
  echo "❌ module.ts não encontrado"
  exit 1
fi

# Verificar permissions.ts
if [ ! -f "$FEAT_PATH/permissions.ts" ]; then
  echo "⚠️  permissions.ts não encontrado (opcional)"
fi

# Verificar CSS próprio
CSS_FILES=$(find "$FEAT_PATH" -name "*.css" 2>/dev/null | wc -l)
if [ "$CSS_FILES" -gt 0 ]; then
  echo "ℹ️  CSS próprio encontrado: $CSS_FILES arquivo(s)"
fi

# Verificar componentes TSX
TSX_FILES=$(find "$FEAT_PATH" -name "*.tsx" 2>/dev/null | wc -l)
echo "ℹ️  Componentes TSX: $TSX_FILES arquivo(s)"

# Verificar documento de referência
DOC_PATH="docs-projeto/docs-design-system/ds-$MODULO.md"
if [ -f "$DOC_PATH" ]; then
  echo "✅ Documento de referência encontrado: $DOC_PATH"
else
  echo "⚠️  Documento de referência não encontrado: $DOC_PATH"
  echo "   Usando ds-erp.md como referência global"
fi

# Build check
echo ""
echo "=== Verificando Build ==="
if npm run build 2>&1 | grep -q "error"; then
  echo "❌ Build com erros - corrigir antes de aplicar design"
  exit 1
else
  echo "✅ Build passando"
fi

echo ""
echo "=== Validação Concluída ==="
echo "Módulo pronto para receber design system."

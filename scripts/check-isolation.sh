#!/bin/bash
# Script de validação de isolamento de módulos
# Verifica que nenhuma feature importa de outra feature (exceto a si mesma)
#
# Exceções aceitas:
# - imports de tipo (type ... from) são permitidos
# - chamadas de função de dados de "módulos compartilhados" (empresas) são permitidas
# - imports de ~/components/ui/ são permitidos

set -e

FEATURES_DIR="src/features"
ERRORS=0

echo "=== Verificando isolamento de módulos ==="
echo ""

for dir in "$FEATURES_DIR"/*/; do
  module=$(basename "$dir")
  echo "--- Módulo: $module ---"

  # Encontra imports de outras features
  # Exceções: type imports, imports de empresas (acesso a dados compartilhados)
  violations=$(grep -rn "from \"~/features/" "$dir" --include="*.ts" --include="*.tsx" 2>/dev/null \
    | grep -v "from \"~/features/$module" \
    | grep -v "type.*from" \
    | grep -v "from \"~/features/empresas" \
    || true)

  if [ -n "$violations" ]; then
    echo "  ⚠️  Violações encontradas:"
    echo "$violations" | while read line; do
      echo "    $line"
    done
    ERRORS=$((ERRORS + 1))
  else
    echo "  ✅ Isolado"
  fi
done

echo ""
echo "=== Verificando imports de features em core/ ==="

core_violations=$(grep -rn "from \"~/features/" src/core/ --include="*.ts" --include="*.tsx" 2>/dev/null || true)

if [ -n "$core_violations" ]; then
  echo "⚠️  core/ importa de features/:"
  echo "$core_violations" | while read line; do
    echo "  $line"
  done
  ERRORS=$((ERRORS + 1))
else
  echo "✅ core/ está limpo"
fi

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "✅ Todos os módulos estão isolados!"
  exit 0
else
  echo "❌ $ERRORS violação(ão) encontrada(s)"
  exit 1
fi

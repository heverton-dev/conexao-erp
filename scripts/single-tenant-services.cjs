/**
 * Script para refatorar services do catálogo para single-tenant.
 * 
 * Uso: node scripts/single-tenant-services.js
 * 
 * O que faz:
 * 1. Adiciona import de EMPRESA_ID no topo de cada service
 * 2. Substitui parâmetro empresaId por EMPRESA_ID nas funções
 * 3. Substitui uso de empresaId por EMPRESA_ID no corpo das funções
 */

const fs = require('fs');
const path = require('path');

const SERVICES_DIR = path.join(__dirname, '../src/features/catalogo/services');
const EMPRESA_ID_IMPORT = 'import { EMPRESA_ID } from "~/config/empresa"';

// Lista de arquivos para processar
const files = fs.readdirSync(SERVICES_DIR).filter(f => f.endsWith('.service.ts'));

let totalChanges = 0;

for (const file of files) {
  const filePath = path.join(SERVICES_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // 1. Adicionar import se não existe
  if (!content.includes('EMPRESA_ID')) {
    // Adicionar após primeira linha de import
    const firstImportIdx = content.indexOf('import ');
    if (firstImportIdx !== -1) {
      const lineEnd = content.indexOf('\n', firstImportIdx);
      content = content.slice(0, lineEnd + 1) + EMPRESA_ID_IMPORT + '\n' + content.slice(lineEnd + 1);
    }
  }
  
  // 2. Substituir parâmetro empresaId: string nas assinaturas de função
  // Padrão: (empresaId: string, ...) → (..., ...) mas manter os outros params
  content = content.replace(/\(empresaId: string,\s*/g, '(');
  content = content.replace(/async function \w+\(empresaId: string\)/g, (match) => match.replace('empresaId: string', ''));
  
  // 3. Substituir uso de empresaId por EMPRESA_ID no corpo
  // Cuidado: não substituir em comentários ou strings
  content = content.replace(/\bempresaId\b/g, 'EMPRESA_ID');
  
  // 4. Corrigir: se a função ficou com parâmetro vazio no início, ajustar
  // Ex: (, sku: string) → (sku: string)
  content = content.replace(/\(\s*,\s*/g, '(');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file} - refatorado`);
    totalChanges++;
  } else {
    console.log(`⏭️  ${file} - sem mudanças`);
  }
}

console.log(`\n📊 Total: ${totalChanges} arquivos refatorados`);

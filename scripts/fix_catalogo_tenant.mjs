import fs from 'fs';
import path from 'path';

const routesDir = path.join(process.cwd(), 'src/routes');
const files = fs.readdirSync(routesDir).filter(f => f.startsWith('catalogo.admin.'));

for (const file of files) {
  const p = path.join(routesDir, file);
  let content = fs.readFileSync(p, 'utf-8');

  // Remove do payload: empresa_id: EMPRESA_ID
  content = content.replace(/,?\s*empresa_id:\s*EMPRESA_ID\s*,?/g, function(match) {
    if (match.startsWith(',') && match.endsWith(',')) return ', ';
    if (match.startsWith('{') || match.endsWith('}')) return match.replace(/empresa_id:\s*EMPRESA_ID\s*,?/, ''); // simplistic fallback
    return '';
  });
  
  // Limpa propriedades soltas caso tenham sobrado (ex: inicio do objeto)
  content = content.replace(/\{\s*empresa_id:\s*EMPRESA_ID\s*,?/g, '{');
  content = content.replace(/,\s*empresa_id:\s*EMPRESA_ID\s*\}/g, '}');

  // Remove queries: .eq("empresa_id", empresaId) e variantes
  content = content.replace(/\.eq\(['"]empresa_id['"],\s*(empresaId|EMPRESA_ID)\)/g, '');

  fs.writeFileSync(p, content);
  console.log(`Updated ${file}`);
}

const servicesDir = path.join(process.cwd(), 'src/features/catalogo/services');
if (fs.existsSync(servicesDir)) {
  const serviceFiles = fs.readdirSync(servicesDir).filter(f => f.endsWith('.ts'));
  for (const file of serviceFiles) {
    const p = path.join(servicesDir, file);
    let content = fs.readFileSync(p, 'utf-8');
    content = content.replace(/\.eq\(['"]empresa_id['"],\s*(empresaId|EMPRESA_ID)\)/g, '');
    fs.writeFileSync(p, content);
    console.log(`Updated service ${file}`);
  }
}

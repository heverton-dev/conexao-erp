const fs = require('fs');
const { execSync } = require('child_process');
try {
  const original = execSync('git show HEAD:docs-projeto/docs-ARCHIFY/cadastros-lifecycle.html').toString();
  fs.writeFileSync('docs-projeto/docs-ARCHIFY/cadastros-lifecycle-limpo.html', original);
  console.log("Recuperado com sucesso");
} catch(e) {
  console.log("Erro");
}

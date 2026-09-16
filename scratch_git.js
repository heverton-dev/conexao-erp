const { execSync } = require('child_process');
try {
  execSync('git checkout docs-projeto/docs-ARCHIFY/cadastros-lifecycle.html');
  console.log("Git checkout ok");
} catch (e) {
  console.log(e.stdout ? e.stdout.toString() : e.message);
  console.log(e.stderr ? e.stderr.toString() : '');
}

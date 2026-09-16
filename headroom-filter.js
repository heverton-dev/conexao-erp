import { spawn } from 'child_process';

// Captura o comando que você quer rodar (ex: vitest, npm run test)
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ Headroom: Forneça um comando. Ex: node headroom-filter.js npm test');
  process.exit(1);
}

const command = args[0];
const commandArgs = args.slice(1);

// Executa o processo filho na sua máquina
const child = spawn(command, commandArgs, { shell: true });

let stdoutBuffer = '';
let stderrBuffer = '';

child.stdout.on('data', (data) => { stdoutBuffer += data.toString(); });
child.stderr.on('data', (data) => { stderrBuffer += data.toString(); });

child.on('close', (code) => {
  // Se o comando rodar com sucesso, exibe o log normal curto
  if (code === 0) {
    console.log(stdoutBuffer);
    process.exit(0);
  }

  // Se falhar, o Headroom entra em ação limpando o lixo de tokens!
  console.error(`\n🚨 [HEADROOM ACTIVATED] Comando falhou com código ${code}. Compactando logs...`);
  
  const fullLog = stdoutBuffer + '\n' + stderrBuffer;
  const lines = fullLog.split('\n');

  // Filtros Regex para remover lixo visual que gasta tokens invisíveis
  const filteredLines = lines.filter(line => {
    const isProgress = line.includes('↷') || line.includes('loading') || line.includes('↳');
    const isSuccess = line.includes('✓') || line.includes('passed');
    const isTraceNoise = line.includes('node_modules') && !line.includes('src/'); // Remove pilhas internas do Node
    return !isProgress && !isSuccess && !isTraceNoise;
  });

  // Limita o retorno final para no máximo as 25 linhas mais importantes do erro
  const maxLines = 25;
  const finalOutput = filteredLines.slice(-maxLines).join('\n');

  console.log('\n========= LOG SURGICAL COMPACTADO PARA A IA =========');
  console.log(finalOutput || 'Nenhum erro explícito encontrado nas linhas filtradas.');
  console.log('======================================================');
  
  process.exit(code);
});

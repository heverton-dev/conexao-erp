---
name: deploy-vps
description: >
  Deploy workflow completo do ERP Odonto: commit → migration → push → merge → build → deploy.
  Inclui rollback automático, health check pós-deploy, versionamento e notificação.
  DISPARO: ativar SOMENTE quando o usuário disser "deploy", "/deploy" ou "fazer deploy".
  NÃO ativar em nenhum outro contexto.
---

# Deploy VPS — ERP Odonto

Deploy completo com pré-requisitos automáticos e rollback.

## Regra

Só executar quando o usuário disser "deploy" ou "/deploy" explicitamente.

## Fluxo Resumido

```
Commit → Migrations → Push → Merge (se branch) → Build → Deploy VPS
```

## Pré-requisitos

- `.env` no raiz do projeto com:
  - `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (frontend)
  - `SUPABASE_ACCESS_TOKEN` (Edge Functions via CLI)
  - `SUPABASE_DB_PASSWORD` (migrations via `pg`)
  - `DOCKER_HUB_USERNAME` (Docker Hub username)
  - `DOCKER_HUB_PASSWORD` (Docker Hub password)
  - `VPS_IP`
  - `VPS_USER`
  - `VPS_PASSWORD`
- **Node + `pg`** disponíveis (migrations via conexão direta)
- Build local deve passar

### Project ref

Extrair do `VITE_SUPABASE_URL`:
```
URL=https://<PROJECT_REF>.supabase.co  →  PROJECT_REF=<PROJECT_REF>
DB_URL=postgresql://postgres:<SUPABASE_DB_PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres
```

---

## Workflow Completo

### Step 0: Economia de Tokens

Seguir diretrizes de economia de tokens do AGENTS.md.

### Step 1: Verificar e Commitar mudanças locais

```bash
# Sincronizar docs antes de commit
node scripts/sync-docs.mjs

git status --porcelain
```

Se houver mudanças (staged ou unstaged):
1. Perguntar mensagem de commit (ou usar padrão automático)
2. `git add -A && git commit -m "<mensagem>"`
3. Se NÃO houver mudanças, pular para Step 2.

**Mensagem padrão automática** (se usuário não especificar):
```
feat(catalogo): update via deploy workflow
```

### Step 2: Verificar build local

```bash
npm run build
```

Se falhar, **INTERROMPER** — NÃO prosseguir.

### Step 3: Push para origin

```bash
git push origin main
```

Se estiver em branch feature, fazer push com `-u`:
```bash
git push -u origin <branch_name>
```

### Step 4: Merge (se estiver em branch feature)

Verificar se está em branch diferente de `main`:
```bash
CURRENT_BRANCH=$(git branch --show-current)
```

Se `CURRENT_BRANCH != "main"`:
```bash
git checkout main && git merge <branch_name> && git push origin main
```

Se já estiver em `main`, pular.

### Step 5: Aplicar Migrations (se houver SQL novo)

**Gate obrigatório antes de qualquer migration:**

```bash
npm run db:status      # repo x schema_migrations
npm run db:verificar   # migrations "aplicadas" cujo efeito NAO existe no schema
```

O ledger `supabase_migrations.schema_migrations` já mentiu neste projeto: 39
migrations foram inseridas à mão (`-- pre-applied`, `-- Obsoleta: ...`) sem que o
SQL rodasse, e o resultado foi 52 tabelas ausentes em produção. Ver
`docs/agents/drift-banco-vs-migrations.md`.

Se `db:verificar` apontar migration sem efeito, **INTERROMPER** e tratar o drift
antes de deployar.

**PROIBIDO:** inserir em `schema_migrations` sem executar o SQL. Se uma migration
é realmente obsoleta, **apagar o arquivo** — não marcá-la como aplicada.

Verificar se há migrations não aplicadas:
```bash
# Listar migrations locais
ls -1 supabase/migrations/*.sql | sort
```

Se houver migrations, aplicar via conexão direta ao banco:

```javascript
// Script: apply-migration.js
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Ler .env
const env = {};
for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/); // tolera `KEY = value`
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
}

const ref = env.VITE_SUPABASE_URL.replace('https://', '').split('.')[0];
const DB_URL = `postgresql://postgres:${encodeURIComponent(env.SUPABASE_DB_PASSWORD)}@db.${ref}.supabase.co:5432/postgres`;

const migrationsDir = 'supabase/migrations';
const files = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

(async () => {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  for (const file of files) {
    const version = file.split('_')[0];

    // Verificar se já foi aplicada
    const check = await client.query(
      'SELECT 1 FROM supabase_migrations.schema_migrations WHERE version = $1',
      [version]
    );

    if (check.rows.length > 0) {
      console.log(`SKIP (já aplicada): ${version}`);
      continue;
    }

    console.log(`Aplicando: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    try {
      await client.query(sql);
      await client.query(
        'INSERT INTO supabase_migrations.schema_migrations (version, statements) VALUES ($1, ARRAY[$2]::text[])',
        [version, '-- Applied via deploy workflow']
      );
      console.log(`OK: ${version}`);
    } catch (e) {
      console.error(`ERRO na migration ${version}: ${e.message}`);
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
  console.log('Migrations concluídas.');
})();
```

Executar:
```bash
node apply-migration.js
```

Se migration falhar, **INTERROMPER** — NÃO fazer deploy.

### Step 6: Deploy de Edge Function (se aplicável)

Se houver alterações em `supabase/functions/`:

```bash
TOKEN=$(grep SUPABASE_ACCESS_TOKEN .env | head -1 | sed 's/.*=//' | tr -d '"' | tr -d "'")
npx supabase login --token "$TOKEN"
npx supabase functions deploy <NOME_FUNCAO> --project-ref <PROJECT_REF>
```

### Step 7: Ler credenciais VPS

```bash
source .env
```

Variáveis necessárias:
- `DOCKER_HUB_USERNAME` (Docker Hub username)
- `DOCKER_HUB_PASSWORD` (Docker Hub password)
- `VPS_IP`
- `VPS_USER`
- `VPS_PASSWORD`

### Step 8: Determinar versão

**Formato:** `v2.X` onde X é o número do deploy (v2.1, v2.2, v2.3, ...)

```bash
# Descobrir última tag existente no Docker Hub e incrementar
# Consultar tags remotas: docker images hevertonperes/erp-odonto --format "{{.Tag}}"
# Ou usar git tags: git tag -l "v2.*" | sort -V | tail -1
# Incrementar o último número: v2.1 → v2.2 → v2.3
```

**Exemplo:** Se última tag é `v2.1`, próximo deploy será `v2.2`.

### Step 9: SSH na VPS + Backup

```python
import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=30)

# Backup da imagem atual
stdin, stdout, stderr = client.exec_command(
    "docker service inspect erp-odonto_app --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}' 2>/dev/null"
)
current_image = stdout.read().decode().strip()
client.exec_command(f"echo 'Rollback image: {current_image}' > /tmp/rollback-info.txt")
```

### Step 10: Git pull na VPS

```bash
cd /root/Cadastros-Conexao && git pull origin main
```

### Step 11: Docker build

```bash
cd /root/Cadastros-Conexao && docker build --no-cache \
  -t hevertonperes/erp-odonto:latest \
  -t hevertonperes/erp-odonto:v<NUMERO> \
  --build-arg VITE_SUPABASE_URL=<URL> \
  --build-arg VITE_SUPABASE_ANON_KEY=<KEY> \
  --build-arg VITE_EMPRESA_ID=<EMPRESA_ID> \
  --build-arg VITE_EMPRESA_SLUG=<EMPRESA_SLUG> .
```

**Se build falhar:** Interromper, NÃO push/update.

### Step 12: Docker push

```bash
docker push hevertonperes/erp-odonto:v<NUMERO>
docker push hevertonperes/erp-odonto:latest
```

### Step 13: Service update

```bash
docker service update --force --image hevertonperes/erp-odonto:v<NUMERO> erp-odonto_app
```

### Step 14: Health check

```bash
sleep 10
docker service ps erp-odonto_app --format "{{.CurrentState}}" | head -1
docker service logs erp-odonto_app --tail 20 2>&1 | grep -i "error\|fatal" || true
```

### Step 15: Rollback (se necessário)

Se health check falhar:
```bash
ROLLBACK_IMAGE=$(cat /tmp/rollback-info.txt | cut -d' ' -f3)
docker service update --force --image $ROLLBACK_IMAGE erp-odonto_app
```

### Step 16: Fechar SSH + Tag

```python
client.close()
```

Tag local:
```bash
git tag -a v<NUMERO> -m "Deploy v<NUMERO>" && git push origin v<NUMERO>
```

### Step 17: Notificar resultado

```markdown
## Deploy Concluído ✅

- **Versão:** v<NUMERO>
- **Branch:** <branch>
- **Commits:** <lista>
- **Migrations:** <lista ou "nenhuma">
- **Status:** Sucesso
- **Tempo:** ~Xmin

### Próximos passos
- Verificar em https://erp.vpsconexao.org
```

Ou em caso de falha:

```markdown
## Deploy com Falha ❌

- **Versão:** v<NUMERO>
- **Erro:** <descrição>
- **Rollback:** <status>

### Ação necessária
- <ação recomendada>
```

---

## Regras Obrigatórias

1. **Commit** — sempre commitar antes do deploy (Step 1)
2. **Build local** — sempre verificar antes do deploy (Step 2)
3. **Push** — sempre enviar para remote (Step 3)
4. **Merge** — se branch feature, merge em main (Step 4)
5. **Migrations** — se SQL novo, aplicar ANTES do deploy (Step 5)
6. **Backup** — sempre salvar imagem anterior (Step 9)
7. **Health check** — sempre verificar pós-deploy (Step 14)
8. **Rollback** — automático se falhar (Step 15)
9. **Tag** — versionar cada deploy (Step 16)
10. **Notificação** — sempre informar resultado (Step 17)

## Dois Alvos de Deploy

1. **Frontend** = Docker VPS (Steps 7-15)
2. **Backend/Supabase** = Edge Functions + migrations (Steps 5-6)

## Economia de Tokens

- **Lean-CTX:** Apenas comandos necessários
- **Caveman:** Deploy conciso
- **Pre-flight:** Verificar build local antes de tudo

#!/usr/bin/env tsx
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const MODULOS = [
  'admin', 'agentes', 'api-connectors', 'cadastros', 'catalogo',
  'clientes', 'credenciais', 'crm', 'dashboard', 'demos',
  'despesas', 'documentos', 'empresas', 'funis', 'gerador-links',
  'hub', 'integracoes', 'linktree', 'manutencao', 'mapas',
  'marketing', 'nps', 'precadastro', 'revisoes', 'rotas'
];

function getAllFiles(dir: string): string[] {
  let files: string[] = [];
  if (!existsSync(dir)) return files;
  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files = [...files, ...getAllFiles(fullPath)];
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath.replace(dir + '/', ''));
    }
  }
  return files;
}

function readModuloFiles(moduloKey: string) {
  const basePath = join('src/features', moduloKey);
  const files: Record<string, string> = {};
  
  const moduleTsPath = join(basePath, 'module.ts');
  if (existsSync(moduleTsPath)) files.moduleTs = readFileSync(moduleTsPath, 'utf-8');
  
  const permissionsPath = join(basePath, 'permissions.ts');
  if (existsSync(permissionsPath)) files.permissionsTs = readFileSync(permissionsPath, 'utf-8');
  
  const typesPath = join(basePath, 'types.ts');
  if (existsSync(typesPath)) files.tiposTs = readFileSync(typesPath, 'utf-8');

  const servicesDir = join(basePath, 'services');
  if (existsSync(servicesDir)) files.services = readdirSync(servicesDir).filter(f => f.endsWith('.ts'));

  const hooksDir = join(basePath, 'hooks');
  if (existsSync(hooksDir)) files.hooks = readdirSync(hooksDir).filter(f => f.endsWith('.ts'));

  const componentsDir = join(basePath, 'components');
  if (existsSync(componentsDir)) files.components = getAllFiles(componentsDir);

  const schemasDir = join(basePath, 'schemas');
  if (existsSync(schemasDir)) files.schemas = readdirSync(schemasDir).filter(f => f.endsWith('.ts'));

  const contextsDir = join(basePath, 'context');
  if (existsSync(contextsDir)) files.contexts = readdirSync(contextsDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
  const contextsDirPlural = join(basePath, 'contexts');
  if (existsSync(contextsDirPlural)) files.contexts = [...(files.contexts || []), ...readdirSync(contextsDirPlural).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))];

  return files;
}

function extrairEventos(moduleTs: string): string[] {
  const match = moduleTs.match(/events\s*:\s*\[([\s\S]*?)\]/);
  if (!match) return [];
  const keys = match[1].match(/'([^']+)'/g) || [];
  return keys.map(k => k.replace(/'/g, ''));
}

function extrairHasDesignConfig(moduleTs: string): boolean {
  return moduleTs.includes('hasDesignConfig: true');
}

function extrairSetup(moduleTs: string): string {
  const match = moduleTs.match(/setup\s*\(\)\s*\{([\s\S]*?)\n\}/);
  return match?.[1]?.trim() || '// setup não encontrado';
}

function extrairModuloInfo(moduleTs: string) {
  const keyMatch = moduleTs.match(/key\s*:\s*["']([^"']+)["']/);
  const nomeMatch = moduleTs.match(/nome\s*:\s*["']([^"']+)["']/);
  const descMatch = moduleTs.match(/descricao\s*:\s*["']([^"']+)["']/);
  const ambientesMatch = moduleTs.match(/ambientes\s*:\s*\[([^\]]+)\]/);
  return {
    key: keyMatch?.[1] || 'desconhecido',
    nome: nomeMatch?.[1] || 'Desconhecido',
    descricao: descMatch?.[1] || 'Sem descrição',
    ambientes: ambientesMatch ? ambientesMatch[1].split(',').map(s => s.trim().replace(/["']/g, '')) : []
  };
}

function extrairPermissoes(permissionsTs: string) {
  const perms: { key: string; label: string; group: string }[] = [];
  const matches = permissionsTs.matchAll(/registerPermission\s*\(\s*\{([\s\S]*?)\}\s*\)/g);
  for (const match of matches) {
    const perm = match[1];
    const keyMatch = perm.match(/chave\s*:\s*["']([^"']+)["']/);
    const labelMatch = perm.match(/label\s*:\s*["']([^"']+)["']/);
    const groupMatch = perm.match(/grupo\s*:\s*["']([^"']+)["']/);
    if (keyMatch) {
      perms.push({
        key: keyMatch[1],
        label: labelMatch?.[1] || 'Sem label',
        group: groupMatch?.[1] || 'sem grupo'
      });
    }
  }
  return perms;
}

function buscarRotasModulo(moduloKey: string): string[] {
  const routesDir = 'src/routes';
  if (!existsSync(routesDir)) return [];
  const allRoutes: string[] = [];
  function walk(dir: string) {
    const items = readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const full = join(dir, item.name);
      if (item.isDirectory()) walk(full);
      else if (item.name.endsWith('.tsx')) allRoutes.push(full.replace('src/routes/', '').replace('.tsx', ''));
    }
  }
  walk(routesDir);
  return allRoutes.filter(r => r.toLowerCase().includes(moduloKey.toLowerCase()) || r.toLowerCase().includes(moduloKey.replace('-', '_').toLowerCase()));
}

function buscarMigrationsModulo(moduloKey: string): string[] {
  const migrationsDir = join('supabase', 'migrations');
  if (!existsSync(migrationsDir)) return [];
  return readdirSync(migrationsDir).filter(f => f.endsWith('.sql') && (f.toLowerCase().includes(moduloKey.toLowerCase()) || f.toLowerCase().includes(moduloKey.replace('-', '_').toLowerCase()))).sort();
}

function detectarFeatureEspecial(moduloKey: string): string[] {
  const moduloPath = join('src/features', moduloKey);
  const features: string[] = [];
  if (existsSync(join(moduloPath, 'import'))) features.push('wizard-import');
  if (existsSync(join(moduloPath, 'wizard'))) features.push('wizard');
  if (existsSync(join(moduloPath, 'export'))) features.push('export');
  if (existsSync(join(moduloPath, 'sync'))) features.push('sync');
  if (existsSync(join(moduloPath, 'webhook'))) features.push('webhook');
  if (existsSync(join(moduloPath, 'ia'))) features.push('ia');
  if (existsSync(join(moduloPath, 'relatorios'))) features.push('relatorios');
  return features;
}

function gerarCapitulo00(moduloNome: string, moduloKey: string, temDesignConfig: boolean) {
  let md = `# Manual Técnico — Módulo ${moduloNome}\n\n`;
  md += `> Análise completa da arquitetura do módulo **${moduloNome}** (ERP Odonto), do macro ao micro, servindo de base para modelar, implementar e padronizar **novos módulos** no sistema.\n\n`;
  md += `## Como navegar\n\nLeia na ordem — cada documento assume que você já leu os anteriores:\n\n`;
  const caps = [
    ['01', 'Visão Macro', '01-visao-macro.md', 'Estrutura de pastas, module.ts, permissões'],
    ['02', 'Camada de Dados', '02-camada-dados.md', 'Tabelas Supabase, relacionamentos, RLS'],
    ['03', 'Sistema de Eventos', '03-sistema-de-eventos.md', 'Webhooks, dispararEventoModulo, eventos'],
    ['04', 'Estudo de Caso Principal', '04-estudo-caso-principal.md', 'Rota real fim-a-fim, anti-padrão'],
    ['05', 'Padrão Correto vs Anti-padrão', '05-estudo-caso-padrao-correto.md', 'Contraste implementação correta vs errada'],
    ['06', 'Área Pública/Externa', '06-area-publica.md', 'Fluxo cliente final, rotas não-admin, riscos'],
    ['07', 'Rotas do Colaborador', '07-rotas-colaborador.md', 'Rotas logadas não-admin'],
    ['08', 'Inventário Rotas Admin', '08-inventario-rotas-admin.md', 'Todas rotas admin: padrão ou bypass?'],
    ['09', 'Feature Específica', '09-feature-especifica.md', 'Funcionalidade única do módulo'],
    ['10', 'Padrões e Anti-padrões', '10-padroes-e-antipadroes.md', 'Tabela comparativa tudo que vale/nao vale'],
    ['11', 'Manual Técnico Novos Módulos', '11-manual-tecnico-novos-modulos.md', 'Checklist + esqueleto código']
  ];
  for (const [n, nome, arq, desc] of caps) md += `${parseInt(n)}. [**${nome}**](${arq}) — ${desc}\n`;
  md += `\n## Glossário rápido\n\n`;
  md += `- **SKU**: código identificação. Costuma ser PK da tabela.\n`;
  md += `- **FK**: coluna que aponta para OUTRA tabela.\n`;
  md += `- **PK**: identifica linha única.\n`;
  md += `- **RLS**: Row Level Security. \`USING (true)\` = acesso aberto.\n`;
  md += `- **Tabela-pivô N:M**: tabela auxiliar com duas colunas.\n`;
  md += `- **Fire-and-forget**: \`sem await\` + \`.catch(() => {})\`.\n`;
  md += `- **Evento/webhook**: aviso interno (ex: "registro criado").\n`;
  md += `- **Bypass**: tela usa \`supabase.from()\` direto (anti-padrão).\n`;
  md += `- **Single-tenant**: uma empresa. Sem \`empresa_id\`, RLS não filtra por empresa.\n`;
  md += `\n## Achados principais\n\n- **Análise pendente** — Complete capítulos 01-10.\n`;
  return md;
}

function gerarCapitulo01(moduloNome: string, moduloKey: string, moduleTs: string, files: any) {
  const info = extrairModuloInfo(moduleTs);
  const setup = extrairSetup(moduleTs);
  const hasDesign = extrairHasDesignConfig(moduleTs);
  const perms = files.permissionsTs ? extrairPermissoes(files.permissionsTs) : [];

  let md = `# 01 — Visão Macro do Módulo ${moduloNome}\n\n> Como o módulo **${moduloNome}** está organizado.\n\n`;
  md += `## 1. O que é o módulo\n\n\`src/features/${moduloKey}/module.ts\` define:\n\n`;
  md += `- **Chave**: \`"${info.key}"\`, **Nome**: "${info.nome}", **Descrição**: "${info.descricao}"\n`;
  md += `- **Ambientes**: \`${JSON.stringify(info.ambientes)}\`\n`;
  md += `- **hasDesignConfig**: ${hasDesign ? 'true' : 'false'} ${hasDesign ? '— tem personalização visual' : ''}\n`;
  md += `- **setup()**: registra permissões, nav items, defaults\n\n`;

  md += `## 2. Estrutura de pastas\n\n\`\`\`\nsrc/features/${moduloKey}/\n`;
  const rootFiles = ['module.ts', 'index.ts', 'permissions.ts', 'types.ts', 'onboarding.tsx', 'diagnostic.ts', 'AGENTS.md', 'CLAUDE.md', 'GEMINI.md'];
  for (const f of rootFiles) if (existsSync(join('src/features', moduloKey, f))) md += `├── ${f}\n`;
  const dirs = ['components', 'context', 'contexts', 'hooks', 'services', 'schemas', 'types', 'lib', 'import', 'styles', 'pages'];
  for (const d of dirs) {
    const dp = join('src/features', moduloKey, d);
    if (existsSync(dp)) {
      md += `├── ${d}/\n`;
      for (const item of readdirSync(dp)) md += `│   ├── ${item}\n`;
    }
  }
  md += `\`\`\`\n\n`;

  const pastasInfo: Record<string, string> = {
    components: 'Telas e blocos de UI',
    services: 'Camada de dados (Supabase)',
    hooks: 'React Query (queries/mutations)',
    schemas: 'Schemas Zod validação',
    types: 'Tipos TypeScript',
    context: 'Contextos React (negócio)',
    contexts: 'Contextos React (UI/compat)',
    lib: 'Utilitários internos',
    import: 'Wizards de importação',
    pages: 'Páginas completas'
  };

  for (const [pasta, desc] of Object.entries(pastasInfo)) {
    const dp = join('src/features', moduloKey, pasta);
    if (existsSync(dp)) {
      const arquivos = readdirSync(dp);
      if (arquivos.length > 0) {
        md += `### \`${pasta}/\` — ${desc} (${arquivos.length} itens)\n\n`;
        if (pasta === 'services' || pasta === 'hooks' || pasta === 'schemas') {
          for (const a of arquivos) md += `- **${a}**\n`;
          md += '\n';
        }
      }
    }
  }

  if (perms.length > 0) {
    md += `## 3. Permissões (${perms.length})\n\n`;
    for (const p of perms) md += `- **${p.key}**: ${p.label} (${p.group})\n`;
    md += '\n';
  }

  md += `## 4. Setup()\n\n\`\`\`typescript\n${setup}\n\`\`\`\n`;
  return md;
}

function gerarCapitulo02(moduloNome: string, moduloKey: string) {
  const migrations = buscarMigrationsModulo(moduloKey);
  let md = `# 02 — Camada de Dados do Módulo ${moduloNome}\n\n> Tabelas Supabase, relacionamentos, RLS do **${moduloNome}**.\n\n`;
  if (migrations.length === 0) {
    md += `⚠️ Nenhuma migration específica. Verifique \`supabase/migrations/\`.\n\n`;
  } else {
    md += `## Migrations (${migrations.length})\n\n`;
    for (const m of migrations) md += `- \`${m}\`\n`;
    md += '\n';
    const todasTabelas = new Set<string>();
    for (const m of migrations) {
      const sql = readFileSync(join('supabase', 'migrations', m), 'utf-8');
      const tabelas = [...sql.matchAll(/CREATE TABLE\s+(\w+)/gi)].map(m => m[1]);
      tabelas.forEach(t => todasTabelas.add(t));
    }
    md += `## Tabelas\n\n`;
    for (const t of todasTabelas) md += `### \`${t}\`\n\n- Migration: ${migrations.find(m => readFileSync(join('supabase', 'migrations', m), 'utf-8').includes(t)) || '?'}\n\n`;
  }
  md += `## Padrões single-tenant\n\n- Sem \`empresa_id\` (migração 20260721000000)\n- RLS \`USING (true)\` — controle via app\n- Tabelas pivô N:M = PK composta\n- \`ON UPDATE CASCADE\` em FKs\n- \`created_at\`, \`updated_at\` + trigger\n\n## Checklist\n- [ ] RLS habilitada?\n- [ ] Sem \`empresa_id\`?\n- [ ] PK composta em pivôs?\n- [ ] Trigger updated_at?\n`;
  return md;
}

function gerarCapitulo03(moduloNome: string, moduloKey: string, moduleTs: string, files: any) {
  const eventos = extrairEventos(moduleTs);
  let disparos: { arquivo: string; evento: string }[] = [];
  if (files.services) {
    for (const s of files.services) {
      const content = readFileSync(join('src/features', moduloKey, 'services', s), 'utf-8');
      const matches = content.matchAll(/dispararEventoModulo\s*\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']/g);
      for (const m of matches) disparos.push({ arquivo: s, evento: m[2] });
    }
  }
  let md = `# 03 — Sistema de Eventos do Módulo ${moduloNome}\n\n> Como **${moduloNome}** avisa o sistema (webhooks).\n\n`;
  md += `## Eventos declarados (${eventos.length})\n\n`;
  for (const e of eventos) md += `- **${e}**\n`;
  if (eventos.length === 0) md += `⚠️ Mínimo 2 eventos obrigatórios.\n`;
  md += '\n';

  md += `## Disparos reais (${disparos.length})\n\n`;
  const porEvento: Record<string, string[]> = {};
  for (const d of disparos) { if (!porEvento[d.evento]) porEvento[d.evento] = []; porEvento[d.evento].push(d.arquivo); }
  for (const [evt, arqs] of Object.entries(porEvento)) { md += `### ${evt}\n`; for (const a of arqs) md += `- \`${a}\`\n`; md += '\n'; }
  if (disparos.length === 0) md += `⚠️ Nenhum disparo encontrado.\n\n`;

  md += `## Padrão obrigatório\n1. \`events: ["e1", "e2"]\` no module.ts (mín 2)\n2. \`dispararEventoModulo(key, evento, payload)\` — 3 args\n3. \`.catch(() => {})\` — fire-and-forget, nunca await\n4. Payload tipado em types.ts\n\n## Conformidade\n| Evento | Declarado | Disparado | Status |\n|--------|-----------|-----------|--------|\n`;
  for (const e of eventos) md += `| ${e} | ✅ | ${disparos.some(d => d.evento === e) ? '✅' : '❌'} | ${disparos.some(d => d.evento === e) ? 'OK' : 'FALTA'} |\n`;
  for (const d of disparos) if (!eventos.includes(d.evento)) md += `| ${d.evento} | ❌ | ✅ (${d.arquivo}) | NÃO DECLARADO |\n`;
  return md;
}

function gerarCapitulo04(moduloNome: string, moduloKey: string) {
  let md = `# 04 — Estudo de Caso Principal: ${moduloNome}\n\n> Rota real fim-a-fim com anti-padrão.\n\n## TODO: Selecionar rota representativa\n- CRUD principal (criar/editar ${moduloNome.toLowerCase()})\n- Fluxo especial (import, wizard)\n\n## Template fluxo fim-a-fim\n### 1. Rota (TanStack Router)\n\`\`\`tsx\nexport const Route = createFileRoute('/${moduloKey}/\$id')({\n  component: ${moduloNome}DetalhePage,\n  beforeLoad: () => RequirePermission("${moduloKey}.ver")\n});\n\`\`\`\n\n### 2. Página\n\`\`\`tsx\nexport function ${moduloNome}DetalhePage() {\n  const { id } = useParams();\n  const { data } = use${moduloNome}(id);\n  return <PageLayout><PageHeader title="${moduloNome}" /><${moduloNome}Form data={data} /></PageLayout>;\n}\n\`\`\`\n\n### 3. Formulário (RHF + Zod)\n\`\`\`tsx\nexport function ${moduloNome}Form({ data, onSave }) {\n  const form = useForm<${moduloNome}Input>({ defaultValues: data });\n  return <Form {...form}><FormField name="nome" /><Button onClick={form.handleSubmit(onSave)}>Salvar</Button></Form>;\n}\n\`\`\`\n\n### 4. Hook (TanStack Query)\n\`\`\`typescript\nexport function use${moduloNome}(id: string) {\n  return useQuery({ queryKey: ["${moduloKey}", id], queryFn: () => ${moduloNome}Service.buscarPorId(id), enabled: !!id });\n}\n\`\`\`\n\n### 5. Service (padrão correto)\n\`\`\`typescript\nexport const ${moduloNome}Service = {\n  async atualizar(input) {\n    const { data } = await supabase.from("${moduloKey}").update(input).eq("id", input.id).select().single();\n    dispararEventoModulo("${moduloKey}", "${moduloKey}.atualizado", data).catch(() => {});\n    return data;\n  }\n};\n\`\`\`\n\n## Anti-padrões comuns\n### ❌ Bypass service\n\`\`\`tsx\n// ERRADO no componente\nawait supabase.from("${moduloKey}").update(...); // sem evento, sem cache\n\`\`\`\n### ❌ Evento só no create\nService tem evento no create mas não no update/delete.\n\n### ✅ Correto: SEMPRE service + evento em TODAS mutações + cache invalidado\n`;
  return md;
}

function gerarCapitulo05(moduloNome: string, moduloKey: string) {
  let md = `# 05 — Padrão Correto vs Anti-padrão (${moduloNome})\n\n## ✅ Service completo com eventos\n\`\`\`typescript\nexport const ${moduloNome}Service = {\n  async criar(input) { const { data } = await supabase.from("${moduloKey}").insert(input).select().single(); dispararEventoModulo("${moduloKey}", "${moduloKey}.criado", data).catch(() => {}); return data; },\n  async atualizar(input) { const { data } = await supabase.from("${moduloKey}").update(input).eq("id", input.id).select().single(); dispararEventoModulo("${moduloKey}", "${moduloKey}.atualizado", data).catch(() => {}); return data; },\n  async excluir(id) { await supabase.from("${moduloKey}").delete().eq("id", id); dispararEventoModulo("${moduloKey}", "${moduloKey}.excluido", { id }).catch(() => {}); }\n};\n\`\`\`\n\n## ❌ Anti-padrão: bypass + evento faltando\n\`\`\`tsx\n// Componente direto no supabase\nawait supabase.from("${moduloKey}").insert(data); // sem evento, sem cache\n\`\`\`\n\n## Comparativo\n| Aspecto | Correto | Anti-padrão |\n|---------|---------|-------------|\n| Dados | Via service | supabase.from direto |\n| Evento create | ✅ | ✅ |\n| Evento update | ✅ | ❌ |\n| Evento delete | ✅ | ❌ |\n| Cache | onSuccess hook | Manual/ausente |\n| Testável | Sim (mock) | Não |\n| Webhook | Notifica | Não |\n\n## Auditoria ${moduloNome} (TODO)\n| Service | create | update | delete | bypass? |\n|---------|--------|--------|--------|---------|\n| ${moduloKey}.service.ts | 🔍 | 🔍 | 🔍 | 🔍 |\n`;
  return md;
}

function gerarCapitulo06(moduloNome: string, moduloKey: string) {
  let md = `# 06 — Área Pública/Externa (${moduloNome})\n\n> Fluxo cliente final, rotas não-admin, riscos.\n\n## Rotas públicas (TODO: auditar src/routes/)\n\`\`\`tsx\nexport const Route = createFileRoute('/${moduloKey}-publico/\$slug')({\n  component: ${moduloNome}PublicoPage\n  // SEM RequirePermission\n});\n\`\`\`\n\n## Riscos conhecidos\n### ⚠️ RLS desabilitada\nMigração 20260721000000 desabilitou RLS em ~58 tabelas. Verificar reabilitação.\n### ⚠️ Filtro empresa_id inexistente\nCódigo legado filtra por \`empresa_id\` removido → falha produção.\n### ⚠️ Dados sensíveis expostos\nVerificar exposição apenas dados públicos (sem PII/financeiro).\n\n## Checklist\n- [ ] Listar rotas públicas\n- [ ] Verificar RLS tabelas acessadas\n- [ ] Confirmar sem filtro empresa_id\n- [ ] Validar apenas dados públicos\n- [ ] Testar acesso não-autenticado\n`;
  return md;
}

function gerarCapitulo07(moduloNome: string, moduloKey: string) {
  const rotas = buscarRotasModulo(moduloKey);
  let md = `# 07 — Rotas do Colaborador (${moduloNome})\n\n> Rotas logadas não-admin.\n\n## Encontradas (${rotas.length})\n\n`;
  for (const r of rotas) md += `- \`${r}\`\n`;
  md += '\n| Rota | Tipo | Permissão | Status |\n|------|------|-----------|--------|\n';
  for (const r of rotas) md += `| ${r} | Colaborador | RequirePermission? | 🔍 |\n`;
  md += '\n## Padrão esperado\n- RequirePermission\n- PageHeader + breadcrumbs\n- Mobile-first + Skeleton/ErrorState/EmptyState\n- Service → Hook → Componente\n\n## Checklist\n- [ ] Todas com RequirePermission?\n- [ ] Nenhuma supabase.from direto?\n- [ ] Eventos nas mutations?\n- [ ] Cache invalidado?\n';
  return md;
}

function gerarCapitulo08(moduloNome: string, moduloKey: string) {
  const rotas = buscarRotasModulo(moduloKey);
  const adminRotas = rotas.filter(r => r.includes('admin') || r.includes('Admin'));
  let md = `# 08 — Inventário Rotas Admin (${moduloNome})\n\n> ${adminRotas.length} rotas admin: padrão ou bypass?\n\n| # | Rota | Padrão? | Bypass? | Eventos | Cache | Obs |\n|---|------|---------|---------|---------|-------|-----|\n`;
  for (let i = 0; i < adminRotas.length; i++) md += `| ${i+1} | ${adminRotas[i]} | 🔍 | 🔍 | 🔍 | 🔍 | Pendente |\n`;
  md += '\n## Critérios\n### ✅ Padrão: RequirePermission + Hook→Service + Evento + Cache invalidado\n### ❌ Bypass: supabase.from direto + sem evento + sem cache + sem RequirePermission\n\n## Ação: `grep -r "supabase\\.from" src/routes/ --include="*${moduloKey}*"`\n';
  return md;
}

function gerarCapitulo09(moduloNome: string, moduloKey: string) {
  const features = detectarFeatureEspecial(moduloKey);
  let md = `# 09 — Feature Específica (${moduloNome})\n\n> Features: ${features.join(', ') || 'nenhuma detectada'}\n\n`;
  if (features.length === 0) {
    md += `## Verificar manualmente:\n- Wizard import (CSV/XLSX)\n- Exportação\n- Sync externo\n- Webhooks entrada\n- IA\n- Relatórios\n\n`;
  } else {
    for (const f of features) {
      md += `## ${f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}\n\n`;
      if (f === 'wizard-import') {
        md += `### Fluxo: Upload → Validação → Preview → Batch insert → Eventos → Relatório\n`;
        const importDir = join('src/features', moduloKey, 'import');
        if (existsSync(importDir)) {
          md += `### Arquivos:\n`;
          for (const file of readdirSync(importDir, { recursive: true })) md += `- \`${file}\`\n`;
        }
      }
      md += `### Checklist\n- [ ] Validação Zod robusta\n- [ ] Batch/transação performance\n- [ ] Eventos por registro\n- [ ] Tratamento erro + rollback\n- [ ] Log auditoria\n- [ ] Feedback progresso\n\n`;
    }
  }
  md += `## Template service feature\n\`\`\`typescript\nexport const ${moduloNome}FeatureService = {\n  async processar(input) { /* validar, batch, eventos, retornar */ }\n};\n\`\`\`\n`;
  return md;
}

function gerarCapitulo10(moduloNome: string, moduloKey: string) {
  let md = `# 10 — Padrões e Anti-padrões (${moduloNome})\n\n## ✅ Padrões (copiar)\n| # | Padrão | Onde | Exemplo |\n|---|--------|------|---------|\n| 1 | module.ts events[] (mín 2) | Todo módulo | \`events: ["m.criado", "m.atualizado"]\` |\n| 2 | Service layer isolada | Todo CRUD | \`ModuloService.criar()\` |\n| 3 | dispararEventoModulo 3 args + catch | Toda mutação | \`dispararEventoModulo("k","e",p).catch(() => {})\` |\n| 4 | Hooks React Query namespace | Data fetching | \`queryKey: ["modulo", "list"]\` |\n| 5 | Zod schemas em schemas/ | Validação | \`schemas/modulo.schema.ts\` |\n| 6 | RequirePermission rotas | Rota protegida | \`RequirePermission("modulo.ver")\` |\n| 7 | PageHeader + breadcrumbs | Toda página | \`<PageHeader title="..." />\` |\n| 8 | Skeleton/ErrorState/EmptyState | Listagens | \`<Skeleton />\` |\n| 9 | Single-tenant (sem empresa_id) | Modelo | Migração 20260721000000 |\n| 10 | RLS USING (true) + app control | Segurança | \`ALTER TABLE ... ENABLE RLS\` |\n\n## ❌ Anti-padrões (NÃO copiar)\n| # | Anti-padrão | Problema | Correção |\n|---|-------------|----------|----------|\n| 1 | supabase.from no componente | Bypass, sem evento, sem cache | Hook → Service |\n| 2 | Service sem evento | Webhook não notifica | Adicionar dispararEventoModulo |\n| 3 | Evento só no create | Update/delete invisíveis | Evento em TODAS mutações |\n| 4 | await dispararEventoModulo | Trava UI | .catch(() => {}) |\n| 5 | empresa_id injetado | Viola single-tenant | Remover |\n| 6 | RLS desabilitada | Dados expostos | Habilitar USING (true) |\n| 7 | Schema Zod duplicado | Divergência, 2x manutenção | Schema único em schemas/ |\n| 8 | context/ E contexts/ misturados | Confusão | Uma pasta context/ |\n| 9 | Tabela genérica forçada | Abstração vazada | Inline para negócio complexo |\n| 10 | window.confirm/alert | Proibido | AlertDialog / Dialog |\n\n## Auditoria ${moduloNome} (TODO)\n| Service | create | update | delete | bypass? |\n|---------|--------|--------|--------|---------|\n| ${moduloKey}.service.ts | 🔍 | 🔍 | 🔍 | 🔍 |\n`;
  return md;
}

function gerarCapitulo11(moduloNome: string, moduloKey: string) {
  let md = `# 11 — Manual Técnico Novos Módulos (base: ${moduloNome})\n\n## Checklist criação\n- [ ] 1. Pasta \`src/features/novo-modulo/\`\n- [ ] 2. module.ts (chave, nome, desc, ambientes, events[]≥2, hasDesignConfig, setup())\n- [ ] 3. permissions.ts (registerPermission)\n- [ ] 4. types.ts (Entity, InputCreate, InputUpdate, Filtros)\n- [ ] 5. schemas/ (Zod — reusado forms + services)\n- [ ] 6. services/ (CRUD + dispararEventoModulo em TODAS mutações)\n- [ ] 7. hooks/ (useQuery/useMutation + invalidação cache)\n- [ ] 8. components/ (forms, tables, modais + design system)\n- [ ] 9. Rotas src/routes/ (RequirePermission + lazy)\n- [ ] 10. Nav items no setup()\n- [ ] 11. Testes básicos\n- [ ] 12. \`npm run build\` passa\n- [ ] 13. \`npm run check:types\` passa\n\n## Esqueletos\n\n### module.ts\n\`\`\`typescript\nexport const novoModuloModule: Module = {\n  chave: "novo-modulo", nome: "Novo Módulo", descricao: "Desc",\n  ambientes: ["cadastro", "tecnologia"], icone: "layout-dashboard",\n  hasDesignConfig: false,\n  events: ["novo-modulo.criado", "novo-modulo.atualizado", "novo-modulo.excluido"],\n  setup() {\n    registerPermission({ chave: "novo-modulo.ver", label: "Ver", grupo: "novo-modulo" });\n    registerPermission({ chave: "novo-modulo.criar", label: "Criar", grupo: "novo-modulo" });\n    registerPermission({ chave: "novo-modulo.editar", label: "Editar", grupo: "novo-modulo" });\n    registerPermission({ chave: "novo-modulo.excluir", label: "Excluir", grupo: "novo-modulo" });\n    registerNavItem({ id: "novo-modulo", label: "Novo Módulo", href: "/novo-modulo", icon: "layout-dashboard", permissionCheck: (p) => p?.novo_modulo_ver, moduloKey: "novo-modulo" });\n    registerPermissionDefaults("novo-modulo", { cadastro: { novo_modulo_ver: true, novo_modulo_criar: true, novo_modulo_editar: true }, tecnologia: { novo_modulo_ver: true, novo_modulo_criar: true, novo_modulo_editar: true, novo_modulo_excluir: true }, consultor: { novo_modulo_ver: true }, suporte: {} });\n  }\n};\n\`\`\`\n\n### types.ts\n\`\`\`typescript\nexport interface NovoModulo { id: string; nome: string; descricao?: string; ativo: boolean; created_at: string; updated_at: string; }\nexport interface CriarNovoModuloInput { nome: string; descricao?: string; ativo?: boolean; }\nexport interface AtualizarNovoModuloInput { id: string; nome?: string; descricao?: string; ativo?: boolean; }\nexport interface NovoModuloFiltros { ativo?: boolean; busca?: string; page?: number; pageSize?: number; }\n\`\`\`\n\n### schemas/novo-modulo.schema.ts\n\`\`\`typescript\nimport { z } from "zod";\nexport const criarNovoModuloSchema = z.object({ nome: z.string().min(1).max(100), descricao: z.string().max(500).optional(), ativo: z.boolean().default(true) });\nexport const atualizarNovoModuloSchema = criarNovoModuloSchema.partial().extend({ id: z.string().uuid() });\nexport type CriarNovoModuloInput = z.infer<typeof criarNovoModuloSchema>;\nexport type AtualizarNovoModuloInput = z.infer<typeof atualizarNovoModuloSchema>;\n\`\`\`\n\n### services/novo-modulo.service.ts\n\`\`\`typescript\nimport { supabase } from "~/core/services/supabase";\nimport { dispararEventoModulo } from "~/core/events";\nimport type { NovoModulo, CriarNovoModuloInput, AtualizarNovoModuloInput, NovoModuloFiltros } from "../types";\nconst TABLE = "novo_modulo"; const KEY = "novo-modulo";\nexport const NovoModuloService = {\n  async listar(f: NovoModuloFiltros={}) { let q = supabase.from(TABLE).select("*"); if(f.ativo!==undefined) q=q.eq("ativo",f.ativo); if(f.busca) q=q.ilike("nome",\`%\${f.busca}%\`); const p=f.page??1, ps=f.pageSize??20, from=(p-1)*ps, to=from+ps-1; q=q.order("created_at",{ascending:false}).range(from,to); const {data,error,count}=await q; if(error)throw error; return {data:data as NovoModulo[], count:count??0}; },\n  async buscarPorId(id:string) { const {data,error}=await supabase.from(TABLE).select("*").eq("id",id).single(); if(error)throw error; return data as NovoModulo; },\n  async criar(input:CriarNovoModuloInput) { const {data,error}=await supabase.from(TABLE).insert(input).select().single(); if(error)throw error; dispararEventoModulo(KEY,\`\${KEY}.criado\`,data).catch(()=>{}); return data as NovoModulo; },\n  async atualizar(input:AtualizarNovoModuloInput) { const {id,...u}=input; const {data,error}=await supabase.from(TABLE).update(u).eq("id",id).select().single(); if(error)throw error; dispararEventoModulo(KEY,\`\${KEY}.atualizado\`,data).catch(()=>{}); return data as NovoModulo; },\n  async excluir(id:string) { const {error}=await supabase.from(TABLE).delete().eq("id",id); if(error)throw error; dispararEventoModulo(KEY,\`\${KEY}.excluido\`,{id}).catch(()=>{}); }\n};\n\`\`\`\n\n### hooks/useNovoModulo.ts\n\`\`\`typescript\nimport { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";\nimport { NovoModuloService } from "../services/novo-modulo.service";\nimport type { NovoModulo, CriarNovoModuloInput, AtualizarNovoModuloInput, NovoModuloFiltros } from "../types";\nconst KEY="novo-modulo";\nexport function useNovoModulos(f:NovoModuloFiltros={}) { return useQuery({ queryKey:[KEY,"list",f], queryFn:()=>NovoModuloService.listar(f), placeholderData:(p)=>p }); }\nexport function useNovoModulo(id:string) { return useQuery({ queryKey:[KEY,"detail",id], queryFn:()=>NovoModuloService.buscarPorId(id), enabled:!!id }); }\nexport function useCriarNovoModulo() { const qc=useQueryClient(); return useMutation({ mutationFn:NovoModuloService.criar, onSuccess:()=>qc.invalidateQueries({queryKey:[KEY]}) }); }\nexport function useAtualizarNovoModulo() { const qc=useQueryClient(); return useMutation({ mutationFn:NovoModuloService.atualizar, onSuccess:()=>qc.invalidateQueries({queryKey:[KEY]}) }); }\nexport function useExcluirNovoModulo() { const qc=useQueryClient(); return useMutation({ mutationFn:NovoModuloService.excluir, onSuccess:()=>qc.invalidateQueries({queryKey:[KEY]}) }); }\n\`\`\`\n\n### Rotas\n\`\`\`tsx\nexport const Route = createFileRoute('/novo-modulo')({ component: NovoModuloListPage, beforeLoad:()=>RequirePermission("novo-modulo.ver") });\nexport const Route = createFileRoute('/novo-modulo/\$id')({ component: NovoModuloDetalhePage, beforeLoad:()=>RequirePermission("novo-modulo.editar") });\n\`\`\`\n\n## Validação\n\`\`\`bash\nnpm run check:types && npm run build && npm run test && npm run lint\n\`\`\`\n`;
  return md;
}

function mergeCapitulos(moduloKey: string, capitulos: string[]) {
  const outputDir = join('docs-projeto', `doc-ANALISE-MODULO-${moduloKey.toUpperCase()}`);
  let merged = '';
  for (const cap of capitulos) {
    const fp = join(outputDir, cap);
    if (existsSync(fp)) merged += readFileSync(fp, 'utf-8') + '\n\n---\n\n';
  }
  const outPath = join(outputDir, `analise-modulo-${moduloKey}.md`);
  writeFileSync(outPath, merged);
  const sz = statSync(outPath).size;
  console.log(`  ✓ Merged: ${outPath} (${(sz/1024).toFixed(1)} KB)`);
}

async function processarModulo(moduloKey: string) {
  const basePath = join('src/features', moduloKey);
  if (!existsSync(basePath)) { console.log(`  ⚠️ Pasta não existe: ${basePath}`); return; }

  console.log(`\n📦 ${moduloKey}`);
  const files = readModuloFiles(moduloKey);
  if (!files.moduleTs) { console.log(`  ⚠️ Sem module.ts`); return; }

  const moduloNome = moduloKey.charAt(0).toUpperCase() + moduloKey.slice(1);
  const hasDesign = extrairHasDesignConfig(files.moduleTs);
  const outputDir = join('docs-projeto', `doc-ANALISE-MODULO-${moduloKey.toUpperCase()}`);
  mkdirSync(outputDir, { recursive: true });

  const capitulos = [
    ['00-indice.md', gerarCapitulo00(moduloNome, moduloKey, hasDesign)],
    ['01-visao-macro.md', gerarCapitulo01(moduloNome, moduloKey, files.moduleTs, files)],
    ['02-camada-dados.md', gerarCapitulo02(moduloNome, moduloKey)],
    ['03-sistema-de-eventos.md', gerarCapitulo03(moduloNome, moduloKey, files.moduleTs, files)],
    ['04-estudo-caso-principal.md', gerarCapitulo04(moduloNome, moduloKey)],
    ['05-estudo-caso-padrao-correto.md', gerarCapitulo05(moduloNome, moduloKey)],
    ['06-area-publica.md', gerarCapitulo06(moduloNome, moduloKey)],
    ['07-rotas-colaborador.md', gerarCapitulo07(moduloNome, moduloKey)],
    ['08-inventario-rotas-admin.md', gerarCapitulo08(moduloNome, moduloKey)],
    ['09-feature-especifica.md', gerarCapitulo09(moduloNome, moduloKey)],
    ['10-padroes-e-antipadroes.md', gerarCapitulo10(moduloNome, moduloKey)],
    ['11-manual-tecnico-novos-modulos.md', gerarCapitulo11(moduloNome, moduloKey)]
  ];

  for (const [nome, conteudo] of capitulos) {
    writeFileSync(join(outputDir, nome), conteudo);
    console.log(`  ✓ ${nome}`);
  }

  mergeCapitulos(moduloKey, capitulos.map(c => c[0]));
}

async function main() {
  const alvo = process.argv[2];
  const modulos = alvo ? [alvo] : MODULOS;
  console.log(`🚀 Gerando manuais para ${modulos.length} módulos...`);
  for (const m of modulos) await processarModulo(m);
  console.log('\n✅ Concluído! Manuais em docs-projeto/doc-ANALISE-MODULO-*/');
}

main().catch(console.error);
#!/usr/bin/env tsx
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

interface ModuloInfo {
  nome: string;
  key: string;
  path: string;
  moduleTs?: string;
  permissionsTs?: string;
  tiposTs?: string;
  services: string[];
  hooks: string[];
  components: string[];
  schemas: string[];
  routes: string[];
  contexts: string[];
  hasDesignConfig: boolean;
  permissoes: any[];
  navItems: any[];
  eventos: string[];
}

import { statSync } from 'fs';

function getAllFiles(dir: string): string[] {
  let files: string[] = [];
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

function analisarModulo(moduloPath: string): ModuloInfo {
  const nome = moduloPath.split('/').pop() || '';
  const info: ModuloInfo = {
    nome,
    key: nome,
    path: moduloPath,
    services: [],
    hooks: [],
    components: [],
    schemas: [],
    routes: [],
    contexts: [],
    hasDesignConfig: false,
    permissoes: [],
    navItems: [],
    eventos: []
  };

  const moduleTsPath = join(moduloPath, 'module.ts');
  if (existsSync(moduleTsPath)) {
    info.moduleTs = readFileSync(moduleTsPath, 'utf-8');
    info.hasDesignConfig = info.moduleTs.includes('hasDesignConfig: true');
  }

  const permissionsPath = join(moduloPath, 'permissions.ts');
  if (existsSync(permissionsPath)) {
    info.permissionsTs = readFileSync(permissionsPath, 'utf-8');
  }

  const typesPath = join(moduloPath, 'types.ts');
  if (existsSync(typesPath)) {
    info.tiposTs = readFileSync(typesPath, 'utf-8');
  }

  const servicesDir = join(moduloPath, 'services');
  if (existsSync(servicesDir)) {
    info.services = readdirSync(servicesDir).filter(f => f.endsWith('.ts'));
  }

  const hooksDir = join(moduloPath, 'hooks');
  if (existsSync(hooksDir)) {
    info.hooks = readdirSync(hooksDir).filter(f => f.endsWith('.ts'));
  }

  const componentsDir = join(moduloPath, 'components');
  if (existsSync(componentsDir)) {
    info.components = getAllFiles(componentsDir);
  }

  const schemasDir = join(moduloPath, 'schemas');
  if (existsSync(schemasDir)) {
    info.schemas = readdirSync(schemasDir).filter(f => f.endsWith('.ts'));
  }

  const contextsDir = join(moduloPath, 'context');
  if (existsSync(contextsDir)) {
    info.contexts = readdirSync(contextsDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
  }
  const contextsDirPlural = join(moduloPath, 'contexts');
  if (existsSync(contextsDirPlural)) {
    info.contexts = [...info.contexts, ...readdirSync(contextsDirPlural).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))];
  }

  if (info.moduleTs) {
    const eventosMatch = info.moduleTs.match(/events\s*:\s*\[([\s\S]*?)\]/);
    if (eventosMatch) {
      const eventosStr = eventosMatch[1];
      const keys = eventosStr.match(/'([^']+)'/g) || [];
      info.eventos = keys.map(k => k.replace(/'/g, ''));
    }
  }

  return info;
}

const moduloArg = process.argv[2];
if (!moduloArg) {
  console.error('Uso: tsx scripts/analisar-modulo.ts <nome-modulo>');
  process.exit(1);
}

const moduloPath = join('src/features', moduloArg);
if (!existsSync(moduloPath)) {
  console.error(`Módulo não encontrado: ${moduloPath}`);
  process.exit(1);
}

const info = analisarModulo(moduloPath);
console.log(JSON.stringify(info, null, 2));
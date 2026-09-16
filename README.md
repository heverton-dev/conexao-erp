# ERP Conexão

> Plataforma multi-tenant para gestão de cadastros, CRM, NPS, marketing e automações para rede de distribuidores.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-BaaS-3ECF8E)
![License](https://img.shields.io/badge/license-Proprietary-red)

---

## 🚀 Quick Start

```bash
# 1. Clone o repositório
git clone <repo-url>
cd erp-conexao

# 2. Instale as dependências
npm install --legacy-peer-deps

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais Supabase

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173` no navegador.

---

## 📋 Pré-requisitos

- **Node.js** >= 18
- **npm** >= 9
- Conta no [Supabase](https://supabase.com) (gratuita)
- Chrome/Chromium para testes Playwright

---

## 🛠️ Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Vite) |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run check:types` | TypeScript type checking |
| `npm run test` | Vitest unit tests |
| `npm run lint` | ESLint |
| `npm run format` | Prettier format |
| `npm run storybook` | Storybook (componentes) |

---

## 📁 Estrutura do Projeto

```
erp-conexao/
├── src/
│   ├── main.tsx                  ← Entry point + module registration
│   ├── routeTree.gen.ts          ← Rotas (auto-generated, ~134 rotas)
│   ├── components/ui/            ← shadcn/ui components (59+)
│   ├── core/                     ← Core services & providers
│   │   ├── auth/                 ← AuthProvider, useAuth
│   │   ├── supabase/             ← Supabase client
│   │   ├── permissions/          ← Permission system
│   │   ├── services/             ← Webhooks, notificações, atividades
│   │   └── registry/             ← Module & permission registry
│   ├── features/                 ← Módulos de negócio
│   │   ├── cadastros/            ← Gestão de cadastros
│   │   ├── crm/                  ← CRM com pipeline
│   │   ├── funis/                ← Kanban de tarefas
│   │   ├── nps/                  ← Pesquisa de satisfação
│   │   ├── mapas/                ← Mapas de presença
│   │   ├── hub/                  ← Gamificação
│   │   ├── despesas/             ← Gestão de despesas
│   │   ├── rotas/                ← Planejamento de rotas
│   │   ├── linktree/             ← LinkTree
│   │   ├── gerador-links/        ← Gerador de links
│   │   ├── marketing/            ← Marketing digital (13 submódulos)
│   │   └── empresas/             ← Configuração da empresa
│   ├── routes/                   ← ~134 rotas TanStack Router
│   ├── lib/                      ← Utilities & re-exports
│   ├── styles/                   ← CSS global
│   └── design-system/            ← Design System (tokens, provider)
├── supabase/
│   └── migrations/               ← 73 migrations SQL
├── supabase-mcp-server/          ← MCP server para gerenciar banco
├── docs-projeto/                 ← 🚨 Documentação completa (206+ docs)
│   ├── README.md                 ← Índice remissivo da documentação
│   ├── PRD.md                    ← Product Requirements Document
│   ├── SPEC.md                   ← Technical Specification
│   ├── TREE.md                   ← Mapa visual da estrutura
│   └── doc-*/                    ← 44 pastas de documentação
├── tests/                        ← Testes K6
├── Dockerfile                    ← Multi-stage build
├── docker-compose.yml            ← Docker Swarm config
└── nginx.conf                    ← Nginx config
```

---

## 📦 Stack Tecnológica

### Frontend
| Camada | Tecnologia |
|---|---|
| Framework | React 19 |
| Router | TanStack Router |
| Server State | TanStack Query |
| Estilos | Tailwind CSS v4 |
| UI | shadcn/ui (59 componentes) |
| Ícones | Lucide React |
| Formulários | React Hook Form + Zod |
| Charts | Recharts |

### Backend (BaaS)
| Serviço | Uso |
|---|---|
| Supabase Auth | Autenticação JWT + 2FA |
| Supabase Database | PostgreSQL |
| Supabase Realtime | Notificações em tempo real |
| Supabase Storage | Upload de documentos |

### Infraestrutura
| Componente | Especificação |
|---|---|
| Container | Docker + Swarm |
| Proxy | Traefik + Let's Encrypt |
| Servidor Web | Nginx (alpine) |
| VPS | *(privado)* |
| Docker Hub | hevertonperes/erp-odonto |

---

## 🏗️ Arquitetura

O ERP Conexão segue uma **Arquitetura Modular Monolítica**:

```
core/ (auth, supabase, services)
  └── Módulos independentes (13)
       ├── Cadastros · CRM · NPS · Funis · Mapas
       ├── Hub · Despesas · Rotas · LinkTree
       ├── Gerador Links · Marketing (13 submódulos)
       └── Empresa · Global (infra)
```

**Princípios:**
- 📦 **Zero acoplamento**: Nenhum módulo importa outro módulo
- 🔐 **Multi-tenant**: Isolamento por `empresa_id` + RLS
- 🎨 **Design System próprio**: Temas customizáveis por empresa
- ⚡ **Event-driven**: 54 eventos disparando webhooks/notificações
- 📱 **Mobile-first**: Responsivo em todos os breakpoints

---

## 🔐 Variáveis de Ambiente

```env
# .env (desenvolvimento local)
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_SENTRY_DSN=<sentry-dsn>  # Opcional
```

```env
# vps.env (deploy)
DOCKER_HUB_USERNAME=<docker-hub-username>
DOCKER_HUB_PASSWORD=<docker-hub-password>
VPS_IP=<vps-ip>
VPS_USER=<vps-user>
VPS_PASSWORD=<vps-password>
```

---

## 🚢 Deploy

```bash
# Build local
npm run build

# Deploy manual na VPS
# 1. Commit e push
git add -A && git commit -m "feat: ..." && git push

# 2. O deploy automático via GitHub Actions pode ser acionado
#    ou manualmente via SSH na VPS
```

---

## 📚 Documentação

A documentação completa está em `docs-projeto/` com **206+ documentos**:

| Documento | Descrição |
|---|---|
| [`docs-projeto/README.md`](docs-projeto/README.md) | Índice remissivo completo |
| [`docs-projeto/PRD.md`](docs-projeto/PRD.md) | Product Requirements Document |
| [`docs-projeto/SPEC.md`](docs-projeto/SPEC.md) | Technical Specification |
| [`docs-projeto/TREE.md`](docs-projeto/TREE.md) | Mapa visual da estrutura |
| `docs-projeto/doc-*` | 44 pastas de documentação |

---

## 🧪 Testes

```bash
# Unit tests
npm run test

# E2E (Playwright)
cd tests/playwright && npx playwright test

# Stress (K6)
cd tests/k6 && k6 run k6-complete-stress.js

# Type checking
npm run check:types
```

---

## 🤝 Contribuição

1. Crie um branch: `git checkout -b feature/nova-feature`
2. Faça as alterações seguindo o padrão do projeto
3. Commit com [Conventional Commits](https://www.conventionalcommits.org/)
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

---

## 📄 Licença

**Proprietária** — Todos os direitos reservados.
ERP Conexão © 2026

---

> ⚡ **Documentação desenvolvida com** [Codebuff](https://codebuff.com)

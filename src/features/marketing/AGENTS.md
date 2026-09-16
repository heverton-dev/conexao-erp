# AGENTS.md — `marketing`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**Marketing** — Modulo de Marketing Digital - Visao geral

Tipo: **meta-módulo** · `key: "marketing"` · 71 arquivos

## Estrutura

```
src/features/marketing/
├── index.ts
├── module.ts
├── types.ts
├── calendario-editorial/  (6 arquivos)
├── criativos/  (6 arquivos)
├── dashboard/  (3 arquivos)
├── email-marketing/  (6 arquivos)
├── landing-pages/  (6 arquivos)
├── leads/  (7 arquivos)
├── lib/  (3 arquivos)
├── meta-bm/  (11 arquivos)
├── pixels/  (6 arquivos)
├── seo/  (6 arquivos)
├── utms/  (5 arquivos)
└── whatsapp/  (3 arquivos)
```

## Rotas

`/marketing/dashboard`

## Registro

- Ambientes: `cadastro` · `tecnologia`

## Submódulos

| Diretório | key | Nome | Rotas | Eventos |
| --- | --- | --- | --- | --- |
| `calendario-editorial/` | `mktg-calendario` | Calendario Editorial | `/marketing/calendario` | — |
| `criativos/` | `mktg-criativos` | Criativos | `/marketing/criativos` | `criativo.criado` |
| `dashboard/` | `mktg-dashboard` | Dashboard Marketing | `/marketing/dashboard` | — |
| `email-marketing/` | `mktg-email` | E-mail Marketing | `/marketing/email` | `campanha.criada` · `email.enviado` · `email.aberto` · `email.clicado` |
| `landing-pages/` | `mktg-landing-pages` | Landing Pages | `/marketing/landing-pages` | `pagina.criada` · `pagina.publicada` · `pagina.visitante` |
| `leads/` | `mktg-leads` | Leads | `/marketing/leads` | `lead.capturado` · `lead.convertido` · `lead.perdido` |
| `meta-bm/` | `mktg-meta-bm` | Meta Business Manager | `/marketing/meta-bm` · `/marketing/meta-bm/campanhas` · `/marketing/meta-bm/posts` | — |
| `pixels/` | `mktg-pixels` | Pixels | `/marketing/pixels` | `evento.registrado` · `conversao.registrada` |
| `seo/` | `mktg-seo` | SEO | `/marketing/seo` | — |
| `utms/` | `mktg-utms` | UTMs | `/marketing/utms` | — |
| `whatsapp/` | `mktg-whatsapp` | WhatsApp Marketing | `/marketing/whatsapp` | `mensagem.enviada` · `template.cadastrado` |

## Tabelas e RPCs

Tabelas: `empresa_limites_modulo` · `mktg_calendario` · `mktg_campanhas_email` · `mktg_criativos` · `mktg_eventos` · `mktg_landing_pages` · `mktg_landing_pages_versoes` · `mktg_leads` · `mktg_meta_campanhas` · `mktg_meta_contas` · `mktg_meta_insights` · `mktg_meta_posts` · `mktg_pixels` · `mktg_utms` · `mktg_whatsapp_campanhas`

<!-- /sync:fatos -->

## Notas

- Meta-módulo: o `module.ts` da raiz registra apenas `/marketing/dashboard`. Cada submódulo tem seu próprio `module.ts` e é registrado separadamente em `src/main.tsx`.
- Só `whatsapp/` declara permissões (`mktg_wpp_ver`, `mktg_wpp_enviar`). Os outros submódulos hoje não têm permissão própria — ao criar, siga o prefixo `mktg_*`.
- **`empresa_id`:** a coluna existe e é `NOT NULL` no banco real. Sai na fase 2, depois de o banco ser reconciliado — ver `docs/agents/drift-banco-vs-migrations.md`. Não use em código novo.

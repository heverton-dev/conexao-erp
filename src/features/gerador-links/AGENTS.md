# AGENTS.md — `gerador-links`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**Links** — Geração de links personalizados: WhatsApp, UTMs, Google Review, Maps, Waze e QR Code

Tipo: **registrado** · `key: "gerador-links"` · 24 arquivos

## Estrutura

```
src/features/gerador-links/
├── diagnostic.ts
├── module.ts
├── onboarding.tsx
├── permissions.ts
├── types.ts
├── components/  (10 arquivos)
├── hooks/  (3 arquivos)
├── services/  (4 arquivos)
└── utils/  (2 arquivos)
```

## Rotas

`/ferramentas/links` · `/ferramentas/links/historico` · `/ferramentas/links/templates` · `/ferramentas/links/whatsapp` · `/ferramentas/links/utm` · `/ferramentas/links/google-review` · `/ferramentas/links/maps` · `/ferramentas/links/waze` · `/ferramentas/links/qrcode`

## Permissões

`lk_ver` · `lk_gerar` · `lk_salvar` · `lk_editar` · `lk_excluir` · `lk_gerenciar_templates`

## Eventos

`link.gerado_whatsapp` · `link.gerado_qrcode` · `link.clicado`

Disparos no código: 3. Sempre `dispararEventoModulo("gerador-links", <evento>, payload).catch(() => {})`.

## Registro

- Ambientes: `cadastro` · `tecnologia`
- Abas de config: `eventos`
- Flags: `hasDiagnostico`

## Tabelas e RPCs

Tabelas: `gerador_link_cliques` · `gerador_links` · `gerador_modelos`

RPCs: `registrar_clique`

<!-- /sync:fatos -->

## Notas

- Permissões usam o prefixo curto `lk_*` (não `gerador_links_*`). Tabelas usam `gerador_*`.
- `gerador_link_cliques` + RPC `registrar_clique` alimentam o evento `link.clicado`; a rota pública de redirect é que dispara.

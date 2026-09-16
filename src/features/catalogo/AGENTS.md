# AGENTS.md — `catalogo`

**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — este arquivo cobre só o que é específico deste módulo.

<!-- sync:fatos -->

**Catálogo** — Catálogo de implantes, componentes, kits e pacotes promocionais

Tipo: **registrado** · `key: "catalogo"` · 146 arquivos

## Estrutura

```
src/features/catalogo/
├── index.ts
├── module.ts
├── onboarding.tsx
├── permissions.ts
├── components/  (56 arquivos)
├── contexts/  (4 arquivos)
├── hooks/  (5 arquivos)
├── import/  (22 arquivos)
├── lib/  (2 arquivos)
├── schemas/  (13 arquivos)
├── services/  (35 arquivos)
├── styles/  (0 arquivos)
└── types/  (5 arquivos)
```

## Rotas

`/catalogo` · `/catalogo/produto/$tipo/$sku` · `/catalogo/carrinho` · `/catalogo/checkout` · `/catalogo/admin/dashboard` · `/catalogo/admin/implantes` · `/catalogo/admin/componentes` · `/catalogo/admin/instrumentais` · `/catalogo/admin/kits` · `/catalogo/admin/workflows` · `/catalogo/admin/fresagens` · `/catalogo/admin/categorias` · `/catalogo/admin/cadastros` · `/catalogo/admin/produtos` · `/catalogo/admin/cupons` · `/catalogo/admin/frete` · `/catalogo/admin/promocionais` · `/catalogo/admin/configuracoes` · `/catalogo/admin/design` · `/catalogo/admin/clientes` · `/catalogo/admin/grupos` · `/catalogo/admin/orcamentos` · `/catalogo/admin/pedidos` · `/catalogo/admin/solicitacoes` · `/catalogo/admin/estoque` · `/loja/$slug` · `/loja/$slug/login` · `/loja/$slug/pedidos` · `/loja/$slug/pedidos/$pedidoId` · `/loja/$slug/favoritos` · `/loja/$slug/orcamento/$token`

## Permissões

`catalogo_ver_catalogo` · `catalogo_gerenciar_produtos` · `catalogo_gerenciar_cadastros` · `catalogo_gerenciar_cupons` · `catalogo_gerenciar_frete` · `catalogo_gerenciar_promocionais` · `catalogo_dashboard` · `catalogo_gerenciar_design` · `catalogo_gerenciar_clientes` · `catalogo_gerenciar_grupos` · `catalogo_gerenciar_orcamentos` · `catalogo_gerenciar_pedidos` · `catalogo_gerenciar_solicitacoes` · `catalogo_cliente_ver_produtos` · `catalogo_cliente_ver_precos` · `catalogo_cliente_comprar` · `catalogo_cliente_ver_pedidos` · `catalogo_cliente_ver_favoritos` · `catalogo_cliente_rastrear` · `catalogo_colab_ver_produtos` · `catalogo_colab_ver_precos` · `catalogo_colab_criar_orcamento` · `catalogo_colab_gerenciar_orcamentos` · `catalogo_colab_compartilhar` · `catalogo_colab_converter_pedido` · `catalogo_colab_ver_pedidos`

## Eventos

`produto.criado` · `produto.atualizado` · `produto.removido` · `promocional.criado` · `cupom.utilizado` · `orcamento.criado` · `orcamento.enviado` · `orcamento.aprovado` · `orcamento.reprovado` · `orcamento.pedido_criado` · `pedido.criado` · `pedido.pago` · `pedido.confirmado` · `pedido.separando` · `pedido.enviado` · `pedido.entregue` · `pedido.cancelado` · `cliente.credencial_criada` · `solicitacao_acesso.criada` · `solicitacao_acesso.aprovada` · `solicitacao_acesso.rejeitada` · `link_teste.criado` · `link_teste.acessado`

Disparos no código: 23. Sempre `dispararEventoModulo("catalogo", <evento>, payload).catch(() => {})`.

## Registro

- Ambientes: `cadastro` · `tecnologia`
- Abas de config: `geral` · `permissoes` · `eventos`
- Flags: `hasDesignConfig`

## Tabelas e RPCs

Tabelas: `cadastros` · `catalogo_abutment_chaves` · `catalogo_abutment_kits` · `catalogo_abutment_parafusos` · `catalogo_abutments` · `catalogo_acessorio_ferramental` · `catalogo_acessorios` · `catalogo_categorias_acessorio` · `catalogo_categorias_instrumental` · `catalogo_chaves` · `catalogo_chaves_ferramental` · `catalogo_cicatrizadores` · `catalogo_cliente_permissoes` · `catalogo_clientes` · `catalogo_complementares` · `catalogo_componentes` · `catalogo_configuracoes` · `catalogo_cps_etapas_workflows` · `catalogo_cps_tipos_abutments` · `catalogo_cps_tipos_cicatrizadores` · `catalogo_cps_tipos_componentes` · `catalogo_cps_tipos_parafusos` · `catalogo_cps_tipos_reabilitacao` · `catalogo_cps_tipos_reabilitacao_familias` · `catalogo_cps_tipos_workflows` · `catalogo_cupons` · `catalogo_design_config` · `catalogo_favoritos` · `catalogo_fresas` · `catalogo_fretes` · `catalogo_grupo_desconto_categoria` · `catalogo_grupo_precos` · `catalogo_grupos_clientes` · `catalogo_imagens_produto` · `catalogo_implante_abutment` · `catalogo_implante_chaves` · `catalogo_implante_kit` · `catalogo_implantes` · `catalogo_instrumentais_gerais` · `catalogo_kit_chaves` · `catalogo_kit_cicatrizadores` · `catalogo_kit_complementares` · `catalogo_kit_fresas` · `catalogo_kit_implantes` · `catalogo_kit_kits_complementares` · `catalogo_kit_kits_relacionados` · `catalogo_kit_opcionais` · `catalogo_kits` · `catalogo_links_teste` · `catalogo_links_teste_acessos` · `catalogo_opcionais` · `catalogo_orcamento_itens` · `catalogo_orcamentos` · `catalogo_pagamentos` · `catalogo_parafusos` · `catalogo_parafusos_retensao` · `catalogo_pedido_itens` · `catalogo_pedidos` · `catalogo_promocionais` · `catalogo_promocional_itens` · `catalogo_protocolos_fresagens` · `catalogo_protocolos_fresas_itens` · `catalogo_seq_protetica_abutments` · `catalogo_seq_protetica_etapa_componentes` · `catalogo_seq_protetica_etapas` · `catalogo_seq_proteticas` · `catalogo_solicitacoes_acesso` · `catalogo_tipos_chaves` · `catalogo_tipos_complementares` · `catalogo_tipos_fresas` · `catalogo_tipos_kits` · `catalogo_tipos_opcionais` · `catalogo_tipos_ossos` · `clientes` · `logos`

RPCs: `atualizar_status_orcamento_por_token` · `buscar_itens_orcamento` · `buscar_orcamento_por_token`

<!-- /sync:fatos -->

## Notas

- Maior módulo do projeto: 146 arquivos e ~75 tabelas `catalogo_*`. Antes de mexer, use `rg` no subdiretório específico — não leia o módulo inteiro.
- Duas faces: **admin** (`/catalogo/admin/*`, permissões `catalogo_gerenciar_*`, `catalogo_dashboard`) e **loja** (`/catalogo`, `/loja/$slug/*`, permissões `catalogo_cliente_*` e `catalogo_colab_*`). Mudança em preço, estoque ou desconto costuma afetar as duas.
- Validação de formulário vive em `schemas/` (Zod), não junto do componente.
- ⚠ `context/` e `contexts/` coexistem, e `styles/` não tem arquivo `.ts`. Ao criar contexto novo, use `contexts/` — consolidação em A8 do plano de correção.
- ⚠ `components/ClienteAtivoBar.tsx` importa `~/features/crm` — violação de isolamento. Correção definida em A4 de `docs/agents/plano-correcao-auditoria.md` (mover para `~/components/shared/`). Não replicar o padrão.

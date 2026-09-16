# PLANO — Livro: Engenharia Reversa de IDEs Agênticas

## Título provisório
**"Desvendando o Harness: O Manual Completo de IDEs Agênticas para Desenvolvedores"**

## Público-alvo
Desenvolvedores que usam IDEs agênticas (Oh My Pi, OpenCode, MiMoCode, Antigravity, Freebuff, Claude Code, Cursor, Windsurf, Cline, Aider) e querem entender **como funcionam por dentro** para usar com máxima eficiência.

## Diferencial
Não existe livro/guia que una:
- Arquitetura interna do harness (o que roda por baixo)
- Fluxo completo input → processamento → output
- Técnicas avançadas de contexto
- MCPs de A a Z
- Rules系统 completa
- Configurações ocultas e avançadas
- Aplicação prática em CADA IDE

## Estrutura Proposta (18 capítulos + apêndices)

### PARTE I — O QUE É UM HARNESS (Cap 1-4)

**Cap 1: O que é um Harness Agêntico**
- Definição: o que está entre você e o LLM
- Harness vs IDE vs Framework — diferenças
- Anatomia: UI, Context Manager, Tool Router, LLM Gateway
- Exemplo real: Oh My Pi (arquitetura)
- Exemplo real: OpenCode (arquitetura)
- Como cada IDE implementa o harness

**Cap 2: O Fluxo Completo — Input → Processamento → Output**
- Diagrama completo de uma chamada
- Fase 1: Input do usuário + System Prompt + Contexto
- Fase 2: LLM processa, decide tool calls
- Fase 3: Harness executa tools, retorna resultados
- Fase 4: LLM gera output final
- O que acontece em cada fase (tokens, latência, custo)
- Diferença entre modo chat e modo agente
- Como o streaming funciona

**Cap 3: O System Prompt — O DNA do Agente**
- O que é e como é construído
- Componentes: instruções base + regras do projeto + tools disponíveis
- Onde fica em cada IDE:
  - Oh My Pi: system prompt interno + AGENTS.md + skills
  - OpenCode: system prompt + .opencode/rules/
  - MiMoCode: system prompt + regras do projeto
  - Antigravity: system prompt + config
  - Freebuff: system prompt + config
  - Claude Code: system prompt + CLAUDE.md
  - Cursor: system prompt + .cursorrules
  - Windsurf: system prompt + .windsurfrules
- Quanto custa: cálculo de tokens do system prompt
- O impacto de cada linha no system prompt

**Cap 4: Tokens — A Moeda do Sistema**
- Anatomia de um token (de verdade, não "uma palavra")
- Tokenizers: como o texto vira tokens
- Os 4 tipos de consumo: system prompt, histórico, input, output
- Cálculo de custo por modelo
- Por que código custa mais que texto
- Tokens desperdiçados: os 5 vilões

### PARTE II — CONTEXTO (Cap 5-8)

**Cap 5: O que é Contexto e como ele é Construído**
- Definição técnica de contexto em LLMs
- Janela de contexto: o que é, quanto cada modelo tem
- Context window vs contexto efetivo
- O que entra no contexto: system prompt + tools + histórico + input atual
- O paradoxo: mais contexto = melhor entendimento, mas mais custo
- Como cada IDE gerencia o contexto:
  - Oh My Pi: context management + /clear
  - OpenCode: context files + auto-compact
  - MiMoCode: session management
  - Claude Code: /compact + context
  - Cursor: codebase indexing

**Cap 6: Técnicas de Context Management**
- Lean-CTX: ler assinaturas antes de corpos
- Grep → Read → Edit (nunca Read → Read → Edit)
- Range reads: `read file:42-60` vs `read file`
- Context compaction: quando e como
- /clear: quando limpar
- Scratchpad: memória persistente entre sessões
- Context sharing entre sessões
- O ciclo ideal: setup → exploração → execução → verificação → cleanup

**Cap 7: Economia de Tokens — Guia Completo**
- System prompt otimizado: como escrever AGENTS.md eficiente
- Tamanho ideal: por que <100 linhas
- O que vai no AGENTS.md vs o que vai em skills
- Cache de contexto: reutilizar o que já foi lido
- Output telegráfico: caveman mode
- Subagents para isolamento de contexto
- A regra de ouro: cada token do system prompt custa N× (N = turnos)
- Benchmarking: tokens esperados por tipo de tarefa

**Cap 8: Técnicas Avançadas de Contexto**
- Context streaming: como funciona por baixo
- Context pruning: o que o modelo descarta
- Context priority: nem todo token tem o mesmo valor
- Multi-turn context: como o histórico cresce
- Context overflow: o que acontece quando a janela enche
- Context recovery: como recuperar contexto perdido
- Context warming: como "aquecer" o contexto para tarefas complexas

### PARTE III — RULES E COMMANDS (Cap 9-11)

**Cap 9: Rules — O Sistema de Regras**
- O que são rules e para que servem
- Hierarquia de rules: global → projeto → pasta → arquivo
- Onde fica em cada IDE:
  - Oh My Pi: AGENTS.md + .gemini/GEMINI.md + skills
  - OpenCode: .opencode/rules/ + project instructions
  - MiMoCode: config do projeto
  - Antigravity: config
  - Freebuff: config
  - Claude Code: CLAUDE.md + ~/.claude/CLAUDE.md
  - Cursor: .cursorrules + .cursorignore
  - Windsurf: .windsurfrules
  - Cline: .clinerules
  - Aider: .aider.conf.yml + CONVENTIONS.md
- Diferença entre rules permanentes e temporárias
- Como rules afetam o system prompt
- O custo de rules: cada regra = tokens
- Regras de performance: o que colocar e o que não colocar

**Cap 10: Commands — O Sistema de Comandos**
- O que são commands e como funcionam
- Commands built-in vs custom commands
- Oh My Pi: /clear, /compact, /commit, skills
  - OpenCode: comandos do CLI
  - MiMoCode: comandos da interface
  - Antigravity: comandos
  - Freebuff: comandos
  - Claude Code: /clear, /compact, /cost, /doctor
  - Cursor: comandos do editor
- Como criar comandos customizados
- Macros e atalhos
- Comandos que economizam tokens

**Cap 11: A Hierarquia de Configuração**
- Nível 1: Configuração global (~/.config/)
- Nível 2: Configuração do projeto (raiz)
- Nível 3: Configuração da pasta
- Nível 4: Contexto da sessão
- Como cada IDE resolve conflitos
- Prioridade: quem sobrescreve quem
- Arquivos de configuração em cada IDE:
  - Oh My Pi: opencode.json, AGENTS.md, skills/
  - OpenCode: opencode.json, .opencode/
  - MiMoCode: config files
  - Antigravity: config files
  - Freebuff: config files
  - Claude Code: settings.json, CLAUDE.md
  - Cursor: settings.json, .cursor/
  - Windsurf: settings.json

### PARTE IV — MCPs (Cap 12-14)

**Cap 12: O que é MCP (Model Context Protocol)**
- Definição e origem
- MCP vs Function Calling vs Tool Use — diferenças
- Arquitetura: Client → Server → Tools
- Como o MCP se encaixa no fluxo da IDE
- Por que MCP revoluciona o desenvolvimento
- Limitações atuais

**Cap 13: MCP na Prática**
- Tipos de MCP servers:
  - Filesystem (ler/escrever arquivos)
  - Database (Supabase, PostgreSQL, etc)
  - API (chamar APIs externas)
  - Custom (servers próprios)
- Como configurar MCP em cada IDE:
  - Oh My Pi: config de MCP servers
  - OpenCode: .opencode/mcp/
  - Claude Code: settings.json
  - Cursor: settings.json
  - Cline: .clinerules
- Exemplo completo: MCP do Supabase
- Custo de MCP: tokens por tool call
- Otimização de MCP: quando usar tool vs código inline

**Cap 14: Criando MCPs Próprios**
- Arquitetura de um MCP server
- Protocolo MCP: methods e responses
- Implementação em TypeScript
- Exemplo 1: MCP para API REST
- Exemplo 2: MCP para banco de dados
- Exemplo 3: MCP para filesystem customizado
- Publicando e compartilhando MCPs
- Boas práticas e segurança

### PARTE V — CONFIGURAÇÕES OCULTAS (Cap 15-16)

**Cap 15: O que Ninguém Fala — Configurações Secretas**
- Oh My Pi:
  - Configurações avançadas do harness
  - Customização de system prompt
  - Filtros de output
  - Modos de operação
- OpenCode:
  - Configurações de model selection
  - Auto-compact thresholds
  - Tool routing
- Claude Code:
  - ~/.claude/settings.json (configurações globais)
  - Max tokens, temperature, top_p
  - Custom system prompts
  - Permission modes
  - Model selection per task
- Cursor:
  - .cursor/settings.json
  - Codebase indexing
  - Ignore patterns
  - Model selection
- Windsurf:
  - Flow mode vs Ask mode
  - Context providers
- Outras IDEs:
  - Configurações similares

**Cap 16: Tuning de Performance**
- Temperature e top_p: quando alterar
- Max tokens: configurar por tipo de tarefa
- Model selection: qual modelo para qual tarefa
  - Tarefas simples: Haiku/Flash (barato)
  - Tarefas complexas: Sonnet/GPT-4o (preciso)
  - Code generation: modelos especializados
- Rate limiting: como evitar throttling
- Retry strategies: como lidar com falhas
- Caching de respostas
- Batch processing: quando aplicável

### PARTE VI — APLICAÇÃO PRÁTICA (Cap 17-18)

**Cap 17: Guia por IDE — Setup Completo**

Para CADA IDE, documentar:
1. Instalação e configuração inicial
2. Estrutura de arquivos de configuração
3. Onde colocar rules
4. Como configurar MCPs
5. Configurações avançadas
6. Dicas específicas
7. Economia de tokens específica

IDEs cobertas:
- Oh My Pi (detalhado — é o que usamos)
- OpenCode
- MiMoCode
- Antigravity
- Freebuff
- Claude Code (referência)
- Cursor (referência)

**Cap 18: Casos Reais — Antes e Depois**
- Caso 1: Criar módulo completo (antes: 200K tokens, depois: 50K)
- Caso 2: Bug fix (antes: 30K tokens, depois: 8K)
- Caso 3: Deploy (antes: 100K tokens, depois: 30K)
- Caso 4: Refatoração grande (antes: 500K tokens, depois: 120K)
- Análise de cada caso: o que mudou e por quê

### APÊNDICES

**A: Glossário Completo**
- Harness, Context, System Prompt, Tool, MCP, Rule, Command, etc.

**B: Tabela de Custos por Modelo (Atualizada)**

**C: Templates**
- Template de AGENTS.md otimizado
- Template de MCP server
- Template de skill
- Template de rule

**D: Referências e Links**
- Documentação oficial de cada IDE
- Repositórios de MCP servers
- Comunidades e recursos

---

## Decisões de Escopo

### Universais vs Específicos
- **Cap 1-8, 12-14**: Conceitos universais (valem para qualquer IDE)
- **Cap 9-11**: Parcialmente universais (hierarquia é universal, implementação varia)
- **Cap 15-17**: Específicos por IDE
- **Cap 18**: Casos reais do nosso projeto

### Profundidade por IDE
- **Oh My Pi**: MÁXIMA (usamos diariamente, temos acesso total)
- **OpenCode**: ALTA (usamos regularmente)
- **MiMoCode**: MÉDIA (usamos occasionalmente)
- **Antigravity**: MÉDIA (usamos occasionalmente)
- **Freebuff**: MÉDIA (usamos occasionalmente)
- **Claude Code**: REFERÊNCIA (benchmark do mercado)
- **Cursor**: REFERÊNCIA (benchmark do mercado)

### Tamanho estimado
- 18 capítulos × ~80-120 linhas = ~1.500-2.200 linhas
- Total estimado: ~80-120KB
- Tempo de escrita: 2-3 sessões

---

## Próximos Passos

1. [ ] Criar esqueleto do livro (todos os capítulos com headings)
2. [ ] Escrever Parte I (Cap 1-4)
3. [ ] Escrever Parte II (Cap 5-8)
4. [ ] Escrever Parte III (Cap 9-11)
5. [ ] Escrever Parte IV (Cap 12-14)
6. [ ] Escrever Parte V (Cap 15-16)
7. [ ] Escrever Parte VI (Cap 17-18)
8. [ ] Escrever Apêndices
9. [ ] Revisão e revisão

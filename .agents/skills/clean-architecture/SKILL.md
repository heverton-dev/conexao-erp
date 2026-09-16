# Skill: Arquitetura Limpa — Guia Operacional

## Trigger
Use quando o usuário pedir para "aplicar arquitetura limpa", "revisar arquitetura", "avaliar design", "verificar SOLID", "desacoplar módulos", "criar limites arquiteturais", ou qualquer tarefa relacionada a estruturação de código seguindo os princípios de Robert C. Martin.

## Objetivo
Fornecer um passo a passo operacional para aplicar os conceitos do livro "Arquitetura Limpa" de Robert C. Martin em projetos de software.

---

## FASE 1: DIAGNÓSTICO — Avaliar o Estado Atual

### 1.1 Identificar Violações do SRP (Responsabilidade Única)
**Princípio:** Um módulo deve ser responsável por um, e apenas um, ator (grupo de stakeholders).

**Checklist Operacional:**
- [ ] Listar todos os stakeholders que causam mudanças no módulo
- [ ] Verificar se há múltiplos atores alterando o mesmo arquivo
- [ ] Procurar por "duplicação acidental" — código compartilhado entre responsabilidades diferentes
- [ ] Identificar "fusões" — múltiplos desenvolvedores alterando o mesmo arquivo por razões diferentes

**Ação:** Se violado,Separar código por ator/stakeholder em módulos distintos.

### 1.2 Identificar Violações do OCP (Aberto/Fechado)
**Princípio:** Artefatos de software devem ser abertos para extensão, fechados para modificação.

**Checklist Operacional:**
- [ ] Verificar se extensões simples nos requisitos forçam mudanças massivas no código
- [ ] Avaliar se novos recursos podem ser adicionados sem modificar código existente
- [ ] Identificar "eixos de mudança" — razões pelas quais o sistema muda

**Ação:** Particionar sistema em componentes e organizar hierarquia de dependências.

### 1.3 Identificar Violações do LSP (Substituição de Liskov)
**Princípio:** Subtipos devem ser substituíveis por seus tipos base sem alterar o comportamento correto.

**Checklist Operacional:**
- [ ] Verificar se subclasses podem ser substituídas por classes base
- [ ] Procurar por "声明ações if" que detectam tipos específicos
- [ ] Avaliar se herança está sendo usada corretamente

**Ação:** Reestruturar hierarquia de herança ou usar composição.

### 1.4 Identificar Violações do ISP (Segregação de Interface)
**Princípio:** Clientes não devem depender de interfaces que não usam.

**Checklist Operacional:**
- [ ] Verificar se módulos dependem de elementos que não utilizam
- [ ] Identificar interfaces "gordas" com muitos métodos não utilizados
- [ ] Avaliar se dependências transitivas estão causando recompilações desnecessárias

**Ação:** Segregar interfaces em interfaces menores e específicas.

### 1.5 Identificar Violações do DIP (Inversão de Dependência)
**Princípio:** Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações.

**Checklist Operacional:**
- [ ] Verificar se dependências de código-fonte apontam na direção correta (para cima)
- [ ] Identificar referências a classes concretas voláteis
- [ ] Avaliar se interfaces estão sendo usadas para desacoplar módulos

**Ação:** Inverter dependências usando interfaces e polimorfismo.

---

## FASE 2: ESTRUTURA DE COMPONENTES — Aplicar Princípios de Componentes

### 2.1 REP (Equivalência Reúso/Release)
**Princípio:** A granularidade do reúso é a granularidade do release.

**Ação:** Todo componente reutilizável deve ter seu próprio ciclo de release.

### 2.2 CCP (Fechamento Comum)
**Princípio:** Componentes que mudam pelas mesmas razões e ao mesmo tempo devem estar no mesmo componente.

**Ação:** Agrupar classes que mudam por razões similares.

### 2.3 CRP (Reúso Comum)
**Princípio:** Classes que são usadas juntas devem ser entregues juntas.

**Ação:** Separar classes que não têm relação de uso.

### 2.4 ADP (Dependências Acíclicas)
**Princípio:** O grafo de dependências de componentes não deve conter ciclos.

**Ação:** Quebrar ciclos usando Dependência Inversa ou criar novo componente.

### 2.5 SDP (Dependências Estáveis)
**Princípio:** Dependências devem apontar na direção da estabilidade.

**Ação:** Componentes estáveis devem ser poucos e bem definidos.

### 2.6 SAP (Abstrações Estáveis)
**Princípio:** Abstrações devem estar na direção da estabilidade.

**Ação:** Componentes estáveis devem ser abstratos (interfaces).

---

## FASE 3: ARQUITETURA LIMPA — Implementar a Regra da Dependência

### 3.1 Definir Limites Arquiteturais
**Regra:** Dependências de código-fonte devem apontar apenas para dentro, na direção das políticas de nível mais alto.

**Estrutura de Círculos Concêntricos:**
```
┌─────────────────────────────────────┐
│  Círculo mais externo:              │
│  Frameworks e Drivers               │
│  (Web, DB, UI, External APIs)       │
├─────────────────────────────────────┤
│  Adaptadores de Interface           │
│  (Controllers, Presenters, Gateways)│
├─────────────────────────────────────┤
│  Casos de Uso                       │
│  (Regras de Negócio da Aplicação)   │
├─────────────────────────────────────┤
│  Entidades                          │
│  (Regras de Negócio Centrais)       │
│  Círculo mais interno               │
└─────────────────────────────────────┘
```

**Ação:** Organizar código nestes 4 círculos, garantindo que dependências apontem para dentro.

### 3.2 Entidades — Regras de Negócio Centrais
**O que são:** Regras de negócio cruciais que existiriam mesmo sem o sistema automatizado.

**Checklist:**
- [ ] Entidades são independentes de UI, DB e frameworks
- [ ] Entidades contêm apenas regras de negócio puras
- [ ] Entidades podem ser reutilizadas em múltiplas aplicações

### 3.3 Casos de Uso — Regras da Aplicação
**O que são:** Regras que especificam como o sistema automatizado opera.

**Checklist:**
- [ ] Casos de uso orquestram fluxo de dados para/entre entidades
- [ ] Casos de uso não conhecem UI ou DB
- [ ] Casos de uso aceitam estruturas de dados simples (Request/Response)
- [ ] Casos de uso não derivam de interfaces de framework

### 3.4 Adaptadores de Interface
**O que são:** Convertem dados entre formato dos casos de uso e formato de agentes externos.

**Componentes:**
- **Controllers:** Recebem input do usuário e passam para casos de uso
- **Presenters:** Formata output dos casos de uso para a UI
- **Gateways:** Interfaces para acesso a banco de dados
- **ViewModels:** Estruturas de dados para a UI

### 3.5 Frameworks e Drivers
**O que são:** Detalhes de implementação (Web, DB, UI, etc.)

**Regra:** Não programar código de negócio nessa camada. Apenas código de ligação.

---

## FASE 4: CRUZAMENTO DE LIMITES — Implementar Polimorfismo

### 4.1 Padrão de Objeto Humble
**Objetivo:** Separar comportamentos testáveis de não testáveis.

**Implementação:**
1. Identificar comportamentos difíceis de testar (GUI, DB, etc.)
2. Criar interface polimórfica no círculo interno
3. Implementar no círculo externo
4. Dados que cruzam limites são estruturas simples (DTOs)

### 4.2 Gateways de Banco de Dados
**Implementação:**
1. Criar interface `IXxxGateway` no caso de uso
2. Implementar na camada de persistência
3. Usar DTOs para transferir dados
4. SQL restrito à camada de adaptadores

### 4.3 Apresentadores e ViewModels
**Implementação:**
1. Caso de uso retorna `OutputData` (objeto simples)
2. Presenter formata `OutputData` em `ViewModel` (strings, booleans)
3. View apenas move dados do ViewModel para tela

---

## FASE 5: DETALHES COMO PLUGINS — Tratar Componentes Externos

### 5.1 Banco de Dados é um Detalhe
**Ação:**
- [ ] Não permitir SQL na camada de casos de uso
- [ ] Usar ORMs/Mappers apenas na camada de adaptadores
- [ ] Manter modelo de dados separado de estrutura de tabelas

### 5.2 Web é um Detalhe
**Ação:**
- [ ] UI pode ser trocada (Web → Console → Mobile) sem afetar regras de negócio
- [ ] Controllers convertem HTTP para objetos simples
- [ ] Presenters convertem output para HTTP

### 5.3 Frameworks são Detalhes
**Ação:**
- [ ] Frameworks são ferramentas, não modos de vida
- [ ] Usar frameworks com "rédeas curtas"
- [ ] Nunca permitir que framework defina arquitetura

---

## FASE 6: MAIN E DEPENDÊNCIAS — Ponto de Entrada

### 6.1 Componente Main
**Responsabilidade:** Criar, coordenar e supervisionar todos os outros componentes.

**Implementação:**
1. Main é o "detalhe final" — política de nível mais baixo
2. Main cria factories e injeta dependências
3. Main entrega controle para camadas de alto nível
4. Main pode ser um plug-in por configuração

### 6.2 Injeção de Dependência
**Implementação:**
1. Definir interfaces no círculo interno
2. Implementar no círculo externo
3. Usar framework DI ou injeção manual
4. Componente Main monta o grafo de dependências

---

## FASE 7: TESTABILIDADE — O Limite Teste

### 7.1 Testes como Componentes
**Princípio:** Testes são o círculo mais externo da arquitetura.

**Ação:**
- [ ] Testes seguem Regra da Dependência
- [ ] Testes são independentemente implementáveis
- [ ] Testes não são necessários para operação do sistema

### 7.2 API de Teste
**Implementação:**
1. Criar API específica para testes
2. API tem "superpoderes" (bypass segurança, forçar estados)
3. API desacopla testes da estrutura da aplicação
4. Evitar acoplamento estrutural (classe de teste ↔ classe de produção)

### 7.3 Evitar Testes Frágeis
**Ação:**
- [ ] Não testar regras de negócio via GUI
- [ ] Testar cada camada isoladamente
- [ ] Usar mocks/stubs para dependências externas

---

## FASE 8: SERVIÇOS — Grandes e Pequenos

### 8.1 Serviços Não São Arquitetura
**Verdade:** Serviços por si só não definem arquitetura. A arquitetura é definida por limites internos.

### 8.2 Serviços Baseados em Componentes
**Implementação:**
1. Cada serviço deve ter design de componentes interno
2. Usar SOLID dentro do serviço
3. Limites arquiteturais passam através dos serviços
4. Novos recursos = novos componentes (OCP)

---

## CHECKLIST FINAL — Validação da Arquitetura

### Estrutura
- [ ] Entidades são independentes de detalhes
- [ ] Casos de uso não conhecem UI ou DB
- [ ] Adaptadores convertem entre camadas
- [ ] Frameworks estão no círculo mais externo

### Dependências
- [ ] Todas as dependências apontam para dentro (Regra da Dependência)
- [ ] Não há ciclos de dependência entre componentes
- [ ] Interfaces são usadas para desacoplar módulos

### Testabilidade
- [ ] Regras de negócio são testáveis sem UI/DB
- [ ] Testes seguem Regra da Dependência
- [ ] Não há testes frágeis acoplados à estrutura

### Flexibilidade
- [ ] UI pode ser trocada sem afetar regras de negócio
- [ ] DB pode ser trocado sem afetar regras de negócio
- [ ] Frameworks podem ser trocados sem afetar regras de negócio

---

## REFERÊNCIAS
- **Livro:** Arquitetura Limpa — Robert C. Martin (2018)
- **Princípios SOLID:** SRP, OCP, LSP, ISP, DIP
- **Princípios de Componentes:** REP, CCP, CRP, ADP, SDP, SAP
- **Padrões:** Objeto Humble, Factory, Strategy, Template Method

---
name: loop
description: >
  Conduz uma entrevista curta e ESCREVE a especificação de um loop de agente, num documento
  <nome>-loop.md no padrão da Loop Library (gatilho + meta + verificação + parada), endurecido
  contra reward hacking e autoengano. NÃO executa o loop, só o especifica. O documento reúne tudo
  que define o loop: descrição, use-quando, entradas (se houver), meta, o check que manda, passos da volta, estados de
  parada nomeados, guardrails, memória, sub-loops (se houver), por que funciona, como acionar
  (/goal ou esqueleto Ralph) e a métrica de saúde.
  Use SEMPRE que o usuário disser "/loop", "escreve um loop", "cria um loop", "forja um
  loop", "especifica um loop", "documenta um loop", "quero um agent loop", "transforma isso num
  loop autônomo", "loop que roda sozinho até", "loop de cobertura/erros/performance", "loop pra
  rodar de madrugada", ou pedir para automatizar uma tarefa iterativa com verificação e parada.
  NÃO use para gerar slides (isso é Mira) nem para de fato rodar o loop.
---

# Loop

Esta skill faz uma entrevista curta e **escreve a especificação** de um loop de agente. Ela não
roda o loop, ela o documenta no padrão da Loop Library e o endurece com o que a pesquisa mostrou
(verificação externa no lugar de auto-pontuação, separação de quem faz e quem confere, estados de
parada nomeados). Distinção que não pode se perder: **esta skill ESCREVE loops; o artefato que ela
produz é um documento `<nome>-loop.md`, a especificação completa do loop — não uma skill executável
nem o loop rodando.**

## O que ela entrega

Um único documento **`<nome>-loop.md`** que reúne tudo que define o loop: descrição, use-quando,
entradas (se houver), meta, o check que manda, passos da volta, estados de parada nomeados,
guardrails, memória, sub-loops (se houver), por que funciona, a forma de acionar e a métrica de
saúde. Antes de escrever, a skill pergunta ONDE salvar o loop e se ele deve virar um comando
`/loop-<nome>` (ver Fase 3.5). O loop pode ir para uma pasta `loops/` local (no projeto atual) ou
para a pasta global do Claude (`~/.claude/loops/`).

A forma de acionar vive **dentro** do documento, na seção "Como acionar":
- **Loop que cabe numa janela de contexto:** um comando **`/goal`** que dispara o loop e fixa a
  condição de parada.
- **Loop longo (muitas voltas, estoura contexto):** um **esqueleto Ralph** (laço de shell que relê
  o documento + estado no disco a cada volta, com contexto fresco).

## O princípio que rege tudo

A habilidade central de um loop não é o prompt, é o **check que decide quando o trabalho terminou**.
Um loop sem nada que empurre de volta é o agente concordando consigo mesmo. Regra de ouro: **se
nenhum feedback novo muda a próxima ação, não é loop, é um prompt agendado.**

---

## Fluxo

### Fase 0 — Triagem (faça isto antes de qualquer coisa)

Pergunte: **"o resultado de cada volta muda a próxima ação?"**

- Se **não**: não é loop. Diga isso com franqueza, entregue um **prompt agendado** simples (a tarefa
  + a cadência) e encerre. Não force um loop onde não há iteração.
- Se **sim**: siga para a entrevista.

### Fase 1 — Entrevista (uma pergunta por vez, não todas juntas)

Cubra as oito perguntas. Adapte a linguagem ao caso; não despeje a lista.

1. **Meta.** O que o loop tem que alcançar? Peça o estado final concreto.
   - **Entradas (opcional).** O loop precisa PEDIR algum valor ao usuário no início de cada execução
     (ex. alvo, tema, nº de iterações, nº de agentes)? Se sim, liste. Muitos loops são autônomos e
     não pedem nada; nesse caso a seção de Entradas nem entra no documento.
2. **Verificável?** Esse sucesso é um número/teste/comando, ou depende de juízo? (verificável é o
   alvo; se for juízo, você vai endurecer na Fase 2).
3. **Check.** Qual comando ou aferição prova que a volta funcionou? Prefira determinístico (teste,
   lint, build, contagem, diff).
4. **Gatilho.** Manual, agendado (horário/cadência) ou por evento (ex: abrir um PR)?
5. **Estados de parada.** Além de sucesso, quais? (sem-progresso, bloqueado, esgotado por budget).
6. **Skills chamadas.** Quais skills nomeadas o loop usa por dentro? (um loop deve compor skills,
   não improvisar do zero a cada volta).
   - **Sub-loops (opcional).** Este loop chama outro loop por dentro (for-dentro-de-for)? Se sim, dê
     o NOME do documento de cada sub-loop — ele precisa estar na MESMA pasta deste. Cada sub-loop
     roda até a própria parada dentro de uma volta do loop pai.
7. **Memória.** Onde fica o estado entre voltas? (arquivo no disco: progresso, decisões, o que já
   foi tentado).
8. **Guardrails.** Teto de turnos/custo, e onde o loop precisa de aprovação humana (ações
   destrutivas, em produção, financeiras ou externas).

### Fase 2 — Endurecimento (aplique a teoria antes de escrever)

Passe o loop por este checklist. Cada item existe por uma razão comprovada:

- **Check externo no lugar do auto-score.** Sem feedback externo, a autocorreção de raciocínio
  estagna ou piora, e um modelo que se dá nota de 1 a 10 infla a própria nota. Nunca deixe o loop
  parar por "achei que ficou bom". A parada tem que vir de um check que roda fora da cabeça do
  agente.
- **Evidência na conversa.** O avaliador do `/goal` (um modelo rápido) só lê o que está no
  transcript: ele não roda comandos nem abre arquivos. Então o loop tem que **rodar o check e jogar
  a saída na conversa** a cada volta, e a condição de parada tem que ser escrita sobre essa
  evidência. Sem isso o loop "acha" que terminou sem prova.
- **Se a meta depende de juiz-LLM, endureça:** rubrica fixa e congelada; separe quem gera de quem
  avalia (sessões/modelos distintos); e **quebre a simetria de contexto** entre os dois (não
  compartilhe o histórico de quem fez com quem julga, isso é o que dispara o reward hacking).
- **Estados terminais nomeados:** sucesso, sem-progresso (ex: 2 voltas sem ganho), bloqueado,
  esgotado (budget/turnos). **Erro ou budget estourado nunca é sucesso.**
- **Uma mudança por volta; pior primeiro; fotografe o "antes"** como linha de base comparável.
- **Loops chamam skills nomeadas.** Um loop sem skills reusáveis dentro é um `while true` em volta
  de um estranho.
- **Sub-loops aninham, com teto multiplicativo.** Um loop pode chamar outro loop por dentro
  (for-dentro-de-for), referenciado pelo NOME do documento `<nome>-loop.md` na MESMA pasta. O custo
  multiplica (voltas do pai × voltas do filho), então o teto tem que contar o aninhamento; e proíba
  ciclos: um sub-loop nunca chama, direta ou indiretamente, o loop que o chamou.
- **Memória no disco**, para sobreviver entre voltas (e para o padrão de contexto fresco).
- **Guardrails reais:** teto rígido de iteração/custo, detecção de não-progresso, e aprovação
  humana antes do irreversível.
- **Métrica de saúde:** custo por mudança aceita = tokens (ou R$) gastos / nº de mudanças que
  sobreviveram à verificação. Um loop que queima sem produzir mudanças aceitas está quebrado.

### Fase 3 — Escolha a forma de acionamento (vai na seção "Como acionar" do documento)

- Trabalho de duração curta a média, que cabe numa janela de contexto: o gatilho é um **`/goal`**.
- Trabalho longo, muitas voltas, que estouraria o contexto (a qualidade cai além de ~100-150k
  tokens): o gatilho é um **esqueleto Ralph**, que recomeça com contexto fresco lendo o estado do
  disco. Em ambos os casos a saída é o MESMO documento `<nome>-loop.md`; só muda o conteúdo da
  seção "Como acionar".

### Fase 3.5 — Onde salvar e se vira comando (pergunte ANTES de escrever)

O local precisa ser decidido antes de escrever o arquivo. Faça estas duas perguntas em prosa, uma
de cada vez:

1. **Onde salvar o loop?**
   - **Local:** uma pasta `loops/` na raiz do projeto atual (`./loops/<nome>-loop.md`). Bom quando o
     loop é específico daquele projeto.
   - **Global:** a pasta global do Claude (`~/.claude/loops/<nome>-loop.md`; no Windows
     `C:\Users\<usuário>\.claude\loops\<nome>-loop.md`). Bom quando você quer chamar o loop de
     qualquer projeto. Crie a pasta se ela não existir.

2. **Quer criar o comando `/loop-<nome>`?** Um slash command que dispara o loop já pedindo as
   entradas e rodando, para acionar com `/goal /loop-<nome>` (ou direto `/loop-<nome>`).
   - Se **sim**, o comando vai na pasta de comandos correspondente ao local escolhido no item 1:
     global em `~/.claude/commands/loop-<nome>.md`, local em `./.claude/commands/loop-<nome>.md`.
     Use o gabarito de comando mais abaixo. Crie a pasta de comandos se não existir.
   - Se **não**, entregue só o documento do loop.

### Fase 4 — Escreva o documento `<nome>-loop.md` (no local escolhido na Fase 3.5) com o gabarito abaixo. Se o usuário pediu o comando, escreva também `loop-<nome>.md` com o gabarito de comando.

---

## Gabarito: o documento `<nome>-loop.md`

Escreva UM arquivo com este esqueleto. Quase toda seção é obrigatória; o que não se aplica, escreva
"não se aplica" e diga por quê (silêncio esconde furo). A ÚNICA seção opcional é **Entradas**:
inclua só se o loop pede algo ao usuário; loop autônomo simplesmente não tem essa seção.

```markdown
---
nome: <nome-do-loop>
categoria: <ex: Avaliação | Cobertura | Refatoração | Multi-agente>
gatilho: <manual | agendado | evento>
base-teorica: <papers/fontes que sustentam o desenho, ex: 2305.19118, 2502.19559>
---

# <Nome legível do loop>

## Descrição
<o que o loop faz, em 1-2 frases>

## Use quando
<a situação concreta em que vale rodar este loop>

## Entradas (o usuário fornece ao rodar) — SEÇÃO OPCIONAL
Inclua só se o loop pede valores ao usuário no início. Se o loop é autônomo, OMITA esta seção
inteira. Quando houver, liste cada entrada:
1. <entrada 1: o que é>
2. <entrada 2: o que é>
Se o usuário não informar alguma, use um padrão sensato e AVISE na conversa que usou o padrão.

## Meta
<estado final concreto>. Verificável? <sim, é número/comando | não, depende de juízo —
endurecido na Verificação abaixo>.

## Verificação (o check que manda)
A cada volta, RODE o check e COLE a saída na conversa — é a evidência que a parada lê (o avaliador
não roda comandos nem abre arquivos, só lê o transcript).
- **Check:** `<comando determinístico>` OU <juiz endurecido: rubrica congelada + painel de N +
  voto majoritário; gerador separado do juiz; simetria de contexto quebrada>.
- **Pronto =** <condição lida dessa saída>.

## Passos da volta
0. Setup (só se houver Entradas, na 1ª volta): pergunte ao usuário as entradas declaradas e fixe-as
   para a execução inteira (não mude no meio). Sem entradas, comece direto no passo 1.
1. Fotografe o estado atual (linha de base).
2. Ranqueie o alvo de maior impacto (pior primeiro).
3. Faça UMA mudança, chamando as skills nomeadas <skills> ou disparando um sub-loop declarado (que
   roda até a parada DELE antes do pai seguir).
4. Rode o check e cole a saída.
5. Mantenha a mudança só se nada regrediu; senão reverta.
6. Registre o progresso em <arquivo de estado>.

## Estados de parada
- **sucesso:** <condição lida do check>.
- **sem-progresso:** 2 voltas sem ganho medível.
- **bloqueado:** <quando pedir ajuda humana>.
- **esgotado:** atingiu <N turnos / budget>.
(Erro ou budget estourado NUNCA é sucesso.)

## Guardrails
- Teto: <N turnos / R$ X>.
- Aprovação humana antes de: <ações irreversíveis / produção / financeiras / externas>.

## Memória / estado
<onde o estado vive entre voltas: arquivo no disco com progresso, decisões, o que já foi tentado>.

## Sub-loops (opcional)
Loops aninham, como for-dentro-de-for. Se este chama outro por dentro, liste cada sub-loop pelo
NOME do documento (tem que estar na MESMA pasta deste):
- `<sub-nome>-loop.md` — disparado no passo <N> da volta; roda até a parada DELE antes do pai seguir.
Cuidados: o teto do pai já conta o aninhamento (voltas do pai × voltas do filho); nenhum sub-loop
pode chamar (direta ou indiretamente) o loop que o chamou. Se não aninha nada, OMITA esta seção.

## Por que funciona
<ligação explícita com a teoria: qual modo de falha cada decisão de desenho evita>.

## Como acionar
Loop curto/médio (cabe no contexto) — comando `/goal`:
> /goal Use o loop <nome-do-loop>. Continue até <estado final medível> comprovado por <check no
> transcript>. Restrições: <...>. Pare e me chame se <bloqueio>, ou após <N> turnos.

Loop longo (estoura contexto) — esqueleto Ralph (laço de shell que relê este documento + estado
no disco a cada volta, com contexto fresco; exige sandbox isolado e teto de budget).

## Métrica de saúde
custo por mudança aceita = tokens (ou R$) / nº de mudanças que sobreviveram ao check.
```

---

## Gabarito: o comando `/loop-<nome>` (opcional)

Só crie se o usuário pediu na Fase 3.5. Escreva um arquivo `loop-<nome>.md` na pasta de comandos
(global `~/.claude/commands/` ou local `./.claude/commands/`). O corpo referencia o documento do
loop pelo caminho absoluto e manda executá-lo, pedindo as entradas e rodando até a parada. O comando
deve ser autossuficiente para funcionar tanto sozinho (`/loop-<nome>`) quanto embrulhado no goal
(`/goal /loop-<nome>`). Esqueleto:

````markdown
---
description: <uma linha: roda o loop <nome> definido em <caminho do loop>, e o que ele entrega>
argument-hint: "[opcional inline: as entradas do loop; se vazio o loop pergunta]"
---

Execute o loop especificado em `<caminho absoluto do arquivo <nome>-loop.md>`. Leia esse documento
primeiro e siga os passos da volta exatamente.

<Resumo curto do que rodar: as entradas a pedir e travar, o check de cada volta a colar no
transcript, e a condição de parada. Erro ou estouro de teto NUNCA é sucesso.>

Inputs inline (se houver):
$ARGUMENTS
````

## Saída final ao usuário

Entregue: (1) o documento `<nome>-loop.md` pronto, salvo no local escolhido na Fase 3.5 (`loops/`
local ou `~/.claude/loops/` global), com o caminho; (2) se o usuário pediu, o comando `/loop-<nome>`
criado, com o caminho do arquivo e como acioná-lo; (3) a métrica de saúde a observar. Se a triagem
da Fase 0 reprovou, entregue um prompt agendado simples e explique por que não era um loop.

## Exemplo de documento forjado (cobertura de testes)

`cobertura-auth-loop.md`: entradas = o diretório alvo (ex: `test/auth`); meta = cobertura desse
diretório em 100% (verificável); check =
`npm test -- --coverage` sai 0 e o relatório mostra 100%; passos = fotografe a cobertura, ataque o
arquivo mais descoberto, escreva 1 teste, prove que ele pega o bug (vermelho antes / verde depois),
rode a suíte, mantenha se nada regrediu; parada = sucesso 100% / sem-progresso 2 voltas / esgotado
30 turnos; guardrails = não tocar em CI sem aprovação; como acionar = `/goal Use o loop
cobertura-auth. Continue até a saída de npm test -- --coverage mostrar 0 falhas e 100% em test/auth,
sem alterar arquivos fora de test/auth, ou pare após 30 turnos.`

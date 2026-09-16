---
description: Este documento registra as ações executadas para solucionar a exibição de modificações indesejadas (indicadas pela letra **M**) nos diretórios de skills no painel de controle de versão (Git) do VS Code.
---

## 1. Diagnóstico do Problema
O Git sinalizava alterações nos seguintes caminhos dentro de `erp-conexao`:
* `.agents/skills/caveman`
* `.agents/skills/headroom`
* `.agents/skills/lean-ctx`
* `.agents/skills/rtk`

**Causa:** Esses diretórios foram clonados com seus próprios repositórios Git internos (contendo pastas `.git`). O repositório pai os identificava incorretamente como submodules de modo `160000` (gitlinks) sem que houvesse um mapeamento correspondente no arquivo `.gitmodules`.

## 2. Ações Realizadas

### A. Limpeza do Cache do Git
Removemos os diretórios do cache de rastreamento do Git (mantendo os arquivos locais intactos):
```bash
git rm --cached .agents/skills/caveman .agents/skills/headroom .agents/skills/lean-ctx .agents/skills/rtk
```

### B. Atualização do `.gitignore`
Editamos o arquivo [gitignore](file:///c:/Users/trcnologia/Desktop/PROJETOS/proj_erp/erp-conexao/.gitignore) para ignorar os repositórios clonados e evitar novos conflitos:
```gitignore
# Skills com repo Git próprio (clonados)
.agents/skills/caveman/
.agents/skills/headroom/
.agents/skills/lean-ctx/
.agents/skills/rtk/
```

### C. Confirmação do Commit
Registramos as alterações no repositório com a seguinte mensagem de commit:
```bash
git add .gitignore
git commit -m "fix: ignora skills clonadas com repo Git próprio no .gitignore"
```

## 3. Resultado
O controle de versão foi limpo com sucesso e não exibe mais marcações pendentes de alteração para as skills citadas.

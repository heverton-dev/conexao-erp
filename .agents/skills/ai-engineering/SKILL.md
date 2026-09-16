# Skill: AI Engineering — Guia Operacional

## Trigger
Use quando o usuário pedir para "engenharia de IA", "projetar sistema de IA", "avaliar modelos", "otimizar prompts", "criar pipeline de ML", ou qualquer tarefa relacionada a engenharia de sistemas de inteligência artificial.

## Objetivo
Fornecer um passo a passo operacional para projetar e construir sistemas de IA, baseado no livro "AI Engineering" de Chip Huyen.

---

## FASE 1: FUNDAMENTOS DE AI ENGINEERING

### 1.1 O que é AI Engineering
**Princípio:** AI Engineering é a prática de construir sistemas de IA escaláveis, confiáveis e eficientes que resolvem problemas do mundo real.

**Conceitos-Chave:**
- **Modelos Fundamentais:** LLMs, diffusion models, etc.
- **Prompt Engineering:** Design de prompts eficazes
- **RAG:** Retrieval-Augmented Generation
- **Fine-tuning:** Ajuste de modelos para tarefas específicas
- **Agentes:** Sistemas autônomos com ferramentas

### 1.2 Pilares do AI Engineering
```
┌─────────────────────────────────────────────────────┐
│                  AI Engineering                      │
├─────────────┬─────────────┬─────────────┬───────────┤
│  Modelos    │  Dados      │  Infra      │  Avaliação │
│  Fundament. │  Pipelines  │  Escalável  │  Contínua  │
└─────────────┴─────────────┴─────────────┴───────────┘
```

---

## FASE 2: PROMPT ENGINEERING

### 2.1 Técnicas de Prompting
**Princípio:** Bons prompts são específicos, contextuais e incluem exemplos.

**Checklist Operacional:**
- [ ] Definir persona do modelo
- [ ] Instruções claras e específicas
- [ ] Incluir exemplos (few-shot)
- [ ] Definir formato de saída
- [ ] Adicionar restrições quando necessário

### 2.2 Padrões de Prompt
```python
# Padrão 1: Few-Shot Prompting
prompt_few_shot = """
Você é um classificador de sentimentos.

Exemplos:
- "Adorei o produto!" → Positivo
- "Produto ruim, não recomendo." → Negativo
- "É ok, nada especial." → Neutro

Classifique: "O atendimento foi ótimo mas o produto chegou danificado."
"""

# Padrão 2: Chain-of-Thought
prompt_cot = """
Você é um resolvedor de problemas. Pense passo a passo.

Problema: Se tenho 5 camisas e compro mais 3, quantas tenho?

Resolução:
1. Começo com 5 camisas
2. Compro mais 3
3. 5 + 3 = 8
Resposta: 8 camisas
"""

# Padrão 3: Persona + Formato
prompt_persona = """
Você é um especialista em marketing digital com 10 anos de experiência.

Analise o texto abaixo e retorne no formato JSON:
{
  "sentimento": "positivo|negativo|neutro",
  "confianca": 0.0-1.0,
  "pontos_chave": ["ponto1", "ponto2"]
}

Texto: {texto}
"""
```

### 2.3 Checklist de Prompt Engineering
- [ ] Persona definida
- [ ] Instruções claras e específicas
- [ ] Exemplos incluídos (quando aplicável)
- [ ] Formato de saída definido
- [ ] Restrições documentadas
- [ ] Testado com múltiplos inputs
- [ ] Avaliado para viés e alucinações

---

## FASE 3: RAG (RETRIEVAL-AUGMENTED GENERATION)

### 3.1 Arquitetura RAG
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Documentos  │────▶│  Embeddings │────▶│  Vector DB  │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
┌─────────────┐     ┌─────────────┐           │
│   Query     │────▶│  Retrieval  │◀──────────┘
└─────────────┘     └─────────────┘
                         │
┌─────────────┐     ┌─────────────┐
│  Contexto   │────▶│   LLM      │────▶ Resposta
└─────────────┘     └─────────────┘
```

### 3.2 Implementação RAG
```python
# rag.py
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains import RetrievalQA
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

class RAGSystem:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.embeddings = OpenAIEmbeddings()
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )
        self.vector_store = None
        
    def load_documents(self, file_paths: list):
        """Carregar e processar documentos"""
        documents = []
        for path in file_paths:
            loader = TextLoader(path)
            documents.extend(loader.load())
        
        # Dividir em chunks
        chunks = self.text_splitter.split_documents(documents)
        
        # Criar vector store
        self.vector_store = Chroma.from_documents(
            chunks, 
            self.embeddings
        )
        
    def query(self, question: str, k: int = 3):
        """Consultar o sistema RAG"""
        if not self.vector_store:
            raise ValueError("Sistema não inicializado. Execute load_documents primeiro.")
        
        # Buscar documentos relevantes
        retriever = self.vector_store.as_retriever(search_kwargs={"k": k})
        
        # Criar chain QA
        llm = ChatOpenAI(model="gpt-4")
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=True
        )
        
        result = qa_chain.invoke({"query": question})
        return result
```

### 3.3 Checklist RAG
- [ ] Documentos carregados e processados
- [ ] Chunking adequado (tamanho e sobreposição)
- [ ] Embeddings de qualidade
- [ ] Vector store configurado
- [ ] Retrieval testado
- [ ] Respostas avaliadas para qualidade
- [ ] Fontes citadas corretamente

---

## FASE 4: FINE-TUNING

### 4.1 Quando Fazer Fine-Tuning
- [ ] Prompt engineering não resolve
- [ ] Necessidade de formato específico
- [ ] Dados proprietários disponíveis
- [ ] Requisitos de latência baixa
- [ ] Custo de API muito alto

### 4.2 Pipeline de Fine-Tuning
```python
# fine_tuning.py
from openai import OpenAI
import json

class FineTuningPipeline:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)
        
    def prepare_dataset(self, data: list, output_path: str):
        """Preparar dataset no formato JSONL"""
        with open(output_path, 'w') as f:
            for item in data:
                jsonl_item = {
                    "messages": [
                        {"role": "system", "content": item["system"]},
                        {"role": "user", "content": item["user"]},
                        {"role": "assistant", "content": item["assistant"]}
                    ]
                }
                f.write(json.dumps(jsonl_item) + '\n')
    
    def upload_dataset(self, file_path: str):
        """Upload do dataset para OpenAI"""
        with open(file_path, 'rb') as f:
            response = self.client.files.create(
                file=f,
                purpose='fine-tune'
            )
        return response.id
    
    def create_finetune_job(self, file_id: str, model: str = "gpt-3.5-turbo"):
        """Criar job de fine-tuning"""
        response = self.client.fine_tuning.jobs.create(
            training_file=file_id,
            model=model,
            hyperparameters={
                "n_epochs": 3,
                "batch_size": 1,
                "learning_rate_multiplier": 0.1
            }
        )
        return response.id
    
    def monitor_job(self, job_id: str):
        """Monitorar progresso do job"""
        response = self.client.fine_tuning.jobs.retrieve(job_id)
        return {
            "status": response.status,
            "trained_tokens": response.trained_tokens,
            "fine_tuned_model": response.fine_tuned_model
        }
```

### 4.3 Checklist Fine-Tuning
- [ ] Dataset preparado no formato correto
- [ ] Dados validados e limpos
- [ ] Hiperparâmetros definidos
- [ ] Job de treinamento criado
- [ ] Progresso monitorado
- [ ] Modelo avaliado após treinamento
- [ ] Deploy do modelo fine-tuned

---

## FASE 5: AVALIAÇÃO DE MODELOS

### 5.1 Métricas de Avaliação
| Métrica | Uso | Fórmula |
|---------|-----|---------|
| **Accuracy** | Classificação geral | (TP+TN)/(TP+TN+FP+FN) |
| **Precision** | Qualidade dos positivos | TP/(TP+FP) |
| **Recall** | Cobertura dos positivos | TP/(TP+FN) |
| **F1-Score** | Balanceamento | 2×(P×R)/(P+R) |
| **BLEU** | Tradução/geração | Precisão de n-gramas |
| **ROUGE** | Resumo | Recall de n-gramas |
| **BERTScore** | Similaridade semântica | Similaridade de embeddings |

### 5.2 Framework de Avaliação
```python
# evaluation.py
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import numpy as np

class ModelEvaluator:
    def __init__(self):
        self.metrics = {}
        
    def evaluate_classification(self, y_true: list, y_pred: list):
        """Avaliar modelo de classificação"""
        self.metrics = {
            "accuracy": accuracy_score(y_true, y_pred),
            "precision": precision_score(y_true, y_pred, average='weighted'),
            "recall": recall_score(y_true, y_pred, average='weighted'),
            "f1": f1_score(y_true, y_pred, average='weighted')
        }
        return self.metrics
    
    def evaluate_generation(self, references: list, predictions: list):
        """Avaliar qualidade de geração de texto"""
        # BLEU Score
        from nltk.translate.bleu_score import sentence_bleu
        bleu_scores = []
        for ref, pred in zip(references, predictions):
            bleu_scores.append(sentence_bleu([ref.split()], pred.split()))
        
        self.metrics = {
            "bleu": np.mean(bleu_scores),
            "avg_length": np.mean([len(p.split()) for p in predictions])
        }
        return self.metrics
    
    def compare_models(self, results: dict):
        """Comparar resultados de múltiplos modelos"""
        comparison = {}
        for model_name, metrics in results.items():
            comparison[model_name] = {
                k: f"{v:.4f}" if isinstance(v, float) else v
                for k, v in metrics.items()
            }
        return comparison
```

### 5.3 Checklist de Avaliação
- [ ] Métricas definidas para o caso de uso
- [ ] Dataset de teste preparado
- [ ] Avaliação automatizada implementada
- [ ] Avaliação humana realizada (quando aplicável)
- [ ] Comparação entre modelos documentada
- [ ] Trade-offs analisados (custo vs qualidade)

---

## FASE 6: DEPLOY E ESCALABILIDADE

### 6.1 Arquitetura de Deploy
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   API       │────▶│   Load      │────▶│   Model     │
│   Gateway   │     │   Balancer  │     │   Servers   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │  Monitoring │
                    │  & Logging  │
                    └─────────────┘
```

### 6.2 Checklist de Deploy
- [ ] Modelo versionado e exportado
- [ ] API de inference implementada
- [ ] Load testing realizado
- [ ] Monitoramento configurado
- [ ] Logging implementado
- [ ] Rollback planejado
- [ ] Documentação de deploy criada

---

## CHECKLIST FINAL — Validação de AI Engineering

### Arquitetura
- [ ] Sistema de IA projetado adequadamente
- [ ] Componentes desacoplados
- [ ] Escalabilidade planejada
- [ ] Custos estimados

### Dados
- [ ] Pipeline de dados implementado
- [ ] Qualidade dos dados verificada
- [ ] Privacidade e segurança garantidas
- [ ] Versionamento de dados

### Modelos
- [ ] Modelo selecionado adequadamente
- [ ] Prompt engineering otimizado
- [ ] Fine-tuning realizado (se necessário)
- [ ] Avaliação completa

### Deploy
- [ ] Deploy automatizado
- [ ] Monitoramento ativo
- [ ] Alertas configurados
- [ ] Documentação atualizada

### Iteração
- [ ] Feedback coletado
- [ ] Métricas monitoradas
- [ ] Melhorias implementadas
- [ ] Experimentos documentados

---

## REFERÊNCIAS
- **Livro:** AI Engineering — Chip Huyen (2024)
- **Conceitos:** Prompt Engineering, RAG, Fine-tuning, Evaluation
- **Ferramentas:** LangChain, OpenAI, ChromaDB, scikit-learn
- **Padrões:** Few-Shot, Chain-of-Thought, RAG Pipeline

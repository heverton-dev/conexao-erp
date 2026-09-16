# Skill: AI Agents with MCP — Guia Operacional

## Trigger
Use quando o usuário pedir para "criar agente de IA", "integrar MCP", "usar Model Context Protocol", "construir cliente MCP", "criar servidor MCP", ou qualquer tarefa relacionada a agentes de IA com o protocolo MCP.

## Objetivo
Fornecer um passo a passo operacional para construir agentes de IA usando o Model Context Protocol (MCP), baseado no livro "AI Agents with MCP" de Kyle Stratis.

---

## FASE 1: FUNDAMENTOS DO MCP

### 1.1 O que é o MCP
**Princípio:** MCP é um protocolo aberto que permite conectar modelos de IA a fontes de dados e ferramentas externas de forma padronizada.

**Conceitos-Chave:**
- **Cliente MCP:** Aplicação que se comunica com servidores MCP
- **Servidor MCP:** Expõe ferramentas, recursos e prompts para clientes
- **Transporte:** Camada de comunicação (stdio, HTTP/SSE)
- **Ferramentas:** Funções que o agente pode chamar
- **Recursos:** Dados que o agente pode ler
- **Prompts:** Templates de prompts pré-definidos

### 1.2 Arquitetura MCP
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Aplicação     │     │   Cliente MCP   │     │   Servidor MCP  │
│   (Agente IA)   │────▶│   (Driver)      │────▶│   (Tools/Data)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## FASE 2: CRIANDO UM SERVIDOR MCP

### 2.1 Estrutura Básica do Servidor
```python
# server.py
from mcp.server import Server
from mcp.types import Tool, Resource, Prompt
import asyncio

# Criar instância do servidor
server = Server("meu-servidor")

# Definir ferramentas
@server.list_tools()
async def list_tools():
    return [
        Tool(
            name="buscar_usuario",
            description="Busca usuário por ID",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {"type": "string", "description": "ID do usuário"}
                },
                "required": ["user_id"]
            }
        )
    ]

# Implementar ferramenta
@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "buscar_usuario":
        user_id = arguments["user_id"]
        # Lógica de busca
        return {"id": user_id, "nome": "João", "email": "joao@email.com"}

# Definir recursos
@server.list_resources()
async def list_resources():
    return [
        Resource(
            uri="usuarios://lista",
            name="Lista de Usuários",
            description="Lista completa de usuários do sistema",
            mimeType="application/json"
        )
    ]

# Implementar leitura de recurso
@server.read_resource()
async def read_resource(uri: str):
    if uri == "usuarios://lista":
        return [{"id": "1", "nome": "João"}, {"id": "2", "nome": "Maria"}]

# Executar servidor
async def main():
    from mcp.server.stdio import stdio_server
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream)

if __name__ == "__main__":
    asyncio.run(main())
```

### 2.2 Checklist do Servidor
- [ ] Definir nome e versão do servidor
- [ ] Implementar `list_tools()` com schemas válidos
- [ ] Implementar `call_tool()` com tratamento de erros
- [ ] Implementar `list_resources()` se necessário
- [ ] Implementar `read_resource()` para cada recurso
- [ ] Adicionar validação de entrada
- [ ] Implementar logs para debugging

---

## FASE 3: CRIANDO UM CLIENTE MCP

### 3.1 Cliente Básico
```python
# client.py
from mcp.client import ClientSession
from mcp.client.stdio import stdio_client
import asyncio

async def main():
    # Conectar ao servidor
    async with stdio_client("python", ["server.py"]) as (read, write):
        async with ClientSession(read, write) as session:
            # Inicializar conexão
            await session.initialize()
            
            # Listar ferramentas disponíveis
            tools = await session.list_tools()
            print("Ferramentas disponíveis:")
            for tool in tools:
                print(f"  - {tool.name}: {tool.description}")
            
            # Chamar ferramenta
            result = await session.call_tool(
                "buscar_usuario",
                {"user_id": "123"}
            )
            print(f"Resultado: {result}")
            
            # Ler recurso
            resource = await session.read_resource("usuarios://lista")
            print(f"Recurso: {resource}")

asyncio.run(main())
```

### 3.2 Checklist do Cliente
- [ ] Conectar ao servidor via transporte adequado
- [ ] Inicializar sessão corretamente
- [ ] Listar ferramentas antes de usar
- [ ] Validar argumentos antes de chamar
- [ ] Tratar erros de conexão
- [ ] Implementar retry em caso de falha

---

## FASE 4: AGENTE DE IA COM MCP

### 4.1 Arquitetura do Agente
```python
# agent.py
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
import asyncio

class MCPAgent:
    def __init__(self, server_command: str, server_args: list):
        self.server_params = StdioServerParameters(
            command=server_command,
            args=server_args
        )
        self.tools = []
        
    async def connect(self):
        """Conectar ao servidor MCP e carregar ferramentas"""
        self.read, self.write = await stdio_client(self.server_params).__aenter__()
        self.session = ClientSession(self.read, self.write)
        await self.session.__aenter__()
        await self.session.initialize()
        
        # Carregar ferramentas do servidor
        server_tools = await self.session.list_tools()
        for tool in server_tools:
            self.tools.append(MCPTool(self.session, tool))
    
    async def run(self, query: str):
        """Executar agente com query do usuário"""
        llm = ChatOpenAI(model="gpt-4")
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Você é um assistente útil que usa ferramentas MCP."),
            ("human", "{input}"),
            ("placeholder", "{agent_scratchpad}")
        ])
        
        agent = create_tool_calling_agent(llm, self.tools, prompt)
        executor = AgentExecutor(agent=agent, tools=self.tools, verbose=True)
        
        result = await executor.ainvoke({"input": query})
        return result

class MCPTool:
    """Wrapper para ferramenta MCP"""
    def __init__(self, session, tool_info):
        self.session = session
        self.name = tool_info.name
        self.description = tool_info.description
        self.args_schema = tool_info.inputSchema
    
    async def arun(self, **kwargs):
        return await self.session.call_tool(self.name, kwargs)
```

### 4.2 Checklist do Agente
- [ ] Conectar a múltiplos servidores MCP
- [ ] Carregar ferramentas dinamicamente
- [ ] Implementar memória de contexto
- [ ] Adicionar tratamento de erros robusto
- [ ] Implementar logging de ações
- [ ] Adicionar validação de respostas

---

## FASE 5: PADRÕES DE DESIGN MCP

### 5.1 Padrão Gateway
```python
# gateway.py - Centraliza múltiplos servidores MCP
class MCPGateway:
    def __init__(self):
        self.servers = {}
        self.tools = {}
    
    async def register_server(self, name: str, command: str, args: list):
        """Registrar novo servidor MCP"""
        server_params = StdioServerParameters(command=command, args=args)
        self.servers[name] = server_params
        
        # Conectar e carregar ferramentas
        read, write = await stdio_client(server_params).__aenter__()
        session = ClientSession(read, write)
        await session.__aenter__()
        await session.initialize()
        
        tools = await session.list_tools()
        for tool in tools:
            self.tools[f"{name}_{tool.name}"] = (session, tool)
    
    async def call_tool(self, tool_name: str, arguments: dict):
        """Chamar ferramenta pelo nome completo"""
        session, tool = self.tools[tool_name]
        return await session.call_tool(tool.name, arguments)
```

### 5.2 Padrão Cache
```python
# cache.py - Cache de resultados MCP
import json
from datetime import datetime, timedelta

class MCPCache:
    def __init__(self, ttl_seconds: int = 300):
        self.cache = {}
        self.ttl = ttl_seconds
    
    async def call_tool_with_cache(self, session, tool_name: str, arguments: dict):
        """Chamar ferramenta com cache"""
        cache_key = f"{tool_name}:{json.dumps(arguments, sort_keys=True)}"
        
        # Verificar cache
        if cache_key in self.cache:
            entry = self.cache[cache_key]
            if datetime.now() - entry["time"] < timedelta(seconds=self.ttl):
                return entry["result"]
        
        # Chamar ferramenta
        result = await session.call_tool(tool_name, arguments)
        
        # Armazenar no cache
        self.cache[cache_key] = {
            "result": result,
            "time": datetime.now()
        }
        
        return result
```

---

## FASE 6: SEGURANÇA E VALIDAÇÃO

### 6.1 Validação de Entrada
```python
# validation.py
from pydantic import BaseModel, validator
from typing import Any, Dict

class ToolInputValidator:
    @staticmethod
    def validate(tool_schema: dict, arguments: dict) -> bool:
        """Validar argumentos contra schema da ferramenta"""
        required = tool_schema.get("required", [])
        properties = tool_schema.get("properties", {})
        
        # Verificar campos obrigatórios
        for field in required:
            if field not in arguments:
                raise ValueError(f"Campo obrigatório ausente: {field}")
        
        # Validar tipos
        for field, value in arguments.items():
            if field in properties:
                expected_type = properties[field].get("type")
                if not ToolInputValidator._check_type(value, expected_type):
                    raise ValueError(f"Tipo inválido para {field}: esperado {expected_type}")
        
        return True
    
    @staticmethod
    def _check_type(value: Any, expected_type: str) -> bool:
        type_map = {
            "string": str,
            "number": (int, float),
            "integer": int,
            "boolean": bool,
            "array": list,
            "object": dict
        }
        return isinstance(value, type_map.get(expected_type, object))
```

### 6.2 Checklist de Segurança
- [ ] Validar todos os inputs antes de processar
- [ ] Sanitizar dados de saída
- [ ] Implementar rate limiting
- [ ] Log de todas as chamadas de ferramenta
- [ ] Restringir acesso a ferramentas sensíveis
- [ ] Implementar autenticação entre cliente e servidor

---

## FASE 7: TESTES E DEBUGGING

### 7.1 Testes Unitários
```python
# test_server.py
import pytest
import asyncio
from server import call_tool, list_tools

@pytest.mark.asyncio
async def test_list_tools():
    tools = await list_tools()
    assert len(tools) > 0
    assert tools[0].name == "buscar_usuario"

@pytest.mark.asyncio
async def test_call_tool():
    result = await call_tool("buscar_usuario", {"user_id": "123"})
    assert result is not None
    assert "id" in result

@pytest.mark.asyncio
async def test_call_tool_invalid():
    with pytest.raises(ValueError):
        await call_tool("buscar_usuario", {})
```

### 7.2 Checklist de Testes
- [ ] Testar listagem de ferramentas
- [ ] Testar chamada de cada ferramenta
- [ ] Testar validação de inputs
- [ ] Testar tratamento de erros
- [ ] Testar conexão/desconexão
- [ ] Testar com múltiplos clientes

---

## CHECKLIST FINAL — Validação de Agente MCP

### Arquitetura
- [ ] Servidor MCP implementado e testado
- [ ] Cliente MCP conectando corretamente
- [ ] Agente integrado com LLM
- [ ] Gateway para múltiplos servidores (se necessário)

### Ferramentas
- [ ] Todas as ferramentas documentadas
- [ ] Schemas de entrada validados
- [ ] Tratamento de erros implementado
- [ ] Cache implementado (se necessário)

### Segurança
- [ ] Validação de inputs
- [ ] Rate limiting implementado
- [ ] Logs de auditoria
- [ ] Autenticação entre componentes

### Testes
- [ ] Testes unitários cobrindo ferramentas
- [ ] Testes de integração com servidor
- [ ] Testes de conexão
- [ ] Testes de erro

### Documentação
- [ ] README com instruções de uso
- [ ] Documentação de cada ferramenta
- [ ] Exemplos de uso
- [ ] Guia de troubleshooting

---

## REFERÊNCIAS
- **Livro:** AI Agents with MCP — Kyle Stratis (2026)
- **Protocolo:** Model Context Protocol (MCP)
- **Transporte:** stdio, HTTP/SSE
- **Padrões:** Gateway, Cache, Validation

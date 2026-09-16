# Skill: Código Limpo — Guia Operacional

## Trigger
Use quando o usuário pedir para "aplicar código limpo", "revisar código", "melhorar legibilidade", "renomear variáveis", "refatorar funções", "remover comentários desnecessários", ou qualquer tarefa relacionada a qualidade de código seguindo os princípios de Robert C. Martin.

## Objetivo
Fornecer um passo a passo operacional para aplicar os conceitos do livro "Código Limpo" de Robert C. Martin em código de software.

---

## FASE 1: NOMES SIGNIFICATIVOS — A Arte de Nomear

### 1.1 Regras para Nomes
**Princípio:** Nomes devem revelar intenção. Devem ser pronunciáveis e pesquisáveis.

**Checklist Operacional:**
- [ ] Nomes de variáveis descrevem o que contêm
- [ ] Nomes de funções descrevem o que fazem
- [ ] Nomes de classes descrevem o que representam
- [ ] Nomes de constantes são significativos (não mágicos)

**Ações:**
- [ ] Renomear variáveis com nomes intencionais
- [ ] Renomear funções com verbos de ação
- [ ] Evitar abreviações (use `userAddress` não `usrAddr`)
- [ ] Usar nomes consistentes no mesmo contexto

### 1.2 Convenções de Nomes
```
// ❌ RUIM
int d; // passou desde última última última ultima vez?
String tmp;
bool flag;

// ✅ BOM
int elapsedTimeSinceCreation;
String temporaryBuffer;
bool isProcessComplete;
```

### 1.3 Escopo e Tamanho
| Escopo | Tamanho Recomendado |
|--------|---------------------|
| Variável local | 1-2 palavras |
| Função | 2-3 palavras |
| Classe | 1-2 palavras |
| Método | 3-5 palavras |

---

## FASE 2: FUNÇÕES — Pequenas e com Responsabilidade Única

### 2.1 Regras para Funções
**Princípio:** Funções devem ser pequenas e fazer uma coisa só.

**Checklist Operacional:**
- [ ] Funções com no máximo 20-30 linhas
- [ ] Uma função faz apenas uma coisa
- [ ] Nome da função descreve o que faz
- [ ] Número de argumentos ideal: 0-2
- [ ] Evitar argumentos de output (side effects)

### 2.2 Estrutura de Função
```
// ❌ RUIM - Função gigante com múltiplas responsabilidades
function processOrder(order) {
  // 50 linhas de validação
  // 30 linhas de cálculo
  // 40 linhas de persistência
  // 20 linhas de notificação
}

// ✅ BOM - Funções pequenas e compostas
function processOrder(order) {
  validateOrder(order);
  calculateTotal(order);
  persistOrder(order);
  notifyCustomer(order);
}
```

### 2.3 Nomes de Funções
```
// ❌ RUIM
function checkTheThing() { }
function doStuffWithIt() { }

// ✅ BOM
function validateUserCredentials() { }
function calculateOrderTotal() { }
function sendConfirmationEmail() { }
```

### 2.4 Funções Comando vs Query
```
// ❌ RUIM - Mistura comando e query
function setAndCheck(value) {
  this.value = value;
  return this.value === value;
}

// ✅ BOM - Separação clara
function setValue(value) {
  this.value = value;
}

function isValueSet() {
  return this.value === value;
}
```

---

## FASE 3: COMENTÁRIOS — Não Comente, Escreva Código Claro

### 3.1 Regras para Comentários
**Princípio:** Código limpo não precisa de muitos comentários. O código deve se explicar.

**Checklist Operacional:**
- [ ] Remover comentários obsoletos
- [ ] Remover comentários de código comentado
- [ ] Remover comentários de explicação óbvia
- [ ] Usar nomes significativos em vez de comentários
- [ ] Documentar intenção, não implementação

### 3.2 Tipos de Comentários a Evitar
```javascript
// ❌ RUIM - Comentário de código morto
// int count = 0;
// while (count < items.length) {
//   process(items[count]);
//   count++;
// }

// ❌ RUIM - Comentário óbvio
// Verifica se o usuário está ativo
if (user.isActive) { }

// ❌ RUIM - Comentário de implementação
// Incrementa o contador em 1
count++;
```

### 3.3 Quando Usar Comentários
```java
// ✅ BOM - Comentário de intenção
// A API externa não aceita mais de 100 requisições por minuto
// Portanto, precisamos implementar rate limiting
rateLimiter.setLimit(100);

// ✅ BOM - TODO com contexto
// TODO: Implementar cache quando o banco de dados estiver indisponível
// Atualmente, retorna erro 503 em caso de falha
```

---

## FASE 4: FORMATAÇÃO — Organização Visual do Código

### 4.1 Regras de Formatação
**Princípio:** Formatação é comunicação. Código deve ser visualmente organizado.

**Checklist Operacional:**
- [ ] Linhas com no máximo 120 caracteres
- [ ] Funções separadas por linha em branco
- [ ] Blocos lógicos separados por linhas em branco
- [ ] Indentação consistente (2 ou 4 espaços)
- [ ] Alinhamento vertical para conceitos relacionados

### 4.2 Ordem de Elementos na Classe
```
// ✅ ORDEM RECOMENDADA
class Classe {
  // 1. Constantes
  // 2. Atributos estáticos
  // 3. Atributos de instância
  // 4. Construtor
  // 5. Métodos públicos
  // 6. Métodos protegidos
  // 7. Métodos privados
}
```

### 4.3 Vertical Rule of Proximity
```java
// ✅ BOM - Conceitos relacionados próximos
public class UserService {
  private UserRepository repository;
  private EmailService emailService;
  
  public User createUser(CreateUserRequest request) {
    validateRequest(request);
    User user = mapToUser(request);
    return repository.save(user);
  }
  
  private void validateRequest(CreateUserRequest request) { }
  private User mapToUser(CreateUserRequest request) { }
}
```

---

## FASE 5: OBJETOS E ESTRUTURAS DE DADOS — Abstração Adequada

### 5.1 Regras para Objetos
**Princípio:** Objetos ocultam seus dados e expõem operações. Estruturas de dados expõem seus dados e não têm operações significativas.

**Checklist Operacional:**
- [ ] Objetos encapsulam dados e comportamento
- [ ] Evitar "anêmicos" (só dados, sem lógica)
- [ ] Usar Data Transfer Objects (DTOs) para transferência
- [ ] Preferir polimorfismo a switch/if-else em classes

### 5.2 Law of Demeter
```java
// ❌ RUIM - Violação da Lei de Demeter
String userCity = user.getAddress().getCity().getName();

// ✅ BOM - Encapsulamento adequado
String userCity = user.getCityName();
```

### 5.3 Estruturas de Dados vs Objetos
```java
// ESTRUTURA DE DADOS - Para dados puros
public class Point {
  public double x;
  public double y;
}

// OBJETO - Para comportamento
public class Circle {
  private Point center;
  private double radius;
  
  public boolean contains(Point point) {
    return point.distanceTo(center) <= radius;
  }
}
```

---

## FASE 6: TRATAMENTO DE ERROS — Exceções, Não Return Codes

### 6.1 Regras para Erros
**Princípio:** Use exceções em vez de códigos de retorno. Mantenha o encapsulamento.

**Checklist Operacional:**
- [ ] Usar exceções para erros, não códigos de retorno
- [ ] Não retornar null
- [ ] Não passar null como argumento
- [ ] Capturar exceções específicas, nunca genéricas
- [ ] Liberar recursos em finally/deferred

### 6.2 Padrão de Exceção Customizada
```java
// ❌ RUIM
public User findUser(String id) {
  if (id == null) return null;
  User user = repository.findById(id);
  if (user == null) return null;
  return user;
}

// ✅ BOM
public User findUser(String id) {
  if (id == null) {
    throw new IllegalArgumentException("ID não pode ser null");
  }
  return repository.findById(id)
    .orElseThrow(() -> new UserNotFoundException(id));
}
```

### 6.3 Estrutura de Try-Catch
```java
// ✅ BOM - Try-catch com responsabilidade clara
try {
  processPayment(order);
} catch (PaymentDeclinedException e) {
  notifyCustomerPaymentFailed(order, e);
  log.error("Pagamento recusado para pedido {}", order.getId(), e);
  throw new OrderProcessingException("Falha no pagamento", e);
} catch (PaymentGatewayException e) {
  log.error("Erro no gateway de pagamento", e);
  throw new OrderProcessingException("Serviço de pagamento indisponível", e);
}
```

---

## FASE 7: LIMITES — Não Dependências de Detalhes

### 7.1 Regras para Limites
**Princípio:** Mantenha dependências apontando para dentro. Não exponha detalhes de implementação.

**Checklist Operacional:**
- [ ] Usar interfaces para desacoplar módulos
- [ ] Não expor bibliotecas de terceiros diretamente
- [ ] Criar anti-caminos (wrappers) para serviços externos
- [ ] Manter frameworks na camada mais externa

### 7.2 Padrão de Anti-Caminho
```java
// ❌ RUIM - Acoplamento direto ao framework
import org.springframework.web.client.RestTemplate;

public class UserService {
  private RestTemplate restTemplate;
  
  public User getUser(String id) {
    return restTemplate.getForObject("/users/" + id, User.class);
  }
}

// ✅ BOM - Anti-caminho para o framework
public interface UserClient {
  User getUser(String id);
}

public class RestUserClient implements UserClient {
  private final RestTemplate restTemplate;
  
  public User getUser(String id) {
    return restTemplate.getForObject("/users/" + id, User.class);
  }
}
```

---

## FASE 8: TESTES UNITÁRIOS — TDD e a Regra dos 3 Atos

### 8.1 Regras para Testes
**Princípio:** Testes são código limpo. Seguem a Regra dos 3 Atos: Setup, Execução, Verificação.

**Checklist Operacional:**
- [ ] Um teste por assert
- [ ] Testes快速 e independentes
- [ ] Nomes descritivos (Teste o que, Quando cenário, Então resultado)
- [ ] Seguir Arrange-Act-Assert (AAA)
- [ ] Não testar implementação, testar comportamento

### 8.2 Estrutura de Teste
```java
// ✅ BOM - Teste com AAA
@Test
void shouldCalculateOrderTotalWithDiscount() {
  // Arrange
  Order order = new Order();
  order.addItem(new Product("Notebook", 3000.00));
  Discount discount = new PercentageDiscount(10);
  
  // Act
  double total = order.calculateTotal(discount);
  
  // Assert
  assertEquals(2700.00, total, 0.01);
}

// ❌ RUIM - Múltiplos asserts e teste confuso
@Test
void testOrder() {
  Order order = new Order();
  order.addItem(new Product("A", 100));
  order.addItem(new Product("B", 200));
  assertEquals(2, order.getItems().size());
  assertEquals(300, order.getTotal());
  order.removeItem(0);
  assertEquals(1, order.getItems().size());
  assertEquals(200, order.getTotal());
}
```

### 8.3 Testes como Documentação
```java
// ✅ BOM - Nome do teste documenta o comportamento
@Test
void shouldRejectOrderWhenProductIsOutOfStock() {
  // Arrange
  Product product = new Product("Notebook", 3000.00);
  product.setStock(0);
  
  // Act & Assert
  assertThrows(OutOfStockException.class, () -> {
    orderService.addItem(product);
  });
}
```

---

## FASE 9: CLASSES — Coesão e Princípio da Responsabilidade Única

### 9.1 Regras para Classes
**Princípio:** Classes devem ter uma única responsabilidade. Devem ser pequenas.

**Checklist Operacional:**
- [ ] Máximo de variáveis de instância por classe: 5-7
- [ ] Uma responsabilidade por classe
- [ ] SRP (Single Responsibility Principle)
- [ ] classes coesas e pequenas

### 9.2 Estrutura de Classe
```java
// ✅ BOM - Classe coesa e pequeña
public class Order {
  private final String id;
  private final List<OrderItem> items;
  private final Customer customer;
  private OrderStatus status;
  
  public Order(String id, Customer customer) {
    this.id = id;
    this.customer = customer;
    this.items = new ArrayList<>();
    this.status = OrderStatus.PENDING;
  }
  
  public void addItem(Product product, int quantity) {
    items.add(new OrderItem(product, quantity));
  }
  
  public double calculateTotal() {
    return items.stream()
      .mapToDouble(OrderItem::getSubtotal)
      .sum();
  }
  
  public void confirm() {
    if (items.isEmpty()) {
      throw new OrderIsEmptyException(id);
    }
    this.status = OrderStatus.CONFIRMED;
  }
}
```

---

## FASE 10: SISTEMAS — Arquitetura e Dependências

### 10.1 Regras para Sistemas
**Princípio:** Separe o que é容易 de mudar do que é difícil de mudar. Use Inversão de Dependência.

**Checklist Operacional:**
- [ ] Separar construção de uso
- [ ] Usar Inversão de Dependência (DIP)
- [ ] Módulos de alto nível não dependem de baixo nível
- [ ] Ambos dependem de abstrações

### 10.2 Padrão de Inversão de Dependência
```java
// ❌ RUIM - Acoplamento direto
public class OrderService {
  private MySQLOrderRepository repository;
  
  public OrderService() {
    this.repository = new MySQLOrderRepository();
  }
}

// ✅ BOM - Inversão de Dependência
public class OrderService {
  private final OrderRepository repository;
  
  public OrderService(OrderRepository repository) {
    this.repository = repository;
  }
}

// Interface
public interface OrderRepository {
  void save(Order order);
  Optional<Order> findById(String id);
}
```

---

## FASE 11: EMERGÊNCIA — Design que Evolui

### 11.1 Regras para Emergência
**Princípio:** Design não é estático. Evolui com o código. Refatore continuamente.

**Checklist Operacional:**
- [ ] Aplicar SOLID progressivamente
- [ ] DRY (Don't Repeat Yourself)
- [ ] YAGNI (You Aren't Gonna Need It)
- [ ] KISS (Keep It Simple, Stupid)
- [ ] Boy Scout Rule (deixe o código mais limpo do que encontrou)

### 11.2 Princípios SOLID
| Princípio | Significado | Ação |
|-----------|-------------|------|
| **S**RP | Responsabilidade Única | Uma classe, uma responsabilidade |
| **O**CP | Aberto/Fechado | Aberto para extensão, fechado para modificação |
| **L**SP | Substituição de Liskov | Subtipos devem ser substituíveis |
| **I**SP | Segregação de Interface | Interfaces pequenas e específicas |
| **D**IP | Inversão de Dependência | Depender de abstrações, não de concretos |

---

## FASE 12: REFACTORING — Melhoria Contínua

### 12.1 Checklist de Refatoração
- [ ] Eliminar código morto
- [ ] Extrair métodos/funções
- [ ] Renomear para nomes mais claros
- [ ] Mover método para classe adequada
- [ ] Substituir magic numbers por constantes
- [ ] Simplificar condicionais
- [ ] Decompor funções complexas
- [ ] Unir funções fragmentadas

### 12.2 Sinais de Código que Precisa de Refatoração
- [ ] Funções com mais de 30 linhas
- [ ] Classes com mais de 10 variáveis de instância
- [ ] Parâmetros com mais de 3 argumentos
- [ ] Código duplicado em 2+ lugares
- [ ] Nomes confusos ou genéricos
- [ ] Comentários explicando código complexo
- [ ] Exceções genéricas (catch Exception)

---

## CHECKLIST FINAL — Validação de Código Limpo

### Nomes
- [ ] Todos os nomes são significativos e intencionais
- [ ] Sem abreviações confusas
- [ ] Constantes nomeadas (não magic numbers)
- [ ] Nomes consistentes no mesmo contexto

### Funções
- [ ] Funções pequenas (máx 20-30 linhas)
- [ ] Uma responsabilidade por função
- [ ] Nomes descrevem o que a função faz
- [ ] Poucos parâmetros (ideal: 0-2)
- [ ] Sem side effects inesperados

### Comentários
- [ ] Código autoexplicativo (poucos comentários)
- [ ] Sem comentários obsoletos
- [ ] Sem código comentado
- [ ] TODOs com contexto

### Formatação
- [ ] Linhas com no máximo 120 caracteres
- [ ] Indentação consistente
- [ ] Espaçamento vertical lógico
- [ ] Ordem de elementos consistente

### Objetos
- [ ] Objetos encapsulam dados e comportamento
- [ ] Lei de Demeter respeitada
- [ ] Sem switch/if-else longos em classes
- [ ] DTOs para transferência de dados

### Erros
- [ ] Exceções em vez de códigos de retorno
- [ ] Sem null como retorno ou parâmetro
- [ ] Exceções específicas
- [ ] Recursos liberados em finally/deferred

### Limites
- [ ] Interfaces para desacoplar módulos
- [ ] Anti-caminhos para serviços externos
- [ ] Frameworks na camada mais externa
- [ ] Dependências apontando para dentro

### Testes
- [ ] Testes unitários cobrem casos importantes
- [ ] Regra dos 3 Atos (AAA)
- [ ] Nomes descritivos
- [ ] Testes rápidos e independentes

### Classes
- [ ] SRP aplicado
- [ ] Máximo 5-7 variáveis de instância
- [ ] Classes pequenas e coesas
- [ ] Responsabilidades bem definidas

### Sistemas
- [ ] Inversão de Dependência aplicada
- [ ] Construção separada de uso
- [ ] Módulos de alto nível independentes

---

## REFERÊNCIAS
- **Livro:** Código Limpo — Robert C. Martin (2009)
- **Princípios:** SOLID, DRY, KISS, YAGNI, Boy Scout Rule
- **Padrões:** AAA (Arrange-Act-Assert), Law of Demeter, DIP
- **Práticas:** TDD, Refatoração Contínua, Code Review

import { useState, useEffect } from "react";
import {
  Loader2,
  Plus,
  Save,
  Play,
  Trash2,
  Code,
  Settings2,
  Webhook as WebhookIcon,
  Link2,
  PlusCircle,
  Bell,
  History,
  Settings,
  RefreshCw,
  X,
  ToggleRight,
  ToggleLeft,
  GitFork,
  Copy,
  Info,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "~/core/supabase";
import {
  listApiConnectors,
  createApiConnector,
  updateApiConnector,
  deleteApiConnector,
  executeApiConnector,
  type ApiConnector,
  type ApiConnectorInput,
} from "~/features/api-connectors";
import {
  listarWebhookLogs,
  listarWebhooks,
  criarWebhook,
  atualizarWebhook,
  deletarWebhook,
  type WebhookLog,
  type Webhook,
} from "~/core/services/webhooks";
import {
  listarTemplates,
  criarTemplate,
  atualizarTemplatePorId,
  deletarTemplate,
  type NotificacaoTemplate,
} from "~/core/services/notificacoes";
import { getAllModules, getModule } from "~/registry";

type ItemType = "api_call" | "notification" | "webhook";

type ListItem = {
  id: string;
  name: string;
  type: "api_call" | "notification" | "webhook";
  subtitle: string;
  isActive: boolean;
  raw: any;
};

// Dicionário de Variáveis recomendadas por Evento/Gatilho
const VARIAVEIS_POR_EVENTO: Record<string, string[]> = {
  cadastro_correcao: ["cadastro_id", "lead_nome", "motivo"],
  cadastro_reprovado: ["cadastro_id", "lead_nome", "motivo"],
  cadastro_aprovado: ["cadastro_id", "lead_nome", "codigo_cliente"],
  cadastro_em_analise: ["cadastro_id", "lead_nome"],
  criacao_credencial: ["nome", "email", "departamento"],
  link_gerado: ["cadastro_id", "token", "link_acesso"],
  dados_enviados: ["cadastro_id", "email"],
  em_analise: ["cadastro_id", "email"],
  em_correcao: ["cadastro_id", "lead_nome", "motivo"],
  aprovado: ["cadastro_id", "lead_nome", "codigo_cliente"],
  reprovado: ["cadastro_id", "lead_nome", "motivo"],
  botao_aprovar: ["cadastro_id", "documento_id"],
  botao_reprovar: ["cadastro_id", "documento_id", "motivo"],
  botao_corrigir: ["cadastro_id", "documento_id", "comentario"],
  botao_compartilhar_link: ["cadastro_id", "token"],
};

// Dicionário de Ações Nativas por Evento/Gatilho
const ACOES_NATIVAS: Record<string, string[]> = {
  link_gerado: [
    "Atualiza status do cadastro para 'Link Gerado'",
    "Registra log de criação de link de acesso",
  ],
  dados_enviados: [
    "Salva formulário do pré-cadastro no banco de dados",
    "Atualiza data de envio de dados",
  ],
  em_analise: [
    "Atualiza status do cadastro para 'Em Análise'",
    "Notifica equipe de compliance interna",
  ],
  em_correcao: [
    "Salva observações de correção",
    "Atualiza status do cadastro para 'Em Correção'",
  ],
  aprovado: [
    "Atualiza status do cadastro para 'Aprovado'",
    "Libera acesso completo do cliente no portal",
  ],
  reprovado: [
    "Salva motivo de reprovação",
    "Atualiza status do cadastro para 'Reprovado'",
  ],
  botao_compartilhar_link: [
    "Gera token seguro temporário no banco de dados",
    "Monta URL pública de acesso externa para o pre-cadastro",
  ],
  botao_aprovar: [
    "Altera perfil do cliente para ativo no banco de dados",
    "Gera logs de auditoria de aprovação",
  ],
  botao_reprovar: ["Gera justificativa de reprovação e salva no cadastro"],
  botao_corrigir: [
    "Envia solicitações de reenvio de documentos específicos para o cliente",
  ],
  criacao_credencial: [
    "Cria usuário e senha temporários do parceiro no banco de dados",
  ],
};

function gerarJsonPadrao(evento: string | null): string {
  if (!evento) return "{\n  \n}";
  const vars = VARIAVEIS_POR_EVENTO[evento] || [];
  const obj: Record<string, string> = {};
  vars.forEach((v) => {
    obj[v] = `{{${v}}}`;
  });
  // Injetar variáveis de realizador também
  obj["usuario_nome"] = "{{usuario_nome}}";
  obj["usuario_email"] = "{{usuario_email}}";
  return JSON.stringify(obj, null, 2);
}

function parseCurl(curl: string) {
  const cleaned = curl
    .replace(/\\\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  let method = "GET";
  let url = "";
  const headers: Record<string, string> = {};
  let body = "";

  const methodMatch = cleaned.match(/(?:-X|--request)\s+([A-Z]+)/i);
  if (methodMatch) {
    method = methodMatch[1].toUpperCase();
  }

  const headerRegex = /(?:-H|--header)\s+["']([^"']+)["']/g;
  let match;
  while ((match = headerRegex.exec(cleaned)) !== null) {
    const parts = match[1].split(":");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join(":").trim();
      headers[key] = val;
    }
  }

  const dataRegex =
    /(?:-d|--data|--data-raw|--data-binary)\s+('(?:[^']|\\')*'|"(?:[^"]|\\")*")/g;
  const dataMatch = dataRegex.exec(cleaned);
  if (dataMatch) {
    let rawData = dataMatch[1];
    if (
      (rawData.startsWith("'") && rawData.endsWith("'")) ||
      (rawData.startsWith('"') && rawData.endsWith('"'))
    ) {
      rawData = rawData.slice(1, -1);
    }
    body = rawData.replace(/\\"/g, '"').replace(/\\'/g, "'");
    if (!methodMatch) {
      method = "POST";
    }
  }

  const tokens: string[] = [];
  let currentToken = "";
  let inQuote = false;
  let quoteChar = "";

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (
      (char === '"' || char === "'") &&
      (i === 0 || cleaned[i - 1] !== "\\")
    ) {
      if (inQuote && char === quoteChar) {
        inQuote = false;
      } else if (!inQuote) {
        inQuote = true;
        quoteChar = char;
      }
    } else if (char === " " && !inQuote) {
      if (currentToken) {
        tokens.push(currentToken);
        currentToken = "";
      }
    } else {
      currentToken += char;
    }
  }
  if (currentToken) {
    tokens.push(currentToken);
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.startsWith("http://") || token.startsWith("https://")) {
      url = token.replace(/^['"]|['"]$/g, "");
      break;
    }
  }

  if (!url) {
    for (let i = 1; i < tokens.length; i++) {
      const prev = tokens[i - 1];
      const curr = tokens[i];
      if (curr.startsWith("-")) continue;
      if (
        [
          "-X",
          "--request",
          "-H",
          "--header",
          "-d",
          "--data",
          "--data-raw",
          "--data-binary",
        ].includes(prev)
      ) {
        continue;
      }
      if (!curr.startsWith("curl") && !curr.startsWith("-")) {
        url = curr.replace(/^['"]|['"]$/g, "");
        break;
      }
    }
  }

  return { method, url, headers, body };
}

export function CentralAcoesTab() {
  const [activeModuleKey, setActiveModuleKey] =
    useState<string>("cadastros");

  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<ListItem | null>(null);
  const [activeTab, setActiveTab] = useState<"workflows" | "logs">("workflows");
  const [editorModalOpen, setEditorModalOpen] = useState(false);

  // Modais de confirmação customizados (nativos da UI)
  const [confirmPayloadModal, setConfirmPayloadModal] = useState(false);
  const [confirmExcluirModal, setConfirmExcluirModal] = useState(false);

  // Assistente de Variáveis de Tabelas do Banco
  const [esquemaTabelas, setEsquemaTabelas] = useState<
    Record<string, string[]>
  >({});
  const [tabelaSelecionada, setTabelaSelecionada] = useState("");
  const [colunaSelecionada, setColunaSelecionada] = useState("");

  // States para Formulários
  const [formName, setFormName] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  // States específicos de API/Webhook
  const [apiMethod, setApiMethod] = useState("POST");
  const [apiUrl, setApiUrl] = useState("https://");
  const [apiHeaders, setApiHeaders] = useState<Record<string, string>>({});
  const [apiQuery, setApiQuery] = useState<Record<string, string>>({});
  const [apiBody, setApiBody] = useState("");
  const [apiEvento, setApiEvento] = useState<string | null>(null);
  const [apiTipoEvento, setApiTipoEvento] = useState<
    "status_change" | "button_action" | null
  >(null);

  // States específicos de Notificação
  const [notifTitulo, setNotifTitulo] = useState("");
  const [notifCorpo, setNotifCorpo] = useState("");
  const [notifEvento, setNotifEvento] = useState("");
  const [notifDestinatarioTipo, setNotifDestinatarioTipo] =
    useState("consultor");

  // State de editor secundário
  const [editorTab, setEditorTab] = useState<
    "headers" | "query" | "body" | "template" | "test"
  >("headers");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // Playground de Testes
  const [testVars, setTestVars] = useState<string>("{}");
  const [testResult, setTestResult] = useState<any>(null);

  // Logs
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [filtroGatilho, setFiltroGatilho] = useState<string>("todos");
  const [integracoesNativas, setIntegracoesNativas] = useState<any[]>([]);
  const [curlInput, setCurlInput] = useState("");
  const [showCurlImporter, setShowCurlImporter] = useState(false);

  useEffect(() => {
    carregarTudo();
  }, [activeModuleKey]);

  async function carregarTudo() {
    setLoading(true);
    try {
      const modKey = activeModuleKey;

      const [
        apis,
        templates,
        webhooks,
        { data: esquema, error: errSchema },
        { data: integracoesConfig, error: errInt },
      ] = await Promise.all([
        listApiConnectors(undefined, modKey),
        listarTemplates(modKey),
        listarWebhooks(modKey),
        supabase.rpc("obter_esquema_banco"),
        supabase.from("config_integracoes").select("*"),
      ]);

      if (integracoesConfig && !errInt) {
        setIntegracoesNativas(integracoesConfig);
      }

      if (esquema && !errSchema) {
        const map: Record<string, string[]> = {};
        esquema.forEach((item: { tabela: string; coluna: string }) => {
          if (!map[item.tabela]) {
            map[item.tabela] = [];
          }
          map[item.tabela].push(item.coluna);
        });
        setEsquemaTabelas(map);
        const tabelas = Object.keys(map);
        if (tabelas.length > 0) {
          setTabelaSelecionada(tabelas[0]);
          setColunaSelecionada(map[tabelas[0]][0] || "");
        }
      }

      const list: ListItem[] = [];

      // APIs do api_connectors
      apis.forEach((a) => {
        list.push({
          id: a.id,
          name: a.name,
          type: a.type as ItemType,
          subtitle:
            a.type === "api_call"
              ? "API Externa"
              : `Webhook: ${a.evento || "Sem gatilho"}`,
          isActive: a.is_active,
          raw: a,
        });
      });

      // Webhooks Nativos da Tabela Webhooks
      webhooks.forEach((w) => {
        list.push({
          id: `webhook-${w.id}`,
          name: w.nome,
          type: "webhook",
          subtitle: `Webhook: ${w.evento}`,
          isActive: w.ativo,
          raw: w,
        });
      });

      // Templates de notificações
      templates.forEach((t) => {
        list.push({
          id: `notif-${t.id}`,
          name: t.titulo,
          type: "notification",
          subtitle: `Notificação: ${t.evento}`,
          isActive: t.ativo,
          raw: t,
        });
      });

      setItems(list);

      // Tenta manter selecionado se houver ID ativo
      if (activeItem) {
        const found = list.find((l) => l.id === activeItem.id);
        if (found) selecionar(found);
      } else if (list.length > 0) {
        selecionar(list[0]);
      }
    } catch (err) {
      toast.error("Erro ao carregar os dados da central");
    } finally {
      setLoading(false);
    }
  }

  async function carregarLogs() {
    setLoadingLogs(true);
    try {
      const data = await listarWebhookLogs();
      setLogs(data);
    } catch {
      toast.error("Erro ao carregar logs");
    } finally {
      setLoadingLogs(false);
    }
  }

  function handleImportarCurl() {
    if (!curlInput.trim()) {
      toast.error("Por favor, cole um comando cURL válido.");
      return;
    }
    try {
      const parsed = parseCurl(curlInput);
      setApiMethod(parsed.method);
      setApiUrl(parsed.url);
      setApiHeaders(parsed.headers);
      setApiBody(parsed.body);
      setApiQuery({});
      toast.success("cURL importado com sucesso! Os campos foram preenchidos.");
      setCurlInput("");
      setShowCurlImporter(false);
    } catch (e: any) {
      toast.error("Erro ao processar cURL: " + e.message);
    }
  }

  function selecionar(item: ListItem) {
    setActiveItem(item);
    setFormName(item.name);
    setFormIsActive(item.isActive);
    setTestResult(null);

    if (item.type === "notification") {
      setNotifTitulo(item.raw.titulo);
      setNotifCorpo(item.raw.corpo_template);
      setNotifEvento(item.raw.evento);
      setNotifDestinatarioTipo(item.raw.destinatario_tipo || "consultor");
      setEditorTab("template");
    } else if (item.type === "webhook") {
      const w = item.raw as Webhook;
      setApiMethod(w.metodo || "POST");
      setApiUrl(w.url || "");
      setApiHeaders(w.headers || {});
      setApiQuery({});
      setApiBody(
        w.body_template ? JSON.stringify(w.body_template, null, 2) : "",
      );
      setApiEvento(w.evento || null);
      setApiTipoEvento(w.tipo_evento || null);
      setEditorTab("headers");
    } else {
      const c = item.raw as ApiConnector;
      setApiMethod(c.method || "POST");
      setApiUrl(c.url || "");
      setApiHeaders(c.headers || {});
      setApiQuery(c.query_params || {});
      setApiBody(c.body_template || "");
      setApiEvento(c.evento || null);
      setApiTipoEvento(c.tipo_evento || null);
      setEditorTab("headers");
    }
  }

  function iniciarCriacao(tipo: ItemType) {
    const tempId = `new-${tipo}-${Date.now()}`;
    const newItem: ListItem = {
      id: tempId,
      name:
        tipo === "api_call"
          ? "Nova Chamada de API"
          : tipo === "notification"
            ? "Novo Template de Notificação"
            : "Novo Webhook",
      type: tipo,
      subtitle: "Criando novo...",
      isActive: true,
      raw: {},
    };

    setActiveItem(newItem);
    setFormName(newItem.name);
    setFormIsActive(true);
    setTestResult(null);

    if (tipo === "notification") {
      setNotifTitulo("Novo Alerta de Sistema");
      setNotifCorpo("Olá {{lead_nome}}, seu cadastro está pendente.");
      setNotifEvento("");
      setNotifDestinatarioTipo("consultor");
      setEditorTab("template");
    } else {
      setApiMethod("POST");
      setApiUrl("https://");
      setApiHeaders({ "Content-Type": "application/json" });
      setApiQuery({});
      setApiBody('{\n  "lead_id": "{{cadastro_id}}"\n}');
      setApiEvento(null);
      setApiTipoEvento(null);
      setEditorTab("headers");
    }
  }

  async function handleSalvar() {
    if (!activeItem) return;
    if (!formName.trim()) return toast.error("Por favor, informe um nome");
    if (activeItem.type !== "notification" && !apiUrl.trim())
      return toast.error("URL é obrigatória");
    if (
      activeItem.type === "notification" &&
      (!notifTitulo.trim() || !notifCorpo.trim() || !notifEvento.trim())
    ) {
      return toast.error(
        "Título, Corpo e Evento são obrigatórios para Notificações",
      );
    }

    setSaving(true);
    try {
      const isNew = activeItem.id.startsWith("new-");

      const modKey = activeModuleKey;

      const eventoAlvo =
        activeItem.type === "notification" ? notifEvento : apiEvento;
      let proximaOrdem = 0;
      if (isNew && eventoAlvo) {
        const acoesExistentes = items.filter(
          (item) => item.raw.evento === eventoAlvo,
        );
        proximaOrdem = acoesExistentes.length + 1;
      }

      if (activeItem.type === "notification") {
        const payload: any = {
          evento: notifEvento,
          evento_key: notifEvento,
          titulo: notifTitulo,
          corpo_template: notifCorpo,
          destinatario_tipo: notifDestinatarioTipo,
          ativo: formIsActive,
          modulo_key: modKey,
        };

        if (isNew) {
          payload.ordem = proximaOrdem;
          await criarTemplate(payload);
          toast.success("Notificação criada com sucesso!");
        } else {
          await atualizarTemplatePorId(
            activeItem.id.replace("notif-", ""),
            payload,
          );
          toast.success("Notificação atualizada com sucesso!");
        }
      } else if (activeItem.type === "webhook") {
        let parsedBody = {};
        try {
          parsedBody = apiBody ? JSON.parse(apiBody) : {};
        } catch (e) {}

        const payload: any = {
          nome: formName,
          evento: apiEvento,
          evento_key: apiEvento,
          url: apiUrl,
          metodo: apiMethod,
          headers: apiHeaders,
          body_template: parsedBody,
          ativo: formIsActive,
          modulo_key: modKey,
        };

        if (isNew) {
          payload.ordem = proximaOrdem;
          await criarWebhook(payload);
          toast.success("Webhook criado com sucesso!");
        } else {
          await atualizarWebhook(
            activeItem.id.replace("webhook-", ""),
            payload,
          );
          toast.success("Webhook atualizado com sucesso!");
        }
      } else {
        const payload: any = {
          name: formName,
          type: activeItem.type,
          method: apiMethod,
          url: apiUrl,
          headers: apiHeaders,
          query_params: apiQuery,
          body_template: apiBody,
          response_schema: isNew
            ? null
            : activeItem.raw.response_schema || null,
          evento: apiEvento,
          evento_key: apiEvento,
          tipo_evento: apiTipoEvento,
          is_active: formIsActive,
          modulo_key: modKey,
        };

        if (isNew) {
          payload.ordem = proximaOrdem;
          const created = await createApiConnector(payload);
          setActiveItem({
            id: created.id,
            name: created.name,
            type: created.type as ItemType,
            subtitle: "API Externa",
            isActive: created.is_active,
            raw: created,
          });
          toast.success("Conexão criada com sucesso!");
        } else {
          await updateApiConnector(activeItem.id, payload);
          toast.success("Conexão atualizada com sucesso!");
        }
      }

      await carregarTudo();
      setEditorModalOpen(false);
    } catch (err: any) {
      toast.error("Erro ao salvar: " + (err.message || "Tente novamente"));
    } finally {
      setSaving(false);
    }
  }

  async function executarExclusao() {
    if (!activeItem || activeItem.id.startsWith("new-")) return;
    try {
      if (activeItem.type === "notification") {
        const id = activeItem.id.replace("notif-", "");
        await deletarTemplate(id);
      } else if (activeItem.type === "webhook") {
        const id = activeItem.id.replace("webhook-", "");
        await deletarWebhook(id);
      } else {
        await deleteApiConnector(activeItem.id);
      }
      toast.success("Ação excluída com sucesso!");
      setActiveItem(null);
      await carregarTudo();
      setEditorModalOpen(false);
    } catch {
      toast.error("Erro ao excluir ação");
    }
  }

  function handleExcluir() {
    if (!activeItem || activeItem.id.startsWith("new-")) return;
    setConfirmExcluirModal(true);
  }

  async function handleTestar() {
    if (!activeItem || activeItem.id.startsWith("new-"))
      return toast.error("Salve antes de testar!");
    let vars = {};
    try {
      vars = JSON.parse(testVars || "{}");
    } catch {
      return toast.error("As variáveis de teste precisam ser um JSON válido");
    }

    setTesting(true);
    try {
      if (activeItem.type === "notification") {
        // Testar interpolação da notificação localmente na tela
        let tituloFinal = notifTitulo;
        let msgFinal = notifCorpo;

        for (const [chave, valor] of Object.entries(vars)) {
          const placeholder = new RegExp(`{{${chave}}}`, "g");
          tituloFinal = tituloFinal.replace(placeholder, String(valor));
          msgFinal = msgFinal.replace(placeholder, String(valor));
        }

        setTestResult({
          status: 200,
          duration: 1,
          data: {
            destinatario_simulado: "Usuário Logado",
            titulo_interpolado: tituloFinal,
            mensagem_interpolada: msgFinal,
            variaveis_recebidas: vars,
          },
        });
        toast.success("Notificação testada com sucesso!");
      } else {
        const result = await executeApiConnector(activeItem.id, vars);
        setTestResult(result);
        toast.success("Teste de API concluído!");
      }
    } catch (e: any) {
      toast.error("Erro no teste: " + e.message);
    } finally {
      setTesting(false);
    }
  }

  async function toggleStatusAcao(item: ListItem) {
    try {
      const isNotif = item.type === "notification";
      const novoStatus = !item.isActive;

      if (isNotif) {
        const id = item.id.replace("notif-", "");
        await atualizarTemplatePorId(id, { ativo: novoStatus });
      } else {
        await updateApiConnector(item.id, { is_active: novoStatus });
      }
      toast.success(`${item.name} ${novoStatus ? "ativado" : "desativado"}`);
      await carregarTudo();
    } catch {
      toast.error("Erro ao alterar status");
    }
  }

  async function moverPasso(
    evento: string,
    acaoId: string,
    direcao: "up" | "down",
  ) {
    // 1. Filtrar as ações vinculadas ordenadas por ordem atual
    const acoes = items
      .filter((item) => item.raw.evento === evento)
      .sort((a, b) => (a.raw.ordem || 0) - (b.raw.ordem || 0));

    const index = acoes.findIndex((a) => a.id === acaoId);
    if (index === -1) return;

    const novoIndex = direcao === "up" ? index - 1 : index + 1;
    if (novoIndex < 0 || novoIndex >= acoes.length) return;

    // Troca de posição
    const temp = acoes[index];
    acoes[index] = acoes[novoIndex];
    acoes[novoIndex] = temp;

    // Atualizar no banco de dados todas com a nova ordem sequencial (0, 1, 2...)
    setLoading(true);
    try {
      const promises = acoes.map((item, idx) => {
        const idLimpo = item.id.replace("notif-", "");
        if (item.type === "notification") {
          return atualizarTemplatePorId(idLimpo, { ordem: idx + 1 });
        } else {
          return updateApiConnector(item.id, { ordem: idx + 1 });
        }
      });
      await Promise.all(promises);
      toast.success("Ordem dos passos atualizada!");
      await carregarTudo();
    } catch (err) {
      toast.error("Erro ao reordenar passos");
    } finally {
      setLoading(false);
    }
  }

  function adicionarAcaoInline(
    evento: string,
    tipoEvento: string,
    tipoAcao: ItemType,
  ) {
    // Conta quantas ações já existem para este evento para calcular a próxima ordem
    const acoesExistentes = items.filter((item) => item.raw.evento === evento);
    const proximaOrdem = acoesExistentes.length + 1;

    iniciarCriacao(tipoAcao);

    // Configura o evento no state
    if (tipoAcao === "notification") {
      setNotifEvento(evento);
    } else {
      setApiEvento(evento);
      setApiTipoEvento(tipoEvento as any);
      setApiBody(gerarJsonPadrao(evento));
    }

    // Atualiza o state temporário da ordem (podemos injetar no activeItem depois)
    setEditorModalOpen(true);
    toast.success(
      `Criando nova ${tipoAcao === "notification" ? "Notificação" : "API"} pré-vinculada ao gatilho!`,
    );
  }

  // KV Editor Helper para headers/query params
  function KVEditor({
    data,
    onChange,
  }: {
    data: Record<string, string>;
    onChange: (v: Record<string, string>) => void;
  }) {
    const entries = Object.entries(data);

    const updateKey = (idx: number, newKey: string) => {
      const newObj: Record<string, string> = {};
      entries.forEach(([k, v], i) => {
        if (i === idx) {
          if (newKey) newObj[newKey] = v;
        } else {
          newObj[k] = v;
        }
      });
      onChange(newObj);
    };

    const updateVal = (key: string, newVal: string) => {
      onChange({ ...data, [key]: newVal });
    };

    const remove = (key: string) => {
      const newObj = { ...data };
      delete newObj[key];
      onChange(newObj);
    };

    const add = () => {
      onChange({ ...data, ["nova_chave_" + Date.now()]: "" });
    };

    return (
      <div className="flex flex-col gap-2">
        {entries.map(([k, v], i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-2">
            <input
              value={k}
              onChange={(e) => updateKey(i, e.target.value)}
              className="w-full sm:w-1/3 rounded border border-input-border bg-bg-dark px-3 py-2 text-xs text-text-main focus:border-accent font-mono"
              placeholder="Chave"
            />
            <div className="flex gap-2 flex-1">
              <input
                value={v}
                onChange={(e) => updateVal(k, e.target.value)}
                className="flex-1 rounded border border-input-border bg-bg-dark px-3 py-2 text-xs text-text-main focus:border-accent font-mono"
                placeholder="Valor {{variavel}}"
              />
              <button
                onClick={() => remove(k)}
                className="p-2 text-red-400 hover:bg-red-400/10 rounded shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={add}
          className="text-xs font-medium text-accent hover:underline self-start flex items-center gap-1 mt-2"
        >
          <PlusCircle size={12} /> Adicionar Linha
        </button>
      </div>
    );
  }

  // Componente de dicionário de variáveis recomendadas
  function DicionarioVariaveis({ evento }: { evento: string | null }) {
    if (!evento) return null;

    const copyToClipboard = (v: string) => {
      navigator.clipboard.writeText(`{{${v}}}`);
      toast.success(`Copiado: {{${v}}}`);
    };

    return (
      <div className="mt-4 p-4 rounded-xl border border-accent/20 bg-accent/5 flex flex-col gap-4">
        {/* Assistente de Tabelas Dinâmico */}
        {Object.keys(esquemaTabelas).length > 0 && (
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Info size={14} /> Assistente de Colunas do Banco de Dados
            </h4>
            <p className="text-xs text-text-muted mb-2">
              Selecione uma tabela e coluna para copiar como variável de banco
              de dados.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 items-end sm:items-center">
              <div className="flex-1 flex gap-2 w-full">
                {/* Select Tabela */}
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[8px] font-bold text-text-muted uppercase">
                    Tabela
                  </label>
                  <select
                    value={tabelaSelecionada}
                    onChange={(e) => {
                      const tab = e.target.value;
                      setTabelaSelecionada(tab);
                      setColunaSelecionada(esquemaTabelas[tab]?.[0] || "");
                    }}
                    className="w-full rounded-lg border border-input-border bg-bg-dark px-2 py-1.5 text-xs text-text-main outline-none focus:border-accent"
                  >
                    {Object.keys(esquemaTabelas).map((t) => (
                      <option
                        key={t}
                        value={t}
                        className="bg-bg-dark text-text-main"
                      >
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Coluna */}
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[8px] font-bold text-text-muted uppercase">
                    Coluna
                  </label>
                  <select
                    value={colunaSelecionada}
                    onChange={(e) => setColunaSelecionada(e.target.value)}
                    className="w-full rounded-lg border border-input-border bg-bg-dark px-2 py-1.5 text-xs text-text-main outline-none focus:border-accent"
                  >
                    {(esquemaTabelas[tabelaSelecionada] || []).map((c) => (
                      <option
                        key={c}
                        value={c}
                        className="bg-bg-dark text-text-main"
                      >
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botão Copiar */}
              <button
                onClick={() => {
                  if (tabelaSelecionada && colunaSelecionada) {
                    copyToClipboard(
                      `${tabelaSelecionada}.${colunaSelecionada}`,
                    );
                  }
                }}
                className="w-full sm:w-auto px-4 py-1.5 bg-accent text-accent-fg hover:bg-accent/90 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 self-stretch sm:self-auto sm:mt-4 shrink-0"
              >
                <Copy size={12} /> Copiar Variável
              </button>
            </div>
            <p className="text-xs text-text-muted font-mono bg-bg-dark/30 p-1.5 rounded-lg border border-input-border/30 self-start">
              Exemplo de uso:{" "}
              <span className="text-accent font-semibold">{`{{${tabelaSelecionada || "tabela"}.${colunaSelecionada || "coluna"}}}`}</span>
            </p>
          </div>
        )}
      </div>
    );
  }

  const activeModule = getModule(activeModuleKey);
  const eventosGerais =
    activeModule?.events?.map((e) => ({
      value: e.key,
      label: e.label,
      tipo: e.type || "status_change",
    })) || [];

  const eventosStatus = eventosGerais.filter((e) => e.tipo === "status_change");
  const eventosBotao = eventosGerais.filter((e) => e.tipo === "button_action");

  return (
    <div className="flex flex-col gap-4">
      {/* Header com Abas e Filtros */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 border-b border-input-border pb-4 mb-8">
        {/* Abas */}
        <div className="flex gap-2 w-full xl:w-auto overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab("workflows")}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg transition-colors shrink-0 flex-1 xl:flex-none ${activeTab === "workflows" ? "bg-accent text-accent-fg" : "bg-card text-text-muted hover:text-text-main border border-input-border/50"}`}
          >
            <GitFork size={14} />
            <span className="hidden sm:inline">
              Matriz de Gatilhos (Workflows)
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab("logs");
              carregarLogs();
            }}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg transition-colors shrink-0 flex-1 xl:flex-none ${activeTab === "logs" ? "bg-accent text-accent-fg" : "bg-card text-text-muted hover:text-text-main border border-input-border/50"}`}
          >
            <History size={14} />
            <span className="hidden sm:inline">Logs de Execução</span>
          </button>
        </div>

        {/* Seletores */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="flex flex-col gap-1 w-full sm:w-64 shrink-0">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Módulo
            </label>
            <select
              value={activeModuleKey}
              onChange={(e) => setActiveModuleKey(e.target.value)}
              className="w-full rounded-xl border border-input-border bg-bg-dark px-4 py-2.5 text-sm font-semibold text-text-main outline-none focus:border-accent transition-all cursor-pointer hover:border-input-border/80"
            >
              {getAllModules().map((mod) => (
                <option
                  key={mod.key}
                  value={mod.key}
                  className="bg-bg-dark text-text-main font-medium py-1"
                >
                  {mod.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {editorModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-input-border rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header do Editor */}
            <div className="p-4 border-b border-input-border flex flex-col sm:flex-row sm:items-center gap-3 justify-between bg-bg-dark/50">
              <div className="flex items-center gap-2 flex-1 w-full">
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="text-sm font-bold bg-transparent text-text-main outline-none w-full border-b border-transparent focus:border-accent"
                  placeholder="Nome da Ação"
                />
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-text-main">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="accent-accent w-4 h-4"
                  />
                  Ativo
                </label>
                <button
                  onClick={handleSalvar}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-accent-fg rounded-lg text-xs font-medium hover:bg-accent/90 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Save size={12} />
                  )}{" "}
                  Salvar
                </button>
                {!activeItem.id.startsWith("new-") && (
                  <button
                    onClick={handleExcluir}
                    title="Excluir ação"
                    className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditorModalOpen(false);
                    setActiveItem(null);
                  }}
                  className="p-1.5 text-text-muted hover:bg-bg-dark hover:text-text-main rounded-lg ml-2"
                  title="Fechar"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Corpo do Editor com scroll interno */}
            <div className="flex-1 overflow-y-auto flex flex-col bg-card">
              {/* Parâmetros do Gatilho (Notificações) */}
              {activeItem.type === "notification" && (
                <div className="px-5 pt-4 pb-2 border-b border-input-border bg-bg-dark/30 flex flex-col sm:flex-row gap-3">
                  <div className="w-full">
                    <label className="text-xs font-bold text-text-muted mb-1 block uppercase">
                      Gatilho do Evento
                    </label>
                    <select
                      value={notifEvento}
                      onChange={(e) => setNotifEvento(e.target.value)}
                      className="w-full rounded-lg border border-input-border bg-bg-dark px-3 py-2 text-xs text-text-main outline-none focus:border-accent"
                    >
                      <option value="" className="bg-bg-dark text-text-main">
                        Vincular a qual evento?
                      </option>
                      {eventosStatus.length > 0 && (
                        <optgroup
                          label="Eventos de Status"
                          className="bg-bg-dark text-text-muted"
                        >
                          {eventosStatus.map((e) => (
                            <option
                              key={e.value}
                              value={e.value}
                              className="bg-bg-dark text-text-main"
                            >
                              {e.label}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {eventosBotao.length > 0 && (
                        <optgroup
                          label="Ações de Botão"
                          className="bg-bg-dark text-text-muted"
                        >
                          {eventosBotao.map((e) => (
                            <option
                              key={e.value}
                              value={e.value}
                              className="bg-bg-dark text-text-main"
                            >
                              {e.label}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                </div>
              )}

              {/* Seleção de API Existente ou Personalizado */}
              {activeItem.type === "api_call" && (
                <div className="px-5 pt-4 pb-2 border-b border-input-border bg-bg-dark/25 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase">
                    Modelo de Integração API
                  </label>
                  <select
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if (selectedId === "custom") {
                        setApiMethod("POST");
                        setApiUrl("https://");
                        setApiHeaders({ "Content-Type": "application/json" });
                        setApiQuery({});
                        setApiBody("{\n  \n}");
                        return;
                      }

                      if (selectedId.startsWith("native-")) {
                        const parts = selectedId.split("-");
                        const chave = parts[1];
                        const endpoint = parts[2];
                        const int = integracoesNativas.find(
                          (n) => n.chave === chave,
                        );
                        if (int) {
                          const config = int.config || {};
                          if (chave === "evolution_api") {
                            const baseUrl = (config.base_url || "").replace(
                              /\/$/,
                              "",
                            );
                            const apiKey = config.api_key || "";
                            const instancia = config.instancia || "";

                            setApiHeaders({
                              "Content-Type": "application/json",
                              apikey: apiKey,
                            });
                            setApiQuery({});
                            setApiMethod("POST");

                            if (endpoint === "sendText") {
                              setApiUrl(
                                `${baseUrl}/message/sendText/${instancia}`,
                              );
                              setApiBody(
                                JSON.stringify(
                                  {
                                    number: "{{cadastros.contato}}",
                                    options: {
                                      delay: 1200,
                                      presence: "composing",
                                      linkPreview: true,
                                    },
                                    textMessage: {
                                      text: "Olá {{lead_nome}}! Seu cadastro foi atualizado.",
                                    },
                                  },
                                  null,
                                  2,
                                ),
                              );
                              setFormName("Evolution: Enviar Texto");
                            } else if (endpoint === "sendMedia") {
                              setApiUrl(
                                `${baseUrl}/message/sendMedia/${instancia}`,
                              );
                              setApiBody(
                                JSON.stringify(
                                  {
                                    number: "{{cadastros.contato}}",
                                    mediatype: "image",
                                    media: "https://exemplo.com/imagem.png",
                                    fileName: "imagem.png",
                                    caption:
                                      "Olá {{lead_nome}}, o seu arquivo está anexado.",
                                  },
                                  null,
                                  2,
                                ),
                              );
                              setFormName("Evolution: Enviar Mídia");
                            } else if (endpoint === "sendAudio") {
                              setApiUrl(
                                `${baseUrl}/message/sendWhatsAppAudio/${instancia}`,
                              );
                              setApiBody(
                                JSON.stringify(
                                  {
                                    number: "{{cadastros.contato}}",
                                    audio: "https://exemplo.com/audio.mp3",
                                  },
                                  null,
                                  2,
                                ),
                              );
                              setFormName("Evolution: Enviar Áudio");
                            } else if (endpoint === "sendContact") {
                              setApiUrl(
                                `${baseUrl}/message/sendContact/${instancia}`,
                              );
                              setApiBody(
                                JSON.stringify(
                                  {
                                    number: "{{cadastros.contato}}",
                                    contact: [
                                      {
                                        fullName: "Suporte Conexão",
                                        wuid: "5511999999999",
                                        phoneNumber: "5511999999999",
                                      },
                                    ],
                                  },
                                  null,
                                  2,
                                ),
                              );
                              setFormName("Evolution: Enviar Contato");
                            } else if (endpoint === "sendLocation") {
                              setApiUrl(
                                `${baseUrl}/message/sendLocation/${instancia}`,
                              );
                              setApiBody(
                                JSON.stringify(
                                  {
                                    number: "{{cadastros.contato}}",
                                    name: "Sede Administrativa",
                                    address:
                                      "Av. Paulista, 1000 - São Paulo/SP",
                                    latitude: -23.561684,
                                    longitude: -46.655981,
                                  },
                                  null,
                                  2,
                                ),
                              );
                              setFormName("Evolution: Enviar Localização");
                            } else if (endpoint === "sendReaction") {
                              setApiUrl(
                                `${baseUrl}/message/sendReaction/${instancia}`,
                              );
                              setApiBody(
                                JSON.stringify(
                                  {
                                    number: "{{cadastros.contato}}",
                                    messageId: "mensagem_id_a_reagir",
                                    reaction: "👍",
                                  },
                                  null,
                                  2,
                                ),
                              );
                              setFormName("Evolution: Enviar Reação");
                            } else if (endpoint === "sendLinkPreview") {
                              setApiUrl(
                                `${baseUrl}/message/sendLinkPreview/${instancia}`,
                              );
                              setApiBody(
                                JSON.stringify(
                                  {
                                    number: "{{cadastros.contato}}",
                                    url: "https://plataforma.bvirtual.com.br",
                                    text: "Acesse a nossa plataforma virtual!",
                                  },
                                  null,
                                  2,
                                ),
                              );
                              setFormName("Evolution: Enviar Link Preview");
                            } else if (endpoint === "sendButtons") {
                              setApiUrl(
                                `${baseUrl}/message/sendButtons/${instancia}`,
                              );
                              setApiBody(
                                JSON.stringify(
                                  {
                                    number: "{{cadastros.contato}}",
                                    title: "Aviso Importante",
                                    description:
                                      "Selecione uma das opções abaixo:",
                                    footer: "Plataforma Conexão",
                                    buttons: [
                                      {
                                        id: "btn_aceitar",
                                        label: "Aceitar Termos",
                                      },
                                      { id: "btn_recusar", label: "Recusar" },
                                    ],
                                  },
                                  null,
                                  2,
                                ),
                              );
                              setFormName("Evolution: Enviar Botões");
                            } else if (endpoint === "sendList") {
                              setApiUrl(
                                `${baseUrl}/message/sendList/${instancia}`,
                              );
                              setApiBody(
                                JSON.stringify(
                                  {
                                    number: "{{cadastros.contato}}",
                                    title: "Nossos Serviços",
                                    description:
                                      "Selecione o serviço desejado:",
                                    buttonText: "Ver Opções",
                                    sections: [
                                      {
                                        title: "Atendimento",
                                        rows: [
                                          {
                                            title: "Falar com Suporte",
                                            description:
                                              "Dúvidas técnicas e operacionais",
                                            rowId: "suporte",
                                          },
                                          {
                                            title: "Falar com Financeiro",
                                            description:
                                              "Segunda via de boletos e notas",
                                            rowId: "financeiro",
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                  null,
                                  2,
                                ),
                              );
                              setFormName("Evolution: Enviar Lista");
                            } else if (endpoint === "sendStatus") {
                              setApiUrl(
                                `${baseUrl}/message/sendStatus/${instancia}`,
                              );
                              setApiBody(
                                JSON.stringify(
                                  {
                                    statusText: {
                                      text: "Novos cadastros liberados hoje!",
                                      backgroundColor: "#0f172a",
                                      font: 1,
                                    },
                                  },
                                  null,
                                  2,
                                ),
                              );
                              setFormName("Evolution: Enviar Status/Story");
                            }
                            toast.success(
                              `Modelo da Evolution API (${endpoint}) aplicado!`,
                            );
                          } else if (chave === "cep_api") {
                            setApiHeaders({
                              "Content-Type": "application/json",
                            });
                            setApiQuery({});
                            setApiMethod("GET");
                            setApiBody("");

                            if (endpoint === "viacep") {
                              setApiUrl(
                                "https://viacep.com.br/ws/{{cadastros.cep}}/json/",
                              );
                              setFormName("ViaCEP: Consultar CEP");
                            } else if (endpoint === "brasilapi_v1") {
                              setApiUrl(
                                "https://brasilapi.com.br/api/cep/v1/{{cadastros.cep}}",
                              );
                              setFormName("BrasilAPI v1: Consultar CEP");
                            } else if (endpoint === "brasilapi_v2") {
                              setApiUrl(
                                "https://brasilapi.com.br/api/cep/v2/{{cadastros.cep}}",
                              );
                              setFormName("BrasilAPI v2: CEP + Geo");
                            }
                            toast.success("Modelo da CEP API aplicado!");
                          } else if (chave === "google_maps") {
                            const apiKey = config.api_key || "";
                            setApiHeaders({
                              "Content-Type": "application/json",
                            });
                            setApiQuery({});
                            setApiMethod("GET");
                            setApiBody("");

                            if (endpoint === "geocode") {
                              setApiUrl(
                                `https://maps.googleapis.com/maps/api/geocode/json?address={{cadastros.endereco}}&key=${apiKey}`,
                              );
                              setFormName("Google Maps: Geocodificar");
                            } else if (endpoint === "distancematrix") {
                              setApiUrl(
                                `https://maps.googleapis.com/maps/api/distancematrix/json?origins={{cadastros.origem}}&destinations={{cadastros.destino}}&key=${apiKey}`,
                              );
                              setFormName("Google Maps: Calcular Distância");
                            } else if (endpoint === "placeautocomplete") {
                              setApiUrl(
                                `https://maps.googleapis.com/maps/api/place/autocomplete/json?input={{cadastros.busca}}&key=${apiKey}`,
                              );
                              setFormName("Google Maps: Autocomplete Local");
                            } else if (endpoint === "placedetails") {
                              setApiUrl(
                                `https://maps.googleapis.com/maps/api/place/details/json?place_id={{cadastros.place_id}}&key=${apiKey}`,
                              );
                              setFormName("Google Maps: Detalhes do Local");
                            }
                            toast.success("Modelo do Google Maps aplicado!");
                          } else if (chave === "google_sheets") {
                            const spreadsheetId = config.spreadsheet_id || "";
                            setApiHeaders({
                              "Content-Type": "application/json",
                            });
                            setApiQuery({});

                            if (endpoint === "append") {
                              setApiMethod("POST");
                              setApiUrl(
                                `${window.location.origin}/api/integrations/sheets/append`,
                              );
                              setApiBody(
                                JSON.stringify(
                                  {
                                    spreadsheet_id: spreadsheetId,
                                    range: "Página1!A1",
                                    values: [
                                      [
                                        "{{cadastros.id}}",
                                        "{{cadastros.lead_nome}}",
                                        "{{cadastros.email}}",
                                      ],
                                    ],
                                  },
                                  null,
                                  2,
                                ),
                              );
                              setFormName("Google Sheets: Inserir Linha");
                            } else if (endpoint === "getvalues") {
                              setApiMethod("GET");
                              setApiUrl(
                                `${window.location.origin}/api/integrations/sheets/values`,
                              );
                              setApiQuery({
                                spreadsheet_id: spreadsheetId,
                                range: "Página1!A1:C10",
                              });
                              setApiBody("");
                              setFormName("Google Sheets: Ler Linhas");
                            } else if (endpoint === "update") {
                              setApiMethod("PUT");
                              setApiUrl(
                                `${window.location.origin}/api/integrations/sheets/update`,
                              );
                              setApiBody(
                                JSON.stringify(
                                  {
                                    spreadsheet_id: spreadsheetId,
                                    range: "Página1!A2",
                                    values: [
                                      [
                                        "{{cadastros.id}}",
                                        "{{cadastros.lead_nome}}",
                                        "Atualizado",
                                      ],
                                    ],
                                  },
                                  null,
                                  2,
                                ),
                              );
                              setFormName("Google Sheets: Atualizar Linha");
                            } else if (endpoint === "clear") {
                              setApiMethod("POST");
                              setApiUrl(
                                `${window.location.origin}/api/integrations/sheets/clear`,
                              );
                              setApiBody(
                                JSON.stringify(
                                  {
                                    spreadsheet_id: spreadsheetId,
                                    range: "Página1!A2:C2",
                                  },
                                  null,
                                  2,
                                ),
                              );
                              setFormName("Google Sheets: Limpar Células");
                            }
                            toast.success("Modelo do Google Sheets aplicado!");
                          } else if (chave === "gmail_smtp") {
                            setApiHeaders({
                              "Content-Type": "application/json",
                            });
                            setApiQuery({});
                            setApiMethod("POST");
                            setApiBody(
                              JSON.stringify(
                                {
                                  to: "{{cadastros.email}}",
                                  subject:
                                    "Status do seu cadastro: {{cadastros.status}}",
                                  html: "<p>Olá {{cadastros.lead_nome}}, seu cadastro foi alterado.</p>",
                                },
                                null,
                                2,
                              ),
                            );
                            setFormName("Gmail SMTP: Enviar E-mail");
                            toast.success("Modelo de E-mail SMTP aplicado!");
                          }
                        }
                        return;
                      }

                      const found = items.find(
                        (i) =>
                          i.id === selectedId && i.type === activeItem.type,
                      );
                      if (found) {
                        const c = found.raw as any;
                        setApiMethod(c.method || c.metodo || "POST");
                        setApiUrl(c.url || "");
                        setApiHeaders(c.headers || {});
                        setApiQuery(c.query_params || {});
                        setApiBody(
                          c.body_template
                            ? typeof c.body_template === "object"
                              ? JSON.stringify(c.body_template, null, 2)
                              : c.body_template
                            : "",
                        );
                        setFormName(c.name || c.nome);
                        toast.success(
                          `Configurações de "${c.name || c.nome}" carregadas!`,
                        );
                      }
                    }}
                    className="w-full rounded-lg border border-input-border bg-bg-dark px-3 py-2 text-xs text-text-main font-semibold outline-none focus:border-accent"
                    defaultValue="custom"
                  >
                    <option
                      value="custom"
                      className="bg-bg-dark text-text-main"
                    >
                      API Personalizada (Criar do Zero)...
                    </option>

                    {activeItem.type === "api_call" && (
                      <>
                        {integracoesNativas
                          .filter(
                            (int) => int.chave === "evolution_api" && int.ativo,
                          )
                          .map((int) => (
                            <optgroup
                              key={int.id}
                              label="Evolution API (WhatsApp)"
                              className="bg-bg-dark text-text-muted"
                            >
                              <option
                                value="native-evolution_api-sendText"
                                className="bg-bg-dark text-text-main"
                              >
                                Evolution: Enviar Texto
                              </option>
                              <option
                                value="native-evolution_api-sendMedia"
                                className="bg-bg-dark text-text-main"
                              >
                                Evolution: Enviar Mídia (Imagem/Documento)
                              </option>
                              <option
                                value="native-evolution_api-sendAudio"
                                className="bg-bg-dark text-text-main"
                              >
                                Evolution: Enviar Áudio Gravado
                              </option>
                              <option
                                value="native-evolution_api-sendContact"
                                className="bg-bg-dark text-text-main"
                              >
                                Evolution: Enviar Contato (VCard)
                              </option>
                              <option
                                value="native-evolution_api-sendLocation"
                                className="bg-bg-dark text-text-main"
                              >
                                Evolution: Enviar Localização (Mapa)
                              </option>
                              <option
                                value="native-evolution_api-sendReaction"
                                className="bg-bg-dark text-text-main"
                              >
                                Evolution: Enviar Reação (Emoji)
                              </option>
                              <option
                                value="native-evolution_api-sendLinkPreview"
                                className="bg-bg-dark text-text-main"
                              >
                                Evolution: Enviar Link com Preview
                              </option>
                              <option
                                value="native-evolution_api-sendButtons"
                                className="bg-bg-dark text-text-main"
                              >
                                Evolution: Enviar Mensagem com Botões
                              </option>
                              <option
                                value="native-evolution_api-sendList"
                                className="bg-bg-dark text-text-main"
                              >
                                Evolution: Enviar Mensagem com Lista
                              </option>
                              <option
                                value="native-evolution_api-sendStatus"
                                className="bg-bg-dark text-text-main"
                              >
                                Evolution: Enviar Status/Story
                              </option>
                            </optgroup>
                          ))}

                        {integracoesNativas
                          .filter((int) => int.chave === "cep_api" && int.ativo)
                          .map((int) => (
                            <optgroup
                              key={int.id}
                              label="CEP Resiliente (ViaCEP / BrasilAPI)"
                              className="bg-bg-dark text-text-muted"
                            >
                              <option
                                value="native-cep_api-viacep"
                                className="bg-bg-dark text-text-main"
                              >
                                ViaCEP: Consultar CEP
                              </option>
                              <option
                                value="native-cep_api-brasilapi_v1"
                                className="bg-bg-dark text-text-main"
                              >
                                BrasilAPI v1: Consultar CEP
                              </option>
                              <option
                                value="native-cep_api-brasilapi_v2"
                                className="bg-bg-dark text-text-main"
                              >
                                BrasilAPI v2: Consultar CEP + Coordenadas
                              </option>
                            </optgroup>
                          ))}

                        {integracoesNativas
                          .filter(
                            (int) => int.chave === "google_maps" && int.ativo,
                          )
                          .map((int) => (
                            <optgroup
                              key={int.id}
                              label="Google Maps"
                              className="bg-bg-dark text-text-muted"
                            >
                              <option
                                value="native-google_maps-geocode"
                                className="bg-bg-dark text-text-main"
                              >
                                Google Maps: Geocodificar Endereço
                              </option>
                              <option
                                value="native-google_maps-distancematrix"
                                className="bg-bg-dark text-text-main"
                              >
                                Google Maps: Calcular Distância entre Pontos
                              </option>
                              <option
                                value="native-google_maps-placeautocomplete"
                                className="bg-bg-dark text-text-main"
                              >
                                Google Maps: Autocomplete de Locais
                              </option>
                              <option
                                value="native-google_maps-placedetails"
                                className="bg-bg-dark text-text-main"
                              >
                                Google Maps: Detalhes de um Local por ID
                              </option>
                            </optgroup>
                          ))}

                        {integracoesNativas
                          .filter(
                            (int) => int.chave === "google_sheets" && int.ativo,
                          )
                          .map((int) => (
                            <optgroup
                              key={int.id}
                              label="Google Sheets"
                              className="bg-bg-dark text-text-muted"
                            >
                              <option
                                value="native-google_sheets-append"
                                className="bg-bg-dark text-text-main"
                              >
                                Google Sheets: Inserir Linha em Planilha
                              </option>
                              <option
                                value="native-google_sheets-getvalues"
                                className="bg-bg-dark text-text-main"
                              >
                                Google Sheets: Ler Linhas da Planilha
                              </option>
                              <option
                                value="native-google_sheets-update"
                                className="bg-bg-dark text-text-main"
                              >
                                Google Sheets: Atualizar Linha na Planilha
                              </option>
                              <option
                                value="native-google_sheets-clear"
                                className="bg-bg-dark text-text-main"
                              >
                                Google Sheets: Limpar Células da Planilha
                              </option>
                            </optgroup>
                          ))}

                        {integracoesNativas
                          .filter(
                            (int) => int.chave === "gmail_smtp" && int.ativo,
                          )
                          .map((int) => (
                            <optgroup
                              key={int.id}
                              label="SMTP/E-mail (Gmail)"
                              className="bg-bg-dark text-text-muted"
                            >
                              <option
                                value="native-gmail_smtp-send"
                                className="bg-bg-dark text-text-main"
                              >
                                Gmail SMTP: Enviar E-mail Personalizado
                              </option>
                            </optgroup>
                          ))}
                      </>
                    )}

                    <optgroup
                      label="Modelos Customizados Salvos"
                      className="bg-bg-dark text-text-muted"
                    >
                      {items
                        .filter(
                          (i) =>
                            i.type === activeItem.type &&
                            i.isActive &&
                            !i.id.startsWith("new-") &&
                            i.id !== activeItem.id,
                        )
                        .map((i) => (
                          <option
                            key={i.id}
                            value={i.id}
                            className="bg-bg-dark text-text-main"
                          >
                            Usar modelo: {i.name || i.raw.nome} (
                            {i.raw.method || i.raw.metodo || "POST"} {i.raw.url}
                            )
                          </option>
                        ))}
                    </optgroup>
                  </select>
                </div>
              )}

              {/* Importador de Comando cURL */}
              {activeItem.type === "api_call" && (
                <div className="px-5 py-3 border-b border-input-border bg-bg-dark/10 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowCurlImporter(!showCurlImporter)}
                      className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                    >
                      {showCurlImporter
                        ? "Fechar Importador cURL"
                        : "Importar a partir de comando cURL..."}
                    </button>
                  </div>
                  {showCurlImporter && (
                    <div className="flex flex-col gap-2 bg-card p-3 rounded-lg border border-input-border/60">
                      <p className="text-xs text-text-muted">
                        {
                          'Cole o comando cURL completo. Ex: curl -X POST https://api.exemplo.com -H "Authorization: Bearer token" -d \'{"data": "exemplo"}\''
                        }
                      </p>
                      <textarea
                        value={curlInput}
                        onChange={(e) => setCurlInput(e.target.value)}
                        placeholder="Cole seu cURL aqui..."
                        className="w-full h-20 rounded border border-input-border bg-bg-dark px-3 py-2 text-xs text-text-main font-mono outline-none focus:border-accent resize-none"
                      />
                      <button
                        onClick={handleImportarCurl}
                        className="self-end px-4 py-1.5 bg-accent hover:bg-accent/90 text-accent-fg rounded text-xs font-bold transition-all"
                      >
                        Processar cURL & Preencher Campos
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Detalhes HTTP (Apenas para APIs) */}
              {activeItem.type !== "notification" && (
                <div className="p-4 flex flex-col sm:flex-row gap-2 border-b border-input-border bg-bg-dark/10">
                  <select
                    value={apiMethod}
                    onChange={(e) => setApiMethod(e.target.value)}
                    className="w-full sm:w-28 rounded-lg border border-input-border bg-bg-dark px-3 py-2 text-xs font-bold text-accent outline-none"
                  >
                    {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                      <option
                        key={m}
                        value={m}
                        className="bg-bg-dark text-text-main"
                      >
                        {m}
                      </option>
                    ))}
                  </select>
                  <input
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="flex-1 rounded-lg border border-input-border bg-bg-dark px-3 py-2 text-xs text-text-main outline-none focus:border-accent font-mono"
                    placeholder="https://api.exemplo.com/v1/lead/{{cadastro_id}}"
                  />
                </div>
              )}

              {/* Abas Secundárias do Editor */}
              <div className="flex border-b border-input-border px-4 my-1 overflow-x-auto whitespace-nowrap scrollbar-hide bg-bg-dark/20">
                {activeItem.type === "notification" ? (
                  <>
                    <button
                      onClick={() => setEditorTab("template")}
                      className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${editorTab === "template" ? "border-accent text-accent" : "border-transparent text-text-muted hover:text-text-main"}`}
                    >
                      Layout da Notificação
                    </button>
                    <button
                      onClick={() => setEditorTab("test")}
                      className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${editorTab === "test" ? "border-accent text-accent" : "border-transparent text-text-muted hover:text-text-main"}`}
                    >
                      Visualizar & Testar
                    </button>
                  </>
                ) : (
                  <>
                    {[
                      { id: "headers", label: "Headers" },
                      { id: "query", label: "Query Params" },
                      { id: "body", label: "Body Template" },
                      { id: "test", label: "Testar & Inicializar" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setEditorTab(t.id as any)}
                        className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${editorTab === t.id ? "border-accent text-accent" : "border-transparent text-text-muted hover:text-text-main"}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Conteúdo do Editor */}
              <div className="p-5 flex-1 overflow-y-auto bg-card">
                {editorTab === "headers" &&
                  activeItem.type !== "notification" && (
                    <div className="max-w-3xl flex flex-col gap-4">
                      <div>
                        <p className="text-xs text-text-muted mb-4">
                          Envie cabeçalhos HTTP na requisição. Suporta variáveis
                          `{"{{var}}"}`.
                        </p>
                        <KVEditor
                          data={apiHeaders}
                          onChange={(v) => setApiHeaders(v)}
                        />
                      </div>
                      <DicionarioVariaveis evento={apiEvento} />
                    </div>
                  )}

                {editorTab === "query" &&
                  activeItem.type !== "notification" && (
                    <div className="max-w-3xl flex flex-col gap-4">
                      <div>
                        <p className="text-xs text-text-muted mb-4">
                          Parâmetros anexados ao final da URL (ex: ?origem=app).
                          Suporta variáveis `{"{{var}}"}`.
                        </p>
                        <KVEditor
                          data={apiQuery}
                          onChange={(v) => setApiQuery(v)}
                        />
                      </div>
                      <DicionarioVariaveis evento={apiEvento} />
                    </div>
                  )}

                {editorTab === "body" && activeItem.type !== "notification" && (
                  <div className="flex flex-col h-full max-w-4xl min-h-[250px] gap-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs text-text-muted">
                        Defina o corpo JSON da chamada. Use `{"{{campo}}"}` para
                        interpolar informações dinâmicas do lead.
                      </p>
                      {apiEvento && (
                        <button
                          onClick={() => setConfirmPayloadModal(true)}
                          className="px-2.5 py-1 text-xs font-extrabold bg-accent/10 hover:bg-accent text-accent hover:text-white rounded-lg transition-all shrink-0"
                        >
                          Carregar Payload Padrão
                        </button>
                      )}
                    </div>
                    <textarea
                      value={apiBody}
                      onChange={(e) => setApiBody(e.target.value)}
                      className="flex-1 w-full rounded-lg border border-input-border bg-[#1e1e1e] text-[#d4d4d4] p-4 font-mono text-xs outline-none focus:border-accent resize-none min-h-[200px]"
                      spellCheck={false}
                      placeholder={'{\n  "lead": "{{lead_nome}}"\n}'}
                    />
                    <DicionarioVariaveis evento={apiEvento} />
                  </div>
                )}

                {editorTab === "template" &&
                  activeItem.type === "notification" && (
                    <div className="flex flex-col gap-4 max-w-2xl">
                      <div>
                        <label className="text-xs font-bold text-text-muted mb-1 block">
                          Título da Notificação
                        </label>
                        <input
                          value={notifTitulo}
                          onChange={(e) => setNotifTitulo(e.target.value)}
                          className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2.5 text-xs text-text-main outline-none focus:border-accent"
                          placeholder="Ex: Lead Atualizado!"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-text-muted mb-1 block">
                          Quem receberá a Notificação?
                        </label>
                        <select
                          value={notifDestinatarioTipo}
                          onChange={(e) =>
                            setNotifDestinatarioTipo(e.target.value)
                          }
                          className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2.5 text-xs text-text-main outline-none focus:border-accent"
                        >
                          <option
                            value="consultor"
                            className="bg-bg-dark text-text-main"
                          >
                            Consultor Responsável (Criador do Cadastro)
                          </option>
                          <option
                            value="cadastro"
                            className="bg-bg-dark text-text-main"
                          >
                            Setor de Cadastro
                          </option>
                          <option
                            value="superadmin"
                            className="bg-bg-dark text-text-main"
                          >
                            Super Admin / Administrador
                          </option>
                          <option
                            value="ti"
                            className="bg-bg-dark text-text-main"
                          >
                            Equipe de TI
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-text-muted mb-1 block">
                          Corpo da Mensagem
                        </label>
                        <textarea
                          value={notifCorpo}
                          onChange={(e) => setNotifCorpo(e.target.value)}
                          rows={5}
                          className="w-full rounded-lg border border-input-border bg-input-bg px-4 py-2.5 text-xs text-text-main outline-none focus:border-accent resize-none font-mono"
                          placeholder="Ex: Olá {{lead_nome}}, seu cadastro está sob revisão."
                        />
                      </div>
                      <DicionarioVariaveis evento={notifEvento} />
                    </div>
                  )}

                {editorTab === "test" && (
                  <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[350px]">
                    <div className="flex-1 flex flex-col w-full lg:max-w-xs">
                      <h3 className="text-xs font-bold text-text-main mb-2">
                        Variáveis de Teste (Mock)
                      </h3>
                      <p className="text-xs text-text-muted mb-4">
                        JSON contendo os valores para testar a injeção nos
                        templates e parâmetros.
                      </p>
                      <textarea
                        value={testVars}
                        onChange={(e) => setTestVars(e.target.value)}
                        className="h-32 w-full rounded-lg border border-input-border bg-[#1e1e1e] text-[#d4d4d4] p-3 font-mono text-xs outline-none focus:border-accent resize-none mb-3"
                        spellCheck={false}
                      />
                      <button
                        onClick={handleTestar}
                        disabled={testing || activeItem.id.startsWith("new-")}
                        className="flex justify-center items-center gap-2 w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        {testing ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Play size={14} />
                        )}{" "}
                        Testar Ação
                      </button>
                      {activeItem.id.startsWith("new-") && (
                        <p className="text-xs text-center text-red-400 mt-2">
                          Salve antes de poder testar.
                        </p>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col bg-bg-dark rounded-lg border border-input-border overflow-hidden">
                      <div className="bg-input-bg p-3 border-b border-input-border flex justify-between items-center">
                        <h3 className="text-xs font-bold text-text-main flex items-center gap-1">
                          <Code size={14} /> Retorno
                        </h3>
                        {testResult && (
                          <div className="flex gap-3 text-xs font-mono">
                            <span
                              className={
                                testResult.status >= 200 &&
                                testResult.status < 300
                                  ? "text-green-400"
                                  : "text-red-400"
                              }
                            >
                              Status: {testResult.status}
                            </span>
                            <span className="text-accent">
                              Duração: {testResult.duration}ms
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-4 overflow-auto">
                        {!testResult ? (
                          <div className="h-full flex items-center justify-center text-text-muted text-xs">
                            Execute o teste para visualizar a resposta
                          </div>
                        ) : (
                          <pre className="text-xs font-mono text-[#d4d4d4] whitespace-pre-wrap break-all">
                            {JSON.stringify(testResult.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aba de Matriz de Gatilhos (Workflows de Eventos) */}
      {activeTab === "workflows" && (
        <div className="flex flex-col gap-6 bg-card border border-input-border rounded-xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-input-border/60 pb-4">
            <div>
              <h2 className="text-sm font-bold text-text-main flex items-center gap-2 mb-1.5">
                <GitFork size={16} className="text-accent" /> Workflow Builder
                (Matriz de Gatilhos por Passos)
              </h2>
              <p className="text-xs text-text-muted">
                Configure a ordem sequencial das ações que devem ser disparadas
                quando um evento ou ação de botão ocorre no sistema.
              </p>
            </div>

            <div className="flex flex-col gap-1 w-full md:w-72 shrink-0">
              <label className="text-xs font-bold text-text-muted uppercase">
                Filtrar por Gatilho
              </label>
              <select
                value={filtroGatilho}
                onChange={(e) => setFiltroGatilho(e.target.value)}
                className="w-full rounded-lg border border-input-border bg-bg-dark px-3 py-2 text-xs text-text-main font-semibold outline-none focus:border-accent"
              >
                <option value="todos" className="bg-bg-dark text-text-main">
                  Mostrar Todos
                </option>
                {eventosStatus.length > 0 && (
                  <optgroup
                    label="Eventos de Status"
                    className="bg-bg-dark text-text-muted"
                  >
                    {eventosStatus.map((e) => (
                      <option
                        key={e.value}
                        value={e.value}
                        className="bg-bg-dark text-text-main"
                      >
                        {e.label}
                      </option>
                    ))}
                  </optgroup>
                )}
                {eventosBotao.length > 0 && (
                  <optgroup
                    label="Ações de Botão"
                    className="bg-bg-dark text-text-muted"
                  >
                    {eventosBotao.map((e) => (
                      <option
                        key={e.value}
                        value={e.value}
                        className="bg-bg-dark text-text-main"
                      >
                        {e.label}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {(() => {
              const eventosFiltrados =
                filtroGatilho === "todos"
                  ? eventosGerais
                  : eventosGerais.filter((ev) => ev.value === filtroGatilho);

              return eventosFiltrados.map((ev) => {
                // Filtrar e ordenar ações customizadas ligadas a este evento
                const acoesVinculadas = items
                  .filter((item) => item.raw.evento === ev.value)
                  .sort((a, b) => (a.raw.ordem || 0) - (b.raw.ordem || 0));

                const acoesNativas = ACOES_NATIVAS[ev.value] || [
                  "Ação padrão do sistema",
                ];

                return (
                  <div
                    key={ev.value}
                    className="rounded-xl border border-input-border bg-bg-dark/40 p-5 flex flex-col gap-4"
                  >
                    {/* Cabeçalho do Gatilho */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-input-border pb-3 bg-bg-dark/20 -mx-5 -mt-5 px-5 pt-4 rounded-t-xl">
                      <div>
                        <span className="text-xs font-extrabold text-accent uppercase tracking-wider block mb-0.5">
                          GATILHO
                        </span>
                        <h3 className="text-xs font-bold text-text-main flex items-center gap-1.5">
                          {ev.label}
                        </h3>
                        <span className="text-xs text-text-muted font-mono">
                          {ev.value} (
                          {ev.tipo === "status_change"
                            ? "Mudança de Status"
                            : "Ação de Botão"}
                          )
                        </span>
                      </div>

                      {/* Botões rápidos de adicionar ação */}
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-xs font-bold text-text-muted mr-1">
                          ADICIONAR:
                        </span>
                        <button
                          onClick={() =>
                            adicionarAcaoInline(
                              ev.value,
                              ev.tipo,
                              "notification",
                            )
                          }
                          className="px-2 py-1 bg-accent/10 hover:bg-accent text-accent hover:text-white rounded-md text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Plus size={10} /> Notificação
                        </button>
                        <button
                          onClick={() =>
                            adicionarAcaoInline(ev.value, ev.tipo, "webhook")
                          }
                          className="px-2 py-1 bg-accent/10 hover:bg-accent text-accent hover:text-white rounded-md text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Plus size={10} /> Webhook
                        </button>
                        <button
                          onClick={() =>
                            adicionarAcaoInline(ev.value, ev.tipo, "api_call")
                          }
                          className="px-2 py-1 bg-accent/10 hover:bg-accent text-accent hover:text-white rounded-md text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Plus size={10} /> API
                        </button>
                      </div>
                    </div>

                    {/* Fluxo Vertical (Timeline) */}
                    <div className="relative pl-6 flex flex-col gap-4 border-l border-dashed border-input-border/70 ml-2">
                      {/* Passo 1 - Ação Nativa */}
                      <div className="relative">
                        {/* Ponto indicador na timeline */}
                        <span className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-accent border-2 border-card flex items-center justify-center text-[8px] font-extrabold text-white">
                          1
                        </span>

                        <div className="rounded-xl border border-accent/20 bg-accent/5 p-3.5">
                          <div className="flex items-center gap-1.5 justify-between mb-2">
                            <span className="text-xs font-bold text-accent uppercase tracking-wider">
                              Passo 1: Ação Nativa do Sistema
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-accent/20 text-[8px] font-bold text-accent">
                              Fixo
                            </span>
                          </div>
                          <ul className="list-disc list-inside space-y-1">
                            {acoesNativas.map((nat, i) => (
                              <li
                                key={i}
                                className="text-xs text-text-muted leading-relaxed font-medium"
                              >
                                {nat}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Passos Customizados (Passo 2, 3...) */}
                      {acoesVinculadas.map((a, idx) => {
                        const Icon =
                          a.type === "api_call"
                            ? Link2
                            : a.type === "webhook"
                              ? WebhookIcon
                              : Bell;
                        const labelTipo =
                          a.type === "api_call"
                            ? "API Externa"
                            : a.type === "webhook"
                              ? "Webhook"
                              : "Notificação";
                        const numPasso = idx + 2;

                        return (
                          <div key={a.id} className="relative">
                            {/* Ponto na timeline */}
                            <span className="absolute -left-[30px] top-2.5 w-4 h-4 rounded-full bg-card border border-input-border flex items-center justify-center text-[8px] font-extrabold text-text-main shadow-sm">
                              {numPasso}
                            </span>

                            <div
                              className={`rounded-xl border p-3.5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${a.isActive ? "border-input-border bg-card/60 shadow-sm" : "border-input-border/50 bg-card/20 opacity-70"}`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <div
                                  className={`p-1.5 rounded-lg shrink-0 ${a.isActive ? "bg-accent/10 text-accent" : "bg-input-bg text-text-muted"}`}
                                >
                                  <Icon size={14} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-text-main">
                                      Passo {numPasso}: {a.name}
                                    </span>
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-bg-dark text-text-muted border border-input-border/30">
                                      {labelTipo}
                                    </span>
                                  </div>
                                  <p className="text-xs text-text-muted truncate max-w-[300px] mt-0.5">
                                    {a.type === "notification"
                                      ? `Mensagem: "${a.raw.corpo_template}"`
                                      : `URL: ${a.raw.url}`}
                                  </p>
                                </div>
                              </div>

                              {/* Controles de Ação, Reordenar e Ativar/Desativar */}
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                {/* Botões de Reordenar */}
                                <div className="flex items-center border border-input-border bg-bg-dark p-0.5 rounded-lg mr-1.5">
                                  <button
                                    onClick={() =>
                                      moverPasso(ev.value, a.id, "up")
                                    }
                                    disabled={idx === 0}
                                    title="Mover para cima"
                                    className="p-1 hover:text-accent disabled:opacity-30 disabled:hover:text-text-muted text-text-muted"
                                  >
                                    <ArrowUp size={12} />
                                  </button>
                                  <div className="w-px h-3.5 bg-input-border"></div>
                                  <button
                                    onClick={() =>
                                      moverPasso(ev.value, a.id, "down")
                                    }
                                    disabled={
                                      idx === acoesVinculadas.length - 1
                                    }
                                    title="Mover para baixo"
                                    className="p-1 hover:text-accent disabled:opacity-30 disabled:hover:text-text-muted text-text-muted"
                                  >
                                    <ArrowDown size={12} />
                                  </button>
                                </div>

                                {/* Toggle Ativo/Inativo */}
                                <button
                                  onClick={() => toggleStatusAcao(a)}
                                  title={
                                    a.isActive
                                      ? "Desativar etapa"
                                      : "Ativar etapa"
                                  }
                                  className="hover:text-accent"
                                >
                                  {a.isActive ? (
                                    <ToggleRight
                                      size={22}
                                      className="text-green-500"
                                    />
                                  ) : (
                                    <ToggleLeft
                                      size={22}
                                      className="text-text-muted"
                                    />
                                  )}
                                </button>

                                {/* Editar */}
                                <button
                                  onClick={() => {
                                    selecionar(a);
                                    setEditorModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 bg-input-bg border border-input-border hover:border-accent rounded-lg text-xs font-bold text-text-main hover:text-accent transition-colors"
                                >
                                  Configurar
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {acoesVinculadas.length === 0 && (
                        <div className="relative py-1">
                          <span className="absolute -left-[30px] top-2.5 w-4 h-4 rounded-full bg-card border border-input-border border-dashed flex items-center justify-center text-[8px] font-extrabold text-text-muted">
                            +
                          </span>
                          <p className="text-xs text-text-muted italic ml-2 mt-1">
                            Nenhuma etapa customizada configurada para este
                            gatilho.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Aba de Logs Unificada */}
      {activeTab === "logs" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">
              Histórico das últimas 100 execuções de Webhooks e chamadas de API.
            </p>
            <button
              onClick={carregarLogs}
              disabled={loadingLogs}
              className="flex items-center gap-1.5 rounded-lg bg-card border border-input-border px-3 py-1.5 text-xs text-text-muted hover:text-text-main"
            >
              {loadingLogs ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <RefreshCw size={12} />
              )}{" "}
              Atualizar
            </button>
          </div>
          {loadingLogs && logs.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin text-accent" />
            </div>
          ) : logs.length === 0 ? (
            <p className="py-12 text-center text-xs text-text-muted bg-card rounded-xl border border-input-border">
              Nenhum log registrado
            </p>
          ) : (
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl bg-card border border-input-border p-3.5 shadow-sm hover:border-border-subtle transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${log.sucesso ? "bg-green-400" : "bg-red-400"}`}
                      />
                      <span className="text-xs font-bold text-text-main">
                        {log.evento}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${log.status_code && log.status_code < 300 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
                      >
                        Status: {log.status_code || "FALHA"}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted font-mono">
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-text-muted break-all font-mono">
                    <span className="font-bold text-text-main">URL:</span>{" "}
                    {log.url || "N/A"}
                  </div>
                  {log.resposta && (
                    <div className="mt-1.5 bg-bg-dark p-2 rounded text-xs text-text-muted font-mono whitespace-pre-wrap max-h-24 overflow-y-auto">
                      {log.resposta}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modais de Confirmação Customizados (Nativos da UI) */}
      {confirmPayloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-input-border rounded-xl max-w-sm w-full p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xs font-bold text-text-main uppercase tracking-wider mb-2">
              Substituir Payload?
            </h3>
            <p className="text-xs text-text-muted mb-4 leading-relaxed">
              Isso irá substituir todo o conteúdo atual do Body pelo payload
              padrão do gatilho. Esta ação não pode ser desfeita
              automaticamente.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmPayloadModal(false)}
                className="px-3.5 py-2 bg-input-bg border border-input-border text-text-main hover:bg-bg-dark rounded-lg text-xs font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (apiEvento) {
                    setApiBody(gerarJsonPadrao(apiEvento));
                    toast.success("Payload padrão carregado!");
                  }
                  setConfirmPayloadModal(false);
                }}
                className="px-3.5 py-2 bg-accent hover:bg-accent/90 text-accent-fg rounded-lg text-xs font-bold transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmExcluirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-input-border rounded-xl max-w-sm w-full p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
              Excluir Ação?
            </h3>
            <p className="text-xs text-text-muted mb-4 leading-relaxed">
              Tem certeza que deseja excluir esta ação permanentemente? Isso
              pode quebrar fluxos sequenciais ativos vinculados.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmExcluirModal(false)}
                className="px-3.5 py-2 bg-input-bg border border-input-border text-text-main hover:bg-bg-dark rounded-lg text-xs font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setConfirmExcluirModal(false);
                  executarExclusao();
                }}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

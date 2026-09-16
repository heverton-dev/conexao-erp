import { useState, useEffect } from "react";
import { MessageSquare, Upload, Users, Send, AlertTriangle, CheckCircle, FileSpreadsheet, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "~/lib/auth";
import { PageHeader } from "~/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Skeleton } from "~/components/ui/skeleton";
import { carregarDadosWhatsApp, dispararWhatsApp } from "../services/whatsapp.service";
import type { WhatsAppLead, WhatsAppCampanha } from "../services/whatsapp.service";
import { EMPRESA_ID } from "~/config/empresa";
type Contato = {
  nome: string;
  telefone: string;
};

export function WhatsappMarketing() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [leads, setLeads] = useState<WhatsAppLead[]>([]);
  const [limiteDiario, setLimiteDiario] = useState<number>(0);
  const [enviadosHoje, setEnviadosHoje] = useState<number>(0);
  const [campanhasRecentes, setCampanhasRecentes] = useState<WhatsAppCampanha[]>([]);

  const [tipoOrigem, setTipoOrigem] = useState<"leads" | "csv">("leads");
  const [nomeCampanha, setNomeCampanha] = useState("");
  const [mensagemText, setMensagemText] = useState("Olá {nome}, tudo bem?");
  const [leadsSelecionados, setLeadsSelecionados] = useState<string[]>([]);
  const [contatosCSV, setContatosCSV] = useState<Contato[]>([]);

  useEffect(() => {
    if (!EMPRESA_ID) {
      setLoading(false);
      return;
    }
    carregarDados();
  }, [EMPRESA_ID]);

  async function carregarDados() {
    if (!EMPRESA_ID) return;
    setLoading(true);
    try {
      const dados = await carregarDadosWhatsApp(EMPRESA_ID);
      setLeads(dados.leads);
      setLimiteDiario(dados.limiteMax);
      setEnviadosHoje(dados.enviadosHoje);
      setCampanhasRecentes(dados.campanhasRecentes);
    } catch {
      toast.error("Erro ao carregar dados do WhatsApp Marketing");
    } finally {
      setLoading(false);
    }
  }

  function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split("\n");
      const parsed: Contato[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(/[,;]/);
        if (parts.length >= 2) {
          const nome = parts[0].trim().replace(/^["']|["']$/g, "");
          const telefone = parts[1].trim().replace(/[^0-9]/g, "");
          if (telefone.length >= 8) {
            parsed.push({ nome, telefone });
          }
        }
      }

      if (parsed.length > 0) {
        setContatosCSV(parsed);
        toast.success(`${parsed.length} contatos importados do CSV!`);
      } else {
        toast.error("Nenhum contato válido encontrado no arquivo CSV. Formato esperado: Nome,Telefone");
      }
    };
    reader.readAsText(file);
  }

  function handleSelectAllLeads() {
    if (leadsSelecionados.length === leads.length) {
      setLeadsSelecionados([]);
    } else {
      setLeadsSelecionados(leads.map((l) => l.id));
    }
  }

  function handleToggleLead(id: string) {
    setLeadsSelecionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  const contatosFinais: Contato[] = [];
  if (tipoOrigem === "leads") {
    leads
      .filter((l) => leadsSelecionados.includes(l.id) && l.telefone)
      .forEach((l) => {
        contatosFinais.push({ nome: l.nome, telefone: l.telefone! });
      });
  } else {
    contatosFinais.push(...contatosCSV);
  }

  const saldoHoje = limiteDiario > 0 ? Math.max(0, limiteDiario - enviadosHoje) : Infinity;
  const limiteExcedido = limiteDiario > 0 && contatosFinais.length > saldoHoje;

  async function handleDisparar(e: React.FormEvent) {
    e.preventDefault();
    if (!EMPRESA_ID || !nomeCampanha.trim() || !mensagemText.trim()) return;
    if (contatosFinais.length === 0) {
      toast.error("Selecione pelo menos um contato destinatário!");
      return;
    }
    if (limiteExcedido) {
      toast.error("O número de contatos excede seu saldo diário de mensagens!");
      return;
    }

    setSalvando(true);
    try {
      await dispararWhatsApp({
        empresa_id: EMPRESA_ID,
        nome: nomeCampanha.trim(),
        mensagem: mensagemText.trim(),
        total_contatos: contatosFinais.length,
      });
      toast.success("Campanha de WhatsApp disparada com sucesso!");
      setNomeCampanha("");
      setLeadsSelecionados([]);
      setContatosCSV([]);
      carregarDados();
    } catch {
      toast.error("Erro ao disparar campanha");
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <PageHeader
          title="WhatsApp Marketing"
          description="Envio inteligente de mensagens em massa para seus clientes e leads"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        <div className="lg:col-span-2 space-y-6">
          
          <Card>
            <CardHeader>
              <CardTitle>Configurar Mensagem</CardTitle>
              <CardDescription>Crie o conteúdo que será disparado via WhatsApp.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDisparar} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-text-muted font-medium">Nome da Campanha *</label>
                  <Input
                    required
                    value={nomeCampanha}
                    onChange={(e) => setNomeCampanha(e.target.value)}
                    placeholder="Ex: Ofertas de Outono 2026"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-text-muted font-medium">Mensagem *</label>
                    <span className="text-[10px] text-text-muted">Use a tag <code className="bg-surface px-1 py-0.5 rounded text-accent">{`{nome}`}</code> para personalizar</span>
                  </div>
                  <Textarea
                    required
                    rows={4}
                    value={mensagemText}
                    onChange={(e) => setMensagemText(e.target.value)}
                    placeholder="Olá {nome}, preparamos condições incríveis para você..."
                  />
                </div>

                <div className="space-y-2 border-t border-border pt-4">
                  <label className="text-xs text-text-muted font-medium block">Origem dos Destinatários *</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={tipoOrigem === "leads" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setTipoOrigem("leads")}
                      className="flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Leads do ERP
                    </Button>
                    <Button
                      type="button"
                      variant={tipoOrigem === "csv" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setTipoOrigem("csv")}
                      className="flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Importar arquivo .CSV
                    </Button>
                  </div>
                </div>

                {tipoOrigem === "leads" ? (
                  <div className="border border-border rounded-lg p-3 space-y-3 bg-surface/30">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-semibold text-text-main">
                        Selecione os Leads ({leadsSelecionados.length} selecionados)
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={handleSelectAllLeads}
                      >
                        {leadsSelecionados.length === leads.length ? "Desmarcar Todos" : "Selecionar Todos"}
                      </Button>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-border/40">
                      {leads.length === 0 ? (
                        <p className="text-xs text-text-muted py-4 text-center">Nenhum lead com telefone cadastrado.</p>
                      ) : (
                        leads.map((l) => (
                          <div key={l.id} className="flex items-center gap-3 pt-1.5 first:pt-0">
                            <input
                              type="checkbox"
                              checked={leadsSelecionados.includes(l.id)}
                              onChange={() => handleToggleLead(l.id)}
                              className="rounded border-border bg-card text-accent"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-text-main truncate">{l.nome}</p>
                              <p className="text-[10px] text-text-muted truncate">{l.telefone || "Sem telefone"} {l.email ? `• ${l.email}` : ""}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border border-border border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-3 bg-surface/20">
                    <Upload className="w-8 h-8 text-text-muted" />
                    <div className="text-center">
                      <p className="text-xs font-semibold text-text-main">Importar Lista de Contatos (.csv)</p>
                      <p className="text-[10px] text-text-muted mt-0.5">O arquivo deve conter as colunas: Nome, Telefone</p>
                    </div>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="hidden"
                      id="csv-file-upload"
                    />
                    <label htmlFor="csv-file-upload">
                      <span className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-accent-fg text-xs font-medium rounded-md cursor-pointer transition-colors block">
                        Selecionar Arquivo
                      </span>
                    </label>

                    {contatosCSV.length > 0 && (
                      <div className="w-full mt-3 border-t border-border pt-3">
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className="text-text-muted font-medium">{contatosCSV.length} contatos carregados</span>
                          <button
                            type="button"
                            onClick={() => setContatosCSV([])}
                            className="text-error hover:underline flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Limpar
                          </button>
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-1 divide-y divide-border/40">
                          {contatosCSV.slice(0, 50).map((c, i) => (
                            <div key={i} className="flex justify-between text-[10px] py-1">
                              <span className="text-text-main truncate font-medium">{c.nome}</span>
                              <span className="text-text-muted shrink-0 font-mono">{c.telefone}</span>
                            </div>
                          ))}
                          {contatosCSV.length > 50 && (
                            <p className="text-[9px] text-text-muted text-center pt-1.5">E outros {contatosCSV.length - 50} contatos...</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

        </div>

        <div className="space-y-6">
          
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Disparo</CardTitle>
              <CardDescription>Validação de cota e limites diários.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-text-main">
                  <span>Envios Hoje:</span>
                  <span>
                    {enviadosHoje} / {limiteDiario === 0 ? "Ilimitado" : `${limiteDiario}`}
                  </span>
                </div>
                {limiteDiario > 0 && (
                  <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-border">
                    <div
                      className={`h-full transition-all ${limiteExcedido ? "bg-error" : "bg-accent"}`}
                      style={{ width: `${Math.min(100, (enviadosHoje / limiteDiario) * 100)}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="rounded-lg p-3 bg-surface border border-border space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Destinatários selecionados:</span>
                  <span className="font-semibold text-text-main">{contatosFinais.length}</span>
                </div>
                {limiteDiario > 0 && (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Saldo disponível hoje:</span>
                      <span className="font-semibold text-text-main">{saldoHoje}</span>
                    </div>
                  </>
                )}
                
                {contatosFinais.length > 0 && (
                  <div className="border-t border-border/60 pt-2 mt-2">
                    {limiteExcedido ? (
                      <div className="flex items-start gap-2 text-xs text-error font-medium">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>Campanha Bloqueada! O total de destinatários excede seu limite diário restante.</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 text-xs text-green-400 font-medium">
                        <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>Campanha Válida. Saldo de limite suficiente para o envio.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button
                onClick={handleDisparar}
                disabled={salvando || contatosFinais.length === 0 || limiteExcedido}
                className="w-full flex items-center justify-center gap-2"
              >
                {salvando ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Disparar WhatsApp ({contatosFinais.length})
                  </>
                )}
              </Button>

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Envios Recentes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60 max-h-60 overflow-y-auto">
                {campanhasRecentes.length === 0 ? (
                  <p className="text-xs text-text-muted p-4 text-center">Nenhum envio recente.</p>
                ) : (
                  campanhasRecentes.map((camp) => (
                    <div key={camp.id} className="p-3 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-text-main truncate max-w-[150px]">{camp.nome}</span>
                        <span className="text-[10px] text-accent font-medium">{camp.total_contatos} contatos</span>
                      </div>
                      <p className="text-text-muted truncate text-[10px]">{camp.mensagem}</p>
                      <p className="text-[9px] text-text-muted">{new Date(camp.created_at).toLocaleString("pt-BR")}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}

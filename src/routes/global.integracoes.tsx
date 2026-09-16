import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useAuth } from "~/lib/auth";
import {
  listarIntegracoes,
  salvarIntegracao,
  testarConexaoEvolution,
  type IntegracaoConfig,
} from "~/features/integracoes";
import { useState, useEffect } from "react";
import {
  Loader2,
  Save,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Cable,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import { PasswordInput } from "~/components/ui/password-input";
import { RequireSuperAdmin } from "~/components/guards";

export const adminSuperIntegracoesRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/global/integracoes",
  component: () => (
    <RequireSuperAdmin>
      <AdminSuperIntegracoes />
    </RequireSuperAdmin>
  ),
});

function AdminSuperIntegracoes() {
  const { profile } = useAuth();
  const [integracoes, setIntegracoes] = useState<IntegracaoConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState<string | null>(null);
  const [testando, setTestando] = useState<string | null>(null);
  const [configsLocais, setConfigsLocais] = useState<Record<string, any>>({});

  useEffect(() => {
    if (profile?.is_super_admin) carregar();
  }, [profile]);

  async function carregar() {
    setLoading(true);
    try {
      const data = await listarIntegracoes();
      setIntegracoes(data);
      const initialConfigs: Record<string, any> = {};
      data.forEach((item) => {
        initialConfigs[item.chave] = item.config || {};
      });
      setConfigsLocais(initialConfigs);
    } catch {
      toast.error("Erro ao carregar integrações");
    }
    setLoading(false);
  }

  async function handleSalvar(item: IntegracaoConfig) {
    setSalvando(item.chave);
    try {
      await salvarIntegracao(item.chave, item.ativo, configsLocais[item.chave]);
      toast.success(`${item.nome} atualizada!`);
      carregar();
    } catch {
      toast.error("Erro ao salvar");
    }
    setSalvando(null);
  }

  async function handleToggleAtivo(item: IntegracaoConfig) {
    try {
      const novoStatus = !item.ativo;
      await salvarIntegracao(item.chave, novoStatus, configsLocais[item.chave]);
      toast.success(`${item.nome} ${novoStatus ? "ativada" : "desativada"}`);
      carregar();
    } catch {
      toast.error("Erro ao alterar status");
    }
  }

  async function handleTestarConexao(item: IntegracaoConfig) {
    if (item.chave !== "evolution_api") return;
    setTestando(item.chave);
    const cfg = configsLocais[item.chave] || {};
    try {
      const result = await testarConexaoEvolution(
        cfg.base_url,
        cfg.api_key,
        cfg.instancia,
      );
      if (result.conectado) toast.success(result.mensagem, { duration: 5000 });
      else toast.error(result.mensagem, { duration: 5000 });
    } catch (e: any) {
      toast.error("Falha ao testar: " + e.message);
    }
    setTestando(null);
  }

  const handleFieldChange = (chave: string, campo: string, valor: any) => {
    setConfigsLocais((prev) => ({
      ...prev,
      [chave]: { ...prev[chave], [campo]: valor },
    }));
  };

  if (!profile?.is_super_admin) {
    return (
      <div className="flex items-center justify-center p-8">
        <Shield size={40} className="text-text-muted" />
        <p className="text-sm text-text-muted ml-2">
          Acesso restrito ao Super Admin.
        </p>
      </div>
    );
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Cable size={20} className="text-accent" />
        <div>
          <h1 className="text-lg font-bold text-text-main">
            Integrações Nativas
          </h1>
          <p className="text-xs text-text-muted">
            Ative e configure conexões diretas com plataformas externas. Apenas
            Super Administradores podem visualizar ou modificar essas
            credenciais de segurança.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integracoes.map((item) => {
          const configLocal = configsLocais[item.chave] || {};
          const isSaving = salvando === item.chave;
          const isTesting = testando === item.chave;

          return (
            <div
              key={item.id}
              className="flex flex-col rounded-xl border border-input-border bg-card p-5 transition-all hover:border-input-border/60"
            >
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xs font-bold text-text-main flex items-center gap-1.5">
                    {item.nome}
                  </h3>
                  <span className="text-xs text-text-muted font-mono">
                    {item.chave}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleAtivo(item)}
                  className="focus:outline-none transition-transform active:scale-95"
                  title={item.ativo ? "Desativar" : "Ativar"}
                >
                  {item.ativo ? (
                    <ToggleRight
                      size={38}
                      className="text-green-500 hover:text-green-400"
                    />
                  ) : (
                    <ToggleLeft
                      size={38}
                      className="text-text-muted hover:text-text-muted/80"
                    />
                  )}
                </button>
              </div>

              <div className="flex-1 flex flex-col gap-3 pt-2 border-t border-border-subtle/30">
                {item.chave === "evolution_api" && (
                  <>
                    <div>
                      <label className="text-xs text-text-muted ml-1 mb-1 block">
                        URL Base da API
                      </label>
                      <input
                        value={configLocal.base_url || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            item.chave,
                            "base_url",
                            e.target.value,
                          )
                        }
                        placeholder="https://sua-api.evolution.com.br"
                        className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-xs text-text-main outline-none focus:border-accent"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-text-muted ml-1 mb-1 block">
                          API Key
                        </label>
                        <PasswordInput
                          value={configLocal.api_key || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              item.chave,
                              "api_key",
                              e.target.value,
                            )
                          }
                          placeholder="Chave de Autenticação"
                          className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-xs text-text-main outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-text-muted ml-1 mb-1 block">
                          Nome da Instância
                        </label>
                        <input
                          value={configLocal.instancia || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              item.chave,
                              "instancia",
                              e.target.value,
                            )
                          }
                          placeholder="Ex: conexao_zap"
                          className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-xs text-text-main outline-none focus:border-accent"
                        />
                      </div>
                    </div>
                  </>
                )}

                {item.chave === "cep_api" && (
                  <div>
                    <label className="text-xs text-text-muted ml-1 mb-1 block">
                      Provedor Principal
                    </label>
                    <select
                      value={configLocal.provider || "brasilapi"}
                      onChange={(e) =>
                        handleFieldChange(
                          item.chave,
                          "provider",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-xs text-text-main outline-none focus:border-accent"
                    >
                      <option value="brasilapi">
                        BrasilAPI (Recomendado - CDN Rápido)
                      </option>
                      <option value="viacep">ViaCEP (Tradicional)</option>
                    </select>
                    <p className="text-xs text-text-muted mt-2">
                      A plataforma tentará o provedor selecionado primeiro. Se
                      houver falha, fará fallback automático para o outro.
                    </p>
                  </div>
                )}

                {item.chave === "google_sheets" && (
                  <>
                    <div>
                      <label className="text-xs text-text-muted ml-1 mb-1 block">
                        ID da Planilha (Spreadsheet ID)
                      </label>
                      <input
                        value={configLocal.spreadsheet_id || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            item.chave,
                            "spreadsheet_id",
                            e.target.value,
                          )
                        }
                        placeholder="Ex: 1a2B3c4D..."
                        className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-xs text-text-main outline-none focus:border-accent"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-text-muted ml-1 mb-1 block">
                          E-mail da Conta de Serviço
                        </label>
                        <input
                          value={configLocal.client_email || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              item.chave,
                              "client_email",
                              e.target.value,
                            )
                          }
                          placeholder="sheets-sync@projeto.iam.gserviceaccount.com"
                          className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-xs text-text-main outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-text-muted ml-1 mb-1 block">
                          Private Key
                        </label>
                        <PasswordInput
                          value={configLocal.private_key || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              item.chave,
                              "private_key",
                              e.target.value,
                            )
                          }
                          placeholder="-----BEGIN PRIVATE KEY-----"
                          className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-xs text-text-main outline-none focus:border-accent"
                        />
                      </div>
                    </div>
                  </>
                )}

                {item.chave === "google_drive" && (
                  <>
                    <div>
                      <label className="text-xs text-text-muted ml-1 mb-1 block">
                        ID da Pasta Destino (Folder ID)
                      </label>
                      <input
                        value={configLocal.folder_id || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            item.chave,
                            "folder_id",
                            e.target.value,
                          )
                        }
                        placeholder="Ex: 1xYz2A-bCd..."
                        className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-xs text-text-main outline-none focus:border-accent"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-text-muted ml-1 mb-1 block">
                          E-mail da Conta de Serviço
                        </label>
                        <input
                          value={configLocal.client_email || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              item.chave,
                              "client_email",
                              e.target.value,
                            )
                          }
                          placeholder="drive-upload@projeto.iam.gserviceaccount.com"
                          className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-xs text-text-main outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-text-muted ml-1 mb-1 block">
                          Private Key
                        </label>
                        <PasswordInput
                          value={configLocal.private_key || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              item.chave,
                              "private_key",
                              e.target.value,
                            )
                          }
                          placeholder="-----BEGIN PRIVATE KEY-----"
                          className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-xs text-text-main outline-none focus:border-accent"
                        />
                      </div>
                    </div>
                  </>
                )}

                {item.chave === "google_maps" && (
                  <div>
                    <label className="text-xs text-text-muted ml-1 mb-1 block">
                      Google Maps API Key
                    </label>
                    <PasswordInput
                      value={configLocal.api_key || ""}
                      onChange={(e) =>
                        handleFieldChange(item.chave, "api_key", e.target.value)
                      }
                      placeholder="AIzaSyA1..."
                      className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-xs text-text-main outline-none focus:border-accent"
                    />
                  </div>
                )}

                {item.chave === "gmail_smtp" && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="text-xs text-text-muted ml-1 mb-1 block">
                          Host SMTP
                        </label>
                        <input
                          value={configLocal.host || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              item.chave,
                              "host",
                              e.target.value,
                            )
                          }
                          placeholder="smtp.gmail.com"
                          className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-xs text-text-main outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-text-muted ml-1 mb-1 block">
                          Porta
                        </label>
                        <input
                          type="number"
                          value={configLocal.port || 587}
                          onChange={(e) =>
                            handleFieldChange(
                              item.chave,
                              "port",
                              Number(e.target.value),
                            )
                          }
                          className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-xs text-text-main outline-none focus:border-accent"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-text-muted ml-1 mb-1 block">
                          Usuário / E-mail
                        </label>
                        <input
                          value={configLocal.user || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              item.chave,
                              "user",
                              e.target.value,
                            )
                          }
                          placeholder="exemplo@gmail.com"
                          className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-xs text-text-main outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-text-muted ml-1 mb-1 block">
                          Senha
                        </label>
                        <PasswordInput
                          value={configLocal.pass || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              item.chave,
                              "pass",
                              e.target.value,
                            )
                          }
                          placeholder="Senha do e-mail"
                          className="w-full rounded-xl border border-input-border bg-input-bg px-3 py-2 text-xs text-text-main outline-none focus:border-accent"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2 justify-end mt-5 pt-3 border-t border-border-subtle/30">
                {item.chave === "evolution_api" && (
                  <button
                    onClick={() => handleTestarConexao(item)}
                    disabled={isTesting}
                    className="flex items-center justify-center gap-1 rounded-xl bg-input-bg border border-input-border hover:bg-surface-hover text-text-main px-3 py-1.5 text-xs font-semibold disabled:opacity-50 transition-colors"
                  >
                    {isTesting ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <RefreshCw size={13} />
                    )}{" "}
                    Testar Instância
                  </button>
                )}
                <button
                  onClick={() => handleSalvar(item)}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-1 rounded-xl bg-accent hover:bg-accent-hover text-accent-fg px-4 py-1.5 text-xs font-semibold disabled:opacity-50 transition-all"
                >
                  {isSaving ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}{" "}
                  Salvar Credenciais
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

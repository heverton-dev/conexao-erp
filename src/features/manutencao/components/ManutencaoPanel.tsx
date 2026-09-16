import { useState } from "react";
import { getAllModules } from "~/registry";
import toast from "react-hot-toast";
import { Wrench, Power, CheckCircle2 } from "lucide-react";
import {
  useManutencoes,
  useSalvarManutencao,
  useDesativarManutencao,
} from "../hooks";
import type { Manutencao } from "../types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

const MENSAGEM_PADRAO =
  "Estamos em manutenção. Voltamos em breve. Agradecemos a compreensão.";

const ROTA_TODOS = "__modulo_inteiro__";

function fromLocalInput(v: string): string | null {
  if (!v) return null;
  return new Date(v).toISOString();
}

function formatarFim(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isAtiva(e: Manutencao): boolean {
  if (!e.ativo) return false;
  if (e.data_fim && new Date(e.data_fim).getTime() <= Date.now()) return false;
  return true;
}

export function ManutencaoPanel() {
  const { data: manutencoes = [], isLoading } = useManutencoes();

  const modulos = getAllModules();
  const [moduloKey, setModuloKey] = useState<string>(modulos[0]?.key ?? "");
  const [rota, setRota] = useState<string>(ROTA_TODOS);
  const [mensagem, setMensagem] = useState(MENSAGEM_PADRAO);
  const [dataFim, setDataFim] = useState("");
  const [encerrarId, setEncerrarId] = useState<string | null>(null);

  const salvar = useSalvarManutencao();
  const desativar = useDesativarManutencao();

  const moduloSelecionado = modulos.find((m) => m.key === moduloKey);

  const ativas = manutencoes.filter(isAtiva);

  function handleModuloChange(key: string) {
    setModuloKey(key);
    setRota(ROTA_TODOS);
  }

  function handleAtivar() {
    salvar.mutate(
      {
        modulo_key: moduloKey,
        rota: rota === ROTA_TODOS ? null : rota,
        mensagem,
        data_fim: fromLocalInput(dataFim),
      },
      {
        onSuccess: () => {
          setDataFim("");
          setMensagem(MENSAGEM_PADRAO);
          toast.success("Manutenção ativada com sucesso.");
        },
        onError: (e: any) => {
          toast.error(
            "Falha ao ativar manutenção: " +
              (e?.message ?? "erro desconhecido"),
          );
        },
      },
    );
  }

  function handleDesativar() {
    if (!encerrarId) return;
    desativar.mutate(encerrarId, {
      onSuccess: () => {
        setEncerrarId(null);
        toast.success("Manutenção encerrada.");
      },
      onError: (e: any) => {
        toast.error(
          "Falha ao encerrar manutenção: " +
            (e?.message ?? "erro desconhecido"),
        );
      },
    });
  }

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-lg font-bold text-text-main">
          <Wrench size={20} className="text-accent" /> Manutenção de Módulos
        </h1>
        <p className="text-xs text-text-muted">
          Ative a manutenção de um módulo ou rota. Usuários verão a mensagem
          configurada enquanto estiver ativa.
        </p>
      </div>

      {/* Formulário de ativação */}
      <div className="space-y-3 rounded-2xl border border-border-subtle bg-card p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">
              Módulo
            </label>
            <select
              value={moduloKey}
              onChange={(e) => handleModuloChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text-main outline-none focus:border-accent"
            >
              {modulos.map((mod) => (
                <option key={mod.key} value={mod.key}>
                  {mod.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">
              Rota (opcional)
            </label>
            <select
              value={rota}
              onChange={(e) => setRota(e.target.value)}
              className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text-main outline-none focus:border-accent"
            >
              <option value={ROTA_TODOS}>Módulo inteiro</option>
              {(moduloSelecionado?.routes ?? []).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">
            Mensagem exibida ao usuário
          </label>
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text-main outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-text-muted">
            Data/hora de término (opcional)
          </label>
          <input
            type="datetime-local"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-full rounded-lg border border-border bg-input-bg px-3 py-2 text-sm text-text-main outline-none focus:border-accent"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAtivar}
            disabled={salvar.isPending || !moduloKey}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60 transition-colors min-h-[40px]"
          >
            <Power size={15} />
            {salvar.isPending ? "Ativando..." : "Ativar manutenção"}
          </button>
        </div>
      </div>

      {/* Lista de manutenções ativas */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-text-main">
          Manutenções ativas
        </h2>
        {isLoading ? (
          <p className="py-4 text-center text-sm text-text-muted">Carregando...</p>
        ) : ativas.length === 0 ? (
          <p className="rounded-xl border border-border-subtle bg-input-bg/30 py-6 text-center text-sm text-text-muted">
            Nenhuma manutenção ativa.
          </p>
        ) : (
          <div className="space-y-2">
            {ativas.map((e) => {
              const mod = modulos.find((m) => m.key === e.modulo_key);
              const Icon = mod?.icon;
              return (
                <div
                  key={e.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {Icon && <Icon size={15} className="text-red-400" />}
                      <p className="text-sm font-semibold text-text-main">
                        {mod?.nome ?? e.modulo_key}
                      </p>
                      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-red-400">
                        {e.rota ? "Rota" : "Módulo"}
                      </span>
                    </div>
                    {e.rota && (
                      <p className="mt-0.5 text-xs text-text-muted">{e.rota}</p>
                    )}
                    <p className="mt-1 whitespace-pre-line text-xs text-text-secondary">
                      {e.mensagem}
                    </p>
                    {e.data_fim && (
                      <p className="mt-1 text-xs text-text-muted">
                        Retorno: {formatarFim(e.data_fim)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setEncerrarId(e.id)}
                    className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors min-h-[36px]"
                  >
                    Encerrar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog
        open={!!encerrarId}
        onOpenChange={(o) => !o && setEncerrarId(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-accent" /> Encerrar
              manutenção?
            </AlertDialogTitle>
            <AlertDialogDescription>
              O módulo/rota voltará a ficar acessível imediatamente para os
              usuários.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDesativar}
              className="bg-destructive"
            >
              Encerrar manutenção
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

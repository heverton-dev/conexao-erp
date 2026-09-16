import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "~/core/supabase";
import { sugerirTemperatura } from "~/features/crm/lib/comercial";
import toast from "react-hot-toast";
import {
  Loader2,
  Calendar,
  User,
  Handshake,
  Gauge,
  ArrowRight,
  Star,
  Flame,
  Snowflake,
  Thermometer,
} from "lucide-react";
import { cn } from "~/lib/utils";

type Props = {
  clienteId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

const today = () => new Date().toISOString().slice(0, 10);

export function NovaVisitaModal({ clienteId, open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    data_visita: today(),
    atendente: "",
    cargo_atendente: "Secretária" as "Secretária" | "Dentista" | "Outro",
    tipo_visita: "Prospecção" as "Prospecção" | "Relacionamento" | "Pós-venda",
    gerou_orcamento: false,
    gerou_pedido: false,
    valor_estimado: "",
    interesse_escala: 3,
    temperatura_vendedor: "Morno" as "Frio" | "Morno" | "Quente",
    probabilidade_fechamento: "" as "" | "Baixa" | "Média" | "Alta",
    feedback_cliente: "",
    observacoes_vendedor: "",
    data_proximo_contato: "",
    acao_prevista: "",
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((s) => {
      const next = { ...s, [k]: v };
      if (
        ["gerou_pedido", "gerou_orcamento", "interesse_escala"].includes(
          k as string,
        )
      ) {
        next.temperatura_vendedor = sugerirTemperatura({
          gerou_pedido: next.gerou_pedido,
          gerou_orcamento: next.gerou_orcamento,
          interesse_escala: Number(next.interesse_escala),
        });
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: visita, error } = await supabase
        .from("visitas")
        .insert({
          cliente_id: clienteId,
          data_visita: form.data_visita,
          atendente: form.atendente,
          cargo_atendente: form.cargo_atendente,
          tipo_visita: form.tipo_visita,
          gerou_orcamento: form.gerou_orcamento,
          gerou_pedido: form.gerou_pedido,
          valor_estimado: form.valor_estimado
            ? Number(form.valor_estimado)
            : null,
          interesse_escala: Number(form.interesse_escala),
          temperatura_vendedor: form.temperatura_vendedor,
          probabilidade_fechamento: form.probabilidade_fechamento || null,
          feedback_cliente: form.feedback_cliente || null,
          observacoes_vendedor: form.observacoes_vendedor || null,
          data_proximo_contato: form.data_proximo_contato || null,
          acao_prevista: form.acao_prevista || null,
          consultor_executor_id: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      toast.success("Visita registrada");
      qc.invalidateQueries({ queryKey: ["visitas", clienteId] });
      qc.invalidateQueries({ queryKey: ["carteira"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      onOpenChange(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const tempOptions: {
    value: "Frio" | "Morno" | "Quente";
    icon: typeof Flame;
    bg: string;
    border: string;
    text: string;
  }[] = [
    {
      value: "Frio",
      icon: Snowflake,
      bg: "from-[oklch(0.6_0.13_245/0.18)] to-transparent",
      border: "border-[oklch(0.6_0.13_245/0.6)]",
      text: "text-[oklch(0.78_0.13_245)]",
    },
    {
      value: "Morno",
      icon: Thermometer,
      bg: "from-[oklch(0.78_0.16_75/0.2)] to-transparent",
      border: "border-[oklch(0.78_0.16_75/0.6)]",
      text: "text-[oklch(0.86_0.16_75)]",
    },
    {
      value: "Quente",
      icon: Flame,
      bg: "from-[oklch(0.65_0.21_28/0.2)] to-transparent",
      border: "border-[oklch(0.65_0.21_28/0.6)]",
      text: "text-[oklch(0.75_0.21_28)]",
    },
  ];

  const probOptions: {
    value: "Baixa" | "Média" | "Alta";
    bg: string;
    border: string;
    text: string;
  }[] = [
    {
      value: "Baixa",
      bg: "from-[oklch(0.6_0.13_245/0.18)] to-transparent",
      border: "border-[oklch(0.6_0.13_245/0.6)]",
      text: "text-[oklch(0.78_0.13_245)]",
    },
    {
      value: "Média",
      bg: "from-[oklch(0.78_0.16_75/0.2)] to-transparent",
      border: "border-[oklch(0.78_0.16_75/0.6)]",
      text: "text-[oklch(0.86_0.16_75)]",
    },
    {
      value: "Alta",
      bg: "from-[oklch(0.65_0.21_28/0.2)] to-transparent",
      border: "border-[oklch(0.65_0.21_28/0.6)]",
      text: "text-[oklch(0.75_0.21_28)]",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl flex flex-col max-h-[85vh] overflow-hidden">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>Nova visita</DialogTitle>
              <DialogDescription>
                Registre o que aconteceu e defina os próximos passos com o cliente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 flex-1 min-h-0 overflow-y-auto space-y-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Section icon={Calendar} title="Dados da visita">
            <Field label="Data da visita">
              <Input
                type="date"
                required
                value={form.data_visita}
                onChange={(e) => update("data_visita", e.target.value)}
              />
            </Field>
            <Field label="Tipo de visita">
              <Select
                value={form.tipo_visita}
                onValueChange={(v) =>
                  update("tipo_visita", v as typeof form.tipo_visita)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Prospecção">Prospecção</SelectItem>
                  <SelectItem value="Relacionamento">Relacionamento</SelectItem>
                  <SelectItem value="Pós-venda">Pós-venda</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </Section>

          <Section icon={User} title="Pessoa atendida">
            <Field label="Nome do atendente">
              <Input
                required
                value={form.atendente}
                onChange={(e) => update("atendente", e.target.value)}
                placeholder="Ex: Marcia"
              />
            </Field>
            <Field label="Cargo">
              <Select
                value={form.cargo_atendente}
                onValueChange={(v) =>
                  update("cargo_atendente", v as typeof form.cargo_atendente)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Secretária">Secretária</SelectItem>
                  <SelectItem value="Dentista">Dentista</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </Section>

          <Section icon={Handshake} title="Negociação">
            <ToggleCard
              label="Gerou orçamento?"
              checked={form.gerou_orcamento}
              onChange={(v) => update("gerou_orcamento", v)}
            />
            <ToggleCard
              label="Pedido fechado?"
              checked={form.gerou_pedido}
              onChange={(v) => update("gerou_pedido", v)}
            />
            <Field label="Valor estimado (R$)">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.valor_estimado}
                onChange={(e) => update("valor_estimado", e.target.value)}
                placeholder="0,00"
              />
            </Field>
            <Field label="Escala de interesse">
              <StarRating
                value={Number(form.interesse_escala)}
                onChange={(v) => update("interesse_escala", v)}
              />
            </Field>
          </Section>

          <Section icon={Gauge} title="Avaliação">
            <Field
              label={`Temperatura (sugerido: ${form.temperatura_vendedor})`}
              full
            >
              <div className="grid grid-cols-3 gap-2">
                {tempOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = form.temperatura_vendedor === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update("temperatura_vendedor", opt.value)}
                      className={cn(
                        "flex items-center justify-center gap-2 min-h-10 rounded-lg border bg-gradient-to-br transition-all",
                        active
                          ? `${opt.border} ${opt.bg} ${opt.text} font-semibold shadow-sm`
                          : "border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-foreground/30",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {opt.value}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="Probabilidade de fechamento" full>
              <div className="grid grid-cols-3 gap-2">
                {probOptions.map((opt) => {
                  const active = form.probabilidade_fechamento === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        update(
                          "probabilidade_fechamento",
                          active
                            ? ""
                            : (opt.value as typeof form.probabilidade_fechamento),
                        )
                      }
                      className={cn(
                        "flex items-center justify-center gap-2 min-h-10 rounded-lg border bg-gradient-to-br transition-all",
                        active
                          ? `${opt.border} ${opt.bg} ${opt.text} font-semibold shadow-sm`
                          : "border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-foreground/30",
                      )}
                    >
                      {opt.value}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="Feedback do cliente" full>
              <Textarea
                rows={3}
                value={form.feedback_cliente}
                onChange={(e) => update("feedback_cliente", e.target.value)}
                placeholder="Objeções, comentários..."
              />
            </Field>
            <Field label="Observações internas" full>
              <Textarea
                rows={3}
                value={form.observacoes_vendedor}
                onChange={(e) => update("observacoes_vendedor", e.target.value)}
                placeholder="Contexto para a próxima visita..."
              />
            </Field>
          </Section>

          <Section icon={ArrowRight} title="Próximos passos" highlight>
            <Field label="Data do próximo contato">
              <Input
                type="date"
                value={form.data_proximo_contato}
                onChange={(e) => update("data_proximo_contato", e.target.value)}
              />
            </Field>
            <Field label="Ação prevista" full>
              <Textarea
                rows={3}
                value={form.acao_prevista}
                onChange={(e) => update("acao_prevista", e.target.value)}
                placeholder="Ex: Enviar catálogo por WhatsApp, agendar reunião com o dentista..."
              />
            </Field>
          </Section>

          <DialogFooter className="shrink-0">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Salvar visita"
              )}
            </button>
          </DialogFooter>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  icon: Icon,
  title,
  children,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border p-5 transition-colors",
        highlight
          ? "border-primary/40 bg-gradient-to-br from-primary/8 to-transparent shadow-[0_0_0_1px_oklch(0.745_0.115_80/0.15)]"
          : "border-border/60 bg-card/30 hover:border-border",
      )}
    >
      <div className="mb-4 flex items-center gap-3">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl ring-1",
            highlight
              ? "bg-primary text-primary-foreground ring-primary/40 shadow-md shadow-primary/20"
              : "bg-muted text-muted-foreground ring-border",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/80">
          {title}
        </h3>
        <div className="ml-2 h-px flex-1 bg-gradient-to-r from-border to-transparent" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function ToggleCard({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex items-center justify-between rounded-lg border px-3 min-h-10 py-2 transition-colors text-left cursor-pointer select-none",
        checked
          ? "border-primary/60 bg-primary/10"
          : "border-border bg-transparent hover:border-foreground/30",
      )}
    >
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const labels = ["Muito baixo", "Baixo", "Médio", "Alto", "Muito alto"];
  const display = hover || value;
  return (
    <div className="flex items-center gap-3 min-h-10">
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            className="p-0.5 transition-transform hover:scale-110"
            aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                "h-7 w-7 transition-colors",
                n <= display
                  ? "fill-primary text-primary"
                  : "text-muted-foreground/40",
              )}
            />
          </button>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {labels[display - 1]}
      </span>
    </div>
  );
}

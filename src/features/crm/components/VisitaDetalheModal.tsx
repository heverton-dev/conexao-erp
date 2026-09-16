import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";

import { formatBRL, formatDate } from "~/features/crm/lib/comercial";
import {
  Calendar,
  User,
  Handshake,
  Gauge,
  ArrowRight,
  Star,
  Flame,
  Snowflake,
  Thermometer,
  MessageSquare,
  StickyNote,
} from "lucide-react";
import { cn } from "~/lib/utils";

type Visita = {
  id: string;
  data_visita: string;
  tipo_visita: string;
  atendente: string;
  cargo_atendente: string;
  gerou_orcamento: boolean;
  gerou_pedido: boolean;
  valor_estimado: number | null;
  interesse_escala: number | null;
  temperatura_vendedor: "Frio" | "Morno" | "Quente";
  probabilidade_fechamento: string | null;
  feedback_cliente: string | null;
  observacoes_vendedor: string | null;
  data_proximo_contato: string | null;
  acao_prevista: string | null;
  executor?: { nome_completo: string } | null;
};

type Props = {
  visita: Visita | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export function VisitaDetalheModal({ visita, open, onOpenChange }: Props) {
  if (!visita) return null;

  const tempMeta = {
    Frio: {
      icon: Snowflake,
      color: "text-[oklch(0.78_0.13_245)]",
      bg: "bg-[oklch(0.6_0.13_245/0.15)] border-[oklch(0.6_0.13_245/0.5)]",
    },
    Morno: {
      icon: Thermometer,
      color: "text-[oklch(0.86_0.16_75)]",
      bg: "bg-[oklch(0.78_0.16_75/0.15)] border-[oklch(0.78_0.16_75/0.5)]",
    },
    Quente: {
      icon: Flame,
      color: "text-[oklch(0.75_0.21_28)]",
      bg: "bg-[oklch(0.65_0.21_28/0.15)] border-[oklch(0.65_0.21_28/0.5)]",
    },
  }[visita.temperatura_vendedor] ?? { icon: Thermometer, color: "", bg: "" };
  const TempIcon = tempMeta.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>Visita de {formatDate(visita.data_visita)}</DialogTitle>
              <DialogDescription>
                {visita.tipo_visita} · registrada por{" "}
                {visita.executor?.nome_completo ?? "—"}
              </DialogDescription>
            </div>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase w-fit",
              tempMeta.bg,
              tempMeta.color,
            )}
          >
            <TempIcon className="h-3.5 w-3.5" />
            {visita.temperatura_vendedor}
          </span>
        </DialogHeader>

        <div className="px-6 py-6 flex-1 space-y-4">
        <div className="space-y-5">
          <Section icon={User} title="Pessoa atendida">
            <Info label="Nome" value={visita.atendente} />
            <Info label="Cargo" value={visita.cargo_atendente} />
          </Section>

          <Section icon={Handshake} title="Negociação">
            <Info
              label="Gerou orçamento"
              value={visita.gerou_orcamento ? "Sim" : "Não"}
            />
            <Info
              label="Pedido fechado"
              value={visita.gerou_pedido ? "Sim" : "Não"}
            />
            <Info
              label="Valor estimado"
              value={
                <span className="text-primary font-semibold">
                  {formatBRL(visita.valor_estimado)}
                </span>
              }
            />
            <Info
              label="Interesse"
              value={
                <span className="inline-flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={cn(
                        "h-4 w-4",
                        n <= (visita.interesse_escala ?? 0)
                          ? "fill-primary text-primary"
                          : "text-muted-foreground/30",
                      )}
                    />
                  ))}
                </span>
              }
            />
          </Section>

          <Section icon={Gauge} title="Avaliação">
            <Info
              label="Probabilidade de fechamento"
              value={visita.probabilidade_fechamento ?? "—"}
              full
            />
            {visita.feedback_cliente && (
              <Block
                icon={MessageSquare}
                label="Feedback do cliente"
                text={visita.feedback_cliente}
              />
            )}
            {visita.observacoes_vendedor && (
              <Block
                icon={StickyNote}
                label="Observações internas"
                text={visita.observacoes_vendedor}
              />
            )}
          </Section>

          {(visita.data_proximo_contato || visita.acao_prevista) && (
            <Section icon={ArrowRight} title="Próximos passos" highlight>
              {visita.data_proximo_contato && (
                <Info
                  label="Data do próximo contato"
                  value={formatDate(visita.data_proximo_contato)}
                />
              )}
              {visita.acao_prevista && (
                <Block
                  icon={ArrowRight}
                  label="Ação prevista"
                  text={visita.acao_prevista}
                />
              )}
            </Section>
          )}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]"
          >
            Fechar
          </button>
        </DialogFooter>
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
        "rounded-2xl border p-5",
        highlight
          ? "border-primary/40 bg-gradient-to-br from-primary/8 to-transparent"
          : "border-border/60 bg-card/30",
      )}
    >
      <div className="mb-4 flex items-center gap-3">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl ring-1",
            highlight
              ? "bg-primary text-primary-foreground ring-primary/40"
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

function Info({
  label,
  value,
  full,
}: {
  label: string;
  value: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2 space-y-1" : "space-y-1"}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function Block({
  icon: Icon,
  label,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  text: string;
}) {
  return (
    <div className="sm:col-span-2 rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="text-sm text-foreground whitespace-pre-wrap">{text}</p>
    </div>
  );
}

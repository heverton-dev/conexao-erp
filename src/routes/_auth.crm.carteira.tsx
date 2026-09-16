import { createRoute, Link } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "~/core/supabase";
import { useAuth } from "~/lib/auth";
import { useState } from "react";
import { Plus, Loader2, UserPlus, User, Building2, Phone } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { formatBRL, type Temperatura } from "~/features/crm/lib/comercial";
import toast from "react-hot-toast";
import { RequirePermission } from "~/components/guards";

export const crmCarteiraRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/crm/carteira",
  component: () => (
    <RequirePermission modulo="crm" permissions={["crm_carteira"]}>
      <Carteira />
    </RequirePermission>
  ),
});

type ClienteCard = {
  id: string;
  nome_doutor: string;
  nome_clinica: string | null;
  ultima_temperatura: Temperatura | null;
  ultimo_valor: number | null;
  ultima_data: string | null;
  proxima_data: string | null;
  proxima_acao: string | null;
};

const COLUNAS: { key: Temperatura; label: string; color: string }[] = [
  { key: "Frio", label: "Frio", color: "text-[var(--color-frio)]" },
  { key: "Morno", label: "Morno", color: "text-[var(--color-morno)]" },
  { key: "Quente", label: "Quente", color: "text-[var(--color-quente)]" },
];

function Carteira() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["carteira", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: clientes } = await supabase
        .from("clientes")
        .select(
          `id, nome_doutor, nome_clinica,
           visitas:visitas(temperatura_vendedor, valor_estimado, data_visita, data_proximo_contato, acao_prevista)`,
        )
        .order("criado_em", { ascending: false });

      const cards: ClienteCard[] = (clientes ?? []).map((c: any) => {
        const ordered = (c.visitas ?? []).sort((a: any, b: any) =>
          a.data_visita < b.data_visita ? 1 : -1,
        );
        const last = ordered[0];
        return {
          id: c.id,
          nome_doutor: c.nome_doutor,
          nome_clinica: c.nome_clinica,
          ultima_temperatura: last?.temperatura_vendedor ?? null,
          ultimo_valor: last?.valor_estimado ?? null,
          ultima_data: last?.data_visita ?? null,
          proxima_data: last?.data_proximo_contato ?? null,
          proxima_acao: last?.acao_prevista ?? null,
        };
      });
      return cards;
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Minha Carteira</h1>
          <p className="text-sm text-muted-foreground">
            {data?.length ?? 0} cliente(s) na sua base
          </p>
        </div>
        <NovoClienteButton />
      </header>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUNAS.map((col) => {
            const items = (data ?? []).filter(
              (c) => (c.ultima_temperatura ?? "Frio") === col.key,
            );
            return (
              <div key={col.key} className="glass rounded-2xl p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className={`text-sm font-bold uppercase ${col.color}`}>
                    {col.label}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Nenhum cliente.
                    </p>
                  )}
                  {items.map((c) => (
                    <Link
                      key={c.id}
                      to="/crm/cliente/$id"
                      params={{ id: c.id }}
                      className="block rounded-xl border border-border bg-secondary/30 p-3 transition hover:border-primary/40 hover:bg-secondary/50"
                    >
                      <p className="font-medium text-sm">{c.nome_doutor}</p>
                      {c.nome_clinica && (
                        <p className="text-xs text-muted-foreground">
                          {c.nome_clinica}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-gold font-semibold">
                          {formatBRL(c.ultimo_valor)}
                        </span>
                        <span className="text-muted-foreground">
                          {c.ultima_data
                            ? new Date(c.ultima_data).toLocaleDateString(
                                "pt-BR",
                              )
                            : "—"}
                        </span>
                      </div>
                      {c.proxima_data && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Próx:{" "}
                          {new Date(c.proxima_data).toLocaleDateString("pt-BR")}{" "}
                          · {c.proxima_acao}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NovoClienteButton() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    nome_doutor: "",
    nome_clinica: "",
    telefone_contato: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.from("clientes").insert({
        nome_doutor: form.nome_doutor,
        nome_clinica: form.nome_clinica || null,
        telefone_contato: form.telefone_contato || null,
        consultor_atual_id: user?.id,
      }).select().single();
      if (error) throw error;
      toast.success("Cliente adicionado");
      setForm({ nome_doutor: "", nome_clinica: "", telefone_contato: "" });
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["carteira"] });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" /> Novo cliente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>Novo cliente</DialogTitle>
              <DialogDescription>Adicione um doutor ou clínica à sua carteira.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={submit} className="px-6 py-6 flex-1 space-y-4">
          <FieldRow icon={User} label="Nome do doutor(a)" required>
            <Input
              required
              value={form.nome_doutor}
              onChange={(e) =>
                setForm({ ...form, nome_doutor: e.target.value })
              }
              placeholder="Dr. João Silva"
            />
          </FieldRow>
          <FieldRow icon={Building2} label="Clínica (opcional)">
            <Input
              value={form.nome_clinica}
              onChange={(e) =>
                setForm({ ...form, nome_clinica: e.target.value })
              }
              placeholder="Clínica Sorriso"
            />
          </FieldRow>
          <FieldRow icon={Phone} label="Telefone">
            <Input
              value={form.telefone_contato}
              onChange={(e) =>
                setForm({ ...form, telefone_contato: e.target.value })
              }
              placeholder="(11) 99999-9999"
            />
          </FieldRow>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setOpen(false)}
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
                "Adicionar cliente"
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldRow({
  icon: Icon,
  label,
  required,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        <Icon className="h-3.5 w-3.5" />
        {label}
        {required && <span className="text-primary">*</span>}
      </Label>
      {children}
    </div>
  );
}

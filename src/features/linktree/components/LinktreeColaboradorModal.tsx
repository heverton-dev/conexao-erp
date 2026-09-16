import { useEffect, useState } from "react";
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
import { Loader2, Upload, UserPlus, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "~/core/supabase";
import { useAuth } from "~/core/auth";
import { compressImage } from "~/features/linktree/lib/image-utils";
import { criarColaborador, atualizarColaborador } from "~/features/linktree/index";
import type { LinktreeColaborador } from "~/features/linktree/types";
import {
  decodeTelefone,
  encodePhone,
  encodeTelefone,
  type PhoneParts,
  type TelefoneKind,
} from "~/features/linktree/types";

interface CredencialOption {
  id: string;
  nome_completo: string;
  email_corporativo: string;
  whatsapp_corporativo: string | null;
  departamento: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  collaborator: LinktreeColaborador | null;
  onSaved: () => void;
  empresaId: string | null;
}

const EMPTY_PHONE: PhoneParts = { ddi: "55", ddd: "", number: "" };

export function LinktreeColaboradorModal({
  open,
  onOpenChange,
  collaborator,
  onSaved,
  empresaId,
}: Props) {
  const { user } = useAuth();
  const editing = !!collaborator;
  const [credenciais, setCredenciais] = useState<CredencialOption[]>([]);
  const [selectedCredencialId, setSelectedCredencialId] = useState<string>("");
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [email, setEmail] = useState("");
  const [foto, setFoto] = useState<string | null>("");
  const [whats, setWhats] = useState<PhoneParts>(EMPTY_PHONE);
  const [telKind, setTelKind] = useState<TelefoneKind>("fixo");
  const [telFixo, setTelFixo] = useState<PhoneParts>(EMPTY_PHONE);
  const [ramal, setRamal] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing && collaborator) {
      setSelectedCredencialId(collaborator.credencial_id ?? "");
      setNome(collaborator.nome);
      setCargo(collaborator.cargo);
      setEmail(collaborator.email);
      setFoto(collaborator.foto_url ?? "");
      if (collaborator.whatsapp) {
        const d = collaborator.whatsapp.replace(/\D/g, "");
        setWhats({
          ddi: d.slice(0, 2) || "55",
          ddd: d.slice(2, 4),
          number: d.slice(4),
        });
      }
      const t = decodeTelefone(collaborator.telefone_fixo ?? "");
      setTelKind(t.kind);
      setTelFixo({
        ddi: t.phone.ddi || "55",
        ddd: t.phone.ddd,
        number: t.phone.number,
      });
      setRamal(t.ramal);
    } else {
      setSelectedCredencialId("");
      setNome("");
      setCargo("");
      setEmail("");
      setFoto("");
      setWhats(EMPTY_PHONE);
      setTelKind("fixo");
      setTelFixo(EMPTY_PHONE);
      setRamal("");
    }
  }, [open, collaborator]);

  useEffect(() => {
    if (!open) return;

    async function loadCredenciais() {
      // Busca credenciais da empresa
      let q = supabase
        .from("credenciais")
        .select(
          "id, nome_completo, email_corporativo, whatsapp_corporativo, departamento",
        )
        .eq("ativo", true);
      if (empresaId) q = q.eq("empresa_id", empresaId);
      const { data: allCreds } = await q.order("nome_completo");

      // Busca credenciais já vinculadas a outros colaboradores
      const { data: linked } = await supabase
        .from("linktree_colaboradores")
        .select("credencial_id")
        .not("credencial_id", "is", null);

      const usedIds = new Set((linked ?? []).map((r: any) => r.credencial_id));
      // Permite a credencial do próprio colaborador sendo editado
      if (collaborator?.credencial_id)
        usedIds.delete(collaborator.credencial_id);

      setCredenciais((allCreds ?? []).filter((c: any) => !usedIds.has(c.id)));
    }

    loadCredenciais();
  }, [open, empresaId, collaborator?.credencial_id]);

  function handleCredencialSelect(credId: string) {
    setSelectedCredencialId(credId);
    const c = credenciais.find((x) => x.id === credId);
    if (c) {
      setNome(c.nome_completo);
      setEmail(c.email_corporativo);
      if (c.whatsapp_corporativo) {
        const d = c.whatsapp_corporativo.replace(/\D/g, "");
        setWhats({
          ddi: d.slice(0, 2) || "55",
          ddd: d.slice(2, 4),
          number: d.slice(4),
        });
      }
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      toast.error("Imagem muito grande (max 8MB)");
      return;
    }
    try {
      setFoto(await compressImage(f, 480, 0.82));
    } catch {
      toast.error("Falha ao processar imagem");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("Nome obrigatorio");
      return;
    }
    if (!cargo.trim()) {
      toast.error("Cargo obrigatorio");
      return;
    }
    if (!email.trim()) {
      toast.error("Email obrigatorio");
      return;
    }
    if (!whats.ddd || !whats.number) {
      toast.error("Informe DDD e numero do WhatsApp");
      return;
    }
    if (telKind === "ramal" && !ramal) {
      toast.error("Informe o ramal");
      return;
    }

    setSaving(true);
    const payload = {
      nome: nome.trim(),
      cargo: cargo.trim(),
      email: email.trim(),
      whatsapp: encodePhone(whats),
      telefone_fixo:
        encodeTelefone({ kind: telKind, phone: telFixo, ramal }) || null,
      foto_url: foto || null,
      credencial_id: selectedCredencialId || undefined,
      empresa_id: empresaId || undefined,
      created_by: user?.id,
    };

    try {
      if (editing) {
        await atualizarColaborador(collaborator!.id, payload);
      } else {
        await criarColaborador(payload as any);
      }
    } catch (e: any) {
      setSaving(false);
      toast.error(`Erro: ${e.message}`);
      return;
    }

    setSaving(false);
    toast.success(
      editing ? "Colaborador atualizado" : "LinkTree criado com sucesso",
    );
    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              {editing ? <Pencil className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
            </div>
            <div>
              <DialogTitle>
                {editing ? "Editar LinkTree" : "Novo LinkTree"}
              </DialogTitle>
              <DialogDescription>
                {editing ? "Atualize os dados do colaborador" : "Preencha os dados para criar um novo LinkTree"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 flex-1 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editing && (
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                Credencial (opcional)
              </Label>
              <select
                value={selectedCredencialId}
                onChange={(e) => handleCredencialSelect(e.target.value)}
                className="h-11 w-full rounded-md border border-border/70 bg-surface/60 px-3.5 py-2 text-base md:text-sm"
              >
                <option value="">Selecionar credencial existente...</option>
                {credenciais.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome_completo} — {c.email_corporativo}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Selecione uma credencial para preencher dados automaticamente
              </p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-border bg-surface-hover">
              {foto ? (
                <img
                  src={foto}
                  alt="Preview"
                  className="size-full object-cover"
                />
              ) : (
                <Upload className="size-6 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Label className="mb-1 block">Foto</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-surface-hover file:px-3 file:py-2 file:text-sm file:text-text-main file:cursor-pointer"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                JPG/PNG ate 8MB
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nome completo">
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </Field>
            <Field label="Cargo">
              <Input
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                required
                placeholder="Ex: Consultor Comercial"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="E-mail institucional">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-border p-3">
            <Label className="text-sm font-semibold">WhatsApp</Label>
            <PhoneFields value={whats} onChange={setWhats} />
          </div>

          <div className="space-y-3 rounded-xl border border-border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-sm font-semibold">Telefone</Label>
              <div className="inline-flex rounded-lg bg-surface-hover p-1">
                <KindBtn
                  active={telKind === "fixo"}
                  onClick={() => setTelKind("fixo")}
                >
                  Telefone fixo
                </KindBtn>
                <KindBtn
                  active={telKind === "ramal"}
                  onClick={() => setTelKind("ramal")}
                >
                  Ramal
                </KindBtn>
              </div>
            </div>
            {telKind === "fixo" ? (
              <PhoneFields value={telFixo} onChange={setTelFixo} />
            ) : (
              <Field label="Numero do ramal">
                <Input
                  inputMode="numeric"
                  placeholder="Ex: 1234"
                  value={ramal}
                  onChange={(e) =>
                    setRamal(e.target.value.replace(/\D/g, "").slice(0, 8))
                  }
                />
              </Field>
            )}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : editing ? (
                "Salvar"
              ) : (
                "Criar LinkTree"
              )}
            </button>
          </DialogFooter>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PhoneFields({
  value,
  onChange,
}: {
  value: PhoneParts;
  onChange: (v: PhoneParts) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        className="w-16"
        placeholder="DDI"
        inputMode="numeric"
        value={value.ddi}
        onChange={(e) =>
          onChange({ ...value, ddi: e.target.value.replace(/\D/g, "").slice(0, 3) })
        }
      />
      <Input
        className="w-16"
        placeholder="DDD"
        inputMode="numeric"
        value={value.ddd}
        onChange={(e) =>
          onChange({ ...value, ddd: e.target.value.replace(/\D/g, "").slice(0, 2) })
        }
      />
      <Input
        className="flex-1"
        placeholder="Numero"
        inputMode="numeric"
        value={value.number}
        onChange={(e) =>
          onChange({
            ...value,
            number: e.target.value.replace(/\D/g, "").slice(0, 11),
          })
        }
      />
    </div>
  );
}

function KindBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1 text-xs font-medium transition ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-text-main"}`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

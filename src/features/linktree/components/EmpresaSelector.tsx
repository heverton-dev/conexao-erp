import { useEffect, useState } from "react";
import { supabase } from "~/core/supabase";
import { Label } from "~/components/ui/label";

interface Empresa {
  id: string;
  nome: string;
}

interface Props {
  value: string | null;
  onChange: (empresaId: string) => void;
}

export function EmpresaSelector({ value, onChange }: Props) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("empresas")
        .select("id, nome")
        .order("nome");
      setEmpresas(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading)
    return (
      <p className="text-sm text-muted-foreground">Carregando empresas...</p>
    );

  return (
    <div className="space-y-1.5">
      <Label>Empresa</Label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-border bg-surface-hover px-2 text-sm"
      >
        <option value="">Selecione uma empresa</option>
        {empresas.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {emp.nome}
          </option>
        ))}
      </select>
    </div>
  );
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { Empresa } from "~/shared/empresas";

interface Props {
  empresas: Empresa[];
  value: string;
  onChange: (value: string) => void;
}

export function EmpresaSuperAdminSelector({
  empresas,
  value,
  onChange,
}: Props) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-text-muted whitespace-nowrap">
        Empresa:
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full max-w-xs">
          <SelectValue placeholder="Selecione a empresa" />
        </SelectTrigger>
        <SelectContent>
          {empresas.map((e) => (
            <SelectItem key={e.id} value={e.id}>
              {e.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { EMPRESA_ID } from "~/config/empresa";
import { listarPerguntas } from "../services/form.service";
import {
  atualizarVisita,
  buscarVisitaPorCliente,
} from "../services/trajetos.service";
import { atualizarStatusClienteRota } from "../services/rotas.service";
import type { RotasFormPergunta, FormPerguntaTipo } from "../types";
import toast from "react-hot-toast";

type Props = {
  rotaClienteId: string;
  onDone: () => void;
};

export function FormularioPosVisita({ rotaClienteId, onDone }: Props) {
  const [perguntas, setPerguntas] = useState<RotasFormPergunta[]>([]);
  const [respostas, setRespostas] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await listarPerguntas(EMPRESA_ID);
        setPerguntas(data);
      } catch (err) {
        console.error("Erro ao carregar perguntas:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function updateResposta(perguntaId: string, valor: unknown) {
    setRespostas((prev) => ({ ...prev, [perguntaId]: valor }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validar perguntas obrigatórias
    for (const pergunta of perguntas) {
      if (pergunta.obrigatorio && !respostas[pergunta.id]) {
        toast.error(`Preencha a pergunta: ${pergunta.titulo}`);
        return;
      }
    }

    setSaving(true);
    try {
      // Buscar a visita associada ao cliente da rota
      const visita = await buscarVisitaPorCliente(rotaClienteId);
      if (visita) {
        await atualizarVisita(visita.id, {
          data_fim: new Date().toISOString(),
          duracao_minutos: Math.round(
            (new Date().getTime() - new Date(visita.data_inicio).getTime()) /
              60000,
          ),
          formulario: respostas,
        });
      }

      // Atualizar status do cliente na rota
      await atualizarStatusClienteRota(rotaClienteId, "visitado");

      toast.success("Visita finalizada com sucesso!");
      onDone();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (perguntas.length === 0) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Finalizar Visita</DialogTitle>
        </DialogHeader>
        <div className="py-6 text-center text-muted-foreground">
          <p>Nenhuma pergunta configurada pelo administrador.</p>
          <p className="text-sm mt-2">
            A visita será finalizada sem formulário.
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onDone}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Finalizar
          </Button>
        </DialogFooter>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Formulário Pós-Visita</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6 py-4">
        {perguntas.map((pergunta) => (
          <div key={pergunta.id} className="space-y-2">
            <Label>
              {pergunta.titulo}
              {pergunta.obrigatorio && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <PerguntaInput
              tipo={pergunta.tipo}
              opcoes={pergunta.opcoes}
              valor={respostas[pergunta.id]}
              onChange={(v) => updateResposta(pergunta.id, v)}
            />
          </div>
        ))}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Salvar e Finalizar
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

function PerguntaInput({
  tipo,
  opcoes,
  valor,
  onChange,
}: {
  tipo: FormPerguntaTipo;
  opcoes: string[];
  valor: unknown;
  onChange: (v: unknown) => void;
}) {
  switch (tipo) {
    case "texto_curto":
      return (
        <Input
          value={(valor as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Resposta curta..."
        />
      );

    case "texto_longo":
      return (
        <Textarea
          value={(valor as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Resposta detalhada..."
          rows={3}
        />
      );

    case "data":
      return (
        <Input
          type="date"
          value={(valor as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "selecao":
      return (
        <Select value={(valor as string) ?? ""} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {opcoes.map((opcao) => (
              <SelectItem key={opcao} value={opcao}>
                {opcao}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "radio":
      return (
        <RadioGroup value={(valor as string) ?? ""} onValueChange={onChange}>
          {opcoes.map((opcao) => (
            <div key={opcao} className="flex items-center space-x-2">
              <RadioGroupItem value={opcao} id={opcao} />
              <Label htmlFor={opcao} className="font-normal">
                {opcao}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );

    case "multipla_escolha":
      return (
        <div className="space-y-2">
          {opcoes.map((opcao) => {
            const selected = Array.isArray(valor)
              ? valor.includes(opcao)
              : false;
            return (
              <label
                key={opcao}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <Checkbox
                  checked={selected}
                  onCheckedChange={(checked) => {
                    const current = Array.isArray(valor) ? valor : [];
                    if (checked) {
                      onChange([...current, opcao]);
                    } else {
                      onChange(current.filter((v: string) => v !== opcao));
                    }
                  }}
                />
                <span className="font-normal">{opcao}</span>
              </label>
            );
          })}
        </div>
      );

    default:
      return <Input placeholder="Tipo de pergunta não suportado" disabled />;
  }
}

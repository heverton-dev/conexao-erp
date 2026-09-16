import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { buscarConfig, criarOuAtualizarConfig } from "../../services/config.service";
import type { Frequencia } from "../../types";

const FREQUENCIA_LABEL: Record<string, string> = {
  mensal: "Mensal",
  quinzenal: "Quinzenal",
  semanal: "Semanal",
};

export function ConfigForm({ empresaId }: { empresaId: string }) {
  const [frequencia, setFrequencia] = useState<Frequencia>("mensal");
  const [diaEnvio, setDiaEnvio] = useState(5);
  const [diasAviso, setDiasAviso] = useState(3);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!empresaId) return;
    setLoading(true);
    buscarConfig()
      .then((data) => {
        if (data) {
          setFrequencia(data.frequencia as Frequencia);
          setDiaEnvio(data.dia_envio ?? 5);
          setDiasAviso(data.dias_aviso ?? 3);
        }
      })
      .finally(() => setLoading(false));
  }, [empresaId]);

  async function handleSave() {
    if (!empresaId) return;
    setSaving(true);
    setSaved(false);

    await criarOuAtualizarConfig({
      frequencia,
      dia_envio: diaEnvio,
      dias_aviso: diasAviso,
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading)
    return <div className="text-text-muted text-sm py-4">Carregando...</div>;

  return (
    <div className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label>Frequência dos períodos</Label>
        <div className="flex gap-2">
          {(["mensal", "quinzenal", "semanal"] as Frequencia[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFrequencia(f)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                frequencia === f
                  ? "bg-accent/10 text-accent border-accent/20"
                  : "bg-input-bg text-text-muted border-border hover:text-text-main"
              }`}
            >
              {FREQUENCIA_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="diaEnvio">Dias após o fim do período para envio</Label>
        <Input
          id="diaEnvio"
          type="number"
          min={1}
          max={60}
          value={diaEnvio}
          onChange={(e) => setDiaEnvio(Number(e.target.value))}
        />
        <p className="text-xs text-text-muted">
          Exemplo: Se o período termina em 31/jan e o limite é 5 dias, o
          colaborador pode enviar até 5/fev.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="diasAviso">Dias de aviso prévio antes do prazo</Label>
        <Input
          id="diasAviso"
          type="number"
          min={0}
          max={30}
          value={diasAviso}
          onChange={(e) => setDiasAviso(Number(e.target.value))}
        />
        <p className="text-xs text-text-muted">
          Quantos dias antes do prazo final o sistema começa a alertar o
          colaborador.
        </p>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving || !empresaId}
        className="gap-1.5"
      >
        <Save size={16} />
        {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar configuração"}
      </Button>
    </div>
  );
}

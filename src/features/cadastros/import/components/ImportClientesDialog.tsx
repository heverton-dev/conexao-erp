import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Upload, Download, Loader2, CheckCircle } from "lucide-react";
import { parseClienteCsv, generateClienteTemplate } from "../engine/parser";
import { validateClienteRows } from "../engine/validator";
import { useImportClientes } from "../hooks/useImportClientes";
import type { ClienteCsvRow, ClienteValidation } from "../types";

interface ImportClientesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportClientesDialog({ open, onOpenChange }: ImportClientesDialogProps) {
  const [step, setStep] = useState<"upload" | "preview" | "result">("upload");
  const [parsedData, setParsedData] = useState<{
    headers: string[];
    rows: ClienteCsvRow[];
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState<ClienteValidation[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync, isPending } = useImportClientes();
  const [result, setResult] = useState<{ inserted: number; errors: string[] } | null>(null);

  function handleDownloadTemplate() {
    const csv = generateClienteTemplate();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "template_clientes.csv";
    link.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const { headers, rows } = parseClienteCsv(text);
    setParsedData({ headers, rows });

    const errors = validateClienteRows(rows, headers);
    setValidationErrors(errors);

    const hasBlockingErrors = errors.some((e) => e.severity === "error");
    if (!hasBlockingErrors) {
      setStep("preview");
    }
  }

  async function handleImport() {
    if (!parsedData) return;
    const importResult = await mutateAsync(parsedData.rows);
    setResult(importResult);
    setStep("result");
  }

  function handleClose() {
    setStep("upload");
    setParsedData(null);
    setValidationErrors([]);
    setResult(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0f172a] border-[var(--color-border-subtle)] text-white flex flex-col max-h-[85vh] overflow-hidden max-w-2xl min-h-[500px]">
        <DialogHeader className="shrink-0">
          <DialogTitle>Importar Clientes via CSV</DialogTitle>
          <DialogDescription className="text-slate-400">
            Importe uma lista de clientes a partir de um arquivo CSV.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 flex-1 min-h-0 overflow-y-auto flex items-center justify-center">
          <div className="w-full space-y-4">
            {step === "upload" && (
              <>
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" onClick={handleDownloadTemplate} className="h-11 px-6">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Template
                  </Button>
                  <Button onClick={() => fileInputRef.current?.click()} className="h-11 px-6">
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar CSV
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {validationErrors.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-400 font-medium mb-2">Erros encontrados:</p>
                    <ul className="text-sm text-red-300 space-y-1">
                      {validationErrors.slice(0, 5).map((err, i) => (
                        <li key={i}>
                          Linha {err.rowIndex}: {err.message}
                        </li>
                      ))}
                      {validationErrors.length > 5 && (
                        <li>... e mais {validationErrors.length - 5} erros</li>
                      )}
                    </ul>
                  </div>
                )}
              </>
            )}

            {step === "preview" && parsedData && (
              <>
                <p className="text-sm text-slate-400 text-center">
                  {parsedData.rows.length} cliente(s) encontrado(s) para importação.
                </p>
                <div className="max-h-80 overflow-y-auto border border-slate-700 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800 sticky top-0">
                      <tr>
                        <th className="p-3 text-left">Nome</th>
                        <th className="p-3 text-left">Tipo</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Telefone</th>
                        <th className="p-3 text-left">WhatsApp</th>
                        <th className="p-3 text-left">Cidade</th>
                        <th className="p-3 text-left">UF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.rows.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-t border-slate-700">
                          <td className="p-3">{row.nome}</td>
                          <td className="p-3 text-slate-400">{row.tipo_pessoa || "-"}</td>
                          <td className="p-3 text-slate-400">{row.email || "-"}</td>
                          <td className="p-3 text-slate-400">{row.telefone || "-"}</td>
                          <td className="p-3 text-slate-400">{row.whatsapp || "-"}</td>
                          <td className="p-3 text-slate-400">{row.cidade || "-"}</td>
                          <td className="p-3 text-slate-400">{row.estado || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedData.rows.length > 10 && (
                  <p className="text-xs text-slate-500 text-center">
                    Mostrando 10 de {parsedData.rows.length} registros
                  </p>
                )}
              </>
            )}

            {step === "result" && result && (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <div className="flex items-center gap-3 text-green-400">
                  <CheckCircle className="h-6 w-6" />
                  <span className="text-lg">{result.inserted} cliente(s) importado(s) com sucesso!</span>
                </div>
                {result.errors.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 w-full">
                    <p className="text-red-400 font-medium">Erros:</p>
                    <ul className="text-sm text-red-300 mt-2 space-y-1">
                      {result.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={handleClose}>
            {step === "result" ? "Fechar" : "Cancelar"}
          </Button>
          {step === "preview" && (
            <Button onClick={handleImport} disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Importar {parsedData?.rows.length} cliente(s)
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

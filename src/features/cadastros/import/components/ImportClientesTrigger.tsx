import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Upload } from "lucide-react";
import { ImportClientesDialog } from "./ImportClientesDialog";

export function ImportClientesTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4 mr-2" />
        Importar CSV
      </Button>
      <ImportClientesDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

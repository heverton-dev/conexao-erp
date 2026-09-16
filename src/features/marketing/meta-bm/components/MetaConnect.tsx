import { useState, useEffect } from "react";
import { Facebook, Link2, Link2Off, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "~/lib/auth";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { verificarConexao, desconectar } from "../services/auth.service";
import { EMPRESA_ID } from "~/config/empresa";
export function MetaConnect() {
  const { profile } = useAuth();
  const [conectado, setConectado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!EMPRESA_ID) {
      setCarregando(false);
      return;
    }
    verificarConexao(EMPRESA_ID)
      .then((conta) => setConectado(!!conta))
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, [EMPRESA_ID]);

  async function handleDesconectar() {
    if (!EMPRESA_ID) return;
    setCarregando(true);
    const ok = await desconectar(EMPRESA_ID);
    if (ok) {
      setConectado(false);
      toast.success("Desconectado do Meta Business Manager");
    } else {
      toast.error("Erro ao desconectar");
    }
    setCarregando(false);
  }

  if (carregando) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
        </CardContent>
      </Card>
    );
  }

  if (conectado) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-2">
            <Link2 className="w-6 h-6 text-green-500" />
          </div>
          <CardTitle>Conectado ao Meta</CardTitle>
          <CardDescription>
            Sua conta está vinculada ao Meta Business Manager
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-6">
          <Button variant="destructive" onClick={handleDesconectar}>
            <Link2Off className="w-4 h-4" />
            Desconectar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-surface mb-2">
          <Facebook className="w-6 h-6 text-blue-500" />
        </div>
        <CardTitle>Conectar com Meta</CardTitle>
        <CardDescription>
          Vincule sua conta do Meta Business Manager para gerenciar campanhas e
          posts
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-6">
        <Button>
          <Facebook className="w-4 h-4" />
          Conectar com Meta
        </Button>
      </CardContent>
    </Card>
  );
}

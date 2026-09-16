import { useState } from "react";
import { Trash2, UserPlus, Users, Mail, Shield } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  usePermissoesFunil,
  useConcederPermissao,
  useRevogarPermissao,
} from "../hooks/useFunisData";
import { buscarUsuarioEmail } from "../services";
import type { FunilPermissaoNivel } from "../types";
import { Badge } from "~/components/ui/badge";

type ShareModalProps = {
  funilId: string;
  onClose: () => void;
};

export function ShareModal({ funilId, onClose }: ShareModalProps) {
  const { data: permissoes } = usePermissoesFunil(funilId);
  const conceder = useConcederPermissao();
  const revogar = useRevogarPermissao();
  const [email, setEmail] = useState("");
  const [nivel, setNivel] = useState<FunilPermissaoNivel>("view");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    if (!email.trim()) return;
    setSearching(true);
    setError("");
    try {
      const user = await buscarUsuarioEmail(email.trim());
      setSearching(false);
      if (!user) {
        setError("Usuário não encontrado.");
        return;
      }
      await conceder.mutateAsync({ funilId, userId: user.id, nivel });
      setEmail("");
    } catch (e: any) {
      setSearching(false);
      setError("Erro ao buscar usuário.");
    }
  };

  const handleRevoke = async (id: string) => {
    await revogar.mutateAsync(id);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card max-h-[90dvh] overflow-hidden flex flex-col max-w-md">
        <DialogHeader className="bg-gradient-to-br from-accent/20 via-accent/10 to-transparent px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>Compartilhar Funil</DialogTitle>
              <DialogDescription>Convide membros por e-mail para colaborar no seu funil.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 flex-1 space-y-5">
          {/* Adicionar Colaborador */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
              Adicionar Colaborador
            </label>

            {/* Linha 1: Input de e-mail (w-full) */}
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="E-mail do colaborador"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="pl-9 h-10 w-full text-sm"
              />
            </div>

            {/* Linha 2: Escolha de nível + Botão Adicionar */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              {/* Seletores de Nível (Visualizar ou Editar) */}
              <div className="flex gap-1 bg-muted/40 p-1 rounded-lg border border-border/20 flex-1">
                <button
                  type="button"
                  onClick={() => setNivel("view")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                    nivel === "view"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  Visualizar
                </button>
                <button
                  type="button"
                  onClick={() => setNivel("edit")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                    nivel === "edit"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  Editar
                </button>
              </div>

              {/* Botão Adicionar */}
              <Button
                onClick={handleAdd}
                size="sm"
                className="h-10 px-4 sm:w-auto shrink-0 gradient-gold text-[#0f172a] font-semibold text-xs flex items-center justify-center gap-1.5"
                disabled={searching || !email.trim()}
              >
                {searching ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <UserPlus className="w-3.5 h-3.5" />
                )}
                Adicionar
              </Button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          {/* Lista de Permissões */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
              Colaboradores atuais
            </label>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {permissoes && permissoes.length > 0 ? (
                permissoes.map((p) => {
                  const userName = (p as any).user?.full_name || "Membro";
                  const userEmail = (p as any).user?.email || "";
                  const initials = userName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-surface/20 hover:bg-surface/30 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
                          {initials || <Users className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate text-foreground">
                            {userName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {userEmail}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="secondary"
                          className="gap-1 px-1.5 py-0.5 text-[10px] bg-muted/65 hover:bg-muted/65"
                        >
                          <Shield className="h-2.5 w-2.5 text-muted-foreground" />
                          {p.nivel === "edit" ? "Editor" : "Leitor"}
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost-destructive"
                          onClick={() => handleRevoke(p.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 border border-dashed border-border/40 rounded-lg bg-surface/5">
                  <Users className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Este funil ainda não é compartilhado.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 pt-4 border-t border-border/50 gap-3">
          <button type="button" onClick={onClose} className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">
            Fechar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

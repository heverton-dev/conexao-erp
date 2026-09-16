import { useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  useNotificacoes,
  useContarNaoLidas,
  useMarcarNotificacaoLida,
  useMarcarTodasLidas,
} from "../hooks/useNotifications";
import { useNavigate } from "@tanstack/react-router";

export function NotificationsDropdown() {
  const navigate = useNavigate();
  const { data: notificacoes = [] } = useNotificacoes(20);
  const { data: count = 0 } = useContarNaoLidas();
  const marcarLida = useMarcarNotificacaoLida();
  const marcarTodas = useMarcarTodasLidas();
  const [open, setOpen] = useState(false);

  const handleClick = async (notif: any) => {
    if (!notif.lida) {
      await marcarLida.mutateAsync(notif.id);
    }
    if (notif.link) {
      navigate({ to: notif.link });
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[9px] flex items-center justify-center"
            >
              {count > 9 ? "9+" : count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <span className="text-sm font-semibold">Notificações</span>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => marcarTodas.mutate()}
              className="text-xs h-7"
            >
              <CheckCheck className="h-3 w-3 mr-1" /> Marcar todas
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notificacoes.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                Nenhuma notificação
              </p>
            </div>
          ) : (
            notificacoes.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`w-full text-left px-4 py-3 hover:bg-surface/50 transition-colors border-b border-border/20 ${
                  !notif.lida ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  {!notif.lida && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {notif.titulo}
                    </p>
                    {notif.mensagem && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notif.mensagem}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {getTimeAgo(notif.created_at)}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}min atrás`;
  if (diffHour < 24) return `${diffHour}h atrás`;
  if (diffDay < 7) return `${diffDay}d atrás`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

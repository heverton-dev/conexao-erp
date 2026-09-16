import { useState, useEffect } from "react";
import { useAuth } from "~/lib/auth";
import { LogOut, MonitorX } from "lucide-react";

export function DeviceGate({ children }: { children: React.ReactNode }) {
  const { profile, logout } = useAuth();
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    function checkDevice() {
      // Regra: apenas TECNOLOGIA bloqueado se width < 1024px (Tablet Vertical / Mobile)
      if (profile?.ambiente === "tecnologia") {
        if (window.innerWidth < 1024) {
          setIsBlocked(true);
        } else {
          setIsBlocked(false);
        }
      } else {
        setIsBlocked(false);
      }
    }

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, [profile?.ambiente]);

  if (isBlocked) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-bg-dark p-6 text-center">
        <div className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-xl border border-input-border/50">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-accent/10 p-4">
              <MonitorX size={48} className="text-accent" />
            </div>
          </div>
          <h1 className="mb-2 text-xl font-bold text-text-main">
            Acesso Restrito ao Desktop
          </h1>
          <p className="text-sm text-text-muted">
            O seu perfil de acesso (
            <strong>{profile?.ambiente?.toUpperCase()}</strong>) exige operações
            complexas que foram desenhadas para telas maiores.
          </p>
          <div className="mt-6 rounded-lg bg-yellow-500/10 p-4 border border-yellow-500/20">
            <p className="text-xs text-yellow-500 font-medium">
              Por favor, acesse o sistema através de um computador para
              continuar.
            </p>
          </div>
          <button
            onClick={logout}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent/90"
          >
            <LogOut size={16} />
            Sair da conta
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

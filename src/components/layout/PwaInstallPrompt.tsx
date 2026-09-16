import { useState, useEffect } from "react";
import { Download, X, Share2 } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const LS_KEY = "pwa-prompt-dismissed";

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window)
  );
}

function isStandalone(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [iosDevice, setIosDevice] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(LS_KEY)) return;

    const ios = isIOS();
    setIosDevice(ios);

    if (ios) {
      setShow(true);
      return;
    }

    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    }

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      localStorage.removeItem(LS_KEY);
      setShow(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    localStorage.setItem(LS_KEY, "true");
    setShow(false);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      localStorage.removeItem(LS_KEY);
    }
    setDeferredPrompt(null);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe-or-4 max-sm:bottom-16 lg:bottom-4 lg:left-auto lg:right-4 lg:w-96">
      <div className="mx-auto max-w-md lg:max-w-none rounded-2xl bg-card border border-border-subtle shadow-2xl p-4 flex items-start gap-3">
        <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
          <Download size={20} className="text-accent" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text-main">
            Instalar ERP Odonto
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            {iosDevice
              ? "Toque em Compartilhar e depois em Adicionar à Tela de Início"
              : "Instale para acesso rápido e offline"}
          </p>

          {iosDevice && (
            <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-bg-dark px-3 py-2">
              <Share2 size={14} className="text-accent shrink-0" />
              <span className="text-xs text-text-muted leading-relaxed">
                1. Toque em{" "}
                <strong className="text-text-main">Compartilhar</strong> 2. Role
                até{" "}
                <strong className="text-text-main">
                  Adicionar à Tela de Início
                </strong>
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!iosDevice && deferredPrompt && (
            <button
              onClick={handleInstall}
              className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-fg transition-colors hover:bg-accent/90"
            >
              Instalar
            </button>
          )}
          <button
            onClick={dismiss}
            className="rounded-lg p-2 text-text-muted hover:text-text-main transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

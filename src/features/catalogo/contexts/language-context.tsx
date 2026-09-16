import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import i18n from "~/core/i18n";

const STORAGE_KEY = "catalogo-lang";

type LangCode = "pt-BR" | "en-US" | "es-ES";

interface CatalogoLangContextValue {
  language: LangCode | null;
  setLanguage: (lang: LangCode) => void;
}

const CatalogoLangContext = createContext<CatalogoLangContextValue>({
  language: null,
  setLanguage: () => {},
});

export function useCatalogoLang() {
  return useContext(CatalogoLangContext);
}

function getStoredLang(): LangCode | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "pt-BR" || stored === "en-US" || stored === "es-ES") return stored;
  } catch {}
  return null;
}

export function CatalogoLangProvider({ children }: { children: ReactNode }) {
  const [language, setLangState] = useState<LangCode | null>(getStoredLang);

  const setLanguage = useCallback((lang: LangCode) => {
    localStorage.setItem(STORAGE_KEY, lang);
    i18n.changeLanguage(lang).finally(() => setLangState(lang));
  }, []);

  return (
    <CatalogoLangContext.Provider value={{ language, setLanguage }}>
      {children}
    </CatalogoLangContext.Provider>
  );
}

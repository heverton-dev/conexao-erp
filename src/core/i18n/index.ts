import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ptBR from "./locales/pt-BR.json";
import enUS from "./locales/en-US.json";
import esES from "./locales/es-ES.json";

const STORAGE_KEY = "catalogo-lang";

function getStoredLang(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "pt-BR" || stored === "en-US" || stored === "es-ES") return stored;
  } catch {}
  return "pt-BR";
}

i18n.use(initReactI18next).init({
  resources: {
    "pt-BR": { translation: ptBR },
    "en-US": { translation: enUS },
    "es-ES": { translation: esES },
  },
  lng: getStoredLang(),
  fallbackLng: "pt-BR",
  interpolation: { escapeValue: false },
});

export default i18n;

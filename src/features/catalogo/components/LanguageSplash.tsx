import { useTranslation } from "react-i18next";
import { useCatalogoLang } from "../contexts/language-context";

const LANGUAGES = [
  { code: "pt-BR" as const, label: "Português", flag: "BR", subtitle: "Brasil" },
  { code: "en-US" as const, label: "English", flag: "US", subtitle: "United States" },
  { code: "es-ES" as const, label: "Español", flag: "ES", subtitle: "España" },
];

export function LanguageSplash() {
  const { setLanguage } = useCatalogoLang();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a] px-4">
      <div className="w-full max-w-lg text-center">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">
            {t("catalogo.language.title")}
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm sm:text-base">
            {t("catalogo.language.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className="group relative flex flex-col items-center gap-3 p-6 sm:p-8 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)]/50 backdrop-blur-md hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-hover)] transition-all duration-300 cursor-pointer"
            >
              <div className="text-5xl sm:text-6xl leading-none" role="img" aria-label={lang.label}>
                {lang.flag === "BR" && "🇧🇷"}
                {lang.flag === "US" && "🇺🇸"}
                {lang.flag === "ES" && "🇪🇸"}
              </div>
              <div>
                <p className="text-white font-bold text-lg">{lang.label}</p>
                <p className="text-[var(--color-text-muted)] text-xs mt-0.5">{lang.subtitle}</p>
              </div>
              <div className="absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 group-hover:ring-[var(--color-accent)]/40 transition-all duration-300" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

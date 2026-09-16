import { EmpresaLinktreeCard } from "./EmpresaLinktreeCard";
import type {
  EmpresaLinktreeLink,
  EmpresaLinktreeSection,
  EmpresaLinktreeTheme,
} from "../types-empresa";

interface Props {
  sections: EmpresaLinktreeSection[];
  links: EmpresaLinktreeLink[];
  theme: EmpresaLinktreeTheme;
  bio?: string | null;
  bannerUrl?: string | null;
  avatarUrl?: string | null;
  empresaNome?: string;
}

export function EmpresaLinktreePreview({
  sections,
  links,
  theme,
  bio,
  bannerUrl,
  avatarUrl,
  empresaNome,
}: Props) {
  return (
    <div className="lg:sticky lg:top-20 lg:self-start">
      <div className="overflow-hidden rounded-[2rem] border-[10px] border-surface-hover shadow-2xl">
        <div
          className="h-[720px] w-full overflow-y-auto"
          style={{ maxWidth: 370 }}
        >
          <EmpresaLinktreeCard
            sections={sections}
            links={links}
            theme={theme}
            bio={bio}
            bannerUrl={bannerUrl}
            avatarUrl={avatarUrl}
            empresaNome={empresaNome}
          />
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Preview em tempo real
      </p>
    </div>
  );
}

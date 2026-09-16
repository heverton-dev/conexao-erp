import { ExternalLink, Star, Globe } from "lucide-react";
import {
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
} from "lucide-react";
import type {
  EmpresaLinktreeLink,
  EmpresaLinktreeSection,
  EmpresaLinktreeTheme,
  BackgroundMode,
} from "../types-empresa";
import { DynamicIcon } from "./DynamicIcon";

const POSITION_STYLES: Record<string, React.CSSProperties> = {
  tl: { top: "-10%", left: "-10%" },
  tc: { top: "-15%", left: "50%", transform: "translateX(-50%)" },
  tr: { top: "-10%", right: "-10%" },
  ml: { top: "50%", left: "-15%", transform: "translateY(-50%)" },
  mc: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  mr: { top: "50%", right: "-15%", transform: "translateY(-50%)" },
  bl: { bottom: "-10%", left: "-10%" },
  bc: { bottom: "-15%", left: "50%", transform: "translateX(-50%)" },
  br: { bottom: "-10%", right: "-10%" },
};

interface Props {
  sections: EmpresaLinktreeSection[];
  links: EmpresaLinktreeLink[];
  theme: EmpresaLinktreeTheme;
  bio?: string | null;
  bannerUrl?: string | null;
  avatarUrl?: string | null;
  empresaNome?: string;
  onLinkClick?: (link: EmpresaLinktreeLink) => void;
}

function bgStyle(theme: EmpresaLinktreeTheme): React.CSSProperties {
  const b = theme.background;
  if (b.mode === "solid") return { background: b.solid };
  if (b.mode === "gradient3") {
    return {
      background: `linear-gradient(${b.gradient3Angle}deg, ${b.gradient3From}, ${b.gradient3Mid}, ${b.gradient3To})`,
    };
  }
  return {
    background: `linear-gradient(${b.gradientAngle}deg, ${b.gradientFrom}, ${b.gradientTo})`,
  };
}

function btnBg(theme: EmpresaLinktreeTheme): string {
  const btn = theme.buttons;
  if (btn.bgMode === "transparent") return "transparent";
  if (btn.bgMode === "gradient3") {
    return `linear-gradient(${btn.bgGradient3Angle}deg, ${btn.bgGradient3From}, ${btn.bgGradient3Mid}, ${btn.bgGradient3To})`;
  }
  if (btn.bgMode === "gradient2") {
    return `linear-gradient(${btn.bgGradientAngle}deg, ${btn.bgGradientFrom}, ${btn.bgGradientTo})`;
  }
  return btn.bgColor;
}

function buttonStyle(theme: EmpresaLinktreeTheme): React.CSSProperties {
  const btn = theme.buttons;
  const radius =
    btn.style === "pill" ? 9999 : btn.style === "square" ? 4 : btn.borderRadius;
  return {
    background: btnBg(theme),
    color: btn.textColor,
    borderRadius: radius,
    border: btn.borderWidth > 0 ? `${btn.borderWidth}px solid ${btn.borderColor}` : "none",
    boxShadow: btn.shadow ? `0 ${btn.shadowSize / 2}px ${btn.shadowSize}px rgba(0,0,0,0.15)` : "none",
  };
}

export function EmpresaLinktreeCard({
  sections,
  links,
  theme,
  bio,
  bannerUrl,
  avatarUrl,
  empresaNome,
  onLinkClick,
}: Props) {
  const linksBySection = new Map<string, EmpresaLinktreeLink[]>();
  for (const link of links) {
    const arr = linksBySection.get(link.section_id) ?? [];
    arr.push(link);
    linksBySection.set(link.section_id, arr);
  }

  const pinnedLinks = links.filter((l) => l.pinned);
  const normalLinks = links.filter((l) => !l.pinned);
  const hasSections = sections.length > 0;
  const inst = theme.institucional;
  const sp = theme.spacing;
  const socials: Array<{
    key: "instagram" | "linkedin" | "facebook" | "youtube";
    Icon: typeof Instagram;
    href: string;
    enabled: boolean;
  }> = [
    { key: "instagram", Icon: Instagram, href: inst.instagram, enabled: inst.instagramEnabled },
    { key: "linkedin", Icon: Linkedin, href: inst.linkedin, enabled: inst.linkedinEnabled },
    { key: "facebook", Icon: Facebook, href: inst.facebook, enabled: inst.facebookEnabled },
    { key: "youtube", Icon: Youtube, href: inst.youtube, enabled: inst.youtubeEnabled },
  ];
  const hasSocials = socials.some((s) => s.enabled && s.href);
  const hasFooterContent = inst.logoUrl || (inst.nomeEmpresaEnabled && inst.nomeEmpresa) || (inst.enderecoEnabled && inst.endereco) || hasSocials;
  const hoverBg = theme.buttons.hoverBgColor;
  const hoverColor = theme.buttons.hoverTextColor;
  const hoverScale = theme.buttons.hoverScale;

  function renderLink(link: EmpresaLinktreeLink) {
    const hoverStyle = `
      .lt-link:hover { background: ${hoverBg} !important; color: ${hoverColor} !important; transform: scale(${hoverScale}); }
    `;

    if (link.tipo === "inline_image") {
      return (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          onClick={() => onLinkClick?.(link)}
          className="lt-link block overflow-hidden transition-all duration-200 active:scale-[0.99]"
          style={{
            borderRadius: theme.buttons.style === "pill" ? 9999 : theme.buttons.style === "square" ? 4 : theme.buttons.borderRadius,
          }}
        >
          {link.imagem_url && (
            <img src={link.imagem_url} alt={link.titulo} className="w-full object-cover" />
          )}
        </a>
      );
    }

    if (link.tipo === "image") {
      return (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          onClick={() => onLinkClick?.(link)}
          className="lt-link group flex w-full items-center gap-3 overflow-hidden px-4 py-3 transition-all duration-200 active:scale-[0.99]"
          style={{
            ...buttonStyle(theme),
            fontFamily: theme.typography.buttonFont,
            color: theme.buttons.textColor,
          }}
        >
          {link.imagem_url && (
            <div className="size-14 shrink-0 overflow-hidden rounded-lg">
              <img src={link.imagem_url} alt="" className="size-full object-cover" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {link.pinned && <Star className="size-3 shrink-0 fill-current opacity-60" />}
              <span className="truncate text-sm font-medium">{link.titulo}</span>
            </div>
            {link.descricao && (
              <p className="mt-0.5 truncate text-xs opacity-70">{link.descricao}</p>
            )}
          </div>
          <ExternalLink className="size-4 shrink-0 opacity-40" />
        </a>
      );
    }

    return (
      <a
        key={link.id}
        href={link.url}
        target="_blank"
        rel="noreferrer"
        onClick={() => onLinkClick?.(link)}
        className="lt-link group flex w-full items-center gap-3 px-4 py-3 transition-all duration-200 active:scale-[0.99]"
        style={{
          ...buttonStyle(theme),
          fontFamily: theme.typography.buttonFont,
          color: theme.buttons.textColor,
        }}
      >
        {link.icone ? (
          <span
            className="grid size-9 shrink-0 place-items-center rounded-full"
            style={{ background: theme.icons.bgColor }}
          >
            <DynamicIcon name={link.icone} size={18} color={theme.icons.pathColor} />
          </span>
        ) : (
          <span
            className="grid size-9 shrink-0 place-items-center rounded-full"
            style={{ background: theme.icons.bgColor }}
          >
            <Globe size={18} color={theme.icons.pathColor} strokeWidth={theme.icons.strokeWidth} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {link.pinned && <Star className="size-3 shrink-0 fill-current opacity-60" />}
            <span className="truncate text-sm font-medium">{link.titulo}</span>
          </div>
          {link.descricao && (
            <p className="mt-0.5 truncate text-xs opacity-70">{link.descricao}</p>
          )}
        </div>
        <ExternalLink className="size-4 shrink-0 opacity-40" />
      </a>
    );
  }

  function renderLinks(linksToRender: EmpresaLinktreeLink[]) {
    return linksToRender.map((link) => (
      <div key={link.id}>{renderLink(link)}</div>
    ));
  }

  return (
    <div
      className="relative flex min-h-screen w-full justify-center"
      style={bgStyle(theme)}
    >
      {/* Blobs */}
      {theme.background.blobsEnabled && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {theme.background.blobs
            .filter((b) => b.enabled)
            .map((b, i) => (
              <div
                key={i}
                className="absolute rounded-full blur-3xl"
                style={{
                  width: b.size,
                  height: b.size,
                  background: b.color,
                  opacity: b.opacity,
                  ...POSITION_STYLES[b.position],
                }}
              />
            ))}
        </div>
      )}

      {/* Watermark com bordas suaves */}
      {theme.background.watermarkUrl && (
        <div
          className="pointer-events-none absolute"
          style={{
            ...POSITION_STYLES[theme.background.watermarkPosition],
            width: theme.background.watermarkSize,
            height: theme.background.watermarkSize,
            opacity: theme.background.watermarkOpacity,
            backgroundImage: `url(${theme.background.watermarkUrl})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            filter: `blur(${theme.background.watermarkBlur}px)`,
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          }}
        />
      )}

      {/* Hover styles */}
      <style>{`
        .lt-link:hover {
          background: ${hoverBg} !important;
          color: ${hoverColor} !important;
          transform: scale(${hoverScale});
        }
      `}</style>

      <div
        className="relative z-10 flex w-full max-w-[440px] flex-col"
        style={{ paddingLeft: sp.containerPaddingX, paddingRight: sp.containerPaddingX }}
      >
        {/* Banner */}
        {theme.layout === "hero" && bannerUrl && (
          <div className="w-full overflow-hidden">
            <img
              src={bannerUrl}
              alt="Banner"
              className="h-48 w-full object-cover"
            />
          </div>
        )}

        {/* Conteúdo principal */}
        <div
          className="flex flex-1 flex-col"
          style={{ paddingTop: sp.containerPaddingY, paddingBottom: sp.containerPaddingY }}
        >
          {/* Avatar */}
          {theme.layout === "hero" && avatarUrl && (
            <div className="flex justify-center">
              <div
                className="grid size-28 place-items-center overflow-hidden rounded-full sm:size-32"
                style={{
                  border: `${theme.avatar?.borderWidth ?? 3}px solid ${theme.avatar?.borderColor ?? theme.icons.bgColor}`,
                }}
              >
                <img
                  src={avatarUrl}
                  alt={empresaNome ?? "Avatar"}
                  className="size-full object-cover"
                />
              </div>
            </div>
          )}

          {theme.layout === "classic" && bannerUrl && (
            <div className="mb-4 w-full overflow-hidden rounded-xl">
              <img
                src={bannerUrl}
                alt="Banner"
                className="h-40 w-full object-cover"
              />
            </div>
          )}

          {/* Título */}
          {empresaNome && (
            <h1
              className={`${theme.layout === "hero" && avatarUrl ? "mt-5" : "mt-0"} text-balance text-center font-bold leading-tight`}
              style={{
                fontFamily: theme.typography.font,
                color: theme.typography.titleColor,
                fontSize: theme.typography.titleSize,
              }}
            >
              {empresaNome}
            </h1>
          )}

          {/* Bio */}
          {bio && (
            <p
              className="mt-2 text-center leading-relaxed"
              style={{
                fontFamily: theme.typography.font,
                color: theme.typography.bioColor,
                fontSize: theme.typography.bioSize,
                opacity: 0.8,
              }}
            >
              {bio}
            </p>
          )}

          {/* Links */}
          <div className="mt-6 w-full" style={{ display: "flex", flexDirection: "column", gap: sp.linkGap }}>
            {pinnedLinks.length > 0 && renderLinks(pinnedLinks)}

            {hasSections
              ? sections.map((section) => {
                  const sectionLinks = normalLinks.filter(
                    (l) => l.section_id === section.id,
                  );
                  if (sectionLinks.length === 0) return null;
                  return (
                    <div key={section.id} style={{ display: "flex", flexDirection: "column", gap: sp.linkGap, marginTop: sp.sectionGap }}>
                      {section.imagem_url ? (
                        <div className="relative -mx-5 overflow-hidden">
                          <img
                            src={section.imagem_url}
                            alt={section.titulo}
                            className="h-32 w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                          <h2
                            className="absolute bottom-3 left-5 text-sm font-bold uppercase tracking-wider"
                            style={{
                              fontFamily: theme.typography.font,
                              color: "#ffffff",
                            }}
                          >
                            {section.titulo}
                          </h2>
                        </div>
                      ) : (
                        <h2
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{
                            fontFamily: theme.typography.font,
                            color: theme.typography.sectionColor,
                            opacity: 0.6,
                          }}
                        >
                          {section.titulo}
                        </h2>
                      )}
                      {renderLinks(sectionLinks)}
                    </div>
                  );
                })
              : renderLinks(normalLinks)}
          </div>
        </div>

        {/* Footer */}
        {hasFooterContent && (
          <footer
            className="pb-8 pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            {inst.logoUrl && (
              <div className="flex justify-center">
                <img
                  src={inst.logoUrl}
                  alt={inst.nomeEmpresa}
                  className="object-contain"
                  style={{ width: inst.logoWidth, height: inst.logoHeight }}
                />
              </div>
            )}

            {(inst.nomeEmpresaEnabled || inst.enderecoEnabled) && (
              <div
                className="mt-3 text-center leading-snug"
                style={{
                  fontFamily: theme.typography.font,
                  fontSize: 11,
                  color: theme.typography.bioColor,
                  opacity: 0.7,
                }}
              >
                {inst.nomeEmpresaEnabled && inst.nomeEmpresa && (
                  <div style={{ fontWeight: 600, opacity: 1 }}>{inst.nomeEmpresa}</div>
                )}
                {inst.enderecoEnabled && inst.endereco && <div className="mt-0.5">{inst.endereco}</div>}
                {inst.site && (
                  <a
                    href={inst.site.startsWith("http") ? inst.site : `https://${inst.site}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block hover:underline"
                  >
                    {inst.site}
                  </a>
                )}
              </div>
            )}

            {hasSocials && (
              <div className="mt-4 flex justify-center gap-4">
                {socials.map(({ key, Icon, href, enabled }) =>
                  enabled && href ? (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={key}
                      className="transition-all duration-200 hover:opacity-100 active:scale-90"
                      style={{ opacity: 0.6 }}
                    >
                      <Icon
                        size={18}
                        strokeWidth={1.5}
                        color={inst.socialColors[key]}
                      />
                    </a>
                  ) : null,
                )}
              </div>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}

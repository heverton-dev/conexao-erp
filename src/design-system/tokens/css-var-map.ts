import type { DesignTokens } from "./types";

/**
 * Mapeia cada chave de token para o nome da CSS var correspondente.
 * Convenção: --ds-<categoria>-<campo-kebab>
 */
export const CSS_VAR_MAP: Record<string, string> = {
  // Colors
  "colors.bg": "--color-bg",
  "colors.surface": "--color-surface",
  "colors.surfaceHover": "--color-surface-hover",
  "colors.card": "--color-card",
  "colors.textMain": "--color-text-main",
  "colors.textSecondary": "--color-text-secondary",
  "colors.textMuted": "--color-text-muted",
  "colors.textInverted": "--color-text-inverted",
  "colors.border": "--color-border",
  "colors.borderSubtle": "--color-border-subtle",
  "colors.accent": "--color-accent",
  "colors.accentHover": "--color-accent-hover",
  "colors.accentFg": "--color-accent-fg",
  "colors.accentMuted": "--color-accent-muted",
  "colors.gradientStart": "--color-gradient-start",
  "colors.gradientMid": "--color-gradient-mid",
  "colors.gradientEnd": "--color-gradient-end",
  "colors.success": "--color-success",
  "colors.successBg": "--color-success-bg",
  "colors.warning": "--color-warning",
  "colors.warningBg": "--color-warning-bg",
  "colors.error": "--color-error",
  "colors.errorBg": "--color-error-bg",
  "colors.info": "--color-info",
  "colors.infoBg": "--color-info-bg",
  "colors.overlay": "--color-overlay",
  "colors.shadow": "--color-shadow",
  "colors.glassTint": "--color-glass-tint",
  "colors.headerBg": "--color-header-bg",
  "colors.scrollbarThumb": "--color-scrollbar-thumb",
  "colors.ring": "--color-ring",
  "colors.hoverBg": "--color-hover-bg",
  "colors.hoverBorder": "--color-hover-border",
  "colors.hoverShadow": "--color-hover-shadow",
  // shadcn aliases
  "colors.primary": "--color-primary",
  "colors.primaryForeground": "--color-primary-foreground",
  "colors.secondary": "--color-secondary",
  "colors.secondaryForeground": "--color-secondary-foreground",
  "colors.muted": "--color-muted",
  "colors.mutedForeground": "--color-muted-foreground",
  "colors.destructive": "--color-destructive",
  "colors.destructiveForeground": "--color-destructive-foreground",
  "colors.popover": "--color-popover",
  "colors.popoverForeground": "--color-popover-foreground",
  "colors.input": "--color-input",
  "colors.inputBg": "--color-input-bg",
  "colors.inputBorder": "--color-input-border",
  "colors.inputFocus": "--color-input-focus",
  // Typography
  "typography.fontFamily": "--font-family",
  "typography.fontFamilyMono": "--font-family-mono",
  "typography.fontSizeXs": "--font-size-xs",
  "typography.fontSizeSm": "--font-size-sm",
  "typography.fontSizeMd": "--font-size-md",
  "typography.fontSizeLg": "--font-size-lg",
  "typography.fontSizeXl": "--font-size-xl",
  "typography.fontSize2xl": "--font-size-2xl",
  "typography.lineHeightTight": "--line-height-tight",
  "typography.lineHeightNormal": "--line-height-normal",
  "typography.lineHeightRelaxed": "--line-height-relaxed",
  "typography.letterSpacingTight": "--letter-spacing-tight",
  "typography.letterSpacingNormal": "--letter-spacing-normal",
  "typography.letterSpacingWide": "--letter-spacing-wide",
  // Borders
  "borders.radiusSm": "--radius-sm",
  "borders.radiusMd": "--radius-md",
  "borders.radiusLg": "--radius-lg",
  "borders.radiusXl": "--radius-xl",
  "borders.radiusFull": "--radius-full",
  // Shadows
  "shadows.sm": "--shadow-sm",
  "shadows.md": "--shadow-md",
  "shadows.lg": "--shadow-lg",
  "shadows.xl": "--shadow-xl",
  "shadows.glow": "--shadow-glow",
  "shadows.accentGlow": "--shadow-accent-glow",
  // Animations
  "animations.durationFast": "--animate-duration-fast",
  "animations.durationNormal": "--animate-duration-normal",
  "animations.durationSlow": "--animate-duration-slow",
  "animations.easingDefault": "--animate-easing-default",
  "animations.easingBounce": "--animate-easing-bounce",
  // Spacing
  "spacing.xs": "--spacing-xs",
  "spacing.sm": "--spacing-sm",
  "spacing.md": "--spacing-md",
  "spacing.lg": "--spacing-lg",
  "spacing.xl": "--spacing-xl",
  "spacing.2xl": "--spacing-2xl",
  "spacing.3xl": "--spacing-3xl",
  "spacing.4xl": "--spacing-4xl",
  // Components
  "components.button.paddingX": "--comp-btn-px",
  "components.button.paddingY": "--comp-btn-py",
  "components.button.fontSize": "--comp-btn-fs",
  "components.button.borderRadius": "--comp-btn-radius",
  "components.input.paddingX": "--comp-input-px",
  "components.input.paddingY": "--comp-input-py",
  "components.input.fontSize": "--comp-input-fs",
  "components.input.borderRadius": "--comp-input-radius",
  "components.card.padding": "--comp-card-p",
  "components.card.borderRadius": "--comp-card-radius",
  "components.card.shadow": "--comp-card-shadow",
  "components.modal.backdropBg": "--comp-modal-backdrop",
  "components.modal.borderRadius": "--comp-modal-radius",
  "components.modal.shadow": "--comp-modal-shadow",
  "components.sidebar.width": "--comp-sidebar-w",
  "components.sidebar.collapsedWidth": "--comp-sidebar-w-collapsed",
  "components.badge.paddingX": "--comp-badge-px",
  "components.badge.paddingY": "--comp-badge-py",
  "components.badge.fontSize": "--comp-badge-fs",
  "components.badge.borderRadius": "--comp-badge-radius",
};

/**
 * Converte um objeto DesignTokens flat para um map de CSS vars
 */
export function tokensToCssVars(
  tokens: Partial<DesignTokens>,
): Record<string, string> {
  const result: Record<string, string> = {};

  function walk(obj: Record<string, unknown>, prefix: string) {
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        walk(value as Record<string, unknown>, path);
      } else {
        const cssVar = CSS_VAR_MAP[path];
        if (cssVar && value !== undefined) {
          result[cssVar] = String(value);
        }
      }
    }
  }

  walk(tokens as Record<string, unknown>, "");
  return result;
}

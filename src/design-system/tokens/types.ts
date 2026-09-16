// Token types — Design System ERP Odonto v1.0.0
export interface DesignTokens {
  meta: { version: string; name: string };

  colors: {
    bg: string;
    surface: string;
    surfaceHover: string;
    card: string;
    textMain: string;
    textSecondary: string;
    textMuted: string;
    textInverted: string;
    border: string;
    borderSubtle: string;
    accent: string;
    accentHover: string;
    accentFg: string;
    accentMuted: string;
    gradientStart: string;
    gradientMid: string;
    gradientEnd: string;
    success: string;
    successBg: string;
    warning: string;
    warningBg: string;
    error: string;
    errorBg: string;
    info: string;
    infoBg: string;
    overlay: string;
    shadow: string;
    glassTint: string;
    headerBg: string;
    scrollbarThumb: string;
    ring: string;
    hoverBg: string;
    hoverBorder: string;
    hoverShadow: string;
    // shadcn aliases
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    destructive: string;
    destructiveForeground: string;
    popover: string;
    popoverForeground: string;
    input: string;
    inputBg: string;
    inputBorder: string;
    inputFocus: string;
  };

  typography: {
    fontFamily: string;
    fontFamilyMono: string;
    fontSizeXs: string;
    fontSizeSm: string;
    fontSizeMd: string;
    fontSizeLg: string;
    fontSizeXl: string;
    fontSize2xl: string;
    fontWeightLight: number;
    fontWeightNormal: number;
    fontWeightMedium: number;
    fontWeightSemibold: number;
    fontWeightBold: number;
    lineHeightTight: string;
    lineHeightNormal: string;
    lineHeightRelaxed: string;
    letterSpacingTight: string;
    letterSpacingNormal: string;
    letterSpacingWide: string;
  };

  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
    "4xl": string;
  };

  borders: {
    radiusSm: string;
    radiusMd: string;
    radiusLg: string;
    radiusXl: string;
    radiusFull: string;
  };

  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    glow: string;
    accentGlow: string;
  };

  animations: {
    durationFast: string;
    durationNormal: string;
    durationSlow: string;
    easingDefault: string;
    easingBounce: string;
  };

  components: {
    button: {
      paddingX: string;
      paddingY: string;
      fontSize: string;
      borderRadius: string;
    };
    input: {
      paddingX: string;
      paddingY: string;
      fontSize: string;
      borderRadius: string;
    };
    card: {
      padding: string;
      borderRadius: string;
      shadow: string;
    };
    modal: {
      backdropBg: string;
      borderRadius: string;
      shadow: string;
    };
    sidebar: {
      width: string;
      collapsedWidth: string;
    };
    badge: {
      paddingX: string;
      paddingY: string;
      fontSize: string;
      borderRadius: string;
    };
  };
}

export type PresetKey =
  "dark-gold" | "dark-blue" | "light-clean" | "dark-emerald";

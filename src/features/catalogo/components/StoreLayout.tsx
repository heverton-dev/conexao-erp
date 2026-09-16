import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { Search, ShoppingBag, Menu, Home, ArrowLeft, Instagram, Facebook, Twitter, Youtube, Linkedin, MessageCircle, Globe, Mail, Phone, MapPin, Music2 } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import '../styles/theme.css';
import { toggleCartDrawer, toggleNavDrawer } from '../services/ui.service';
import { useCarrinho, cartTotais, setCarrinhoScope } from '../services/carrinho.service';
import { useAuth } from '~/lib/auth';
import { CartDrawer } from './CartDrawer';
import { NavDrawer } from './NavDrawer';
import { ImageViewer } from './ImageViewer';
import { useTranslation } from 'react-i18next';
import { ProductSheet } from './ProductSheet';
import { ClienteAtivoProvider } from '../contexts/cliente-ativo';
import { ClienteAtivoBar } from './ClienteAtivoBar';
import { CatalogoLangProvider, useCatalogoLang } from '../contexts/language-context';
import { LanguageSplash } from './LanguageSplash';

export const CatalogoVisibilityContext = createContext({ showPrices: true, showSearchBar: true });
export const useCatalogoVisibility = () => useContext(CatalogoVisibilityContext);
import { supabase } from '~/lib/supabase';
import { mergeWithDefaults, type CatalogoDesignFooter } from '../services/design.service';
import { useCatalogoDesign } from '../hooks/useCatalogo';

interface StoreLayoutProps {
  children: React.ReactNode;
  fullHeight?: boolean;
  zoom?: number;
}

function applyDesignToRoot(config: ReturnType<typeof mergeWithDefaults>) {
  const root = document.documentElement;
  const cssMap: Record<string, string> = {
    '--color-accent': config.colors.accent,
    '--color-accent-hover': config.colors.accentHover,
    '--color-accent-fg': config.colors.accentFg,
    '--color-bg': config.colors.bg,
    '--color-surface': config.colors.surface,
    '--color-surface-hover': config.colors.surfaceHover,
    '--color-card': config.colors.card,
    '--color-text-main': config.colors.textMain,
    '--color-text-muted': config.colors.textMuted,
    '--color-border-subtle': config.colors.borderSubtle,
    '--color-input-bg': config.colors.inputBg,
    '--color-input-border': config.colors.inputBorder,
    '--color-success': config.colors.success,
    '--color-error': config.colors.error,
    '--color-accent-muted': `${config.colors.accent}1f`,
    '--catalogo-hero-bg': config.images.heroBackgroundUrl || '',
    '--catalogo-page-bg': config.images.pageBackgroundUrl || '',
    '--catalogo-font-family': config.typography.fontFamily || "'Inter', sans-serif",
    '--catalogo-font-mono': config.typography.fontFamilyMono || "'JetBrains Mono', monospace",
  };
  for (const [k, v] of Object.entries(cssMap)) {
    root.style.setProperty(k, v);
  }
  document.body.style.fontFamily = config.typography.fontFamily || "'Inter', sans-serif";
}

const SOCIAL_ICON_MAP: Record<string, typeof Instagram> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  site: Globe,
  email: Mail,
  telefone: Phone,
  endereco: MapPin,
  tiktok: Music2,
};

export function StoreLayout({ children, fullHeight, zoom }: StoreLayoutProps) {
  return (
    <CatalogoLangProvider>
      <StoreLayoutInner fullHeight={fullHeight} zoom={zoom}>{children}</StoreLayoutInner>
    </CatalogoLangProvider>
  );
}

function StoreLayoutInner({ children, fullHeight, zoom }: StoreLayoutProps) {
  const { t } = useTranslation();
  const { language } = useCatalogoLang();
  const [searchQuery, setSearchQuery] = useState('');
  const [isBackVisible, setIsBackVisible] = useState(false);
  const [visibility, setVisibility] = useState({ showPrices: true, showSearchBar: true, showFooter: true });
  const [logoUrl, setLogoUrl] = useState('');
  const [footerConfig, setFooterConfig] = useState<CatalogoDesignFooter | null>(null);
  const navigate = useNavigate();
  const cart = useCarrinho();
  const { qtd } = useMemo(() => cartTotais(cart), [cart]);
  const { profile } = useAuth();

  useEffect(() => {
    setCarrinhoScope(profile?.id ?? null);
  }, [profile?.id]);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin, role')
        .eq('id', user.id)
        .single();
      if (profile?.is_super_admin || profile?.role === 'admin') {
        setIsBackVisible(true);
      }
    }
    checkAdmin();
  }, []);

  const { data: designConfig } = useCatalogoDesign();

  useEffect(() => {
    if (!designConfig) return;
    const config = designConfig;
    applyDesignToRoot(config);
    setVisibility({
      showPrices: config.visibility.showPrices,
      showSearchBar: config.visibility.showSearchBar,
      showFooter: config.visibility.showFooter,
    });
    if (config.images.pageBackgroundUrl) {
      document.body.style.backgroundImage = `url(${config.images.pageBackgroundUrl})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    }
    const faviconSrc = config.images.faviconUrl;
    if (faviconSrc) {
      const links = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
      if (links.length > 0) {
        links.forEach(link => { link.href = faviconSrc; });
      } else {
        const newLink = document.createElement("link");
        newLink.rel = "icon";
        newLink.href = faviconSrc;
        document.head.appendChild(newLink);
      }
    }
    if (config.texts?.storeName) {
      document.title = config.texts.storeName;
    }
    if (config.images.logoUrl) {
      setLogoUrl(config.images.logoUrl);
    } else {
      setLogoUrl('');
    }
    if (config.footer) {
      setFooterConfig(config.footer);
    }
  }, [designConfig]);

  useEffect(() => {
    return () => {
      const root = document.documentElement;
      const vars = [
        '--color-accent', '--color-accent-hover', '--color-accent-fg',
        '--color-bg', '--color-surface', '--color-surface-hover', '--color-card',
        '--color-text-main', '--color-text-muted', '--color-border-subtle',
        '--color-input-bg', '--color-input-border', '--color-success', '--color-error',
        '--color-accent-muted', '--catalogo-hero-bg', '--catalogo-page-bg',
      ];
      vars.forEach(v => root.style.removeProperty(v));
      document.body.style.backgroundImage = '';
      document.body.style.fontFamily = '';
    };
  }, []);

  // Splash: se nenhum idioma selecionado, mostra tela de seleção
  if (!language) {
    return (
      <ClienteAtivoProvider>
        <LanguageSplash />
      </ClienteAtivoProvider>
    );
  }

  return (
    <ClienteAtivoProvider>
    <div
      className={`catalogo-theme flex flex-col relative bg-[var(--color-bg)] ${fullHeight ? 'h-dvh' : 'min-h-dvh'}`}
    >
      <ClienteAtivoBar />
      <header className="sticky top-0 z-40 bg-[#0f172a]/80 backdrop-blur-2xl h-16 lg:h-20 px-3 sm:px-6 lg:px-16 flex items-center justify-between shadow-2xl shadow-[var(--color-accent-muted)]">
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {isBackVisible && (
            <button
              onClick={() => navigate({ to: '/catalogo/admin/dashboard' })}
              className="p-2 lg:p-2.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-hover)] transition-all"
              title={t("catalogo.store.backToERP")}
            >
              <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </button>
          )}
          <div className="flex items-center hover:scale-105 transition-transform min-w-0">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-6 sm:h-8 lg:h-10 object-contain" />
            ) : (
              <img src="/logos/logo-horizontal-branco.png" alt="ERP Odonto" className="h-6 sm:h-8 lg:h-10 object-contain" />
            )}
          </div>
        </div>
        {visibility.showSearchBar && (
          <form
            onSubmit={(e) => { e.preventDefault(); navigate({ to: '/catalogo/busca', search: { q: searchQuery } }); }}
            className="flex-1 max-w-xl mx-8 relative hidden lg:block"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
            <input
              type="text"
              placeholder={t("catalogo.search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-12 pr-4 rounded-full bg-[var(--color-surface)]/50 border border-[var(--color-input-border)] text-sm focus:border-[var(--color-accent)] focus:bg-[var(--color-input-bg)] focus:shadow-[0_0_15px_rgba(201,166,85,0.15)] focus:outline-none transition-all text-white placeholder-[var(--color-text-muted)]"
            />
          </form>
        )}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 shrink-0">
          <Link to="/catalogo" className="group p-2 sm:p-3 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-hover)] transition-all">
            <Home className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:text-[var(--color-accent)] transition-colors" />
          </Link>
          <button
            onClick={() => toggleCartDrawer(true)}
            className="group p-2 sm:p-3 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-hover)] transition-all relative"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:text-[var(--color-accent)] transition-colors" />
            {qtd > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-gold rounded-full text-[9px] sm:text-[10px] font-bold text-[#0f172a] flex items-center justify-center shadow-[0_0_10px_rgba(201,166,85,0.5)] animate-pulse">
                {qtd}
              </span>
            )}
          </button>
          <button
            onClick={() => toggleNavDrawer(true)}
            className="lg:hidden p-1.5 sm:p-2 text-white hover:text-[var(--color-accent)] ml-[-4px]"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </header>

      <main
        className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden"
        style={zoom ? { transform: `scale(${zoom})`, transformOrigin: 'top center', width: `${100 / zoom}%`, marginInline: 'auto' } : undefined}
      >
        <CatalogoVisibilityContext.Provider value={visibility}>
          {children}
        </CatalogoVisibilityContext.Provider>
      </main>
      {visibility.showFooter && footerConfig && (
        <footer
          className="py-4 px-6 border-t flex items-center justify-center gap-3"
          style={{
            backgroundColor: footerConfig.bgColor || 'var(--color-surface)',
            borderColor: footerConfig.borderColor || 'var(--color-border-subtle)',
            color: footerConfig.textColor || 'var(--color-text-muted)',
          }}
        >
          <p className="text-xs">{footerConfig.text}</p>
          {footerConfig.socialLinks && (
            <div className="flex items-center gap-2">
              {Object.entries(footerConfig.socialLinks).map(([key, url]) => {
                if (!url) return null;
                const Icon = SOCIAL_ICON_MAP[key];
                if (!Icon) return null;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-full transition-opacity hover:opacity-100 opacity-70"
                    style={{ color: footerConfig.iconColor || footerConfig.textColor }}
                    title={key}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                );
              })}
            </div>
          )}
        </footer>
      )}

      <CartDrawer />
      <NavDrawer />
      <ImageViewer />
      <ProductSheet />
    </div>
    </ClienteAtivoProvider>
  );
}

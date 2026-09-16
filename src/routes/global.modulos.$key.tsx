import { createRoute, useParams, useNavigate } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useAuth } from "~/lib/auth";
import { getModule } from "~/registry";
import type { ModuleDefinition } from "~/registry";
import {
  ArrowLeft,
  Settings,
  Shield,
  Key,
  Bell,
  FlaskConical,
  Zap,
  FormInput,
  Link as LinkIcon,
} from "lucide-react";
import { useState } from "react";
import { FormBuilderTab } from "~/components/admin/FormBuilderTab";
import { RequireSuperAdmin } from "~/components/guards";

export const adminSuperModuloDetailRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/global/modulos/$key",
  component: () => (
    <RequireSuperAdmin>
      <AdminSuperModuloDetail />
    </RequireSuperAdmin>
  ),
});

type TabKey =
  | "geral"
  | "permissoes"
  | "credenciais"
  | "eventos"
  | "laboratorio"
  | "acoes"
  | "formularios"
  | "apis";

const TAB_ICONS: Record<TabKey, typeof Settings> = {
  geral: Settings,
  permissoes: Shield,
  credenciais: Key,
  eventos: Bell,
  laboratorio: FlaskConical,
  acoes: Zap,
  formularios: FormInput,
  apis: LinkIcon,
};

const FEATURE_TABS: Partial<Record<keyof ModuleDefinition, TabKey[]>> = {
  hasLaboratorio: ["laboratorio"],
  hasFormulario: ["formularios"],
  hasCustomActions: ["acoes"],
  hasApiConnectors: ["apis"],
};

function AdminSuperModuloDetail() {
  const { profile } = useAuth();
  const { key } = useParams({ from: adminSuperModuloDetailRoute.id });
  const navigate = useNavigate();
  const mod = getModule(key);

  const baseTabs: TabKey[] = ["geral", "permissoes", "credenciais", "eventos"];
  const featureTabs: TabKey[] = [];
  if (mod?.hasLaboratorio) featureTabs.push("laboratorio");
  if (mod?.hasCustomActions) featureTabs.push("acoes");
  if (mod?.hasFormulario) featureTabs.push("formularios");
  if (mod?.hasApiConnectors) featureTabs.push("apis");
  const allTabs = [...baseTabs, ...featureTabs];

  const [tab, setTab] = useState<TabKey>("geral");

  if (!profile?.is_super_admin) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-text-muted text-sm">
          Acesso restrito ao Super Admin.
        </p>
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <button
          onClick={() => navigate({ to: "/global/modulos" })}
          className="flex items-center gap-1 text-sm text-accent mb-4"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <p className="text-text-muted text-sm">Módulo não encontrado: {key}</p>
      </div>
    );
  }

  const Icon = mod.icon;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <button
        onClick={() => navigate({ to: "/global/modulos" })}
        className="flex items-center gap-1 text-sm text-accent mb-4 hover:underline"
      >
        <ArrowLeft size={16} /> Voltar para Módulos
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-accent/10 text-accent">
          <Icon size={24} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-text-main">{mod.nome}</h1>
          <p className="text-xs text-text-muted">{mod.descricao}</p>
        </div>
      </div>

      {/* Navegação de abas */}
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide mb-6">
        {allTabs.map((tabKey) => {
          const TabIcon = TAB_ICONS[tabKey];
          const abaInfo = mod.abas.find((a) => a.key === tabKey);
          return (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                tab === tabKey
                  ? "bg-accent text-accent-fg"
                  : "bg-card text-text-muted hover:text-text-main border border-border-subtle"
              }`}
            >
              <TabIcon size={14} />
              {abaInfo?.label || tabKey}
            </button>
          );
        })}
      </div>

      {tab === "geral" && <GeralTab mod={mod} />}
      {tab === "permissoes" && <PermissoesTab mod={mod} />}
      {tab === "credenciais" && <CredenciaisTab mod={mod} />}
      {tab === "eventos" && <EventosTab mod={mod} />}
      {tab === "laboratorio" && (
        <PlaceholderTab
          title="Laboratório"
          desc="Testes e experimentos do módulo."
        />
      )}
      {tab === "acoes" && (
        <PlaceholderTab title="Ações" desc="Ações customizadas do módulo." />
      )}
      {tab === "formularios" && <FormBuilderTab />}
      {tab === "apis" && (
        <PlaceholderTab title="APIs" desc="Conectores de API do módulo." />
      )}
    </div>
  );
}

function GeralTab({ mod }: { mod: ModuleDefinition }) {
  return (
    <div className="space-y-4">
      <Section title="Informações">
        <InfoRow label="Key" value={mod.key} />
        <InfoRow label="Nome" value={mod.nome} />
        <InfoRow label="Descrição" value={mod.descricao} />
      </Section>

      <Section title="Ambientes">
        <div className="flex flex-wrap gap-2">
          {mod.ambientes.map((amb) => (
            <span
              key={amb}
              className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium"
            >
              {amb}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Rotas">
        <div className="flex flex-col gap-1">
          {mod.routes.map((r) => (
            <span
              key={r}
              className="text-xs font-mono text-text-muted bg-input-bg px-2 py-1 rounded"
            >
              {r}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Feature Flags">
        <div className="flex flex-wrap gap-2">
          <FlagBadge
            label="Escopo de Credenciais"
            active={mod.hasCredentialScopes}
          />
          <FlagBadge label="Laboratório" active={mod.hasLaboratorio} />
          <FlagBadge label="Formulários" active={mod.hasFormulario} />
          <FlagBadge label="Ações Customizadas" active={mod.hasCustomActions} />
          <FlagBadge label="Conectores API" active={mod.hasApiConnectors} />
        </div>
      </Section>

      <Section title="Abas">
        <div className="flex flex-col gap-2">
          {mod.abas.map((aba) => (
            <div key={aba.key} className="flex items-center gap-2 text-sm">
              <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-xs font-mono">
                {aba.key}
              </span>
              <span className="text-text-main">{aba.label}</span>
              {aba.descricao && (
                <span className="text-text-muted text-xs">
                  — {aba.descricao}
                </span>
              )}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function PermissoesTab({ mod }: { mod: ModuleDefinition }) {
  return (
    <div className="space-y-4">
      <Section title="Permissões do Módulo">
        <p className="text-xs text-text-muted mb-3">
          {mod.permissions.length} permissões registradas para este módulo.
        </p>
        <div className="flex flex-col gap-1">
          {mod.permissions.map((p) => (
            <div
              key={p}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-input-bg"
            >
              <Shield size={14} className="text-accent shrink-0" />
              <span className="text-xs font-mono text-text-main">{p}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function CredenciaisTab({ mod }: { mod: ModuleDefinition }) {
  return (
    <div className="space-y-4">
      <Section title="Credenciais com Escopo">
        <p className="text-xs text-text-muted">
          Credenciais globais podem ser escopadas para este módulo e suas abas.
          {mod.hasCredentialScopes
            ? " Este módulo suporta escopo de credenciais."
            : " Este módulo não suporta escopo de credenciais."}
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {mod.abas.map((aba) => (
            <label
              key={aba.key}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-input-bg cursor-pointer"
            >
              <input type="checkbox" className="accent-accent" />
              <span className="text-xs text-text-main">{aba.label}</span>
            </label>
          ))}
        </div>
      </Section>
    </div>
  );
}

function EventosTab({ mod }: { mod: ModuleDefinition }) {
  return (
    <div className="space-y-4">
      <Section title="Eventos do Módulo">
        <p className="text-xs text-text-muted mb-3">
          {mod.events.length} eventos pré-definidos. Eventos disparam webhooks
          configurados.
        </p>
        <div className="flex flex-col gap-2">
          {mod.events.map((evt) => (
            <div
              key={evt.key}
              className="flex items-start gap-3 p-3 rounded-lg bg-input-bg"
            >
              <Bell size={14} className="text-accent shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-medium text-text-main">
                  {evt.label}
                </span>
                <span className="text-xs text-text-muted block">{evt.key}</span>
                <span className="text-xs text-text-muted block mt-0.5">
                  {evt.descricao}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function PlaceholderTab({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FlaskConical size={32} className="text-text-muted mb-3" />
      <p className="text-sm font-medium text-text-main">{title}</p>
      <p className="text-xs text-text-muted mt-1 max-w-sm">{desc}</p>
      <p className="text-xs text-text-muted mt-4 italic">Em desenvolvimento</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-card border border-border-subtle p-4">
      <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs text-text-muted w-20 shrink-0">{label}</span>
      <span className="text-xs font-medium text-text-main">{value}</span>
    </div>
  );
}

function FlagBadge({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${active ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-input-bg text-text-muted border border-border-subtle"}`}
    >
      {label}: {active ? "✓" : "✗"}
    </span>
  );
}

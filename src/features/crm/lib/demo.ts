// Credenciais dos cartões "acesso rápido" no login.
const DEMO_PASSWORD = "Cx!Demo-2026-Impl@7Qv9#R2";
export type DemoRole = "dev" | "diretor_comercial" | "gestor" | "consultor";

export const DEMO_ACCOUNTS: Record<
  DemoRole,
  {
    email: string;
    password: string;
    title: string;
    subtitle: string;
    description: string;
    flagKey: string;
  }
> = {
  dev: {
    email: "demo.dev@conexao.demo",
    password: DEMO_PASSWORD,
    title: "Desenvolvedor",
    subtitle: "Ambiente DEV",
    description: "Convites, gestão de usuários e cartões de demonstração.",
    flagKey: "demo_dev_enabled",
  },
  diretor_comercial: {
    email: "demo.diretor@conexao.demo",
    password: DEMO_PASSWORD,
    title: "Diretor Comercial",
    subtitle: "Visão nacional",
    description:
      "Acompanha gestores, consultores, BI agregado e transfere consultores e clientes.",
    flagKey: "demo_diretor_enabled",
  },
  gestor: {
    email: "demo.gestor@conexao.demo",
    password: DEMO_PASSWORD,
    title: "Gestor",
    subtitle: "Equipe regional",
    description:
      "Acompanha visitas dos consultores, transfere clientes e abre BI da equipe.",
    flagKey: "demo_gestor_enabled",
  },
  consultor: {
    email: "demo.consultor@conexao.demo",
    password: DEMO_PASSWORD,
    title: "Consultor",
    subtitle: "Carteira em campo",
    description:
      "Kanban da carteira, histórico de visitas e registro rápido de atendimento.",
    flagKey: "demo_consultor_enabled",
  },
};

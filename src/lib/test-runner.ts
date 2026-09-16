export type TestResult = {
  success: boolean;
  numPassedTests: number;
  numFailedTests: number;
  numTotalTests: number;
  testResults: Array<{
    name: string;
    status: "passed" | "failed";
    duration: number;
    failureMessage?: string[];
  }>;
  output: string;
};

export type TestCategory = {
  id: string;
  label: string;
  icon: string;
  description: string;
  testFiles: string[];
  moduleKeys: string[];
};

export const TEST_CATEGORIES: TestCategory[] = [
  {
    id: "super-admin",
    label: "Super Admin",
    icon: "Shield",
    description: "Permissões, módulos e navegação do Super Admin",
    testFiles: [
      "src/__tests__/super-admin/permissions.test.ts",
      "src/__tests__/super-admin/modules.test.ts",
      "src/__tests__/super-admin/navigation.test.ts",
    ],
    moduleKeys: ["permissions", "modules", "navigation"],
  },
  {
    id: "modulos",
    label: "Módulos",
    icon: "Puzzle",
    description: "CRUD, serviços e permissões de todos os módulos",
    testFiles: [
      "src/__tests__/modules/crm/services.test.ts",
      "src/__tests__/modules/crm/permissions.test.ts",
      "src/__tests__/modules/crm/module.test.ts",
      "src/__tests__/modules/despesas/services.test.ts",
      "src/__tests__/modules/despesas/permissions.test.ts",
      "src/__tests__/modules/funis/services.test.ts",
      "src/__tests__/modules/funis/permissions.test.ts",
      "src/__tests__/modules/funis/module.test.ts",
      "src/__tests__/modules/hub/services.test.ts",
      "src/__tests__/modules/hub/permissions.test.ts",
      "src/__tests__/modules/hub/module.test.ts",
      "src/__tests__/modules/linktree/services.test.ts",
      "src/__tests__/modules/linktree/permissions.test.ts",
      "src/__tests__/modules/linktree/module.test.ts",
      "src/__tests__/modules/mapas/services.test.ts",
      "src/__tests__/modules/mapas/permissions.test.ts",
      "src/__tests__/modules/mapas/module.test.ts",
      "src/__tests__/modules/nps/services.test.ts",
      "src/__tests__/modules/nps/permissions.test.ts",
      "src/__tests__/modules/nps/module.test.ts",
      "src/__tests__/modules/rotas/services.test.ts",
      "src/__tests__/modules/rotas/permissions.test.ts",
      "src/__tests__/modules/rotas/module.test.ts",
    ],
    moduleKeys: [
      "crm",
      "despesas",
      "funis",
      "hub",
      "linktree",
      "mapas",
      "nps",
      "rotas",
    ],
  },
  {
    id: "integracoes",
    label: "Integrações",
    icon: "Cable",
    description: "APIs externas (CEP, Evolution API)",
    testFiles: [
      "src/__tests__/integrations/cep.test.ts",
      "src/__tests__/integrations/evolution.test.ts",
    ],
    moduleKeys: ["integracoes"],
  },
  {
    id: "componentes",
    label: "Componentes",
    icon: "Component",
    description: "Testes unitários dos componentes UI",
    testFiles: [
      "src/__tests__/components/AlertDialog.test.tsx",
      "src/__tests__/components/Button.test.tsx",
      "src/__tests__/components/EmptyState.test.tsx",
      "src/__tests__/components/LoadingState.test.tsx",
      "src/__tests__/components/PageHeader.test.tsx",
      "src/__tests__/components/PermissionBadge.test.tsx",
    ],
    moduleKeys: ["components"],
  },
  {
    id: "a11y",
    label: "Acessibilidade",
    icon: "Accessibility",
    description: "Testes de acessibilidade (a11y)",
    testFiles: [
      "src/__tests__/a11y/index.test.tsx",
      "src/__tests__/a11y/button.test.tsx",
    ],
    moduleKeys: ["a11y"],
  },
  {
    id: "msw",
    label: "MSW",
    icon: "Network",
    description: "Testes com Mock Service Worker",
    testFiles: [
      "src/__tests__/msw/integration/supabase-crud.test.ts",
      "src/__tests__/msw/integration/cep.test.ts",
    ],
    moduleKeys: ["msw"],
  },
];

export const ALL_CATEGORIES_TEST_FILES = TEST_CATEGORIES.flatMap(
  (c) => c.testFiles,
);

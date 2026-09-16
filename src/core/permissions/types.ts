export type Permissoes = Record<string, boolean>;

export type ModuloAcesso = {
  acessar: boolean;
  paginas: string[];
  acoes: string[];
};

export type ModulosAcesso = Record<string, ModuloAcesso>;

export type Ambiente =
  "cadastro" | "consultor" | "tecnologia" | "suporte" | "ambos";

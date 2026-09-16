/**
 * shared/empresas — Infraestrutura de dados compartilhada da plataforma.
 *
 * Este módulo NÃO é uma feature de negócio.
 * Pode ser importado por qualquer módulo que precise de dados de empresa.
 *
 * Regra: imports de ~/features/* NÃO devem importar de ~/features/empresas.
 *        Use sempre ~/shared/empresas para acesso a dados de empresa.
 */
export type { Empresa, EmpresaDesign, EmpresaConfig, ModuloEmpresa } from "./types";

export {
  listarEmpresas,
  buscarEmpresa,
  criarEmpresa,
  atualizarEmpresa,
  deletarEmpresa,
  toggleEmpresa,
  buscarEmpresaDesign,
  salvarEmpresaDesign,
  buscarEmpresaConfig,
  salvarEmpresaConfig,
  listarModulosEmpresa,
  toggleModuloEmpresa,
  upsertModuloEmpresa,
  uploadEmpresaLogo,
  deletarEmpresaLogo,
  ativarModulosParaEmpresa,
  criarUsuarioEmpresa,
} from "./service";

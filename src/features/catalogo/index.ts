export * from "./types"
export * from "./permissions"
export * from "./module"
export * from "./services/hierarquia.service"
export * from "./services/implantes.service"
export * from "./services/componentes.service"
export * from "./services/acessorios.service"
export * from "./services/workflows.service"
export * from "./services/kits.service"
export * from "./services/cupons.service"
export * from "./services/frete.service"
export * from "./services/promocionais.service"
export * from "./services/chaves.service"
export * from "./services/complementares.service"
export * from "./services/opcionais.service"
export * from "./services/parafusos.service"
export * from "./services/fresagens.service"
export * from "./schemas"
export * from "./hooks/useCatalogo"

// Reexportação explícita para resolver ambiguidade: parafusos.service.ts é a
// fonte canônica de Tipos de Parafuso (componentes.service.ts mantém uma cópia
// legada com o mesmo nome de export).
export {
  listarTiposParafusos,
  criarTipoParafuso,
  toggleTipoParafusoAtivo,
  removerTipoParafuso,
} from "./services/parafusos.service"

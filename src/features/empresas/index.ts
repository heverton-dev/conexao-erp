/**
 * features/empresas — Re-exporta de ~/shared/empresas para compatibilidade.
 *
 * ⚠️  ATENÇÃO: Este arquivo existe apenas como ponte de compatibilidade.
 *    Novos imports devem usar diretamente: ~/shared/empresas
 *    Esta feature expõe apenas a UI administrativa de empresas (rotas /global/empresas).
 *    Os dados de empresa são infraestrutura compartilhada em ~/shared/empresas.
 */
export * from "~/shared/empresas";

import { rootRoute } from "./routes/__root";
import { authLayout } from "./routes/_auth";
import { loginRoute } from "./routes/index";
import { preCadastroRoute } from "./routes/pre-cadastro.$token";
import { dashboardRoute } from "./routes/cadastros.dashboard";
import { clientesRoute } from "./routes/cadastros.solicitacoes";
import { clienteDetailRoute } from "./routes/cadastros.solicitacoes.$id";
import { consultorRoute } from "./routes/cadastros.consultor";
import { consultorClientesRoute } from "./routes/cadastros.consultor.clientes";
import { cadastrosClientesRoute } from "./routes/cadastros.clientes";
import { relatoriosRoute } from "./routes/cadastros.relatorios";
import { credenciaisRoute } from "./routes/credenciais";
import { adminConfigRoute } from "./routes/global.acoes";
import { adminSuperEmpresaDetailRoute } from "./routes/global.empresas.$id";
import { globalCatalogoLinksTesteRoute } from "./routes/global.catalogo-links-teste";
import { adminPermissoesRoute } from "./routes/empresa.permissoes";
import { empresaPerfisRoute } from "./routes/empresa.perfis";
import { adminSuperModulosRoute } from "./routes/global.modulos";
import { adminSuperModuloDetailRoute } from "./routes/global.modulos.$key";
import { adminTemaRoute } from "./routes/empresa.tema";
import { adminEmpresaRoute } from "./routes/empresa";
import { adminSuperBancoRoute } from "./routes/global.banco";
import { adminSuperIntegracoesRoute } from "./routes/global.integracoes";
import { adminSuperDemosRoute } from "./routes/global.demos";
import { adminLaboratorioRoute } from "./routes/global.laboratorio";
import { globalModelosIaRoute } from "./routes/global.modelos-ia";
import { adminSuperTestesRoute } from "./routes/global.testes";
import { adminSuperDiagnosticoRoute } from "./routes/global.diagnostico";
import { globalLimitsRoute } from "./routes/global.limits";
import { adminEmpresaConfigBancoRoute } from "./routes/empresa.banco";
import { adminEmpresaConfigBrandingRoute } from "./routes/empresa.branding";
import { adminEmpresaConfigAcoesRoute } from "./routes/empresa.acoes";
import { globalDesignRoute } from "./routes/global.design";
import { empresaDesignRoute } from "./routes/empresa.design";
import { npsDesignRoute } from "./routes/nps.design";

import { mapasRoute } from "./routes/mapas";
import { mapasDistribuidoresRoute } from "./routes/mapas.distribuidores";
import { mapasConsultoresRoute } from "./routes/mapas.consultores";
import { mapasAdminRoute } from "./routes/mapas.gestao";
import { mapasAdminInsightsRoute } from "./routes/mapas.insights";
import { mapasAdminDistribuidoresRoute } from "./routes/mapas.gestao.distribuidores";
import { mapasAdminConsultoresRoute } from "./routes/mapas.gestao.consultores";

import { npsRoute } from "./routes/nps";
import { npsDashboardRoute } from "./routes/nps.dashboard";
import { globalNpsDashboardRoute } from "./routes/global.nps";
import { npsPesquisasRoute } from "./routes/nps.pesquisas";
import { npsRelatoriosRoute } from "./routes/nps.relatorios";
import { npsPreviewRoute } from "./routes/nps.preview";
import { npsTemaRoute } from "./routes/nps.tema";
import { npsSurveyRoute } from "./routes/nps.survey";

import { funisRoute } from "./routes/funis";
import { funisDashboardRoute } from "./routes/funis.dashboard";
import { funilDetalleRoute } from "./routes/funis.funil.$funilId";
import { funisTemplatesRoute } from "./routes/funis.templates";
import { funilAutomationsRoute } from "./routes/funis.funil.$funilId.automations";

import { linktreePublicRoute } from "./routes/linktree.$id";
import { linktreeDashboardRoute } from "./routes/linktree.dashboard";
import { linktreeTemaRoute } from "./routes/linktree.tema";
import { linktreeDesignRoute } from "./routes/linktree.design";
import { empresaLinktreeDashboardRoute } from "./routes/linktree.empresa";
import { empresaLinktreePublicRoute } from "./routes/e.$slug";

import { globalHubRoute } from "./routes/global.hub";

import { crmDashboardRoute } from "./routes/_auth.crm.dashboard";
import { crmCarteiraRoute } from "./routes/_auth.crm.carteira";
import { crmClienteDetailRoute } from "./routes/_auth.crm.cliente.$id";
import { crmEquipeRoute } from "./routes/_auth.crm.equipe";
import { crmBiRoute } from "./routes/_auth.crm.bi";
import { crmTransferenciaRoute } from "./routes/_auth.crm.transferencia";
import { crmTransferenciaIndexRoute } from "./routes/_auth.crm.transferencia.index";
import { crmTransferenciaConsultoresRoute } from "./routes/_auth.crm.transferencia.consultores";
import { crmDiretoriaIndexRoute } from "./routes/_auth.crm.diretoria.index";
import { crmDiretoriaGestorRoute } from "./routes/_auth.crm.diretoria.gestor.$id";
import { crmAceitarConviteRoute } from "./routes/crm.aceitar-convite.$token";
import { rotasDesignRoute } from "./routes/rotas.design";
import { empresaNpsDesignRoute } from "./routes/empresa.nps-design";
import { empresaLinktreeDesignRoute } from "./routes/empresa.linktree-design";
import { empresaHubDesignRoute } from "./routes/empresa.hub-design";
import { empresaMapasDesignRoute } from "./routes/empresa.mapas-design";
import { empresaFunisDesignRoute } from "./routes/empresa.funis-design";
import { empresaCrmDesignRoute } from "./routes/empresa.crm-design";
import { empresaCadastrosDesignRoute } from "./routes/empresa.cadastros-design";
import { empresaCadastrosFormularioRoute } from "./routes/empresa.cadastros.formulario";
import { empresaDespesasDesignRoute } from "./routes/empresa.despesas-design";
import { empresaRotasDesignRoute } from "./routes/empresa.rotas-design";
import { empresaNpsTemaRoute } from "./routes/empresa.nps-tema";
import { empresaLinktreeTemaRoute } from "./routes/empresa.linktree-tema";
import { empresaHubChatbotRoute } from "./routes/empresa.hub-chatbot";
import { globalManutencaoRoute } from "./routes/global.manutencao";
import { empresaManutencaoRoute } from "./routes/empresa.manutencao";
import { empresaOnboardingRoute } from "./routes/empresa.onboarding";
import { crmPipelineRoute } from "./routes/_auth.crm.pipeline";
import { crmTarefasRoute } from "./routes/_auth.crm.tarefas";
import { crmMetricasRoute } from "./routes/_auth.crm.metricas";
import { empresaHubTemaRoute } from "./routes/empresa.hub.tema";
import { hubClienteDashboardRoute } from "./routes/hub.cliente.dashboard.$empresaId";
import { hubAdminDashboardRoute } from "./routes/hub.admin.dashboard";
import { hubAdminMateriaisRoute } from "./routes/hub.admin.materiais";
import { hubAdminTrilhasRoute } from "./routes/hub.admin.trilhas";
import { hubAdminAnalyticsRoute } from "./routes/hub.admin.analytics";
import { hubAdminBadgesRoute } from "./routes/hub.admin.badges";
import { hubAdminChatbotRoute } from "./routes/hub.admin.chatbot";
import { hubGestorDashboardRoute } from "./routes/hub.gestor.dashboard";
import { hubGestorAnalyticsRoute } from "./routes/hub.gestor.analytics";
import { hubGestorRankingRoute } from "./routes/hub.gestor.ranking";
import { hubGestorConquistasRoute } from "./routes/hub.gestor.conquistas";
import { hubConsultorDashboardRoute } from "./routes/hub.consultor.dashboard";
import { hubConsultorRankingRoute } from "./routes/hub.consultor.ranking";
import { hubConsultorConquistasRoute } from "./routes/hub.consultor.conquistas";
import { hubDistribuidorDashboardRoute } from "./routes/hub.distribuidor.dashboard";
import { hubDistribuidorConquistasRoute } from "./routes/hub.distribuidor.conquistas";
import { hubDesignRoute } from "./routes/hub.design";
import { crmDesignRoute } from "./routes/crm.design";
import { mapasDesignRoute } from "./routes/mapas.design";
import { funisDesignRoute } from "./routes/funis.design";
import { cadastrosDesignRoute } from "./routes/cadastros.design";
import { previsualizacaoRoute } from "./routes/cadastros.previsualizacao";

import { despesasRoute } from "./routes/despesas";
import { despesasAprovacaoRoute } from "./routes/despesas.aprovacao";
import { despesasMeusRelatoriosRoute } from "./routes/despesas.meus-relatorios";
import { despesasRelatoriosRoute } from "./routes/despesas.relatorios";
import { despesasDesignRoute } from "./routes/despesas.design";
import { empresaDespesasConfigRoute } from "./routes/empresa.despesas-config";

import { empresaAgentesRoute } from "./routes/empresa.agentes";
import { globalAgentesRoute } from "./routes/global.agentes";

import { rotasRoute } from "./routes/rotas";
import { rotaDetailRoute } from "./routes/rotas.$id";
import { rotasConfigRoute } from "./routes/rotas.config";
import { empresaRotasConfigRoute } from "./routes/empresa.rotas-config";
import { empresaClientesImportRoute } from "./routes/empresa.clientes-import";

import { marketingDashboardRoute } from "./routes/marketing.dashboard";
import { marketingLandingPagesRoute } from "./routes/marketing.landing-pages";
import { marketingMetaBmRoute } from "./routes/marketing.meta-bm";
import { marketingMetaBmCampanhasRoute } from "./routes/marketing.meta-bm.campanhas";
import { marketingMetaBmPostsRoute } from "./routes/marketing.meta-bm.posts";
import { marketingUtmsRoute } from "./routes/marketing.utms";
import { marketingCriativosRoute } from "./routes/marketing.criativos";
import { marketingEmailRoute } from "./routes/marketing.email";
import { marketingEmailCampanhaRoute } from "./routes/marketing.email.campanha";
import { marketingEmailAnalyticsRoute } from "./routes/marketing.email.analytics";
import { marketingSeoRoute } from "./routes/marketing.seo";
import { marketingCalendarioRoute } from "./routes/marketing.calendario";
import { marketingLeadsRoute } from "./routes/marketing.leads";
import { marketingLeadsDetailRoute } from "./routes/marketing.leads.$id";
import { marketingPixelsRoute } from "./routes/marketing.pixels";
import { marketingWhatsappRoute } from "./routes/marketing.whatsapp";

import { ferramentasLinksRoute } from "./routes/ferramentas.links";
import { ferramentasLinksHistoricoRoute } from "./routes/ferramentas.links.historico";
import { ferramentasLinksTemplatesRoute } from "./routes/ferramentas.links.templates";
import { ferramentasLinksWhatsappRoute } from "./routes/ferramentas.links.whatsapp";
import { ferramentasLinksUtmRoute } from "./routes/ferramentas.links.utm";
import { ferramentasLinksGoogleReviewRoute } from "./routes/ferramentas.links.google-review";
import { ferramentasLinksMapsRoute } from "./routes/ferramentas.links.maps";
import { ferramentasLinksWazeRoute } from "./routes/ferramentas.links.waze";
import { ferramentasLinksQrcodeRoute } from "./routes/ferramentas.links.qrcode";
import { linkRedirectRoute } from "./routes/r.$linkId";

import { catalogoIndexRoute } from "./routes/catalogo.index";
import { catalogoImplantesRoute, catalogoImplantesConexaoRoute, catalogoImplantesFamiliaRoute, catalogoImplantesLinhaRoute } from "./routes/catalogo.implantes";
import { catalogoComponentesRoute, catalogoComponentesTipoReabRoute, catalogoComponentesFamiliaRoute, catalogoComponentesTipoAbutmentRoute } from "./routes/catalogo.componentes";
import { catalogoKitsRoute, catalogoKitsTipoRoute } from "./routes/catalogo.kits";
import { catalogoPromocionaisRoute } from "./routes/catalogo.promocionais";
import { catalogoBuscaRoute } from "./routes/catalogo.busca";
import { catalogoProdutoRoute } from "./routes/catalogo.produto.$tipo.$sku";
import { catalogoCarrinhoRoute } from "./routes/catalogo.carrinho";
import { catalogoCheckoutRoute } from "./routes/catalogo.checkout";
import { catalogoAdminProdutosRoute } from "./routes/catalogo.admin.produtos";
import { catalogoAdminCadastrosRoute } from "./routes/catalogo.admin.cadastros";
import { catalogoAdminCuponsRoute } from "./routes/catalogo.admin.cupons";
import { catalogoAdminFreteRoute } from "./routes/catalogo.admin.frete";
import { catalogoAdminPromocionaisRoute } from "./routes/catalogo.admin.promocionais";
import { catalogoAdminDashboardRoute } from "./routes/catalogo.admin.dashboard";
import { catalogoAdminCoresRoute } from "./routes/catalogo.admin.cores";
import { catalogoAdminConfiguracoesRoute } from "./routes/catalogo.admin.configuracoes";
import { catalogoAdminDesignRoute } from "./routes/catalogo.admin.design";
import { catalogoAdminClientesRoute } from "./routes/catalogo.admin.clientes";
import { catalogoAdminGruposRoute } from "./routes/catalogo.admin.grupos";
import { catalogoAdminOrcamentosRoute } from "./routes/catalogo.admin.orcamentos";
import { catalogoAdminPedidosRoute } from "./routes/catalogo.admin.pedidos";
import { catalogoOrcamentosRoute } from "./routes/catalogo.orcamentos";
import { catalogoPedidosRoute } from "./routes/catalogo.pedidos";
import { catalogoAdminSolicitacoesRoute } from "./routes/catalogo.admin.solicitacoes";
import { catalogoAdminImplantesRoute } from "./routes/catalogo.admin.implantes";
import { catalogoAdminComponentesRoute } from "./routes/catalogo.admin.componentes";
import { catalogoAdminInstrumentaisRoute } from "./routes/catalogo.admin.instrumentais";
import { catalogoAdminKitsRoute } from "./routes/catalogo.admin.kits";
import { catalogoAdminWorkflowsRoute } from "./routes/catalogo.admin.workflows";
import { catalogoAdminFresagensRoute } from "./routes/catalogo.admin.fresagens";
import { catalogoAdminCategoriasRoute } from "./routes/catalogo.admin.categorias";
import { catalogoEmpresaSlugRoute } from "./routes/catalogo.empresa.$slug";

import { catalogoLojaIndexRoute } from "./routes/catalogo-loja.$slug.index";
import { catalogoLojaLoginRoute } from "./routes/catalogo-loja.$slug.login";
import { catalogoLojaPedidosRoute } from "./routes/catalogo-loja.$slug.pedidos";
import { catalogoLojaFavoritosRoute } from "./routes/catalogo-loja.$slug.favoritos";
import { catalogoLojaOrcamentoRoute } from "./routes/catalogo-loja.$slug.orcamento.$token";
import { catalogoLojaPedidoDetalheRoute } from "./routes/catalogo-loja.$slug.pedidos.$id";
import { catalogoLinkTesteRoute } from "./routes/catalogo.teste.$token";


export const routeTree = rootRoute.addChildren([
  loginRoute,
  preCadastroRoute,
  npsSurveyRoute,
  linktreePublicRoute,
  empresaLinktreePublicRoute,
  crmAceitarConviteRoute,
  linkRedirectRoute,
  // Catálogo — rotas públicas (sem login)
  catalogoIndexRoute,
  catalogoEmpresaSlugRoute,
  catalogoImplantesRoute,
  catalogoImplantesConexaoRoute,
  catalogoImplantesFamiliaRoute,
  catalogoImplantesLinhaRoute,
  catalogoComponentesRoute,
  catalogoComponentesTipoReabRoute,
  catalogoComponentesFamiliaRoute,
  catalogoComponentesTipoAbutmentRoute,
  catalogoKitsRoute,
  catalogoKitsTipoRoute,
  catalogoPromocionaisRoute,
  catalogoBuscaRoute,
  catalogoProdutoRoute,
  catalogoCarrinhoRoute,
  catalogoLinkTesteRoute,
  catalogoCheckoutRoute,
  // Loja pública (acesso externo)
  catalogoLojaIndexRoute,
  catalogoLojaLoginRoute,
  catalogoLojaPedidoDetalheRoute,
  catalogoLojaPedidosRoute,
  catalogoLojaFavoritosRoute,
  catalogoLojaOrcamentoRoute,
  authLayout.addChildren([
    hubClienteDashboardRoute,
    dashboardRoute,
    clientesRoute,
    clienteDetailRoute,
    cadastrosClientesRoute,
    consultorRoute,
    consultorClientesRoute,
    relatoriosRoute,
    credenciaisRoute,
    adminConfigRoute,
    adminSuperEmpresaDetailRoute,
    globalCatalogoLinksTesteRoute,
    adminPermissoesRoute,
    empresaPerfisRoute,
    adminSuperModulosRoute,
    adminSuperModuloDetailRoute,
    globalManutencaoRoute,
    empresaManutencaoRoute,
    empresaOnboardingRoute,
    adminTemaRoute,
    adminEmpresaRoute,
    adminSuperBancoRoute,
    adminSuperIntegracoesRoute,
    adminSuperDemosRoute,
    adminSuperTestesRoute,
    adminSuperDiagnosticoRoute,
    adminLaboratorioRoute,
    globalModelosIaRoute,
    globalLimitsRoute,
    globalAgentesRoute,
    adminEmpresaConfigBancoRoute,
    adminEmpresaConfigBrandingRoute,
    adminEmpresaConfigAcoesRoute,
    globalDesignRoute,
    empresaDesignRoute,
    npsDesignRoute,
    hubDesignRoute,
    crmDesignRoute,
    mapasDesignRoute,
    linktreeDesignRoute,
    funisDesignRoute,
    cadastrosDesignRoute,
    previsualizacaoRoute,
    despesasDesignRoute,

    rotasRoute,
    rotaDetailRoute,
    rotasConfigRoute,

    empresaRotasConfigRoute,

    despesasRoute,
    despesasAprovacaoRoute,
    despesasMeusRelatoriosRoute,
    despesasRelatoriosRoute,
    empresaDespesasConfigRoute,

    empresaClientesImportRoute,

    mapasRoute,
    mapasDistribuidoresRoute,
    mapasConsultoresRoute,
    mapasAdminRoute,
    mapasAdminInsightsRoute,
    mapasAdminDistribuidoresRoute,
    mapasAdminConsultoresRoute,

    npsRoute,
    npsDashboardRoute,
    globalNpsDashboardRoute,
    npsPesquisasRoute,
    npsRelatoriosRoute,
    npsPreviewRoute,
    npsTemaRoute,

    funisRoute,
    funisDashboardRoute,
    funilDetalleRoute,
    funisTemplatesRoute,
    funilAutomationsRoute,

    linktreeDashboardRoute,
    linktreeTemaRoute,
    empresaLinktreeDashboardRoute,

    globalHubRoute,
    empresaHubTemaRoute,
    hubAdminDashboardRoute,
    hubAdminMateriaisRoute,
    hubAdminTrilhasRoute,
    hubAdminAnalyticsRoute,
    hubAdminBadgesRoute,
    hubAdminChatbotRoute,
    hubGestorDashboardRoute,
    hubGestorAnalyticsRoute,
    hubGestorRankingRoute,
    hubGestorConquistasRoute,
    hubConsultorDashboardRoute,
    hubConsultorRankingRoute,
    hubConsultorConquistasRoute,
    hubDistribuidorDashboardRoute,
    hubDistribuidorConquistasRoute,

    crmDashboardRoute,
    crmCarteiraRoute,
    crmPipelineRoute,
    crmTarefasRoute,
    crmMetricasRoute,
    crmClienteDetailRoute,
    crmEquipeRoute,
    crmBiRoute,
    crmTransferenciaRoute.addChildren([
      crmTransferenciaIndexRoute,
      crmTransferenciaConsultoresRoute,
    ]),
    crmDiretoriaIndexRoute,
    crmDiretoriaGestorRoute,

    rotasDesignRoute,
    empresaNpsDesignRoute,
    empresaLinktreeDesignRoute,
    empresaHubDesignRoute,
    empresaMapasDesignRoute,
    empresaFunisDesignRoute,
    empresaCrmDesignRoute,
    empresaCadastrosDesignRoute,
    empresaCadastrosFormularioRoute,
    empresaDespesasDesignRoute,
    empresaRotasDesignRoute,
    empresaNpsTemaRoute,
    empresaLinktreeTemaRoute,
    empresaHubChatbotRoute,
    empresaAgentesRoute,

    marketingDashboardRoute,
    marketingLandingPagesRoute,
    marketingMetaBmRoute,
    marketingMetaBmCampanhasRoute,
    marketingMetaBmPostsRoute,
    marketingUtmsRoute,
    marketingCriativosRoute,
    marketingEmailRoute,
    marketingEmailCampanhaRoute,
    marketingEmailAnalyticsRoute,
    marketingSeoRoute,
    marketingCalendarioRoute,
    marketingLeadsRoute,
    marketingLeadsDetailRoute,
    marketingPixelsRoute,
    marketingWhatsappRoute,

    ferramentasLinksRoute,
    ferramentasLinksHistoricoRoute,
    ferramentasLinksTemplatesRoute,
    ferramentasLinksWhatsappRoute,
    ferramentasLinksUtmRoute,
    ferramentasLinksGoogleReviewRoute,
    ferramentasLinksMapsRoute,
    ferramentasLinksWazeRoute,
    ferramentasLinksQrcodeRoute,

    catalogoAdminProdutosRoute,
    catalogoAdminCadastrosRoute,
    catalogoAdminCuponsRoute,
    catalogoAdminFreteRoute,
    catalogoAdminPromocionaisRoute,
    catalogoAdminDashboardRoute,
    catalogoAdminCoresRoute,
    catalogoAdminConfiguracoesRoute,
    catalogoAdminDesignRoute,
    catalogoAdminClientesRoute,
    catalogoAdminGruposRoute,
    catalogoAdminOrcamentosRoute,
    catalogoAdminPedidosRoute,
    catalogoOrcamentosRoute,
    catalogoPedidosRoute,
    catalogoAdminSolicitacoesRoute,
    catalogoAdminImplantesRoute,
    catalogoAdminComponentesRoute,
    catalogoAdminInstrumentaisRoute,
    catalogoAdminKitsRoute,
    catalogoAdminWorkflowsRoute,
    catalogoAdminFresagensRoute,
    catalogoAdminCategoriasRoute,
  ]),
]);

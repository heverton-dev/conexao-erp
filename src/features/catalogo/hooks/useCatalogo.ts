import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as hierarquia from "../services/hierarquia.service"
import * as implantes from "../services/implantes.service"
import * as componentes from "../services/componentes.service"
import * as acessorios from "../services/acessorios.service"
import * as workflows from "../services/workflows.service"
import * as kits from "../services/kits.service"
import * as cupons from "../services/cupons.service"
import * as frete from "../services/frete.service"
import * as parafusosRetensao from "../services/parafusos-retensao.service"
import * as parafusos from "../services/parafusos.service"
import * as cicatrizadores from "../services/cicatrizadores.service"
import * as promocionais from "../services/promocionais.service"
import * as clientesService from "../services/clientes.service"
import * as gruposService from "../services/grupos.service"
import * as pedidosService from "../services/pedidos.service"
import * as orcamentosService from "../services/orcamentos.service"
import * as imagensService from "../services/imagens.service"
import * as chavesService from "../services/chaves.service"
import * as fresasTiposService from "../services/fresas-tipos.service"
import * as fresagensService from "../services/fresagens.service"
import * as complementaresService from "../services/complementares.service"
import * as opcionaisService from "../services/opcionais.service"
import * as seqProteticaService from "../services/sequencia-protetica.service"
import { getCatalogoDesign } from "../services/design.service"
import { getConfiguracoes } from "../services/configuracoes.service"
import * as estoqueService from "../services/estoque.service"
import toast from "react-hot-toast"
import type { CatalogoImplante, CatalogoKit, CatalogoAbutment, CatalogoCategoria, CatalogoConexao, CatalogoLinha, CatalogoFamilia, CatalogoFresa, CatalogoTipoReabilitacao, CatalogoTipoAbutment, CatalogoCategoriaAcessorio, CatalogoAcessorio, CatalogoChave, CatalogoCategoriaInstrumental, CatalogoInstrumentalGeral, CatalogoCategoriaKit, CatalogoTipoKit, CatalogoWorkflow, CatalogoEtapaWorkflow, CatalogoParafusoRetencao, CatalogoCicatrizador, CatalogoTipoChave, CatalogoTipoFresa, CatalogoTipoComplementar, CatalogoTipoOpcional, ProdutoTipoImagem, CatalogoImagemProduto, CatalogoCpsTipoComponente, CatalogoCpsTipoParafuso, CatalogoCpsTipoCicatrizador, CatalogoParafuso, CatalogoComponente } from "../types"


// --- Hierarquia ---
export function useCategorias() {
  return useQuery({ queryKey: ["catalogo", "categorias"], queryFn: () => hierarquia.listarCategorias() })
}

export function useConexoes(categoriaId?: string) {
  return useQuery({ queryKey: ["catalogo", "conexoes", categoriaId], queryFn: () => hierarquia.listarConexoes(categoriaId) })
}

export function useToggleCategoriaAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => hierarquia.toggleCategoriaAtivo(id, ativo),
    onMutate: async ({ id, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "categorias"] })
      const prev = qc.getQueryData<CatalogoCategoria[]>(["catalogo", "categorias"])
      qc.setQueryData<CatalogoCategoria[]>(["catalogo", "categorias"], (old) =>
        old?.map((c) => (c.id === id ? { ...c, ativo } : c)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "categorias"], ctx.prev)
      toast.error("Erro ao alterar categoria: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "categorias"] })
    },
  })
}
export function useCriarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { nome: string; sigla?: string; locked?: boolean; ativo?: boolean }) => hierarquia.criarCategoria(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "categorias"] }),
  })
}

export function useAtualizarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<{ nome: string; sigla: string | null }> }) => hierarquia.atualizarCategoria(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "categorias"] }),
  })
}

export function useRemoverCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => hierarquia.removerCategoria(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "categorias"] }),
  })
}

export function useToggleConexaoAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => hierarquia.toggleConexaoAtivo(id, ativo),
    onMutate: async ({ id, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "conexoes"] })
      const prev = qc.getQueryData<CatalogoConexao[]>(["catalogo", "conexoes"])
      qc.setQueryData<CatalogoConexao[]>(["catalogo", "conexoes"], (old) =>
        old?.map((c) => (c.id === id ? { ...c, ativo } : c)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "conexoes"], ctx.prev)
      toast.error("Erro ao alterar conexão: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "conexoes"] })
    },
  })
}

export function useFamilias(conexaoId?: string) {
  return useQuery({ queryKey: ["catalogo", "familias", conexaoId], queryFn: () => hierarquia.listarFamilias(conexaoId) })
}

export function useLinhas(familiaId?: string) {
  return useQuery({ queryKey: ["catalogo", "linhas", familiaId], queryFn: () => hierarquia.listarLinhas(familiaId) })
}

export function useToggleLinhaAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => hierarquia.toggleLinhaAtiva(id, ativo),
    onMutate: async ({ id, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "linhas"] })
      const prev = qc.getQueryData<CatalogoLinha[]>(["catalogo", "linhas"])
      qc.setQueryData<CatalogoLinha[]>(["catalogo", "linhas"], (old) =>
        old?.map((l) => (l.id === id ? { ...l, ativo } : l)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "linhas"], ctx.prev)
      toast.error("Erro ao alterar linha: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "linhas"] })
    },
  })
}

export function useToggleFamiliaAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => hierarquia.toggleFamiliaAtivo(id, ativo),
    onMutate: async ({ id, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "familias"] })
      const prev = qc.getQueryData<CatalogoFamilia[]>(["catalogo", "familias"])
      qc.setQueryData<CatalogoFamilia[]>(["catalogo", "familias"], (old) =>
        old?.map((f) => (f.id === id ? { ...f, ativo } : f)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "familias"], ctx.prev)
      toast.error("Erro ao alterar família: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "familias"] })
    },
  })
}

export function useCriarConexao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { categoria_id: string; nome: string; sigla: string }) => hierarquia.criarConexao(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "conexoes"] }),
  })
}

export function useAtualizarConexao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<{ nome: string; sigla: string; categoria_id: string }> }) => hierarquia.atualizarConexao(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "conexoes"] }),
  })
}

export function useRemoverConexao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => hierarquia.removerConexao(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "conexoes"] }),
  })
}

export function useCriarFamilia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { conexao_id: string; nome: string; cor_identificacao?: string }) => hierarquia.criarFamilia(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "familias"] }),
  })
}

export function useAtualizarFamilia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<{ nome: string; cor_identificacao: string }> }) => hierarquia.atualizarFamilia(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "familias"] }),
  })
}

export function useRemoverFamilia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => hierarquia.removerFamilia(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "familias"] }),
  })
}

export function useCriarLinha() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { familia_id: string; nome: string }) => hierarquia.criarLinha(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "linhas"] }),
  })
}

export function useAtualizarLinha() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<{ nome: string; familia_id: string }> }) => hierarquia.atualizarLinha(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "linhas"] }),
  })
}

export function useRemoverLinha() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => hierarquia.removerLinha(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "linhas"] }),
  })
}

// --- Implantes ---
export function useImplantesAtivos() {
  return useQuery({ queryKey: ["catalogo", "implantes", "ativos"], queryFn: () => implantes.listarImplantesAtivos() })
}

export function useTodosImplantes() {
  return useQuery({ queryKey: ["catalogo", "implantes", "todos"], queryFn: () => implantes.listarTodosImplantes() })
}

export function useImplanteDetalhe(sku: string) {
  return useQuery({ queryKey: ["catalogo", "implante", sku], queryFn: () => implantes.getImplanteDetalhe(sku), enabled: !!sku })
}

export function useImplantesPorLinha(linhaId: string) {
  return useQuery({ queryKey: ["catalogo", "implantes-linha", linhaId], queryFn: () => implantes.listarImplantesPorLinha(linhaId), enabled: !!linhaId })
}

export function useProtocoloFresagem(implanteSku: string) {
  return useQuery({ queryKey: ["catalogo", "fresagem", implanteSku], queryFn: () => implantes.getProtocoloFresagem(implanteSku), enabled: !!implanteSku })
}
export function useProtocolos() {
  return useQuery({ queryKey: ["catalogo", "protocolos-fresagens"], queryFn: () => fresagensService.listarProtocolos() })
}

export function useTiposOsso() {
  return useQuery({ queryKey: ["catalogo", "tipos-osso"], queryFn: () => fresagensService.listarTiposOsso() })
}

export function useFresas() {
  return useQuery({ queryKey: ["catalogo", "fresas"], queryFn: () => implantes.listarFresas() })
}
export function useProtocoloFresas(protocoloId: string) {
  return useQuery({ queryKey: ["catalogo", "protocolo-fresas", protocoloId], queryFn: () => fresagensService.listarProtocoloFresas(protocoloId), enabled: !!protocoloId })
}

export function useImplantesDiametros() {
  return useQuery({ queryKey: ["catalogo", "implantes-diametros"], queryFn: () => fresagensService.listarDiametrosImplantes() })
}

export function useCriarTipoOsso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { nome: string; sigla?: string | null; categoria?: "hard" | "soft"; ativo?: boolean }) => fresagensService.criarTipoOsso(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-osso"] }),
  })
}

export function useAtualizarTipoOsso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<{ nome: string; sigla: string | null; categoria: "hard" | "soft"; ativo: boolean }> }) => fresagensService.atualizarTipoOsso(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-osso"] }),
  })
}

export function useRemoverTipoOsso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fresagensService.removerTipoOsso(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-osso"] }),
  })
}

export function useToggleTipoOssoAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => fresagensService.toggleTipoOssoAtivo(id, ativo),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-osso"] }),
  })
}

export function useCriarProtocolo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { nome: string; tipo_osso: string; sigla?: string; diametro_mm_aplicavel?: number }) => fresagensService.criarProtocolo(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "protocolos-fresagens"] }),
  })
}

export function useAtualizarProtocolo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<{ nome: string; tipo_osso: string; sigla: string; diametro_mm_aplicavel: number; ativo: boolean }> }) => fresagensService.atualizarProtocolo(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "protocolos-fresagens"] }),
  })
}

export function useRemoverProtocolo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fresagensService.removerProtocolo(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "protocolos-fresagens"] }),
  })
}

export function useToggleProtocoloAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => fresagensService.toggleProtocoloAtivo(id, ativo),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "protocolos-fresagens"] }),
  })
}

export function useSalvarProtocoloFresas() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ protocoloId, items }: { protocoloId: string; items: { fresa_id: string; ordem: number }[] }) => fresagensService.salvarProtocoloFresas(protocoloId, items),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "protocolos-fresagens"] }),
  })
}

export function useCriarImplante() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof implantes.criarImplante>[0]) => implantes.criarImplante(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "implantes"] }),
  })
}

export function useAtualizarImplante() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, input }: { sku: string; input: Parameters<typeof implantes.atualizarImplante>[1] }) => implantes.atualizarImplante(sku, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "implantes"] }),
  })
}

export function useToggleImplanteAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, ativo }: { sku: string; ativo: boolean }) => implantes.toggleImplanteAtivo(sku, ativo),
    onMutate: async ({ sku, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "implantes", "todos"] })
      const prev = qc.getQueryData<CatalogoImplante[]>(["catalogo", "implantes", "todos"])
      qc.setQueryData<CatalogoImplante[]>(["catalogo", "implantes", "todos"], (old) =>
        old?.map((i) => (i.sku === sku ? { ...i, ativo } : i)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "implantes", "todos"], ctx.prev)
      toast.error("Erro ao alterar implante: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "implantes"] })
    },
  })
}

export function useRemoverImplante() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sku: string) => implantes.removerImplante(sku),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "implantes"] }),
  })
}

// --- Componentes ---
export function useTiposReabilitacao() {
  return useQuery({ queryKey: ["catalogo", "tipos-reabilitacao"], queryFn: () => componentes.listarTiposReabilitacao() })
}

export function useTiposAbutment() {
  return useQuery({ queryKey: ["catalogo", "tipos-abutment"], queryFn: () => componentes.listarTiposAbutment() })
}

export function useAbutments(familiaId?: string) {
  return useQuery({ queryKey: ["catalogo", "abutments", familiaId], queryFn: () => componentes.listarAbutments() })
}

export function useComponentes() {
  return useQuery({ queryKey: ["catalogo", "componentes"], queryFn: () => componentes.listarComponentes() })
}

export function useAbutmentDetalhe(sku: string) {
  return useQuery({ queryKey: ["catalogo", "abutment", sku], queryFn: () => componentes.getAbutmentDetalhe(sku), enabled: !!sku })
}

export function useCriarAbutment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof componentes.criarAbutment>[0]) => componentes.criarAbutment(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "abutments"] }),
  })
}

export function useAtualizarAbutment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, input }: { sku: string; input: Parameters<typeof componentes.atualizarAbutment>[1] }) => componentes.atualizarAbutment(sku, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "abutments"] }),
  })
}

export function useRemoverAbutment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sku: string) => componentes.removerAbutment(sku),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "abutments"] }),
  })
}

export function useToggleAbutmentAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, ativo }: { sku: string; ativo: boolean }) => componentes.toggleAbutmentAtivo(sku, ativo),
    onMutate: async ({ sku, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "abutments", undefined] })
      const prev = qc.getQueryData<CatalogoAbutment[]>(["catalogo", "abutments", undefined])
      qc.setQueryData<CatalogoAbutment[]>(["catalogo", "abutments", undefined], (old) =>
        old?.map((a) => (a.sku === sku ? { ...a, ativo } : a)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "abutments", undefined], ctx.prev)
      toast.error("Erro ao alterar componente: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "abutments"] })
    },
  })
}
// --- Componentes: Tipos ---
export function useTiposComponente() {
  return useQuery({ queryKey: ["catalogo", "tipos-componente"], queryFn: () => componentes.listarTiposComponentes() })
}

export function useTiposParafuso() {
  return useQuery({ queryKey: ["catalogo", "tipos-parafuso"], queryFn: () => componentes.listarTiposParafusos() })
}

export function useTiposCicatrizador() {
  return useQuery({ queryKey: ["catalogo", "tipos-cicatrizador"], queryFn: () => componentes.listarTiposCicatrizadores() })
}

// --- Listas para selects ---
export function useParafusosList() {
  return useQuery({ queryKey: ["catalogo", "parafusos-list"], queryFn: () => parafusos.listarParafusos() })
}

export function useChavesList() {
  return useQuery({ queryKey: ["catalogo", "chaves-list"], queryFn: () => chavesService.listarChaves() })
}

export function useReabFamilias() {
  return useQuery({ queryKey: ["catalogo", "reab-familias"], queryFn: () => componentes.listarReabFamilias() })
}

export function useTodasSequencias() {
  return useQuery({ queryKey: ["catalogo", "todas-sequencias"], queryFn: () => seqProteticaService.listarSeqProteticas() })
}

export function useAbutmentSeqs(abutmentSku: string) {
  return useQuery({ queryKey: ["catalogo", "abutment-seqs", abutmentSku], queryFn: () => seqProteticaService.listarSeqProteticasAbutment(abutmentSku), enabled: !!abutmentSku })
}

// --- Componentes: Tipos Mutations ---
export function useCriarTipoReabilitacao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof componentes.criarTipoReabilitacao>[0]) => componentes.criarTipoReabilitacao(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-reabilitacao"] }),
  })
}

export function useAtualizarTipoReabilitacao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof componentes.atualizarTipoReabilitacao>[1] }) => componentes.atualizarTipoReabilitacao(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-reabilitacao"] }),
  })
}

export function useRemoverTipoReabilitacao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => componentes.removerTipoReabilitacao(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-reabilitacao"] }),
  })
}

export function useSalvarReabFamilias() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ tipoReabId, familiaIds }: { tipoReabId: string; familiaIds: string[] }) => componentes.salvarReabFamilias(tipoReabId, familiaIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "reab-familias"] }),
  })
}

export function useCriarTipoAbutment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof componentes.criarTipoAbutment>[0]) => componentes.criarTipoAbutment(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-abutment"] }),
  })
}

export function useAtualizarTipoAbutment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof componentes.atualizarTipoAbutment>[1] }) => componentes.atualizarTipoAbutment(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-abutment"] }),
  })
}

export function useRemoverTipoAbutment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => componentes.removerTipoAbutment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-abutment"] }),
  })
}

export function useCriarTipoComponente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof componentes.criarTipoComponente>[0]) => componentes.criarTipoComponente(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-componente"] }),
  })
}

export function useAtualizarTipoComponente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof componentes.atualizarTipoComponente>[1] }) => componentes.atualizarTipoComponente(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-componente"] }),
  })
}

export function useRemoverTipoComponente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => componentes.removerTipoComponente(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-componente"] }),
  })
}

export function useCriarTipoParafuso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof componentes.criarTipoParafuso>[0]) => componentes.criarTipoParafuso(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-parafuso"] }),
  })
}

export function useAtualizarTipoParafuso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof componentes.atualizarTipoParafuso>[1] }) => componentes.atualizarTipoParafuso(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-parafuso"] }),
  })
}

export function useRemoverTipoParafuso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => componentes.removerTipoParafuso(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-parafuso"] }),
  })
}

export function useCriarTipoCicatrizador() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof componentes.criarTipoCicatrizador>[0]) => componentes.criarTipoCicatrizador(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-cicatrizador"] }),
  })
}

export function useAtualizarTipoCicatrizador() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof componentes.atualizarTipoCicatrizador>[1] }) => componentes.atualizarTipoCicatrizador(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-cicatrizador"] }),
  })
}

export function useRemoverTipoCicatrizador() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => componentes.removerTipoCicatrizador(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-cicatrizador"] }),
  })
}

// --- Componentes: Tipos Toggles ---
export function useToggleTipoComponenteAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => componentes.toggleTipoComponenteAtivo(id, ativo),
    onMutate: async ({ id, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "tipos-componente"] })
      const prev = qc.getQueryData<CatalogoCpsTipoComponente[]>(["catalogo", "tipos-componente"])
      qc.setQueryData<CatalogoCpsTipoComponente[]>(["catalogo", "tipos-componente"], (old) =>
        old?.map((t) => (t.id === id ? { ...t, ativo } : t)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "tipos-componente"], ctx.prev)
      toast.error("Erro ao alterar tipo de componente: " + (err as Error).message)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-componente"] }),
  })
}

export function useToggleTipoParafusoAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => componentes.toggleTipoParafusoAtivo(id, ativo),
    onMutate: async ({ id, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "tipos-parafuso"] })
      const prev = qc.getQueryData<CatalogoCpsTipoParafuso[]>(["catalogo", "tipos-parafuso"])
      qc.setQueryData<CatalogoCpsTipoParafuso[]>(["catalogo", "tipos-parafuso"], (old) =>
        old?.map((t) => (t.id === id ? { ...t, ativo } : t)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "tipos-parafuso"], ctx.prev)
      toast.error("Erro ao alterar tipo de parafuso: " + (err as Error).message)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-parafuso"] }),
  })
}

export function useToggleTipoCicatrizadorAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => componentes.toggleTipoCicatrizadorAtivo(id, ativo),
    onMutate: async ({ id, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "tipos-cicatrizador"] })
      const prev = qc.getQueryData<CatalogoCpsTipoCicatrizador[]>(["catalogo", "tipos-cicatrizador"])
      qc.setQueryData<CatalogoCpsTipoCicatrizador[]>(["catalogo", "tipos-cicatrizador"], (old) =>
        old?.map((t) => (t.id === id ? { ...t, ativo } : t)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "tipos-cicatrizador"], ctx.prev)
      toast.error("Erro ao alterar tipo de cicatrizador: " + (err as Error).message)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-cicatrizador"] }),
  })
}

// --- Parafusos (produtos) ---
export function useCriarParafuso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof parafusos.criarParafuso>[0]) => parafusos.criarParafuso(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "parafusos"] }),
  })
}

export function useAtualizarParafuso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, input }: { sku: string; input: Parameters<typeof parafusos.atualizarParafuso>[1] }) => parafusos.atualizarParafuso(sku, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "parafusos"] }),
  })
}

export function useRemoverParafuso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sku: string) => parafusos.removerParafuso(sku),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "parafusos"] }),
  })
}

export function useToggleParafusoAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, ativo }: { sku: string; ativo: boolean }) => parafusos.toggleParafusoAtivo(sku, ativo),
    onMutate: async ({ sku, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "parafusos-list"] })
      const prev = qc.getQueryData<CatalogoParafuso[]>(["catalogo", "parafusos-list"])
      qc.setQueryData<CatalogoParafuso[]>(["catalogo", "parafusos-list"], (old) =>
        old?.map((p) => (p.sku === sku ? { ...p, ativo } : p)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "parafusos-list"], ctx.prev)
      toast.error("Erro ao alterar parafuso: " + (err as Error).message)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["catalogo", "parafusos"] }),
  })
}

// --- Componentes (produtos) ---
export function useCriarComponenteProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof componentes.criarComponente>[0]) => componentes.criarComponente(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "componentes"] }),
  })
}

export function useAtualizarComponenteProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, input }: { sku: string; input: Parameters<typeof componentes.atualizarComponente>[1] }) => componentes.atualizarComponente(sku, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "componentes"] }),
  })
}

export function useRemoverComponenteProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sku: string) => componentes.removerComponente(sku),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "componentes"] }),
  })
}

export function useToggleComponenteAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, ativo }: { sku: string; ativo: boolean }) => componentes.toggleComponenteAtivo(sku, ativo),
    onMutate: async ({ sku, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "componentes"] })
      const prev = qc.getQueryData<CatalogoComponente[]>(["catalogo", "componentes"])
      qc.setQueryData<CatalogoComponente[]>(["catalogo", "componentes"], (old) =>
        old?.map((c) => (c.sku === sku ? { ...c, ativo } : c)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "componentes"], ctx.prev)
      toast.error("Erro ao alterar componente: " + (err as Error).message)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["catalogo", "componentes"] }),
  })
}

// --- Cicatrizadores: Remover ---
export function useRemoverCicatrizador() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sku: string) => cicatrizadores.removerCicatrizador(sku),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "cicatrizadores"] }),
  })
}

// --- Sequencias Protéticas: Abutment ---
export function useSalvarAbutmentSeqs() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ abutmentSku, seqIds }: { abutmentSku: string; seqIds: string[] }) => seqProteticaService.salvarSeqProteticasAbutment(abutmentSku, seqIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "abutment-seqs"] }),
  })
}

// --- Fresas ---
export function useToggleFresaAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, ativo }: { sku: string; ativo: boolean }) => implantes.toggleFresaAtivo(sku, ativo),
    onMutate: async ({ sku, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "fresas"] })
      const prev = qc.getQueryData<CatalogoFresa[]>(["catalogo", "fresas"])
      qc.setQueryData<CatalogoFresa[]>(["catalogo", "fresas"], (old) =>
        old?.map((f) => (f.sku === sku ? { ...f, ativo } : f)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "fresas"], ctx.prev)
      toast.error("Erro ao alterar fresa: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "fresas"] })
    },
  })
}

// --- Tipos Protéticos ---
export function useToggleTipoReabilitacaoAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => componentes.toggleTipoReabilitacaoAtivo(id, ativo),
    onMutate: async ({ id, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "tipos-reabilitacao"] })
      const prev = qc.getQueryData<CatalogoTipoReabilitacao[]>(["catalogo", "tipos-reabilitacao"])
      qc.setQueryData<CatalogoTipoReabilitacao[]>(["catalogo", "tipos-reabilitacao"], (old) =>
        old?.map((t) => (t.id === id ? { ...t, ativo } : t)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "tipos-reabilitacao"], ctx.prev)
      toast.error("Erro ao alterar tipo de reabilitação: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "tipos-reabilitacao"] })
    },
  })
}

export function useToggleTipoAbutmentAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => componentes.toggleTipoAbutmentAtivo(id, ativo),
    onMutate: async ({ id, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "tipos-abutment"] })
      const prev = qc.getQueryData<CatalogoTipoAbutment[]>(["catalogo", "tipos-abutment"])
      qc.setQueryData<CatalogoTipoAbutment[]>(["catalogo", "tipos-abutment"], (old) =>
        old?.map((t) => (t.id === id ? { ...t, ativo } : t)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "tipos-abutment"], ctx.prev)
      toast.error("Erro ao alterar tipo de abutment: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "tipos-abutment"] })
    },
  })
}

// --- Acessórios ---
export function useToggleCategoriaAcessorioAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => acessorios.toggleCategoriaAcessorioAtivo(id, ativo),
    onMutate: async ({ id, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "cats-acessorio"] })
      const prev = qc.getQueryData<CatalogoCategoriaAcessorio[]>(["catalogo", "cats-acessorio"])
      qc.setQueryData<CatalogoCategoriaAcessorio[]>(["catalogo", "cats-acessorio"], (old) =>
        old?.map((c) => (c.id === id ? { ...c, ativo } : c)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "cats-acessorio"], ctx.prev)
      toast.error("Erro ao alterar categoria de acessório: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "cats-acessorio"] })
    },
  })
}

export function useAcessorios(categoriaId?: string) {
  return useQuery({ queryKey: ["catalogo", "acessorios", categoriaId], queryFn: () => acessorios.listarAcessorios(categoriaId) })
}

export function useToggleAcessorioAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, ativo }: { sku: string; ativo: boolean }) => acessorios.toggleAcessorioAtivo(sku, ativo),
    onMutate: async ({ sku, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "acessorios"] })
      const prev = qc.getQueryData<CatalogoAcessorio[]>(["catalogo", "acessorios"])
      qc.setQueryData<CatalogoAcessorio[]>(["catalogo", "acessorios"], (old) =>
        old?.map((a) => (a.sku === sku ? { ...a, ativo } : a)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "acessorios"], ctx.prev)
      toast.error("Erro ao alterar acessório: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "acessorios"] })
    },
  })
}

export function useChavesFerramental() {
  return useQuery({ queryKey: ["catalogo", "chaves"], queryFn: () => acessorios.listarChavesFerramental() })
}

export function useFerramentasObrigatorias(acessorioSku: string) {
  return useQuery({ queryKey: ["catalogo", "ferramentas-obr", acessorioSku], queryFn: () => acessorios.getFerramentasObrigatorias(acessorioSku), enabled: !!acessorioSku })
}

export function useToggleChaveFerramentalAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, ativo }: { sku: string; ativo: boolean }) => acessorios.toggleChaveFerramentalAtivo(sku, ativo),
    onMutate: async ({ sku, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "chaves"] })
      const prev = qc.getQueryData<CatalogoChave[]>(["catalogo", "chaves"])
      qc.setQueryData<CatalogoChave[]>(["catalogo", "chaves"], (old) =>
        old?.map((c) => (c.sku === sku ? { ...c, ativo } : c)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "chaves"], ctx.prev)
      toast.error("Erro ao alterar chave/ferramental: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "chaves"] })
    },
  })
}

// --- Tipos de Instrumentais ---
export function useTiposChaves() {
  return useQuery({ queryKey: ["catalogo", "tipos-chaves"], queryFn: () => chavesService.listarTiposChaves() })
}

export function useToggleTipoChaveAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => chavesService.toggleTipoChaveAtivo(id, ativo),
    onMutate: async ({ id, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "tipos-chaves"] })
      const prev = qc.getQueryData<CatalogoTipoChave[]>(["catalogo", "tipos-chaves"])
      qc.setQueryData<CatalogoTipoChave[]>(["catalogo", "tipos-chaves"], (old) =>
        old?.map((c) => (c.id === id ? { ...c, ativo } : c)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "tipos-chaves"], ctx.prev)
      toast.error("Erro ao alterar tipo de chave: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "tipos-chaves"] })
    },
  })
}

export function useTiposFresas() {
  return useQuery({ queryKey: ["catalogo", "tipos-fresas"], queryFn: () => fresasTiposService.listarTiposFresas() })
}

export function useToggleTipoFresaAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => fresasTiposService.toggleTipoFresaAtivo(id, ativo),
    onMutate: async ({ id, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "tipos-fresas"] })
      const prev = qc.getQueryData<CatalogoTipoFresa[]>(["catalogo", "tipos-fresas"])
      qc.setQueryData<CatalogoTipoFresa[]>(["catalogo", "tipos-fresas"], (old) =>
        old?.map((c) => (c.id === id ? { ...c, ativo } : c)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "tipos-fresas"], ctx.prev)
      toast.error("Erro ao alterar tipo de fresa: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "tipos-fresas"] })
    },
  })
}

export function useTiposComplementares() {
  return useQuery({ queryKey: ["catalogo", "tipos-complementares"], queryFn: () => complementaresService.listarTiposComplementares() })
}

export function useComplementares() {
  return useQuery({ queryKey: ["catalogo", "complementares"], queryFn: () => complementaresService.listarComplementares() })
}

export function useToggleTipoComplementarAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => complementaresService.toggleTipoComplementarAtivo(id, ativo),
    onMutate: async ({ id, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "tipos-complementares"] })
      const prev = qc.getQueryData<CatalogoTipoComplementar[]>(["catalogo", "tipos-complementares"])
      qc.setQueryData<CatalogoTipoComplementar[]>(["catalogo", "tipos-complementares"], (old) =>
        old?.map((c) => (c.id === id ? { ...c, ativo } : c)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "tipos-complementares"], ctx.prev)
      toast.error("Erro ao alterar tipo complementar: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "tipos-complementares"] })
    },
  })
}

export function useTiposOpcionais() {
  return useQuery({ queryKey: ["catalogo", "tipos-opcionais"], queryFn: () => opcionaisService.listarTiposOpcionais() })
}

export function useOpcionais() {
  return useQuery({ queryKey: ["catalogo", "opcionais"], queryFn: () => opcionaisService.listarOpcionais() })
}

export function useToggleTipoOpcionalAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => opcionaisService.toggleTipoOpcionalAtivo(id, ativo),
    onMutate: async ({ id, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "tipos-opcionais"] })
      const prev = qc.getQueryData<CatalogoTipoOpcional[]>(["catalogo", "tipos-opcionais"])
      qc.setQueryData<CatalogoTipoOpcional[]>(["catalogo", "tipos-opcionais"], (old) =>
        old?.map((c) => (c.id === id ? { ...c, ativo } : c)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "tipos-opcionais"], ctx.prev)
      toast.error("Erro ao alterar tipo opcional: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "tipos-opcionais"] })
    },
  })
}

// --- Chaves (produto) ---
export function useChaves() {
  return useQuery({ queryKey: ["catalogo", "chaves-list"], queryFn: () => chavesService.listarChaves() })
}

export function useCriarChave() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: chavesService.criarChave,
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo"] }) },
  })
}

export function useAtualizarChave() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, input }: { sku: string; input: Parameters<typeof chavesService.atualizarChave>[1] }) => chavesService.atualizarChave(sku, input),
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo"] }) },
  })
}

export function useRemoverChave() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: chavesService.removerChave,
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo"] }) },
  })
}

export function useToggleChaveAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, ativo }: { sku: string; ativo: boolean }) => chavesService.toggleChaveAtivo(sku, ativo),
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo"] }) },
  })
}

// --- CRUD Tipos Chave ---
export function useCriarTipoChave() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: chavesService.criarTipoChave,
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo", "tipos-chaves"] }) },
  })
}

export function useAtualizarTipoChave() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof chavesService.atualizarTipoChave>[1] }) => chavesService.atualizarTipoChave(id, input),
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo", "tipos-chaves"] }) },
  })
}

export function useRemoverTipoChave() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: chavesService.removerTipoChave,
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo", "tipos-chaves"] }) },
  })
}

// --- CRUD Tipos Fresa ---
export function useCriarTipoFresa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fresasTiposService.criarTipoFresa,
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo", "tipos-fresas"] }) },
  })
}

export function useAtualizarTipoFresa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof fresasTiposService.atualizarTipoFresa>[1] }) => fresasTiposService.atualizarTipoFresa(id, input),
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo", "tipos-fresas"] }) },
  })
}

export function useRemoverTipoFresa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fresasTiposService.removerTipoFresa,
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo", "tipos-fresas"] }) },
  })
}

// --- CRUD Tipos Complementar ---
export function useCriarTipoComplementar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: complementaresService.criarTipoComplementar,
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo", "tipos-complementares"] }) },
  })
}

export function useAtualizarTipoComplementar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof complementaresService.atualizarTipoComplementar>[1] }) => complementaresService.atualizarTipoComplementar(id, input),
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo", "tipos-complementares"] }) },
  })
}

export function useRemoverTipoComplementar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: complementaresService.removerTipoComplementar,
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo", "tipos-complementares"] }) },
  })
}

// --- CRUD Tipos Opcional ---
export function useCriarTipoOpcional() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: opcionaisService.criarTipoOpcional,
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo", "tipos-opcionais"] }) },
  })
}

export function useAtualizarTipoOpcional() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof opcionaisService.atualizarTipoOpcional>[1] }) => opcionaisService.atualizarTipoOpcional(id, input),
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo", "tipos-opcionais"] }) },
  })
}

export function useRemoverTipoOpcional() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: opcionaisService.removerTipoOpcional,
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo", "tipos-opcionais"] }) },
  })
}

// --- Fresas (produto) ---
export function useCriarFresa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: implantes.criarFresa,
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo"] }) },
  })
}

export function useAtualizarFresa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, input }: { sku: string; input: Parameters<typeof implantes.atualizarFresa>[1] }) => implantes.atualizarFresa(sku, input),
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo"] }) },
  })
}

export function useRemoverFresa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: implantes.removerFresa,
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo"] }) },
  })
}

// --- Complementares (produto) ---
export function useCriarComplementar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: complementaresService.criarComplementar,
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo"] }) },
  })
}

export function useAtualizarComplementar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, input }: { sku: string; input: Parameters<typeof complementaresService.atualizarComplementar>[1] }) => complementaresService.atualizarComplementar(sku, input),
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo"] }) },
  })
}

export function useRemoverComplementar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: complementaresService.removerComplementar,
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo"] }) },
  })
}

export function useToggleComplementarAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, ativo }: { sku: string; ativo: boolean }) => complementaresService.toggleComplementarAtivo(sku, ativo),
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo"] }) },
  })
}

// --- Opcionais (produto) ---
export function useCriarOpcional() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: opcionaisService.criarOpcional,
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo"] }) },
  })
}

export function useAtualizarOpcional() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, input }: { sku: string; input: Parameters<typeof opcionaisService.atualizarOpcional>[1] }) => opcionaisService.atualizarOpcional(sku, input),
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo"] }) },
  })
}

export function useRemoverOpcional() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: opcionaisService.removerOpcional,
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo"] }) },
  })
}

export function useToggleOpcionalAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, ativo }: { sku: string; ativo: boolean }) => opcionaisService.toggleOpcionalAtivo(sku, ativo),
    onSettled: () => { qc.invalidateQueries({ queryKey: ["catalogo"] }) },
  })
}

export function useCategoriasAcessorio() {
  return useQuery({ queryKey: ["catalogo", "cats-acessorio"], queryFn: () => acessorios.listarCategoriasAcessorio() })
}

export function useToggleCategoriaInstrumentalAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => acessorios.toggleCategoriaInstrumentalAtivo(id, ativo),
    onMutate: async ({ id, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "cats-instrumental"] })
      const prev = qc.getQueryData<CatalogoCategoriaInstrumental[]>(["catalogo", "cats-instrumental"])
      qc.setQueryData<CatalogoCategoriaInstrumental[]>(["catalogo", "cats-instrumental"], (old) =>
        old?.map((c) => (c.id === id ? { ...c, ativo } : c)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "cats-instrumental"], ctx.prev)
      toast.error("Erro ao alterar categoria de instrumental: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "cats-instrumental"] })
    },
  })
}

export function useCategoriasInstrumental() {
  return useQuery({ queryKey: ["catalogo", "cats-instrumental"], queryFn: () => acessorios.listarCategoriasInstrumental() })
}

export function useInstrumentais(categoriaId?: string) {
  return useQuery({ queryKey: ["catalogo", "instrumentais", categoriaId], queryFn: () => acessorios.listarInstrumentais(categoriaId) })
}

export function useToggleInstrumentalAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, ativo }: { sku: string; ativo: boolean }) => acessorios.toggleInstrumentalAtivo(sku, ativo),
    onMutate: async ({ sku, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "instrumentais"] })
      const prev = qc.getQueryData<CatalogoInstrumentalGeral[]>(["catalogo", "instrumentais"])
      qc.setQueryData<CatalogoInstrumentalGeral[]>(["catalogo", "instrumentais"], (old) =>
        old?.map((i) => (i.sku === sku ? { ...i, ativo } : i)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "instrumentais"], ctx.prev)
      toast.error("Erro ao alterar instrumental: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "instrumentais"] })
    },
  })
}

// --- Kits ---
export function useToggleCategoriaKitAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => kits.toggleCategoriaKitAtivo(id, ativo),
    onMutate: async ({ id, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "cats-kit"] })
      const prev = qc.getQueryData<CatalogoCategoriaKit[]>(["catalogo", "cats-kit"])
      qc.setQueryData<CatalogoCategoriaKit[]>(["catalogo", "cats-kit"], (old) =>
        old?.map((c) => (c.id === id ? { ...c, ativo } : c)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "cats-kit"], ctx.prev)
      toast.error("Erro ao alterar categoria de kit: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "cats-kit"] })
    },
  })
}

// --- Workflows ---
export function useWorkflows() {
  return useQuery({ queryKey: ["catalogo", "workflows"], queryFn: () => workflows.listarWorkflows() })
}

export function useToggleWorkflowAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => workflows.toggleWorkflowAtivo(id, ativo),
    onMutate: async ({ id, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "workflows"] })
      const prev = qc.getQueryData<CatalogoWorkflow[]>(["catalogo", "workflows"])
      qc.setQueryData<CatalogoWorkflow[]>(["catalogo", "workflows"], (old) =>
        old?.map((w) => (w.id === id ? { ...w, ativo } : w)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "workflows"], ctx.prev)
      toast.error("Erro ao alterar workflow: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "workflows"] })
    },
  })
}

export function useEtapas() {
  return useQuery({ queryKey: ["catalogo", "etapas"], queryFn: () => workflows.listarEtapas() })
}

export function useSeqProteticas() {
  return useQuery({ queryKey: ["catalogo", "seq-proteticas"], queryFn: () => seqProteticaService.listarSeqProteticas() })
}
// --- Todas Seq Proteticas (inclui inativas) ---
export function useTodasSeqProteticas() {
  return useQuery({ queryKey: ["catalogo", "seq-proteticas-todas"], queryFn: () => seqProteticaService.listarTodasSeqProteticas() })
}

// --- CRUD Tipo Workflow ---
export function useCriarTipoWorkflow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { nome: string; sigla?: string | null }) => workflows.criarTipoWorkflow(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "workflows"] }),
  })
}

export function useAtualizarTipoWorkflow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<{ nome: string; sigla: string | null; ativo: boolean }> }) =>
      workflows.atualizarTipoWorkflow(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "workflows"] }),
  })
}

export function useRemoverTipoWorkflow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => workflows.removerTipoWorkflow(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "workflows"] }),
  })
}

// --- CRUD Etapa Workflow ---
export function useCriarEtapa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { tipo_workflow_id: string; nome: string; sigla?: string; ordem?: number }) =>
      workflows.criarEtapa(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "etapas"] }),
  })
}

export function useAtualizarEtapa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<{ tipo_workflow_id: string; nome: string; sigla: string | null; ordem: number; ativo: boolean }> }) =>
      workflows.atualizarEtapa(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "etapas"] }),
  })
}

export function useRemoverEtapa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => workflows.removerEtapa(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "etapas"] }),
  })
}

// --- CRUD Seq Protetica ---
export function useCriarSeqProtetica() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { nome: string; sigla?: string | null; ativo?: boolean }) =>
      seqProteticaService.criarSeqProtetica(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "seq-proteticas"] }),
  })
}

export function useAtualizarSeqProtetica() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<{ nome: string; sigla: string | null; ativo: boolean }> }) =>
      seqProteticaService.atualizarSeqProtetica(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "seq-proteticas"] }),
  })
}

export function useToggleSeqProteticaAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) =>
      seqProteticaService.toggleSeqProteticaAtivo(id, ativo),
    onMutate: async ({ id, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "seq-proteticas-todas"] })
      const prev = qc.getQueryData<seqProteticaService.CatalogoSeqProtetica[]>(["catalogo", "seq-proteticas-todas"])
      qc.setQueryData<seqProteticaService.CatalogoSeqProtetica[]>(["catalogo", "seq-proteticas-todas"], (old) =>
        old?.map((s) => (s.id === id ? { ...s, ativo } : s)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "seq-proteticas-todas"], ctx.prev)
      toast.error("Erro ao alterar sequência: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "seq-proteticas"] })
    },
  })
}

export function useRemoverSeqProtetica() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => seqProteticaService.removerSeqProtetica(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "seq-proteticas"] }),
  })
}

export function useSalvarComposicaoSeq() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ seqId, abutment_sku, etapasComponentes }: {
      seqId: string; abutment_sku: string; etapasComponentes: Record<string, string[]>
    }) => seqProteticaService.salvarComposicaoSeq(seqId, { abutment_sku, etapasComponentes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "seq-proteticas"] })
    },
  })
}

// --- Remoção genérica por tabela ---
const TABLE_DELETE_MAP: Record<string, (id: string) => Promise<void>> = {
  catalogo_cps_tipos_workflows: (id) => workflows.removerTipoWorkflow(id),
  catalogo_cps_etapas_workflows: (id) => workflows.removerEtapa(id),
  catalogo_seq_proteticas: (id) => seqProteticaService.removerSeqProtetica(id),
}

export function useRemoverWorkflowsItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, table }: { id: string; table: string }) => {
      const fn = TABLE_DELETE_MAP[table]
      if (!fn) throw new Error(`Tabela não suportada: ${table}`)
      return fn(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "workflows"] })
      qc.invalidateQueries({ queryKey: ["catalogo", "etapas"] })
      qc.invalidateQueries({ queryKey: ["catalogo", "seq-proteticas"] })
      qc.invalidateQueries({ queryKey: ["catalogo", "seq-proteticas-todas"] })
    },
  })
}


export function useCatalogoDesign() {
  return useQuery({ queryKey: ["catalogo", "design"], queryFn: getCatalogoDesign, staleTime: 5 * 60_000 })
}

export function useGuias(filters?: { familia_id?: string; workflow_id?: string }) {
  return useQuery({ queryKey: ["catalogo", "guias", filters], queryFn: () => workflows.listarGuias() })
}

export function useWorkflowDetalhe(workflowId: string) {
  return useQuery({ queryKey: ["catalogo", "workflow-detalhe", workflowId], queryFn: () => workflows.getWorkflowDetalhe(workflowId), enabled: !!workflowId })
}

// --- Kits ---
export function useTiposKit() {
  return useQuery({ queryKey: ["catalogo", "tipos-kit"], queryFn: () => kits.listarTiposKit() })
}

export function useKitsAtivos() {
  return useQuery({ queryKey: ["catalogo", "kits", "ativos"], queryFn: () => kits.listarKitsAtivos() })
}

export function useTodosKits() {
  return useQuery({ queryKey: ["catalogo", "kits", "todos"], queryFn: () => kits.listarTodosKits() })
}

export function useKitDetalhe(sku: string) {
  return useQuery({ queryKey: ["catalogo", "kit", sku], queryFn: () => kits.getKitDetalhe(sku), enabled: !!sku })
}

export function useToggleEtapaAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => workflows.toggleEtapaAtivo(id, ativo),
    onMutate: async ({ id, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "etapas"] })
      const prev = qc.getQueryData<CatalogoEtapaWorkflow[]>(["catalogo", "etapas"])
      qc.setQueryData<CatalogoEtapaWorkflow[]>(["catalogo", "etapas"], (old) =>
        old?.map((e) => (e.id === id ? { ...e, ativo } : e)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "etapas"], ctx.prev)
      toast.error("Erro ao alterar etapa: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "etapas"] })
    },
  })
}

export function useCategoriasKit() {
  return useQuery({ queryKey: ["catalogo", "cats-kit"], queryFn: () => kits.listarCategoriasKit() })
}

export function useCriarKit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof kits.criarKit>[0]) => kits.criarKit(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "kits"] }),
  })
}

export function useAtualizarKit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, input }: { sku: string; input: Parameters<typeof kits.atualizarKit>[1] }) => kits.atualizarKit(sku, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "kits"] }),
  })
}

export function useToggleKitAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, ativo }: { sku: string; ativo: boolean }) => kits.toggleKitAtivo(sku, ativo),
    onMutate: async ({ sku, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "kits", "todos"] })
      const prev = qc.getQueryData<CatalogoKit[]>(["catalogo", "kits", "todos"])
      qc.setQueryData<CatalogoKit[]>(["catalogo", "kits", "todos"], (old) =>
        old?.map((k) => (k.sku === sku ? { ...k, ativo } : k)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "kits", "todos"], ctx.prev)
      toast.error("Erro ao alterar kit: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "kits"] })
    },
  })
}

export function useRemoverKit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sku: string) => kits.removerKit(sku),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "kits"] }),
  })
}
// --- Kits: Tipos CRUD ---
export function useCriarTipoKit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof kits.criarTipoKit>[0]) => kits.criarTipoKit(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-kit"] }),
  })
}

export function useAtualizarTipoKit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof kits.atualizarTipoKit>[1] }) => kits.atualizarTipoKit(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-kit"] }),
  })
}

export function useRemoverTipoKit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => kits.removerTipoKit(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "tipos-kit"] }),
  })
}

export function useToggleTipoKitAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => kits.toggleTipoKitAtivo(id, ativo),
    onMutate: async ({ id, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "tipos-kit"] })
      const prev = qc.getQueryData<CatalogoTipoKit[]>(["catalogo", "tipos-kit"])
      qc.setQueryData<CatalogoTipoKit[]>(["catalogo", "tipos-kit"], (old) =>
        old?.map((t) => (t.id === id ? { ...t, ativo } : t)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "tipos-kit"], ctx.prev)
      toast.error("Erro ao alterar tipo de kit: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "tipos-kit"] })
    },
  })
}

// --- Kits: Implantes para composição ---
export function useImplantesParaKit() {
  return useQuery({ queryKey: ["catalogo", "implantes-para-kit"], queryFn: () => implantes.listarImplantesParaKit() })
}

// --- Kits: Salvar composição N:M ---
export function useSalvarKitComposition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ kitSku, chaves, fresas, complementares, opcionais, kitsComplementares, kitsRelacionados, implantes }: {
      kitSku: string
      chaves: string[]
      fresas: string[]
      complementares: string[]
      opcionais: string[]
      kitsComplementares: string[]
      kitsRelacionados: string[]
      implantes: { implante_sku: string; todos_diametros: boolean }[]
    }) => {
      await Promise.all([
        kits.salvarKitChaves(kitSku, chaves),
        kits.salvarKitFresas(kitSku, fresas),
        kits.salvarKitComplementares(kitSku, complementares),
        kits.salvarKitOpcionais(kitSku, opcionais),
        kits.salvarKitKitsComplementares(kitSku, kitsComplementares),
        kits.salvarKitKitsRelacionados(kitSku, kitsRelacionados),
        kits.salvarKitImplantesDetalhado(kitSku, implantes),
      ])
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "kits"] }),
  })
}

// --- Cupons ---
export function useCupons() {
  return useQuery({ queryKey: ["catalogo", "cupons"], queryFn: () => cupons.listarCupons() })
}

export function useCriarCupom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof cupons.criarCupom>[0]) => cupons.criarCupom(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "cupons"] }),
  })
}

export function useAtualizarCupom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof cupons.atualizarCupom>[1] }) => cupons.atualizarCupom(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "cupons"] }),
  })
}

export function useRemoverCupom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cupons.removerCupom(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "cupons"] }),
  })
}

// --- Frete ---
export function useFretes() {
  return useQuery({ queryKey: ["catalogo", "fretes"], queryFn: () => frete.listarFretes() })
}

export function useCriarFrete() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof frete.criarFrete>[0]) => frete.criarFrete(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "fretes"] }),
  })
}

export function useAtualizarFrete() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof frete.atualizarFrete>[1] }) => frete.atualizarFrete(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "fretes"] }),
  })
}

export function useRemoverFrete() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => frete.removerFrete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "fretes"] }),
  })
}

// --- Promocionais ---
export function usePromocionais() {
  return useQuery({ queryKey: ["catalogo", "promocionais"], queryFn: () => promocionais.listarPromocionais() })
}

export function usePromocionaisAtivos() {
  return useQuery({ queryKey: ["catalogo", "promocionais-ativos"], queryFn: () => promocionais.listarPromocionaisAtivos() })
}

export function usePromocionalDetalhe(id: string) {
  return useQuery({ queryKey: ["catalogo", "promocional", id], queryFn: () => promocionais.getPromocionalDetalhe(id), enabled: !!id })
}

export function useItensPromocionalDetalhado(tipo: string | undefined, skus: string[]) {
  return useQuery({
    queryKey: ["catalogo", "promocional-item-detalhe", tipo, skus.sort().join(",")],
    queryFn: () => promocionais.listarItensPromocionalDetalhado(tipo!, skus),
    enabled: !!tipo && skus.length > 0,
  })
}

export function useCriarPromocional() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof promocionais.criarPromocional>[0]) => promocionais.criarPromocional(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "promocionais"] }),
  })
}

export function useAtualizarPromocional() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof promocionais.atualizarPromocional>[1] }) => promocionais.atualizarPromocional(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "promocionais"] }),
  })
}

export function useRemoverPromocional() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => promocionais.removerPromocional(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "promocionais"] }),
  })
}

// --- Clientes ---
export function useClientesCatalogo(filters?: { tipo?: string; ativo?: boolean; search?: string; grupo_id?: string }) {
  return useQuery({
    queryKey: ["catalogo", "clientes", filters],
    queryFn: () => clientesService.listarClientes(filters),
  })
}

export function useCriarClienteCatalogo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof clientesService.criarCliente>[0]) =>
      clientesService.criarCliente(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "clientes"] }),
  })
}

export function useDeletarClienteCatalogo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => clientesService.deletarCliente(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "clientes"] }),
  })
}

// --- Grupos ---
export function useGruposClientes() {
  return useQuery({
    queryKey: ["catalogo", "grupos"],
    queryFn: () => gruposService.listarGrupos(),
  })
}

export function useCriarGrupoCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof gruposService.criarGrupo>[0]) =>
      gruposService.criarGrupo(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "grupos"] }),
  })
}

// --- Pedidos ---
export function usePedidosCatalogo(filters?: { status?: string; cliente_id?: string; search?: string }) {
  return useQuery({
    queryKey: ["catalogo", "pedidos", filters],
    queryFn: () => pedidosService.listarPedidos(filters as any),
  })
}

export function useCriarPedidoCatalogo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof pedidosService.criarPedido>[0]) =>
      pedidosService.criarPedido(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "pedidos"] }),
  })
}

export function useAtualizarStatusPedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      pedidosService.atualizarStatusPedido(id, status as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "pedidos"] }),
  })
}

// --- Orcamentos ---
export function useOrcamentosCatalogo(filters?: { status?: string; colaborador_id?: string; search?: string }) {
  return useQuery({
    queryKey: ["catalogo", "orcamentos", filters],
    queryFn: () => orcamentosService.listarOrcamentos(filters as any),
  })
}

export function useCriarOrcamentoCatalogo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ colaboradorId, input }: { colaboradorId: string; input: Parameters<typeof orcamentosService.criarOrcamento>[1] }) =>
      orcamentosService.criarOrcamento(colaboradorId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "orcamentos"] }),
  })
}

/** Orçamentos criados pelo colaborador logado ("meus orçamentos") */
export function useMeusOrcamentosCatalogo(colaboradorId: string | undefined) {
  return useQuery({
    queryKey: ["catalogo", "orcamentos", "colaborador", colaboradorId],
    queryFn: () => orcamentosService.listarOrcamentosColaborador(colaboradorId as string),
    enabled: Boolean(colaboradorId),
  })
}

/** Pedidos da carteira do colaborador logado ("meus pedidos") */
export function useMeusPedidosCatalogo(colaboradorId: string | undefined) {
  return useQuery({
    queryKey: ["catalogo", "pedidos", "colaborador", colaboradorId],
    queryFn: () => pedidosService.listarPedidosColaborador(colaboradorId as string),
    enabled: Boolean(colaboradorId),
  })
}

export function useAtualizarStatusOrcamento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Parameters<typeof orcamentosService.atualizarStatusOrcamento>[1] }) =>
      orcamentosService.atualizarStatusOrcamento(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "orcamentos"] }),
  })
}

export function useConverterOrcamentoPedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => orcamentosService.converterEmPedido(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "orcamentos"] })
      qc.invalidateQueries({ queryKey: ["catalogo", "pedidos"] })
    },
  })
}

// --- Parafusos de Retenção ---
export function useParafusosRetensao() {
  return useQuery({ queryKey: ["catalogo", "parafusos-retensao"], queryFn: () => parafusosRetensao.listarParafusosRetensao() })
}

export function useCriarParafusoRetencao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof parafusosRetensao.criarParafusoRetencao>[0]) =>
      parafusosRetensao.criarParafusoRetencao(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "parafusos-retensao"] }),
  })
}

export function useAtualizarParafusoRetencao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, input }: { sku: string; input: Parameters<typeof parafusosRetensao.atualizarParafusoRetencao>[1] }) =>
      parafusosRetensao.atualizarParafusoRetencao(sku, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "parafusos-retensao"] }),
  })
}

export function useToggleParafusoRetencaoAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, ativo }: { sku: string; ativo: boolean }) => parafusosRetensao.toggleParafusoRetencaoAtivo(sku, ativo),
    onMutate: async ({ sku, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "parafusos-retensao"] })
      const prev = qc.getQueryData<CatalogoParafusoRetencao[]>(["catalogo", "parafusos-retensao"])
      qc.setQueryData<CatalogoParafusoRetencao[]>(["catalogo", "parafusos-retensao"], (old) =>
        old?.map((p) => (p.sku === sku ? { ...p, ativo } : p)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "parafusos-retensao"], ctx.prev)
      toast.error("Erro ao alterar parafuso de retenção: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "parafusos-retensao"] })
    },
  })
}

// --- Cicatrizadores ---
export function useCicatrizadores() {
  return useQuery({ queryKey: ["catalogo", "cicatrizadores"], queryFn: () => cicatrizadores.listarCicatrizadores() })
}

export function useCriarCicatrizador() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof cicatrizadores.criarCicatrizador>[0]) =>
      cicatrizadores.criarCicatrizador(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "cicatrizadores"] }),
  })
}

export function useAtualizarCicatrizador() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, input }: { sku: string; input: Parameters<typeof cicatrizadores.atualizarCicatrizador>[1] }) =>
      cicatrizadores.atualizarCicatrizador(sku, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["catalogo", "cicatrizadores"] }),
  })
}

export function useToggleCicatrizadorAtivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, ativo }: { sku: string; ativo: boolean }) => cicatrizadores.toggleCicatrizadorAtivo(sku, ativo),
    onMutate: async ({ sku, ativo }) => {
      await qc.cancelQueries({ queryKey: ["catalogo", "cicatrizadores"] })
      const prev = qc.getQueryData<CatalogoCicatrizador[]>(["catalogo", "cicatrizadores"])
      qc.setQueryData<CatalogoCicatrizador[]>(["catalogo", "cicatrizadores"], (old) =>
        old?.map((c) => (c.sku === sku ? { ...c, ativo } : c)) ?? []
      )
      return { prev }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["catalogo", "cicatrizadores"], ctx.prev)
      toast.error("Erro ao alterar cicatrizador: " + (err as Error).message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "cicatrizadores"] })
    },
  })
}

// --- Imagens ---
export function useImagensProduto(tipo: ProdutoTipoImagem | undefined, sku: string | undefined) {
  return useQuery({
    queryKey: ["catalogo", "imagens", tipo, sku],
    queryFn: () => imagensService.listarImagens(tipo!, sku!),
    enabled: !!tipo && !!sku,
  })
}

export function useImagensBatch(tipo: ProdutoTipoImagem | undefined, skus: string[]) {
  return useQuery({
    queryKey: ["catalogo", "imagens-batch", tipo, skus.sort().join(",")],
    queryFn: () => imagensService.listarImagensBatch(tipo!, skus),
    enabled: !!tipo && skus.length > 0,
  })
}

// --- Dados Relacionados ao Implante ---
export function useChavesDoImplante(implanteSku: string) {
  return useQuery({
    queryKey: ["catalogo", "implante-chaves", implanteSku],
    queryFn: () => implantes.listarChavesDoImplante(implanteSku),
    enabled: !!implanteSku,
  })
}

export function useCicatrizadoresDoImplante(implanteSku: string) {
  return useQuery({
    queryKey: ["catalogo", "implante-cicatrizadores", implanteSku],
    queryFn: () => implantes.listarCicatrizadoresDoImplante(implanteSku),
    enabled: !!implanteSku,
  })
}

export function useAbutmentsDaFamilia(familiaId: string | null | undefined) {
  return useQuery({
    queryKey: ["catalogo", "familia-abutments", familiaId],
    queryFn: () => implantes.listarAbutmentsDaFamilia(familiaId!),
    enabled: !!familiaId,
  })
}

export function useKitsComChavesEmComum(implanteSku: string) {
  return useQuery({
    queryKey: ["catalogo", "implante-kits", implanteSku],
    queryFn: () => implantes.listarKitsComChavesEmComum(implanteSku),
    enabled: !!implanteSku,
  })
}

export function useAbutmentsDoImplante(implanteSku: string) {
  return useQuery({
    queryKey: ["catalogo", "implante-abutments", implanteSku],
    queryFn: () => implantes.listarAbutmentsDoImplante(implanteSku),
    enabled: !!implanteSku,
  })
}

export function useImplantesDoAbutment(abutmentSku: string) {
  return useQuery({
    queryKey: ["catalogo", "abutment-implantes", abutmentSku],
    queryFn: () => componentes.listarImplantesDoAbutment(abutmentSku),
    enabled: !!abutmentSku,
  })
}

export function useKitsDoImplante(implanteSku: string) {
  return useQuery({
    queryKey: ["catalogo", "implante-kits-pivot", implanteSku],
    queryFn: () => implantes.listarKitsDoImplante(implanteSku),
    enabled: !!implanteSku,
  })
}
// --- Configurações ---
export function useCatalogoConfig() {
  return useQuery({
    queryKey: ["catalogo", "configuracoes"],
    queryFn: getConfiguracoes,
    staleTime: 5 * 60_000,
  })
}
// --- Estoque ---
export function useListaEstoque(tipo?: string) {
  return useQuery({
    queryKey: ["catalogo", "estoque", tipo],
    queryFn: () => estoqueService.listarEstoque(tipo),
  })
}

export function useAtualizarEstoque() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sku, tipo, qtdDisponivel, qtdMinimaAviso }: {
      sku: string
      tipo: string
      qtdDisponivel: number
      qtdMinimaAviso: number
    }) => estoqueService.atualizarEstoque(sku, tipo, qtdDisponivel, qtdMinimaAviso),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalogo", "estoque"] })
      toast.success("Estoque atualizado!")
    },
  })
}

export function useEstoqueBaixo() {
  return useQuery({
    queryKey: ["catalogo", "estoque-baixo"],
    queryFn: estoqueService.listarEstoqueBaixo,
  })
}

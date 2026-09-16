
import { RequirePermission } from "~/components/guards"
import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { EmpresaCrudGuard } from "~/features/catalogo/components/EmpresaCrudGuard"
import { AdminLayout } from "~/features/catalogo/components/AdminLayout"
import { useCatalogoEmpresaId } from "~/features/catalogo/hooks/useCatalogoEmpresa"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "~/core/supabase"
import { Package, Stethoscope, Scissors, Boxes, Workflow, Drill, LayoutDashboard, TrendingUp, ShoppingCart } from "lucide-react"

export const catalogoAdminDashboardRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/catalogo/admin/dashboard",
  component: () => (
    <RequirePermission modulo="catalogo" permissions={["catalogo_dashboard"]}>
      <EmpresaCrudGuard>
        <AdminDashboardPage />
      </EmpresaCrudGuard>
    </RequirePermission>
  ),
})

function AdminDashboardPage() {
  const empresaId = useCatalogoEmpresaId()

  const { data: implantes } = useQuery({ queryKey: ["dash", "implantes", empresaId], queryFn: async () => { const { count } = await supabase.from("catalogo_implantes").select("*", { count: "exact", head: true }).eq("ativo", true); return count ?? 0 }, enabled: !!empresaId })
  const { data: abutments } = useQuery({ queryKey: ["dash", "abutments", empresaId], queryFn: async () => { const { count } = await supabase.from("catalogo_abutments").select("*", { count: "exact", head: true }).eq("ativo", true); return count ?? 0 }, enabled: !!empresaId })
  const { data: componentes } = useQuery({ queryKey: ["dash", "componentes", empresaId], queryFn: async () => { const { count } = await supabase.from("catalogo_componentes").select("*", { count: "exact", head: true }).eq("ativo", true); return count ?? 0 }, enabled: !!empresaId })
  const { data: parafusos } = useQuery({ queryKey: ["dash", "parafusos", empresaId], queryFn: async () => { const { count } = await supabase.from("catalogo_parafusos").select("*", { count: "exact", head: true }).eq("ativo", true); return count ?? 0 }, enabled: !!empresaId })
  const { data: cicatrizadores } = useQuery({ queryKey: ["dash", "cicatrizadores", empresaId], queryFn: async () => { const { count } = await supabase.from("catalogo_cicatrizadores").select("*", { count: "exact", head: true }).eq("ativo", true); return count ?? 0 }, enabled: !!empresaId })
  const { data: chaves } = useQuery({ queryKey: ["dash", "chaves", empresaId], queryFn: async () => { const { count } = await supabase.from("catalogo_chaves").select("*", { count: "exact", head: true }).eq("ativo", true); return count ?? 0 }, enabled: !!empresaId })
  const { data: fresas } = useQuery({ queryKey: ["dash", "fresas", empresaId], queryFn: async () => { const { count } = await supabase.from("catalogo_fresas").select("*", { count: "exact", head: true }).eq("ativo", true); return count ?? 0 }, enabled: !!empresaId })
  const { data: kits } = useQuery({ queryKey: ["dash", "kits", empresaId], queryFn: async () => { const { count } = await supabase.from("catalogo_kits").select("*", { count: "exact", head: true }).eq("ativo", true); return count ?? 0 }, enabled: !!empresaId })
  const { data: workflows } = useQuery({ queryKey: ["dash", "workflows", empresaId], queryFn: async () => { const { count } = await supabase.from("catalogo_cps_tipos_workflows").select("*", { count: "exact", head: true }).eq("ativo", true); return count ?? 0 }, enabled: !!empresaId })
  const { data: protocolos } = useQuery({ queryKey: ["dash", "protocolos", empresaId], queryFn: async () => { const { count } = await supabase.from("catalogo_protocolos_fresagens").select("*", { count: "exact", head: true }).eq("ativo", true); return count ?? 0 }, enabled: !!empresaId })
  const { data: pedidos } = useQuery({ queryKey: ["dash", "pedidos", empresaId], queryFn: async () => { const { count } = await supabase.from("catalogo_pedidos").select("*", { count: "exact", head: true }); return count ?? 0 }, enabled: !!empresaId })
  const { data: orcamentos } = useQuery({ queryKey: ["dash", "orcamentos", empresaId], queryFn: async () => { const { count } = await supabase.from("catalogo_orcamentos").select("*", { count: "exact", head: true }); return count ?? 0 }, enabled: !!empresaId })

  const totalProdutos = (implantes ?? 0) + (abutments ?? 0) + (componentes ?? 0) + (parafusos ?? 0) + (cicatrizadores ?? 0) + (chaves ?? 0) + (fresas ?? 0) + (kits ?? 0)

  const kpis = [
    { label: "Total Produtos", value: totalProdutos, icon: Package, color: "#c9a655" },
    { label: "Implantes", value: implantes ?? 0, icon: Package, color: "#e8d48b" },
    { label: "Componentes", value: (abutments ?? 0) + (componentes ?? 0), icon: Stethoscope, color: "#c9a655" },
    { label: "Instrumentais", value: (chaves ?? 0) + (fresas ?? 0), icon: Scissors, color: "#e8d48b" },
    { label: "Kits", value: kits ?? 0, icon: Boxes, color: "#c9a655" },
    { label: "Workflows", value: workflows ?? 0, icon: Workflow, color: "#e8d48b" },
    { label: "Protocolos Fresagem", value: protocolos ?? 0, icon: Drill, color: "#c9a655" },
    { label: "Pedidos", value: pedidos ?? 0, icon: ShoppingCart, color: "#e8d48b" },
  ]

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Dashboard do Catálogo</h1>
            <p className="text-sm font-mono mt-1 text-[var(--color-text-muted)] tracking-widest">VISÃO GERAL DO INVENTÁRIO PROTÉTICO</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {kpis.map((card) => (
            <div key={card.label} className="relative group rounded-2xl bg-[var(--color-surface)] border border-transparent hover:border-white/10 p-6 transition-all shadow-lg overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-4 opacity-[0.04] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-500" style={{ color: card.color }}>
                <card.icon className="w-20 h-20" />
              </div>
              <div className="relative z-10">
                <card.icon className="h-6 w-6 mb-4" style={{ color: card.color }} />
                <p className="text-4xl font-black text-white mb-1">{card.value}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl p-6 bg-[var(--color-surface)]/50 backdrop-blur-md border border-[var(--color-border-subtle)] shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#c9a655]" />
              Resumo por Categoria
            </h3>
            <div className="space-y-3">
              {[
                { label: "Implantes", total: implantes ?? 0 },
                { label: "Abutments", total: abutments ?? 0 },
                { label: "Componentes", total: componentes ?? 0 },
                { label: "Parafusos", total: parafusos ?? 0 },
                { label: "Cicatrizadores", total: cicatrizadores ?? 0 },
                { label: "Chaves", total: chaves ?? 0 },
                { label: "Fresas", total: fresas ?? 0 },
                { label: "Kits", total: kits ?? 0 },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-muted)]">{item.label}</span>
                  <span className="text-sm font-bold text-white">{item.total}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-6 bg-[var(--color-surface)]/50 backdrop-blur-md border border-[var(--color-border-subtle)] shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-[#c9a655]" />
              Atividade Comercial
            </h3>
            <div className="space-y-3">
              {[
                { label: "Pedidos Recebidos", total: pedidos ?? 0 },
                { label: "Orçamentos Criados", total: orcamentos ?? 0 },
                { label: "Workflows Ativos", total: workflows ?? 0 },
                { label: "Protocolos de Fresagem", total: protocolos ?? 0 },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-muted)]">{item.label}</span>
                  <span className="text-sm font-bold text-white">{item.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

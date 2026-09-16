import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { RequireSuperAdmin } from "~/components/guards"
import { useEffect, useState } from "react"
import { useAuth } from "~/lib/auth"
import {
  listarLinksTeste,
  criarLinkTeste,
  atualizarLinkTeste,
  revogarLinkTeste,
  removerLinkTeste,
} from "~/features/catalogo/services/links-teste.service"
import type { CatalogoLinkTeste, LinkTesteNivelAcesso } from "~/features/catalogo/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "~/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Plus, Copy, Ban, Trash2, Loader2, Link2 } from "lucide-react"
import toast from "react-hot-toast"

export const globalCatalogoLinksTesteRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/global/catalogo-links-teste",
  component: () => (
    <RequireSuperAdmin>
      <CatalogoLinksTestePage />
    </RequireSuperAdmin>
  ),
})

function statusLabel(link: CatalogoLinkTeste): { texto: string; cls: string } {
  if (!link.ativo) return { texto: "Revogado", cls: "bg-error/10 text-error" }
  if (link.expires_at && new Date(link.expires_at) < new Date()) return { texto: "Expirado", cls: "bg-error/10 text-error" }
  if (link.max_usos != null && link.usos >= link.max_usos) return { texto: "Esgotado", cls: "bg-error/10 text-error" }
  return { texto: "Ativo", cls: "bg-success/10 text-success" }
}

function CatalogoLinksTestePage() {
  const { profile } = useAuth()
  const [links, setLinks] = useState<CatalogoLinkTeste[]>([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<{ nivelAcesso: LinkTesteNivelAcesso; descricao: string; expiresAt: string; maxUsos: string }>({
    nivelAcesso: "visitante",
    descricao: "",
    expiresAt: "",
    maxUsos: "",
  })

  const [revogarAlvo, setRevogarAlvo] = useState<CatalogoLinkTeste | null>(null)
  const [removerAlvo, setRemoverAlvo] = useState<CatalogoLinkTeste | null>(null)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setLoading(true)
    try {
      setLinks(await listarLinksTeste())
    } catch (e: any) {
      toast.error(e.message)
    }
    setLoading(false)
  }

  function openNew() {
    setForm({ nivelAcesso: "visitante", descricao: "", expiresAt: "", maxUsos: "" })
    setModalOpen(true)
  }

  async function handleSalvar() {
    setSaving(true)
    try {
      await criarLinkTeste({
        nivelAcesso: form.nivelAcesso,
        descricao: form.descricao || undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        maxUsos: form.maxUsos ? Number(form.maxUsos) : null,
        createdBy: profile?.id ?? null,
      })
      toast.success("Link de teste criado!")
      setModalOpen(false)
      await carregar()
    } catch (e: any) {
      toast.error(e.message)
    }
    setSaving(false)
  }

  function copiarLink(link: CatalogoLinkTeste) {
    const url = `${window.location.origin}/catalogo/teste/${link.token}`
    navigator.clipboard.writeText(url)
    toast.success("Link copiado!")
  }

  async function confirmarRevogar() {
    if (!revogarAlvo) return
    try {
      await revogarLinkTeste(revogarAlvo.id)
      toast.success("Link revogado")
      setRevogarAlvo(null)
      await carregar()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  async function confirmarRemover() {
    if (!removerAlvo) return
    try {
      await removerLinkTeste(removerAlvo.id)
      toast.success("Link removido")
      setRemoverAlvo(null)
      await carregar()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  async function toggleAtivo(link: CatalogoLinkTeste) {
    try {
      await atualizarLinkTeste(link.id, { ativo: !link.ativo })
      await carregar()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <Link2 size={20} className="text-accent" />
          <div>
            <h1 className="text-lg font-bold text-text-main">Links de Teste — Catálogo</h1>
            <p className="text-xs text-text-muted">Gere links para acesso ao catálogo público (/catalogo) como visitante ou usuário logado.</p>
          </div>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-accent-fg text-sm font-bold hover:bg-accent-hover transition-colors"
        >
          <Plus size={16} /> Novo Link
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      ) : links.length === 0 ? (
        <div className="p-8 text-center text-text-muted text-sm">Nenhum link de teste criado ainda.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Nível de Acesso</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Usos</TableHead>
              <TableHead>Expira em</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => {
              const status = statusLabel(link)
              return (
                <TableRow key={link.id}>
                  <TableCell>{link.descricao || <span className="text-text-muted">—</span>}</TableCell>
                  <TableCell>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {link.nivel_acesso === "logado" ? "Usuário Logado" : "Visitante"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.cls}`}>{status.texto}</span>
                  </TableCell>
                  <TableCell>
                    {link.usos}
                    {link.max_usos != null ? ` / ${link.max_usos}` : ""}
                  </TableCell>
                  <TableCell>{link.expires_at ? new Date(link.expires_at).toLocaleString("pt-BR") : "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <button title="Copiar link" onClick={() => copiarLink(link)} className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors">
                        <Copy size={15} />
                      </button>
                      {link.ativo && (
                        <button title="Revogar" onClick={() => setRevogarAlvo(link)} className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-surface-hover transition-colors">
                          <Ban size={15} />
                        </button>
                      )}
                      <button title="Excluir" onClick={() => setRemoverAlvo(link)} className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-surface-hover transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      {/* Novo link */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Novo Link de Teste</DialogTitle>
            <DialogDescription>O link aponta para /catalogo com o nível de acesso escolhido.</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 min-h-0 space-y-4 px-6 py-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-1.5">Nível de Acesso</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, nivelAcesso: "visitante" }))}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${form.nivelAcesso === "visitante" ? "border-accent bg-accent/10 text-accent" : "border-input-border text-text-muted"}`}
                >
                  Visitante (sem login)
                </button>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, nivelAcesso: "logado" }))}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${form.nivelAcesso === "logado" ? "border-accent bg-accent/10 text-accent" : "border-input-border text-text-muted"}`}
                >
                  Usuário Logado
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-1.5">Descrição</label>
              <input
                type="text"
                value={form.descricao}
                onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
                placeholder="Ex: Demo para clínica X"
                className="w-full bg-input-bg border border-input-border rounded-lg p-2.5 text-sm text-text-main"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-1.5">Expira em (opcional)</label>
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                  className="w-full bg-input-bg border border-input-border rounded-lg p-2.5 text-sm text-text-main"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-1.5">Limite de usos (opcional)</label>
                <input
                  type="number"
                  min={1}
                  value={form.maxUsos}
                  onChange={(e) => setForm((p) => ({ ...p, maxUsos: e.target.value }))}
                  placeholder="Ilimitado"
                  className="w-full bg-input-bg border border-input-border rounded-lg p-2.5 text-sm text-text-main"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-surface-hover transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-accent text-accent-fg text-sm font-bold hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {saving ? "Criando..." : "Criar Link"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revogar */}
      <AlertDialog open={!!revogarAlvo} onOpenChange={(open) => !open && setRevogarAlvo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar este link?</AlertDialogTitle>
            <AlertDialogDescription>
              O link deixará de funcionar imediatamente. Você pode reativá-lo depois se precisar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarRevogar}>Revogar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remover */}
      <AlertDialog open={!!removerAlvo} onOpenChange={(open) => !open && setRemoverAlvo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este link permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O histórico de acessos também será removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarRemover}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

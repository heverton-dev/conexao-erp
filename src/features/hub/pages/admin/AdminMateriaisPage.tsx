import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "~/lib/auth";
import { supabase } from "~/core/supabase/client";
import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Plus, Edit, Trash2, Eye, EyeOff, Star, Building2 } from "lucide-react";
import {
  fetchHubMaterials,
  createHubMaterial,
  updateHubMaterial,
  deleteHubMaterial,
  upsertHubMaterialAsset,
} from "../../services/materials";
import { MaterialFormModal } from "../../components/materials/MaterialFormModal";
import type { HubMaterial, HubLanguage } from "../../types";

function colorMix(c1: string, w: number, c2: string) {
  return `color-mix(in srgb, ${c1} ${w}%, ${c2})`;
}

export function AdminMateriaisPage() {
  const { empresa, is_super_admin } = useAuth() as any;
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{ open: boolean; edit?: HubMaterial }>({
    open: false,
  });
  const [materialParaDeletar, setMaterialParaDeletar] = useState<HubMaterial | null>(null);
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>(
    empresa?.id || "",
  );

  const { data: empresas = [] } = useQuery({
    queryKey: ["empresas-list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("empresas")
        .select("id, nome")
        .order("nome");
      return data || [];
    },
    enabled: !!is_super_admin,
  });

  const activeEmpresaId = is_super_admin ? selectedEmpresa : empresa?.id;

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["hub-materials", activeEmpresaId],
    queryFn: () => fetchHubMaterials(activeEmpresaId),
    enabled: is_super_admin || !!activeEmpresaId,
  });

  const saveMaterial = useMutation({
    mutationFn: async ({
      material,
      assets,
    }: {
      material: Partial<HubMaterial>;
      assets: { language: HubLanguage; url: string; subtitle_url?: string }[];
    }) => {
      let saved: HubMaterial;
      const empId = material.empresa_id || activeEmpresaId;
      if (material.id) {
        saved = await updateHubMaterial(material.id, material);
      } else {
        saved = await createHubMaterial({
          ...material,
          empresa_id: empId,
          created_by: "",
        });
      }
      if (saved.id && assets.length > 0) {
        for (const a of assets) {
          await upsertHubMaterialAsset({
            material_id: saved.id,
            language: a.language,
            url: a.url,
            subtitle_url: a.subtitle_url,
          });
        }
      }
      return saved;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hub-materials"] });
      setModal({ open: false });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteHubMaterial(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["hub-materials"] }),
  });

  const toggleActive = useMutation({
    mutationFn: (m: HubMaterial) =>
      updateHubMaterial(m.id, { active: !m.active }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["hub-materials"] }),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ color: "var(--color-text-main)" }}
          >
            Materiais
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {materials.length} materiais cadastrados
          </p>
        </div>
        <div className="flex items-center gap-3">
          {is_super_admin && empresas.length > 0 && (
            <div className="flex items-center gap-2">
              <Building2 size={14} style={{ color: "var(--color-accent)" }} />
              <Select
                value={selectedEmpresa}
                onValueChange={setSelectedEmpresa}
              >
                <SelectTrigger
                  className="w-full sm:w-60"
                  style={{
                    backgroundColor: "var(--color-input-bg)",
                    borderColor: "var(--color-input-border)",
                    color: "var(--color-text-main)",
                  }}
                >
                  <SelectValue placeholder="Filtrar por empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as empresas</SelectItem>
                  {empresas.map((e: any) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button onClick={() => setModal({ open: true })} className="gap-2">
            <Plus size={16} /> Novo Material
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              role="status"
              aria-label="Carregando"
              className="h-16 rounded-xl animate-pulse"
              style={{
                backgroundColor: colorMix(
                  "var(--color-surface)",
                  40,
                  "rgba(30,41,59,0.4)",
                ),
              }}
            />
          ))}
        </div>
      ) : materials.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 rounded-[2rem] border border-white/5"
          style={{
            backgroundColor: colorMix(
              "var(--color-surface)",
              20,
              "rgba(30,41,59,0.2)",
            ),
          }}
        >
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Nenhum material cadastrado.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {materials.map((m) => (
            <div
              key={m.id}
              className="group flex items-center gap-4 rounded-xl bg-surface border border-border p-4 transition-all duration-200 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: colorMix(
                  "var(--color-surface)",
                  40,
                  "rgba(30,41,59,0.4)",
                ),
              }}
            >
              <div className="icon-box-sm group-hover:bg-accent/20 transition-colors">
                {m.active ? <Eye size={14} /> : <EyeOff size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-bold truncate"
                  style={{ color: "var(--color-text-main)" }}
                >
                  {m.title?.["pt-br"] || "Sem título"}
                </p>
                <div
                  className="flex items-center gap-3 text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <span className="uppercase font-bold">{m.type}</span>
                  <span className="flex items-center gap-1">
                    <Star
                      size={10}
                      style={{
                        fill: "var(--color-warning)",
                        color: "var(--color-warning)",
                      }}
                    />{" "}
                    {m.points} XP
                  </span>
                  <span>
                    {Array.isArray(m.allowedRoles)
                      ? m.allowedRoles.join(", ")
                      : m.allowedRoles}
                  </span>
                  {m.tags?.length > 0 && (
                    <span>{m.tags.slice(0, 3).join(", ")}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-accent/10"
                  onClick={() => toggleActive.mutate(m)}
                  title={m.active ? "Desativar" : "Ativar"}
                >
                  {m.active ? <EyeOff size={14} /> : <Eye size={14} />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-accent/10"
                  onClick={() => setModal({ open: true, edit: m })}
                  title="Editar"
                >
                  <Edit size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-destructive/10"
                  onClick={() => setMaterialParaDeletar(m)}
                  title="Excluir"
                >
                  <Trash2 size={14} className="text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!materialParaDeletar}
        onOpenChange={(o) => !o && setMaterialParaDeletar(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir material?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (materialParaDeletar) remove.mutate(materialParaDeletar.id);
                setMaterialParaDeletar(null);
              }}
              className="bg-destructive"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MaterialFormModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        onSave={(m, assets) =>
          saveMaterial.mutate({
            material: { ...m, empresa_id: activeEmpresaId },
            assets,
          })
        }
        material={modal.edit}
      />
    </div>
  );
}

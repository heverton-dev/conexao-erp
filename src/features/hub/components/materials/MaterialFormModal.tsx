import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Upload, Link, Code, Globe } from "lucide-react";
import { useAuth } from "~/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchHubMaterialAssets,
  upsertHubMaterialAsset,
  deleteHubMaterialAsset,
} from "../../services/materials";
import type {
  HubMaterial,
  HubLanguage,
  HubMaterialType,
  HubRole,
} from "../../types";

const TYPES = [
  { value: "pdf", label: "PDF" },
  { value: "image", label: "Imagem" },
  { value: "video", label: "Vídeo" },
  { value: "audio", label: "Áudio" },
  { value: "html", label: "HTML" },
];

const ROLES = [
  { value: "client", label: "Cliente" },
  { value: "distributor", label: "Distribuidor" },
  { value: "consultant", label: "Consultor" },
  { value: "manager", label: "Gestor" },
];

interface MaterialFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    material: Partial<HubMaterial>,
    assets: { language: HubLanguage; url: string; subtitle_url?: string }[],
  ) => void;
  material?: HubMaterial;
}

export function MaterialFormModal({
  open,
  onClose,
  onSave,
  material,
}: MaterialFormModalProps) {
  const { empresa } = useAuth();
  const queryClient = useQueryClient();
  const isEdit = !!material?.id;

  const [type, setType] = useState<HubMaterialType>(material?.type || "pdf");
  const [active, setActive] = useState(material?.active ?? true);
  const [points, setPoints] = useState(material?.points || 10);
  const [allowedRoles, setAllowedRoles] = useState<string[]>(
    material?.allowedRoles || ["client"],
  );
  const [category, setCategory] = useState(material?.category || "");
  const [tags, setTags] = useState(material?.tags?.join(", ") || "");

  const [titles, setTitles] = useState<Record<HubLanguage, string>>({
    "pt-br": "",
    "en-us": "",
    "es-es": "",
    ...material?.title,
  });
  const [urls, setUrls] = useState<Record<HubLanguage, string>>({
    "pt-br": "",
    "en-us": "",
    "es-es": "",
  });
  const [subtitleUrls, setSubtitleUrls] = useState<Record<HubLanguage, string>>(
    { "pt-br": "", "en-us": "", "es-es": "" },
  );

  const [htmlMode, setHtmlMode] = useState<"url" | "paste" | "upload">("url");
  const [htmlCode, setHtmlCode] = useState("");
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [activeLangTab, setActiveLangTab] = useState<HubLanguage>("pt-br");

  const { data: existingAssets = [] } = useQuery({
    queryKey: ["hub-material-assets", material?.id],
    queryFn: () => fetchHubMaterialAssets(material!.id),
    enabled: isEdit && open,
  });

  useEffect(() => {
    if (existingAssets.length > 0) {
      const urlMap: Record<string, string> = {};
      const subMap: Record<string, string> = {};
      existingAssets.forEach((a) => {
        urlMap[a.language] = a.url;
        if (a.subtitle_url) subMap[a.language] = a.subtitle_url;
      });
      setUrls(urlMap as Record<HubLanguage, string>);
      setSubtitleUrls(subMap as Record<HubLanguage, string>);
    }
  }, [existingAssets]);

  const toggleRole = (role: string) => {
    setAllowedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleSave = async () => {
    const assetsToSave: {
      language: HubLanguage;
      url: string;
      subtitle_url?: string;
    }[] = [];

    if (type === "html" && htmlMode === "paste" && htmlCode) {
      const blob = new Blob([htmlCode], { type: "text/html" });
      const dataUrl = URL.createObjectURL(blob);
      assetsToSave.push({ language: "pt-br", url: dataUrl });
    } else if (type === "html" && htmlMode === "upload" && htmlFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        assetsToSave.push({ language: "pt-br", url: dataUrl });
        onSave(
          {
            ...material,
            title: titles,
            type,
            active,
            points,
            allowedRoles: allowedRoles as HubRole[],
            category: category || undefined,
            tags: tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          },
          assetsToSave,
        );
      };
      reader.readAsDataURL(htmlFile);
      return;
    } else {
      (["pt-br", "en-us", "es-es"] as HubLanguage[]).forEach((lang) => {
        if (urls[lang])
          assetsToSave.push({
            language: lang,
            url: urls[lang],
            subtitle_url: subtitleUrls[lang] || undefined,
          });
      });
    }

    onSave(
      {
        ...material,
        title: titles,
        type,
        active,
        points,
        allowedRoles: allowedRoles as HubRole[],
        category: category || undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      },
      assetsToSave,
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>
                {material ? "Editar Material" : "Novo Material"}
              </DialogTitle>
              <DialogDescription>Preencha as informações do material.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 flex-1 min-h-0 overflow-y-auto space-y-4">
          {/* Tipo + Status + XP */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">
                Tipo *
              </label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as HubMaterialType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">
                XP *
              </label>
              <Input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col items-center justify-end">
              <label className="mb-1 block text-xs font-medium text-text-muted">
                Status
              </label>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs ${active ? "text-green-500" : "text-text-muted"}`}
                >
                  {active ? "Ativo" : "Inativo"}
                </span>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>
            </div>
          </div>

          {/* Público-alvo */}
          <div>
            <label className="mb-2 block text-xs font-medium text-text-muted">
              Público-alvo *
            </label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => toggleRole(r.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${allowedRoles.includes(r.value) ? "liquid-glass-gold text-accent" : "border-border text-text-muted bg-surface"}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conteúdo por idioma */}
          <div>
            <label className="mb-2 block text-xs font-medium text-text-muted">
              <Globe className="inline mr-1" size={12} /> Conteúdo por Idioma
            </label>
            <Tabs
              value={activeLangTab}
              onValueChange={(v) => setActiveLangTab(v as HubLanguage)}
            >
              <TabsList>
                <TabsTrigger value="pt-br">🇧🇷 Português</TabsTrigger>
                <TabsTrigger value="en-us">🇺🇸 English</TabsTrigger>
                <TabsTrigger value="es-es">🇪🇸 Español</TabsTrigger>
              </TabsList>

              {(["pt-br", "en-us", "es-es"] as HubLanguage[]).map((lang) => (
                <TabsContent key={lang} value={lang} className="space-y-3">
                  <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">
                       Título *
                     </label>
                    <Input
                      value={titles[lang]}
                      onChange={(e) =>
                        setTitles({ ...titles, [lang]: e.target.value })
                      }
                      placeholder={`Título em ${lang === "pt-br" ? "Português" : lang === "en-us" ? "Inglês" : "Espanhol"}`}
                    />
                  </div>

                  {type !== "html" ? (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-text-muted">
                        URL do Material
                      </label>
                      <Input
                        value={urls[lang]}
                        onChange={(e) =>
                          setUrls({ ...urls, [lang]: e.target.value })
                        }
                        placeholder="Link do Google Drive, YouTube, S3..."
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-text-muted">
                        URL do Material
                      </label>
                      <Input
                        value={urls[lang]}
                        onChange={(e) =>
                          setUrls({ ...urls, [lang]: e.target.value })
                        }
                        placeholder="URL do HTML"
                      />
                    </div>
                  )}

                  <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">
                         URL da Legenda (Opcional)
                       </label>
                    <Input
                      value={subtitleUrls[lang]}
                      onChange={(e) =>
                        setSubtitleUrls({
                          ...subtitleUrls,
                          [lang]: e.target.value,
                        })
                      }
                      placeholder="Link da legenda .srt ou .vtt"
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Opções HTML */}
          {type === "html" && (
            <div className="p-4 rounded-xl border border-border bg-surface/40 space-y-3">
              <label className="text-xs font-medium text-text-muted">
                Opção HTML
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setHtmlMode("url")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${htmlMode === "url" ? "liquid-glass-gold text-accent" : "border-border text-text-muted"}`}
                >
                  <Link size={12} /> URL
                </button>
                <button
                  onClick={() => setHtmlMode("paste")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${htmlMode === "paste" ? "liquid-glass-gold text-accent" : "border-border text-text-muted"}`}
                >
                  <Code size={12} /> Colar Código
                </button>
                <button
                  onClick={() => setHtmlMode("upload")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${htmlMode === "upload" ? "liquid-glass-gold text-accent" : "border-border text-text-muted"}`}
                >
                  <Upload size={12} /> Upload .html
                </button>
              </div>
              {htmlMode === "paste" && (
                <Textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  placeholder="Cole o código HTML aqui..."
                  rows={8}
                  className="font-mono text-xs"
                />
              )}
              {htmlMode === "upload" && (
                <div>
                  <input
                    type="file"
                    accept=".html"
                    onChange={(e) => setHtmlFile(e.target.files?.[0] || null)}
                    className="text-sm text-text-muted"
                  />
                  <p className="text-[10px] mt-1 text-text-muted">Máximo 5MB</p>
                </div>
              )}
            </div>
          )}

          {/* Categoria + Tags */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">
                Categoria
              </label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Odontologia"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">
                Tags
              </label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2"
              />
            </div>
          </div>

          {/* Ações */}
          <DialogFooter className="shrink-0">
            <button type="button" onClick={onClose} className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">
              Cancelar
            </button>
            <button type="button" onClick={handleSave} className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]">
              {material ? "Salvar" : "Criar Material"}
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

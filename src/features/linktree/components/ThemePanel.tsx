import { useRef, useState } from "react";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { compressImageContain } from "~/features/linktree/lib/image-utils";
import type {
  EmpresaLinktreeTheme,
  EmpresaLayout,
  BackgroundMode,
  BlobItem,
  BlobPosition,
} from "../types-empresa";
import { BLOB_POSITIONS } from "../types-empresa";

const BG_MODES: { value: BackgroundMode; label: string }[] = [
  { value: "solid", label: "Solido" },
  { value: "gradient2", label: "Gradiente 2 cores" },
  { value: "gradient3", label: "Gradiente 3 cores" },
];

const BTN_BG_MODES = [
  { value: "solid", label: "Solido" },
  { value: "gradient2", label: "Gradiente 2" },
  { value: "gradient3", label: "Gradiente 3" },
  { value: "transparent", label: "Transparente" },
];

const BUTTON_STYLES = [
  { value: "rounded" as const, label: "Arredondado" },
  { value: "square" as const, label: "Quadrado" },
  { value: "pill" as const, label: "Pill" },
];

const FONT_OPTIONS = [
  "Inter", "Outfit", "Playfair Display", "Georgia", "system-ui", "Helvetica",
];

const SOCIAL_KEYS = ["instagram", "linkedin", "facebook", "youtube"] as const;

interface Props {
  theme: EmpresaLinktreeTheme;
  onChange: (theme: EmpresaLinktreeTheme) => void;
  bio?: string;
  onBioChange?: (bio: string) => void;
}

export function ThemePanel({ theme, onChange, bio, onBioChange }: Props) {
  function patchBg<K extends keyof EmpresaLinktreeTheme["background"]>(key: K, value: EmpresaLinktreeTheme["background"][K]) {
    onChange({ ...theme, background: { ...theme.background, [key]: value } });
  }
  function patchBtn<K extends keyof EmpresaLinktreeTheme["buttons"]>(key: K, value: EmpresaLinktreeTheme["buttons"][K]) {
    onChange({ ...theme, buttons: { ...theme.buttons, [key]: value } });
  }
  function patchTypo<K extends keyof EmpresaLinktreeTheme["typography"]>(key: K, value: EmpresaLinktreeTheme["typography"][K]) {
    onChange({ ...theme, typography: { ...theme.typography, [key]: value } });
  }

  return (
    <Tabs defaultValue="aparencia">
      <TabsList className="grid w-full grid-cols-4 bg-surface-hover">
        <TabsTrigger value="aparencia">Aparencia</TabsTrigger>
        <TabsTrigger value="botoes">Botoes</TabsTrigger>
        <TabsTrigger value="textos">Textos</TabsTrigger>
        <TabsTrigger value="instituicao">Instituicao</TabsTrigger>
      </TabsList>

      {/* ═══════════════ ABA APARÊNCIA ═══════════════ */}
      <TabsContent value="aparencia" className="space-y-5 pt-5">
        {/* Layout */}
        <Section title="Layout">
          <div className="flex flex-wrap gap-2">
            {([{ value: "hero", label: "Hero (banner + avatar)" }, { value: "classic", label: "Classico (bio)" }] as { value: EmpresaLayout; label: string }[]).map((m) => (
              <button key={m.value} type="button" onClick={() => onChange({ ...theme, layout: m.value })} className={`rounded-md border px-3 py-2 text-sm transition ${theme.layout === m.value ? "border-primary bg-primary/10 text-text-main" : "border-border text-muted-foreground"}`}>{m.label}</button>
            ))}
          </div>
        </Section>

        {/* Fundo */}
        <Section title="Fundo">
          <div className="flex flex-wrap gap-2">
            {BG_MODES.map((m) => (
              <button key={m.value} type="button" onClick={() => patchBg("mode", m.value)} className={`rounded-md border px-3 py-2 text-xs transition ${theme.background.mode === m.value ? "border-primary bg-primary/10 text-text-main" : "border-border text-muted-foreground"}`}>{m.label}</button>
            ))}
          </div>
          {theme.background.mode === "solid" && <ColorRow label="Cor" value={theme.background.solid} onChange={(v) => patchBg("solid", v)} />}
          {theme.background.mode === "gradient2" && (<><ColorRow label="Cor 1" value={theme.background.gradientFrom} onChange={(v) => patchBg("gradientFrom", v)} /><ColorRow label="Cor 2" value={theme.background.gradientTo} onChange={(v) => patchBg("gradientTo", v)} /><RangeRow label="Angulo" value={theme.background.gradientAngle} onChange={(v) => patchBg("gradientAngle", v)} /></>)}
          {theme.background.mode === "gradient3" && (<><ColorRow label="Cor 1" value={theme.background.gradient3From} onChange={(v) => patchBg("gradient3From", v)} /><ColorRow label="Cor central" value={theme.background.gradient3Mid} onChange={(v) => patchBg("gradient3Mid", v)} /><ColorRow label="Cor 3" value={theme.background.gradient3To} onChange={(v) => patchBg("gradient3To", v)} /><RangeRow label="Angulo" value={theme.background.gradient3Angle} onChange={(v) => patchBg("gradient3Angle", v)} /></>)}
        </Section>

        {/* Blobs */}
        <Section title="Blobs decorativos" description="Manchas coloridas no fundo." toggle={{ checked: theme.background.blobsEnabled, onChange: (v) => patchBg("blobsEnabled", v) }}>
          {theme.background.blobsEnabled && (
            <div className="space-y-3">
              {theme.background.blobs.map((b, i) => (
                <BlobRow key={i} blob={b} onChange={(nb) => { const blobs = theme.background.blobs.slice(); blobs[i] = nb; patchBg("blobs", blobs); }} onRemove={() => patchBg("blobs", theme.background.blobs.filter((_, j) => j !== i))} />
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => patchBg("blobs", [...theme.background.blobs, { enabled: true, color: "#46b98c", position: "mc", size: 280, opacity: 0.2 }])}><Plus className="size-4" /> Adicionar blob</Button>
            </div>
          )}
        </Section>

        {/* Watermark */}
        <Section title="Marca d'agua" description="Imagem sutil no fundo.">
          {theme.background.watermarkUrl && (
            <div className="relative">
              <img src={theme.background.watermarkUrl} alt="Watermark" className="h-16 w-16 object-contain opacity-20" />
              <Button type="button" size="sm" variant="ghost" className="absolute right-0 top-0" onClick={() => patchBg("watermarkUrl", "")}><Trash2 className="size-3 text-error" /></Button>
            </div>
          )}
          <ImageUploader label="Enviar imagem" onUpload={(url) => patchBg("watermarkUrl", url)} />
          {theme.background.watermarkUrl && (
            <>
              <RangeRow label="Opacidade" value={Math.round(theme.background.watermarkOpacity * 100)} onChange={(v) => patchBg("watermarkOpacity", v / 100)} min={1} max={20} />
              <RangeRow label="Tamanho" value={theme.background.watermarkSize} onChange={(v) => patchBg("watermarkSize", v)} min={50} max={600} />
              <RangeRow label="Borracao" value={theme.background.watermarkBlur} onChange={(v) => patchBg("watermarkBlur", v)} min={0} max={80} />
              <Label className="text-xs">Posicao</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {BLOB_POSITIONS.map((p) => (
                  <button key={p.value} type="button" onClick={() => patchBg("watermarkPosition", p.value)} className={`rounded border px-2 py-1.5 text-[11px] transition ${theme.background.watermarkPosition === p.value ? "border-primary bg-primary/10 text-text-main" : "border-border text-muted-foreground"}`}>{p.label}</button>
                ))}
              </div>
            </>
          )}
        </Section>

        {/* Avatar */}
        <Section title="Avatar">
          <ColorRow label="Cor da borda" value={theme.avatar?.borderColor ?? "#46b98c"} onChange={(v) => onChange({ ...theme, avatar: { ...theme.avatar, borderColor: v, borderWidth: theme.avatar?.borderWidth ?? 3 } })} />
          <RangeRow label="Espessura da borda" value={theme.avatar?.borderWidth ?? 3} onChange={(v) => onChange({ ...theme, avatar: { ...theme.avatar, borderWidth: v, borderColor: theme.avatar?.borderColor ?? "#46b98c" } })} min={0} max={8} />
        </Section>

        {/* Ícones dos links */}
        <Section title="Icones dos links">
          <ColorRow label="Cor do icone" value={theme.icons.pathColor} onChange={(v) => onChange({ ...theme, icons: { ...theme.icons, pathColor: v } })} />
          <ColorRow label="Cor de fundo" value={theme.icons.bgColor} onChange={(v) => onChange({ ...theme, icons: { ...theme.icons, bgColor: v } })} />
          <RangeRow label="Espessura do traco" value={theme.icons.strokeWidth} onChange={(v) => onChange({ ...theme, icons: { ...theme.icons, strokeWidth: v } })} min={1} max={3} />
        </Section>

        {/* Espaçamento */}
        <Section title="Espacamento">
          <RangeRow label="Gap entre secoes" value={theme.spacing.sectionGap} onChange={(v) => onChange({ ...theme, spacing: { ...theme.spacing, sectionGap: v } })} min={0} max={64} />
          <RangeRow label="Gap entre links" value={theme.spacing.linkGap} onChange={(v) => onChange({ ...theme, spacing: { ...theme.spacing, linkGap: v } })} min={0} max={32} />
          <RangeRow label="Padding horizontal" value={theme.spacing.containerPaddingX} onChange={(v) => onChange({ ...theme, spacing: { ...theme.spacing, containerPaddingX: v } })} min={0} max={48} />
          <RangeRow label="Padding vertical" value={theme.spacing.containerPaddingY} onChange={(v) => onChange({ ...theme, spacing: { ...theme.spacing, containerPaddingY: v } })} min={0} max={64} />
        </Section>
      </TabsContent>

      {/* ═══════════════ ABA BOTÕES ═══════════════ */}
      <TabsContent value="botoes" className="space-y-5 pt-5">
        <Section title="Formato">
          <div className="flex flex-wrap gap-2">
            {BUTTON_STYLES.map((s) => (
              <button key={s.value} type="button" onClick={() => patchBtn("style", s.value)} className={`rounded-md border px-3 py-2 text-sm transition ${theme.buttons.style === s.value ? "border-primary bg-primary/10 text-text-main" : "border-border text-muted-foreground"}`}>{s.label}</button>
            ))}
          </div>
        </Section>

        <Section title="Fundo do botao">
          <div className="flex flex-wrap gap-2">
            {BTN_BG_MODES.map((m) => (
              <button key={m.value} type="button" onClick={() => patchBtn("bgMode", m.value as any)} className={`rounded-md border px-3 py-2 text-xs transition ${theme.buttons.bgMode === m.value ? "border-primary bg-primary/10 text-text-main" : "border-border text-muted-foreground"}`}>{m.label}</button>
            ))}
          </div>
          {theme.buttons.bgMode === "solid" && <ColorRow label="Cor" value={theme.buttons.bgColor} onChange={(v) => patchBtn("bgColor", v)} />}
          {theme.buttons.bgMode === "gradient2" && (<><ColorRow label="Cor 1" value={theme.buttons.bgGradientFrom} onChange={(v) => patchBtn("bgGradientFrom", v)} /><ColorRow label="Cor 2" value={theme.buttons.bgGradientTo} onChange={(v) => patchBtn("bgGradientTo", v)} /><RangeRow label="Angulo" value={theme.buttons.bgGradientAngle} onChange={(v) => patchBtn("bgGradientAngle", v)} /></>)}
          {theme.buttons.bgMode === "gradient3" && (<><ColorRow label="Cor 1" value={theme.buttons.bgGradient3From} onChange={(v) => patchBtn("bgGradient3From", v)} /><ColorRow label="Cor central" value={theme.buttons.bgGradient3Mid} onChange={(v) => patchBtn("bgGradient3Mid", v)} /><ColorRow label="Cor 3" value={theme.buttons.bgGradient3To} onChange={(v) => patchBtn("bgGradient3To", v)} /><RangeRow label="Angulo" value={theme.buttons.bgGradient3Angle} onChange={(v) => patchBtn("bgGradient3Angle", v)} /></>)}
        </Section>

        <Section title="Texto do botao">
          <ColorRow label="Cor" value={theme.buttons.textColor} onChange={(v) => patchBtn("textColor", v)} />
        </Section>

        <Section title="Borda">
          <RangeRow label="Arredondamento" value={theme.buttons.borderRadius} onChange={(v) => patchBtn("borderRadius", v)} min={0} max={32} />
          <RangeRow label="Espessura" value={theme.buttons.borderWidth} onChange={(v) => patchBtn("borderWidth", v)} min={0} max={4} />
          {theme.buttons.borderWidth > 0 && <ColorRow label="Cor" value={theme.buttons.borderColor} onChange={(v) => patchBtn("borderColor", v)} />}
        </Section>

        <Section title="Sombra" toggle={{ checked: theme.buttons.shadow, onChange: (v) => patchBtn("shadow", v) }}>
          {theme.buttons.shadow && <RangeRow label="Tamanho" value={theme.buttons.shadowSize} onChange={(v) => patchBtn("shadowSize", v)} min={2} max={24} />}
        </Section>

        <Section title="Hover (mouse)">
          <ColorRow label="Cor de fundo" value={theme.buttons.hoverBgColor} onChange={(v) => patchBtn("hoverBgColor", v)} />
          <ColorRow label="Cor do texto" value={theme.buttons.hoverTextColor} onChange={(v) => patchBtn("hoverTextColor", v)} />
          <RangeRow label="Escala" value={Math.round(theme.buttons.hoverScale * 100)} onChange={(v) => patchBtn("hoverScale", v / 100)} min={100} max={110} />
        </Section>
      </TabsContent>

      {/* ═══════════════ ABA TEXTOS ═══════════════ */}
      <TabsContent value="textos" className="space-y-5 pt-5">
        <Section title="Titulo (nome da empresa)">
          <Input
            value={theme.institucional.nomeEmpresa}
            onChange={(e) => onChange({ ...theme, institucional: { ...theme.institucional, nomeEmpresa: e.target.value } })}
            placeholder="Nome da sua empresa"
          />
          <ColorRow label="Cor" value={theme.typography.titleColor} onChange={(v) => patchTypo("titleColor", v)} />
          <RangeRow label="Tamanho" value={theme.typography.titleSize} onChange={(v) => patchTypo("titleSize", v)} min={16} max={48} />
        </Section>

        <Section title="Subtitulo">
          <textarea
            value={bio ?? ""}
            onChange={(e) => onBioChange?.(e.target.value)}
            placeholder="Texto que aparece abaixo do titulo..."
            rows={2}
            className="w-full rounded-md border border-border bg-surface-hover px-3 py-2 text-sm"
          />
          <ColorRow label="Cor" value={theme.typography.bioColor} onChange={(v) => patchTypo("bioColor", v)} />
          <RangeRow label="Tamanho" value={theme.typography.bioSize} onChange={(v) => patchTypo("bioSize", v)} min={10} max={24} />
        </Section>

        <Section title="Fonte">
          <div className="space-y-1.5">
            <Label className="text-xs">Fonte principal</Label>
            <select value={theme.typography.font} onChange={(e) => patchTypo("font", e.target.value)} className="h-9 w-full rounded-md border border-border bg-surface-hover px-2 text-sm">
              {FONT_OPTIONS.map((f) => (<option key={f} value={f}>{f}</option>))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fonte dos botoes</Label>
            <select value={theme.typography.buttonFont} onChange={(e) => patchTypo("buttonFont", e.target.value)} className="h-9 w-full rounded-md border border-border bg-surface-hover px-2 text-sm">
              {FONT_OPTIONS.map((f) => (<option key={f} value={f}>{f}</option>))}
            </select>
          </div>
        </Section>

        <Section title="Secoes">
          <ColorRow label="Cor do titulo das secoes" value={theme.typography.sectionColor} onChange={(v) => patchTypo("sectionColor", v)} />
        </Section>
      </TabsContent>

      {/* ═══════════════ ABA INSTITUIÇÃO ═══════════════ */}
      <TabsContent value="instituicao" className="space-y-5 pt-5">
        <Section title="Logo do rodape">
          <LogoUploader
            url={theme.institucional.logoUrl}
            width={theme.institucional.logoWidth}
            height={theme.institucional.logoHeight}
            onChange={(p) => onChange({ ...theme, institucional: { ...theme.institucional, ...p } })}
          />
        </Section>

        <Section title="Nome da empresa" toggle={{ checked: theme.institucional.nomeEmpresaEnabled, onChange: (v) => onChange({ ...theme, institucional: { ...theme.institucional, nomeEmpresaEnabled: v } }) }}>
          <Input value={theme.institucional.nomeEmpresa} onChange={(e) => onChange({ ...theme, institucional: { ...theme.institucional, nomeEmpresa: e.target.value } })} />
        </Section>

        <Section title="Endereco" toggle={{ checked: theme.institucional.enderecoEnabled, onChange: (v) => onChange({ ...theme, institucional: { ...theme.institucional, enderecoEnabled: v } }) }}>
          <Input value={theme.institucional.endereco} onChange={(e) => onChange({ ...theme, institucional: { ...theme.institucional, endereco: e.target.value } })} />
        </Section>

        <Section title="Site">
          <Input value={theme.institucional.site} onChange={(e) => onChange({ ...theme, institucional: { ...theme.institucional, site: e.target.value } })} placeholder="https://..." />
        </Section>

        <Section title="Redes sociais" description="Preencha a URL para ativar automaticamente.">
          <div className="space-y-3">
            {SOCIAL_KEYS.map((k) => {
              const enabledKey = `${k}Enabled` as const;
              return (
                <div key={k} className="flex items-center gap-3">
                  <Switch checked={theme.institucional[enabledKey]} onCheckedChange={(v) => onChange({ ...theme, institucional: { ...theme.institucional, [enabledKey]: v } })} />
                  <span className="w-20 text-sm capitalize">{k}</span>
                  <Input value={theme.institucional[k]} onChange={(e) => { const url = e.target.value; onChange({ ...theme, institucional: { ...theme.institucional, [k]: url, [enabledKey]: url.length > 5 ? true : theme.institucional[enabledKey] } }); }} placeholder={`https://${k}.com/...`} className="flex-1 text-sm" />
                  <input type="color" value={theme.institucional.socialColors[k]} onChange={(e) => onChange({ ...theme, institucional: { ...theme.institucional, socialColors: { ...theme.institucional.socialColors, [k]: e.target.value } } })} className="h-8 w-8 cursor-pointer rounded border border-border" />
                </div>
              );
            })}
          </div>
        </Section>
      </TabsContent>
    </Tabs>
  );
}

/* ═══════════════ COMPONENTES AUXILIARES ═══════════════ */

function Section({ title, description, toggle, children }: { title: string; description?: string; toggle?: { checked: boolean; onChange: (v: boolean) => void }; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-semibold">{title}</Label>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {toggle && <Switch checked={toggle.checked} onCheckedChange={toggle.onChange} />}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono text-xs" />
      </div>
    </div>
  );
}

function RangeRow({ label, value, onChange, min = 0, max = 360 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}: {value}</Label>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </div>
  );
}

function BlobRow({ blob, onChange, onRemove }: { blob: BlobItem; onChange: (b: BlobItem) => void; onRemove: () => void }) {
  return (
    <div className="rounded-md border border-border bg-surface-hover/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Switch checked={blob.enabled} onCheckedChange={(v) => onChange({ ...blob, enabled: v })} />
          <input type="color" value={blob.color} onChange={(e) => onChange({ ...blob, color: e.target.value })} className="h-7 w-9 cursor-pointer rounded border border-border bg-transparent" />
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}><Trash2 className="size-4 text-error" /></Button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {BLOB_POSITIONS.map((p) => (
          <button key={p.value} type="button" onClick={() => onChange({ ...blob, position: p.value as BlobPosition })} className={`rounded border px-2 py-1.5 text-[11px] transition ${blob.position === p.value ? "border-primary bg-primary/10 text-text-main" : "border-border text-muted-foreground hover:text-text-main"}`}>{p.label}</button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label className="text-xs">Tamanho: {blob.size}px</Label><input type="range" min={80} max={600} value={blob.size} onChange={(e) => onChange({ ...blob, size: Number(e.target.value) })} className="w-full" /></div>
        <div className="space-y-1"><Label className="text-xs">Opacidade: {Math.round(blob.opacity * 100)}%</Label><input type="range" min={5} max={100} value={Math.round(blob.opacity * 100)} onChange={(e) => onChange({ ...blob, opacity: Number(e.target.value) / 100 })} className="w-full" /></div>
      </div>
    </div>
  );
}

function LogoUploader({ url, width, height, onChange }: { url: string; width: number; height: number; onChange: (p: { logoUrl?: string; logoWidth?: number; logoHeight?: number }) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return; if (f.size > 4 * 1024 * 1024) { toast.error("Max 4MB"); return; }
    setBusy(true); try { onChange({ logoUrl: await compressImageContain(f, 512) }); } catch { toast.error("Erro"); } finally { setBusy(false); }
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="grid shrink-0 place-items-center rounded border border-dashed border-border bg-surface-hover/40" style={{ width: Math.max(width, 48), height: Math.max(height, 32) }}>
          {url ? <img src={url} alt="Logo" style={{ width, height, objectFit: "contain" }} /> : <Upload className="size-5 text-muted-foreground" />}
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={busy}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Enviar</Button>
          {url && <Button type="button" size="sm" variant="ghost" onClick={() => onChange({ logoUrl: "" })}><Trash2 className="size-4 text-error" /></Button>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {url && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label className="text-xs">Largura: {width}px</Label><input type="range" min={40} max={320} value={width} onChange={(e) => onChange({ logoWidth: Number(e.target.value) })} className="w-full" /></div>
          <div className="space-y-1"><Label className="text-xs">Altura: {height}px</Label><input type="range" min={16} max={160} value={height} onChange={(e) => onChange({ logoHeight: Number(e.target.value) })} className="w-full" /></div>
        </div>
      )}
    </div>
  );
}

function ImageUploader({ label, onUpload }: { label: string; onUpload: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return; if (f.size > 8 * 1024 * 1024) { toast.error("Max 8MB"); return; }
    setBusy(true); try { onUpload(await compressImageContain(f, 512)); } catch { toast.error("Erro"); } finally { setBusy(false); }
  }
  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={busy}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} {label}</Button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </>
  );
}

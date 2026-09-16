import { useState } from "react";
import { Search, Upload, X } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { DynamicIcon } from "./DynamicIcon";

const ICON_LIST = [
  "Globe",
  "ShoppingCart",
  "BookOpen",
  "Music",
  "Camera",
  "Heart",
  "Star",
  "Zap",
  "Phone",
  "Mail",
  "MessageCircle",
  "MapPin",
  "Calendar",
  "Clock",
  "Gift",
  "Award",
  "Briefcase",
  "Building",
  "GraduationCap",
  "Headphones",
  "Image",
  "Film",
  "Mic",
  "Podcast",
  "Radio",
  "Tv",
  "Wifi",
  "Wrench",
  "Settings",
  "User",
  "Users",
  "Video",
  "FileText",
  "Folder",
  "Archive",
  "Bookmark",
  "Tag",
  "Hash",
  "AtSign",
  "Link",
  "ExternalLink",
  "Share",
  "Send",
  "ArrowRight",
  "ChevronRight",
];

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function IconPicker({ value, onChange }: Props) {
  const [search, setSearch] = useState("");
  const [customMode, setCustomMode] = useState(false);

  const filtered = ICON_LIST.filter((i) =>
    i.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Icone</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setCustomMode(!customMode)}
        >
          <Upload className="size-3" />
          {customMode ? "Escolher icone" : "URL custom"}
        </Button>
      </div>

      {customMode ? (
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... ou emoji"
            className="h-8"
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange("")}
            >
              <X className="size-3" />
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar icone..."
              className="h-8 pl-7"
            />
          </div>
          <div className="grid max-h-32 grid-cols-8 gap-1 overflow-y-auto rounded border border-border p-2">
            {filtered.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => onChange(icon)}
                className={`rounded p-1.5 text-xs transition ${
                  value === icon
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-surface-hover"
                }`}
                title={icon}
              >
                <DynamicIcon name={icon} size={16} />
              </button>
            ))}
          </div>
          {value && !customMode && (
            <p className="text-xs text-muted-foreground">
              Selecionado: {value}
            </p>
          )}
        </>
      )}
    </div>
  );
}

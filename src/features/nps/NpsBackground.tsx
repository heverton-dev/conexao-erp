import type { NpsBlob } from "./theme";

function blobPositionToStyle(pos: string): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    "sup-esquerdo": { top: "-10%", left: "-10%" },
    "sup-central": { top: "-10%", left: "50%", transform: "translateX(-50%)" },
    "sup-direito": { top: "-10%", right: "-10%" },
    esquerdo: { top: "50%", left: "-10%", transform: "translateY(-50%)" },
    centro: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
    direito: { top: "50%", right: "-10%", transform: "translateY(-50%)" },
    "inf-esquerdo": { bottom: "-10%", left: "-10%" },
    "inf-central": {
      bottom: "-10%",
      left: "50%",
      transform: "translateX(-50%)",
    },
    "inf-direito": { bottom: "-10%", right: "-10%" },
  };
  return map[pos] ?? {};
}

interface NpsBackgroundProps {
  bgStyle: React.CSSProperties;
  blobs: NpsBlob[];
  className?: string;
  children?: React.ReactNode;
}

export function NpsBackground({
  bgStyle,
  blobs,
  className = "",
  children,
}: NpsBackgroundProps) {
  return (
    <div className={`relative min-h-screen ${className}`} style={bgStyle}>
      {blobs.map((blob) => {
        const posStyle = blobPositionToStyle(blob.position);
        return (
          <div
            key={blob.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              ...posStyle,
              width: blob.size,
              height: blob.size,
              background: `radial-gradient(circle, ${blob.color}${Math.round(
                blob.opacity * 2.55,
              )
                .toString(16)
                .padStart(2, "0")} 0%, transparent 70%)`,
              filter: "blur(60px)",
            }}
          />
        );
      })}
      {children}
    </div>
  );
}

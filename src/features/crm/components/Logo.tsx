type Props = { size?: number; className?: string; withText?: boolean };

export function Logo({ size = 40, className = "", withText = false }: Props) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="rounded-lg shadow-md bg-gradient-to-br from-primary to-gold flex items-center justify-center text-white font-bold"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        CX
      </div>
      {withText && (
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight">Conexão</p>
          <p className="text-xs text-gold font-semibold -mt-0.5">Implantes</p>
        </div>
      )}
    </div>
  );
}

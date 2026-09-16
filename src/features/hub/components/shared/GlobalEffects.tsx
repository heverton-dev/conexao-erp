export function HubGlobalEffects() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      <div
        className="absolute top-0 -left-4 rounded-full mix-blend-multiply filter animate-blob"
        style={{
          width: "var(--env-blob-size, 18rem)",
          height: "var(--env-blob-size, 18rem)",
          backgroundColor: "var(--env-blob1-color, #c9a655)",
          opacity: "var(--env-blob-opacity, 0.20)",
          filter: "blur(var(--env-blob-blur, 64px))",
        }}
      />
      <div
        className="absolute top-0 -right-4 rounded-full mix-blend-multiply filter animate-blob animation-delay-2000"
        style={{
          width: "var(--env-blob-size, 18rem)",
          height: "var(--env-blob-size, 18rem)",
          backgroundColor: "var(--env-blob2-color, #e8d48b)",
          opacity: "var(--env-blob-opacity, 0.20)",
          filter: "blur(var(--env-blob-blur, 64px))",
        }}
      />
      <div
        className="absolute -bottom-8 left-20 rounded-full mix-blend-multiply filter animate-blob animation-delay-4000"
        style={{
          width: "var(--env-blob-size, 18rem)",
          height: "var(--env-blob-size, 18rem)",
          backgroundColor: "var(--env-blob3-color, #a8873a)",
          opacity: "var(--env-blob-opacity, 0.20)",
          filter: "blur(var(--env-blob-blur, 64px))",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url('https://grainy-gradients.vercel.app/noise.svg')",
          opacity: "var(--env-grain-opacity, 0.20)",
          mixBlendMode: "var(--env-grain-blend, multiply)" as any,
          filter: "contrast(var(--env-grain-contrast, 150))",
        }}
      />
    </div>
  );
}

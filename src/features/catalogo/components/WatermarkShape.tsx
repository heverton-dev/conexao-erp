import type { WatermarkShape as Shape } from "../services/design.service"

interface WatermarkShapeProps {
  shape: Shape
  color: string
  className?: string
}

export function WatermarkShape({ shape, color, className = "" }: WatermarkShapeProps) {
  const base = "absolute pointer-events-none transition-opacity duration-500"

  switch (shape) {
    case "diamond":
      return (
        <div
          className={`${base} rotate-45 rounded-2xl opacity-[0.04] group-hover:opacity-[0.08] ${className}`}
          style={{ border: `2px solid ${color}` }}
        />
      )
    case "circle":
      return (
        <div
          className={`${base} rounded-full opacity-[0.04] group-hover:opacity-[0.08] ${className}`}
          style={{ border: `2px solid ${color}` }}
        />
      )
    case "hexagon":
      return (
        <svg className={`${base} opacity-[0.04] group-hover:opacity-[0.08] ${className}`} viewBox="0 0 100 100" fill="none">
          <polygon points="50,2 95,25 95,75 50,98 5,75 5,25" stroke={color} strokeWidth="2" />
        </svg>
      )
    case "ring":
      return (
        <div
          className={`${base} rounded-full opacity-[0.04] group-hover:opacity-[0.08] ${className}`}
          style={{ border: `2px solid ${color}`, boxShadow: `inset 0 0 0 4px ${color}20` }}
        />
      )
    case "square":
      return (
        <div
          className={`${base} rounded-xl opacity-[0.04] group-hover:opacity-[0.08] ${className}`}
          style={{ border: `2px solid ${color}` }}
        />
      )
    default:
      return null
  }
}

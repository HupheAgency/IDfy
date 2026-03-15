interface SectionLabelProps {
  children: React.ReactNode
  className?: string
}

export default function SectionLabel({ children, className = '' }: SectionLabelProps) {
  return (
    <span
      className={`font-mono text-[10px] uppercase tracking-[0.2em] text-mid ${className}`}
    >
      {children}
    </span>
  )
}

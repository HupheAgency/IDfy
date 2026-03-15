interface EquityBadgeProps {
  percent: number | null
  className?: string
}

export default function EquityBadge({ percent, className = '' }: EquityBadgeProps) {
  if (percent === null || percent === undefined) return null

  return (
    <span
      className={`inline-flex items-center bg-accent text-black font-mono text-[10px] font-medium uppercase tracking-widest px-2 py-0.5 ${className}`}
    >
      {percent}% EQUITY
    </span>
  )
}

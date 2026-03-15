interface AccentBarProps {
  className?: string
  height?: string
}

export default function AccentBar({ className = '', height = 'h-full' }: AccentBarProps) {
  return (
    <div
      className={`w-[3px] bg-accent flex-shrink-0 ${height} ${className}`}
      aria-hidden="true"
    />
  )
}

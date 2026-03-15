interface ActivityDotProps {
  lastActiveAt: string
  className?: string
}

export default function ActivityDot({ lastActiveAt, className = '' }: ActivityDotProps) {
  const now = new Date()
  const lastActive = new Date(lastActiveAt)
  const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))

  let color = 'bg-accent' // green = active last 7 days
  let label = 'Active'
  if (diffDays > 30) {
    color = 'bg-red-500'
    label = 'Inactive'
  } else if (diffDays > 7) {
    color = 'bg-amber-400'
    label = 'Semi-active'
  }

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${color} ${className}`}
      title={label}
      aria-label={label}
    />
  )
}

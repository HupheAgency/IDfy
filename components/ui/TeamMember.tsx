import ActivityDot from './ActivityDot'
import { Profile, ProjectMember } from '@/lib/types'

interface TeamMemberProps {
  member: ProjectMember & { profiles?: Profile }
  showEquity?: boolean
  className?: string
}

export default function TeamMember({ member, showEquity = false, className = '' }: TeamMemberProps) {
  const name = member.profiles?.full_name || 'Anonymous'
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className={`flex items-center gap-3 py-2 ${className}`}>
      <div className="w-8 h-8 bg-dark border border-dark flex items-center justify-center flex-shrink-0">
        <span className="font-mono text-[10px] text-mid">{initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-white truncate">{name}</span>
          <ActivityDot lastActiveAt={member.last_active_at} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-mid">{member.role}</span>
          {showEquity && (
            <span className="font-mono text-[10px] text-accent">{member.equity_percent}%</span>
          )}
        </div>
      </div>
    </div>
  )
}

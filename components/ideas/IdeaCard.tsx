import Link from 'next/link'
import EquityBadge from '@/components/ui/EquityBadge'
import { Idea, Profile } from '@/lib/types'

interface IdeaCardProps {
  idea: Idea & { profiles?: Profile }
  className?: string
}

export default function IdeaCard({ idea, className = '' }: IdeaCardProps) {
  const creatorName = idea.profiles?.full_name || 'Anonymous'
  const initials = creatorName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const date = new Date(idea.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Link href={`/ideas/${idea.id}`}>
      <div className={`bg-grey border border-dark p-5 hover:border-accent transition-colors duration-200 group ${className}`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <p className="font-mono text-sm text-white leading-relaxed line-clamp-2 flex-1">
            {idea.teaser.length > 80 ? idea.teaser.slice(0, 80) + '...' : idea.teaser}
          </p>
          {idea.equity_offered_percent !== null && (
            <EquityBadge percent={idea.equity_offered_percent} />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-dark border border-dark flex items-center justify-center">
              <span className="font-mono text-[9px] text-mid">{initials}</span>
            </div>
            <span className="font-mono text-[11px] text-mid">{creatorName}</span>
          </div>

          <div className="flex items-center gap-3">
            {idea.category && (
              <span className="font-mono text-[10px] uppercase tracking-widest text-mid border border-dark px-2 py-0.5">
                {idea.category}
              </span>
            )}
            <span className="font-mono text-[10px] text-mid">Filed {date}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-dark flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-mid group-hover:text-accent transition-colors">
            View idea →
          </span>
          {idea.timestamp_hash && (
            <span className="font-mono text-[9px] text-mid opacity-50" title="Timestamped">
              ● TIMESTAMPED
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

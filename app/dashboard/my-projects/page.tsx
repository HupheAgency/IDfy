import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function MyProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: memberships } = await supabase
    .from('project_members')
    .select('*, projects(*, ideas(teaser, category)), profiles(*)')
    .eq('user_id', user!.id)
    .order('joined_at', { ascending: false })

  const roleColor: Record<string, string> = {
    founder: 'text-accent border-accent',
    lead: 'text-blue-400 border-blue-400',
    contributor: 'text-mid border-dark',
  }

  return (
    <div className="p-8 md:p-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-[3px] h-6 bg-accent" />
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-mid">MY PROJECTS</span>
      </div>

      {!memberships || memberships.length === 0 ? (
        <div className="border border-dark p-12 text-center">
          <p className="font-mono text-sm text-mid mb-2">No projects yet.</p>
          <p className="font-mono text-[11px] text-mid">
            Projects form when an idea creator approves a contributor application.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {memberships.map((membership: any) => {
            const project = membership.projects
            const idea = project?.ideas
            const lastActive = new Date(membership.last_active_at)
            const diffDays = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
            const activityLabel = diffDays <= 7 ? 'Active' : diffDays <= 30 ? 'Semi-active' : 'Inactive'
            const activityColor = diffDays <= 7 ? 'text-accent' : diffDays <= 30 ? 'text-amber-400' : 'text-red-400'

            return (
              <Link key={membership.id} href={`/projects/${project.id}`}>
                <div className="bg-grey border border-dark p-5 hover:border-accent transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-mono text-sm text-white mb-1">{project.name || idea?.teaser?.slice(0, 60)}</p>
                      {idea?.teaser && project.name && (
                        <p className="font-mono text-[11px] text-mid mb-2 line-clamp-1">{idea.teaser}</p>
                      )}
                      <div className="flex items-center gap-4 flex-wrap">
                        {idea?.category && (
                          <span className="font-mono text-[10px] uppercase tracking-widest text-mid border border-dark px-2 py-0.5">
                            {idea.category}
                          </span>
                        )}
                        <span className={`font-mono text-[10px] ${activityColor}`}>
                          ● {activityLabel}
                        </span>
                        <span className="font-mono text-[10px] text-mid">
                          {membership.equity_percent}% equity
                        </span>
                      </div>
                    </div>
                    <span className={`font-mono text-[10px] uppercase tracking-widest border px-2 py-0.5 flex-shrink-0 ${roleColor[membership.role] || 'text-mid border-dark'}`}>
                      {membership.role}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

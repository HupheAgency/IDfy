import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Idea } from '@/lib/types'

export default async function MyIdeasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: ideas } = await supabase
    .from('ideas')
    .select('*, applications(count)')
    .eq('creator_id', user!.id)
    .order('created_at', { ascending: false })

  const statusColor: Record<string, string> = {
    active: 'text-accent border-accent',
    in_progress: 'text-blue-400 border-blue-400',
    completed: 'text-green-400 border-green-400',
    archived: 'text-mid border-dark',
  }

  return (
    <div className="p-8 md:p-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-[3px] h-6 bg-accent" />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-mid">MY IDEAS</span>
        </div>
        <Link
          href="/ideas/new"
          className="bg-accent text-black font-mono text-[11px] uppercase tracking-widest px-5 py-2.5 hover:opacity-90 transition-opacity"
        >
          + File new idea
        </Link>
      </div>

      {!ideas || ideas.length === 0 ? (
        <div className="border border-dark p-12 text-center">
          <p className="font-mono text-sm text-mid mb-6">You haven&apos;t filed any ideas yet.</p>
          <Link
            href="/ideas/new"
            className="inline-block bg-accent text-black font-mono text-[11px] uppercase tracking-widest px-6 py-3"
          >
            File your first idea
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea: Idea & { applications?: { count: number }[] }) => {
            const appCount = idea.applications?.[0]?.count || 0
            return (
              <Link key={idea.id} href={`/ideas/${idea.id}`}>
                <div className="bg-grey border border-dark p-5 hover:border-accent transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-mono text-sm text-white mb-2 leading-relaxed">{idea.teaser}</p>
                      <div className="flex items-center gap-4 flex-wrap">
                        {idea.category && (
                          <span className="font-mono text-[10px] uppercase tracking-widest text-mid border border-dark px-2 py-0.5">
                            {idea.category}
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-mid">
                          {new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {appCount > 0 && (
                          <span className="font-mono text-[10px] text-accent">
                            {appCount} application{appCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`font-mono text-[10px] uppercase tracking-widest border px-2 py-0.5 ${statusColor[idea.status] || 'text-mid border-dark'}`}>
                        {idea.status.replace('_', ' ')}
                      </span>
                    </div>
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

import { createClient } from '@/lib/supabase/server'
import IdeaCard from '@/components/ideas/IdeaCard'
import { Idea, Profile } from '@/lib/types'
import Link from 'next/link'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const supabase = await createClient()
  await supabase.auth.getUser()

  let query = supabase
    .from('ideas')
    .select('*, profiles(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }

  const { data: ideas } = await query

  const categories = ['Technology', 'Media', 'Health', 'Finance', 'Sustainability', 'Creative', 'Other']

  return (
    <div className="p-8 md:p-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-[3px] h-6 bg-accent" />
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-mid">IDEA FEED</span>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <Link
          href="/dashboard"
          className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-colors ${
            !searchParams.category
              ? 'border-accent text-accent'
              : 'border-dark text-mid hover:border-white hover:text-white'
          }`}
        >
          ALL
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/dashboard?category=${cat}`}
            className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-colors ${
              searchParams.category === cat
                ? 'border-accent text-accent'
                : 'border-dark text-mid hover:border-white hover:text-white'
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Ideas grid */}
      {!ideas || ideas.length === 0 ? (
        <div className="border border-dark p-12 text-center">
          <p className="font-mono text-sm text-mid mb-6">No ideas in the feed yet.</p>
          <Link
            href="/ideas/new"
            className="inline-block bg-accent text-black font-mono text-[11px] uppercase tracking-widest px-6 py-3 hover:opacity-90 transition-opacity"
          >
            File the first one
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(ideas as (Idea & { profiles?: Profile })[]).map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  )
}

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
    .in('layer', [3])
    .order('created_at', { ascending: false })

  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }

  const { data: ideas } = await query

  const categories = ['Technology', 'Business', 'Creative', 'Science', 'Social', 'Other']

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#111', letterSpacing: '-0.03em' }}>
          Idea Feed
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.85rem', color: '#999', marginTop: '0.2rem' }}>
          Open ideas looking for contributors. Layer 3 only.
        </p>
      </div>

      {/* Category filter bar */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Link
          href="/dashboard"
          style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 400,
            borderRadius: 100, padding: '0.4rem 1rem',
            background: !searchParams.category ? '#3B6B4A' : '#fff',
            color: !searchParams.category ? '#fff' : '#999',
            border: `1px solid ${!searchParams.category ? '#3B6B4A' : '#E5E3DC'}`,
            textDecoration: 'none', transition: 'all 0.15s',
          }}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/dashboard?category=${cat}`}
            style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 400,
              borderRadius: 100, padding: '0.4rem 1rem',
              background: searchParams.category === cat ? '#3B6B4A' : '#fff',
              color: searchParams.category === cat ? '#fff' : '#999',
              border: `1px solid ${searchParams.category === cat ? '#3B6B4A' : '#E5E3DC'}`,
              textDecoration: 'none', transition: 'all 0.15s',
            }}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Ideas grid */}
      {!ideas || ideas.length === 0 ? (
        <div
          style={{
            background: '#fff', border: '1px solid #E5E3DC', borderRadius: 16,
            padding: '3rem 2rem', textAlign: 'center',
          }}
        >
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.9rem', color: '#999', marginBottom: '1.2rem' }}>
            No open ideas in this category yet.
          </p>
          <Link
            href="/ideas/new"
            style={{
              background: '#111', color: '#F7F6F3', borderRadius: 100,
              padding: '0.65rem 1.4rem', fontSize: '0.83rem', fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif", textDecoration: 'none',
            }}
          >
            File the first one
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.9rem' }}>
          {(ideas as (Idea & { profiles?: Profile })[]).map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import IdeaDetailClient from './IdeaDetailClient'

export default async function IdeaDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: idea } = await supabase
    .from('ideas')
    .select('*, profiles(*)')
    .eq('id', params.id)
    .single()

  if (!idea) notFound()

  // Check NDA
  const { data: nda } = await supabase
    .from('nda_acceptances')
    .select('*')
    .eq('user_id', user.id)
    .eq('idea_id', params.id)
    .single()

  // Check if user is creator
  const isCreator = idea.creator_id === user.id

  // Get applications for creator view
  let applications = null
  if (isCreator) {
    const { data } = await supabase
      .from('applications')
      .select('*, profiles(*)')
      .eq('idea_id', params.id)
      .order('created_at', { ascending: false })
    applications = data
  }

  // Check if user already applied
  const { data: userApplication } = await supabase
    .from('applications')
    .select('*')
    .eq('idea_id', params.id)
    .eq('applicant_id', user.id)
    .single()

  // Get current team (for NDA-signed users)
  let team = null
  if (nda || isCreator) {
    const { data: project } = await supabase
      .from('projects')
      .select('*, project_members(*, profiles(*))')
      .eq('idea_id', params.id)
      .single()
    team = project
  }

  return (
    <IdeaDetailClient
      idea={idea}
      currentUserId={user.id}
      isCreator={isCreator}
      ndaSigned={!!nda || isCreator}
      applications={applications}
      userApplication={userApplication}
      team={team}
    />
  )
}

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ProjectWorkspaceClient from './ProjectWorkspaceClient'

export default async function ProjectWorkspacePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*, ideas(*, profiles(*))')
    .eq('id', params.id)
    .single()

  if (!project) notFound()

  // Check membership
  const { data: membership } = await supabase
    .from('project_members')
    .select('*')
    .eq('project_id', params.id)
    .eq('user_id', user.id)
    .single()

  // Also allow idea creator
  const isCreator = project.ideas?.creator_id === user.id

  if (!membership && !isCreator) {
    redirect('/dashboard')
  }

  const { data: members } = await supabase
    .from('project_members')
    .select('*, profiles(*)')
    .eq('project_id', params.id)
    .order('joined_at')

  const { data: messages } = await supabase
    .from('messages')
    .select('*, profiles(*)')
    .eq('project_id', params.id)
    .is('recipient_id', null)
    .order('created_at')
    .limit(50)

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, profiles(*)')
    .eq('project_id', params.id)
    .order('created_at', { ascending: false })

  const { data: decisions } = await supabase
    .from('decisions')
    .select('*, profiles(*)')
    .eq('project_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <ProjectWorkspaceClient
      project={project}
      currentUserId={user.id}
      members={members || []}
      initialMessages={messages || []}
      tasks={tasks || []}
      decisions={decisions || []}
      isMember={!!membership || isCreator}
    />
  )
}

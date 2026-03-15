import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  const { data: inviteRequests } = await supabase
    .from('invite_requests')
    .select('*')
    .order('created_at', { ascending: false })

  // Stats
  const [
    { count: usersCount },
    { count: ideasCount },
    { count: projectsCount },
    { count: applicationsCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('ideas').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
  ])

  return (
    <AdminClient
      inviteRequests={inviteRequests || []}
      platformStats={{
        users: usersCount || 0,
        ideas: ideasCount || 0,
        projects: projectsCount || 0,
        applications: applicationsCount || 0,
      }}
      adminId={user.id}
    />
  )
}

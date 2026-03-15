import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: ideas } = await supabase
    .from('ideas')
    .select('id, teaser, category, status, created_at')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })

  const { data: memberships } = await supabase
    .from('project_members')
    .select('*, projects(name, status, ideas(teaser))')
    .eq('user_id', user.id)

  const { data: inviteCodes } = await supabase
    .from('invite_codes')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  return (
    <ProfileClient
      profile={profile}
      ideas={ideas || []}
      memberships={memberships || []}
      inviteCodes={inviteCodes || []}
      userId={user.id}
    />
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import InviteCode from '@/components/ui/InviteCode'
import { Profile, InviteCode as InviteCodeType } from '@/lib/types'

interface ProfileClientProps {
  profile: Profile | null
  ideas: any[]
  memberships: any[]
  inviteCodes: InviteCodeType[]
  userId: string
}

const expertiseOptions = [
  'Engineering', 'Design', 'Product', 'Marketing', 'Sales',
  'Finance', 'Legal', 'Operations', 'Data', 'AI/ML',
  'Hardware', 'Content', 'Research', 'Growth', 'Fundraising',
]

export default function ProfileClient({ profile, ideas, memberships, inviteCodes, userId }: ProfileClientProps) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [expertise, setExpertise] = useState<string[]>(profile?.expertise || [])

  const supabase = createClient()

  const handleSave = async () => {
    setSaving(true)
    await supabase
      .from('profiles')
      .update({ full_name: fullName, bio, expertise })
      .eq('id', userId)
    setSaving(false)
    setEditing(false)
  }

  const toggleExpertise = (item: string) => {
    setExpertise((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    )
  }

  const statusColor: Record<string, string> = {
    active: 'text-accent border-accent',
    in_progress: 'text-blue-400 border-blue-400',
    completed: 'text-green-400 border-green-400',
    archived: 'text-mid border-dark',
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Nav */}
      <div className="border-b border-dark px-8 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-mono text-[11px] uppercase tracking-widest text-mid hover:text-white transition-colors">
          ← Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-accent" />
          <span className="font-syne font-extrabold text-lg text-white">IDfy</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-start gap-4">
            <div className="w-[3px] bg-accent self-stretch" />
            <div>
              <div className="w-16 h-16 bg-grey border border-dark flex items-center justify-center mb-4">
                <span className="font-syne font-bold text-2xl text-mid">
                  {(profile?.full_name || 'AN').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              </div>
              {editing ? (
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="font-syne font-bold text-3xl text-white bg-transparent border-b border-accent outline-none mb-2 w-full"
                />
              ) : (
                <h1 className="font-syne font-bold text-3xl text-white mb-1">
                  {profile?.full_name || 'Anonymous'}
                </h1>
              )}
              <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] text-mid uppercase tracking-widest">
                  REPUTATION {profile?.reputation_score || 0}
                </span>
                <span className="font-mono text-[10px] text-mid">
                  {ideas.length} ideas filed
                </span>
                <span className="font-mono text-[10px] text-mid">
                  {memberships.length} projects
                </span>
              </div>
            </div>
          </div>

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="font-mono text-[11px] uppercase tracking-widest text-mid hover:text-white transition-colors border border-dark px-4 py-2 hover:border-white"
            >
              EDIT
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-accent text-black font-mono text-[11px] uppercase tracking-widest px-4 py-2 hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'SAVING...' : 'SAVE'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="border border-dark text-mid font-mono text-[11px] uppercase tracking-widest px-4 py-2 hover:border-white hover:text-white transition-colors"
              >
                CANCEL
              </button>
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-[3px] h-4 bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-mid">BIO</span>
          </div>
          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell people who you are and what you build..."
              className="w-full bg-grey border border-dark px-4 py-3 text-sm text-white placeholder-mid focus:border-accent outline-none resize-none leading-relaxed"
            />
          ) : (
            <p className="font-mono text-sm text-mid leading-relaxed">
              {profile?.bio || 'No bio yet.'}
            </p>
          )}
        </div>

        {/* Expertise */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-[3px] h-4 bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-mid">EXPERTISE</span>
          </div>
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {expertiseOptions.map((item) => (
                <button
                  key={item}
                  onClick={() => toggleExpertise(item)}
                  className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-colors ${
                    expertise.includes(item)
                      ? 'border-accent text-accent bg-dark'
                      : 'border-dark text-mid hover:border-white hover:text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(profile?.expertise || []).length === 0 ? (
                <span className="font-mono text-sm text-mid">No expertise listed.</span>
              ) : (
                profile?.expertise?.map((item) => (
                  <span key={item} className="font-mono text-[10px] uppercase tracking-widest text-accent border border-accent px-3 py-1.5">
                    {item}
                  </span>
                ))
              )}
            </div>
          )}
        </div>

        {/* Ideas filed */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-[3px] h-4 bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-mid">IDEAS FILED</span>
          </div>
          {ideas.length === 0 ? (
            <p className="font-mono text-sm text-mid">No ideas filed yet.</p>
          ) : (
            <div className="space-y-2">
              {ideas.map((idea: any) => (
                <Link key={idea.id} href={`/ideas/${idea.id}`}>
                  <div className="bg-grey border border-dark px-5 py-3 hover:border-accent transition-colors flex items-center justify-between">
                    <p className="font-mono text-sm text-white truncate flex-1">{idea.teaser}</p>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      {idea.category && (
                        <span className="font-mono text-[9px] uppercase tracking-widest text-mid border border-dark px-2 py-0.5">
                          {idea.category}
                        </span>
                      )}
                      <span className={`font-mono text-[9px] uppercase tracking-widest border px-2 py-0.5 ${statusColor[idea.status] || 'text-mid border-dark'}`}>
                        {idea.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Active projects */}
        {memberships.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-[3px] h-4 bg-accent" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-mid">ACTIVE PROJECTS</span>
            </div>
            <div className="space-y-2">
              {memberships.map((m: any) => (
                <Link key={m.id} href={`/projects/${m.project_id}`}>
                  <div className="bg-grey border border-dark px-5 py-3 hover:border-accent transition-colors flex items-center justify-between">
                    <p className="font-mono text-sm text-white truncate">{m.projects?.name || m.projects?.ideas?.teaser?.slice(0, 50)}</p>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-mid border border-dark px-2 py-0.5 flex-shrink-0 ml-4">
                      {m.role}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Invite codes */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-[3px] h-4 bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-mid">INVITE CODES</span>
          </div>
          <p className="font-mono text-[11px] text-mid mb-4">
            Share these to invite people to IDfy. You have {inviteCodes.filter((c) => !c.used_by).length} remaining.
          </p>
          {inviteCodes.length === 0 ? (
            <p className="font-mono text-sm text-mid">No invite codes generated yet.</p>
          ) : (
            <div className="space-y-2">
              {inviteCodes.map((code) => (
                <InviteCode
                  key={code.id}
                  code={code.code}
                  used={!!code.used_by}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

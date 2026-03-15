'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import EquityBadge from '@/components/ui/EquityBadge'

interface IdeaDetailClientProps {
  idea: any
  currentUserId: string
  isCreator: boolean
  ndaSigned: boolean
  applications: any[] | null
  userApplication: any | null
  team: any | null
}

export default function IdeaDetailClient({
  idea,
  currentUserId,
  isCreator,
  ndaSigned,
  applications,
  userApplication,
  team,
}: IdeaDetailClientProps) {
  const router = useRouter()
  const [signingNda, setSigningNda] = useState(false)
  const [signed, setSigned] = useState(ndaSigned)
  const [showNdaText, setShowNdaText] = useState(false)
  const [updatingApp, setUpdatingApp] = useState<string | null>(null)
  const [counterOffer, setCounterOffer] = useState<{ id: string; equity: number; note: string } | null>(null)

  const creatorName = idea.profiles?.full_name || 'Anonymous'
  const date = new Date(idea.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const handleSignNda = async () => {
    setSigningNda(true)
    const supabase = createClient()

    await supabase.from('nda_acceptances').insert({
      user_id: currentUserId,
      idea_id: idea.id,
    })

    setSigned(true)
    setSigningNda(false)
    router.refresh()
  }

  const handleApplicationAction = async (appId: string, action: 'approved' | 'rejected') => {
    setUpdatingApp(appId)
    const supabase = createClient()

    await supabase
      .from('applications')
      .update({ status: action, updated_at: new Date().toISOString() })
      .eq('id', appId)

    // If approving, create project if needed
    if (action === 'approved') {
      const app = applications?.find(a => a.id === appId)
      if (app) {
        // Check if project exists
        const { data: existingProject } = await supabase
          .from('projects')
          .select('*')
          .eq('idea_id', idea.id)
          .single()

        let projectId = existingProject?.id

        if (!existingProject) {
          // Create project
          const { data: newProject } = await supabase
            .from('projects')
            .insert({
              idea_id: idea.id,
              name: idea.teaser.slice(0, 60),
              status: 'active',
            })
            .select()
            .single()

          projectId = newProject?.id

          // Add creator as founder
          if (projectId) {
            const remainingEquity = 100 - 1 - (idea.equity_offered_percent || 0) // 1% IDfy
            await supabase.from('project_members').insert({
              project_id: projectId,
              user_id: idea.creator_id,
              role: 'founder',
              equity_percent: remainingEquity,
            })
          }
        }

        // Add contributor
        if (projectId) {
          await supabase.from('project_members').upsert({
            project_id: projectId,
            user_id: app.applicant_id,
            role: 'contributor',
            equity_percent: app.equity_requested_percent || 5,
          })
        }
      }
    }

    setUpdatingApp(null)
    router.refresh()
  }

  const handleCounterOffer = async (appId: string) => {
    if (!counterOffer) return
    setUpdatingApp(appId)
    const supabase = createClient()

    await supabase
      .from('applications')
      .update({
        status: 'counter',
        counter_offer_equity: counterOffer.equity,
        counter_offer_note: counterOffer.note,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appId)

    setCounterOffer(null)
    setUpdatingApp(null)
    router.refresh()
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'text-mid border-mid',
      approved: 'text-accent border-accent',
      rejected: 'text-red-400 border-red-400',
      counter: 'text-amber-400 border-amber-400',
    }
    return map[status] || 'text-mid border-dark'
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Back */}
        <Link
          href="/dashboard"
          className="font-mono text-[11px] uppercase tracking-widest text-mid hover:text-white transition-colors block mb-10"
        >
          ← Back to feed
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-[3px] bg-accent self-stretch flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {idea.category && (
                <span className="font-mono text-[10px] uppercase tracking-widest text-mid border border-dark px-2 py-0.5">
                  {idea.category}
                </span>
              )}
              {idea.equity_offered_percent !== null && (
                <EquityBadge percent={idea.equity_offered_percent} />
              )}
              {isCreator && (
                <span className="font-mono text-[10px] uppercase tracking-widest text-accent border border-accent px-2 py-0.5">
                  YOUR IDEA
                </span>
              )}
            </div>

            <h1 className="font-syne font-bold text-3xl md:text-4xl text-white leading-tight mb-4">
              {idea.teaser}
            </h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-grey border border-dark flex items-center justify-center">
                  <span className="font-mono text-[9px] text-mid">
                    {creatorName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-mid">{creatorName}</span>
              </div>
              <span className="font-mono text-[11px] text-mid">Filed {date}</span>
            </div>
          </div>
        </div>

        {/* NDA Gate */}
        {!signed && (
          <div className="border border-dark p-8 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-[3px] h-4 bg-accent" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-mid">PROTECTED CONTENT</span>
            </div>
            <h2 className="font-syne font-bold text-2xl text-white mb-3">
              This idea is protected.
            </h2>
            <p className="font-mono text-sm text-mid mb-6">
              Sign the NDA to access the full concept.
            </p>

            <button
              onClick={() => setShowNdaText(!showNdaText)}
              className="font-mono text-[11px] uppercase tracking-widest text-mid hover:text-white transition-colors mb-4 block"
            >
              {showNdaText ? '▲ HIDE NDA TEXT' : '▼ READ NDA TERMS'}
            </button>

            {showNdaText && (
              <div className="bg-grey border border-dark p-5 mb-6">
                <p className="font-mono text-[11px] text-mid leading-relaxed mb-3">
                  By proceeding you agree that:
                </p>
                <ol className="font-mono text-[11px] text-mid space-y-2 leading-relaxed list-decimal list-inside">
                  <li>This idea is the intellectual property of <span className="text-white">{creatorName}</span></li>
                  <li>You will not use, share or replicate this idea without their consent</li>
                  <li>Breach of this agreement constitutes grounds for legal action</li>
                </ol>
              </div>
            )}

            <button
              onClick={handleSignNda}
              disabled={signingNda}
              className="bg-accent text-black font-mono font-medium text-[12px] uppercase tracking-[0.15em] px-8 py-4 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {signingNda ? 'SIGNING...' : 'I agree — Show me the idea'}
            </button>
          </div>
        )}

        {/* Full idea content */}
        {signed && (
          <>
            <div className="space-y-6 mb-8">
              {idea.full_description && (
                <div className="bg-grey border border-dark p-6">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-mid block mb-3">FULL DESCRIPTION</span>
                  <p className="font-mono text-sm text-white leading-relaxed">{idea.full_description}</p>
                </div>
              )}

              {idea.why_it_doesnt_exist && (
                <div className="bg-grey border border-dark p-6">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-mid block mb-3">WHY IT DOESN&apos;T EXIST YET</span>
                  <p className="font-mono text-sm text-white leading-relaxed">{idea.why_it_doesnt_exist}</p>
                </div>
              )}

              {idea.target_audience && (
                <div className="bg-grey border border-dark p-6">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-mid block mb-3">TARGET AUDIENCE</span>
                  <p className="font-mono text-sm text-white leading-relaxed">{idea.target_audience}</p>
                </div>
              )}

              {idea.timestamp_hash && (
                <div className="border border-dark p-5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-mid block mb-2">TIMESTAMP PROOF</span>
                  <p className="font-mono text-[10px] text-mid break-all leading-relaxed">
                    SHA256: {idea.timestamp_hash}
                  </p>
                </div>
              )}
            </div>

            {/* Team section */}
            {team && team.project_members?.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-[3px] h-4 bg-accent" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-mid">CURRENT TEAM</span>
                </div>
                <div className="bg-grey border border-dark divide-y divide-dark">
                  {team.project_members.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-dark flex items-center justify-center">
                          <span className="font-mono text-[9px] text-mid">
                            {(member.profiles?.full_name || 'AN').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <span className="font-mono text-sm text-white">{member.profiles?.full_name || 'Anonymous'}</span>
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-mid">{member.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Apply CTA */}
            {!isCreator && !userApplication && (
              <div className="border border-dark p-6 mb-8">
                <h3 className="font-syne font-bold text-xl text-white mb-2">Want to contribute?</h3>
                <p className="font-mono text-[11px] text-mid mb-5">
                  Apply to join the team. Define your terms. Start building.
                </p>
                <Link
                  href={`/ideas/${idea.id}/apply`}
                  className="inline-block bg-accent text-black font-mono font-medium text-[12px] uppercase tracking-[0.15em] px-8 py-4 hover:opacity-90 transition-opacity"
                >
                  Apply to contribute
                </Link>
              </div>
            )}

            {/* User's existing application */}
            {userApplication && !isCreator && (
              <div className="border border-dark p-6 mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-[3px] h-4 bg-accent" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-mid">YOUR APPLICATION</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm text-white">Application submitted</p>
                  <span className={`font-mono text-[10px] uppercase tracking-widest border px-2 py-0.5 ${statusBadge(userApplication.status)}`}>
                    {userApplication.status}
                  </span>
                </div>
                {userApplication.counter_offer_equity && (
                  <div className="mt-4 bg-grey p-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400 mb-2">COUNTER OFFER</p>
                    <p className="font-mono text-sm text-white">{userApplication.counter_offer_equity}% equity</p>
                    {userApplication.counter_offer_note && (
                      <p className="font-mono text-[11px] text-mid mt-1">{userApplication.counter_offer_note}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Applications (creator only) */}
        {isCreator && applications && applications.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-[3px] h-4 bg-accent" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-mid">
                APPLICATIONS ({applications.length})
              </span>
            </div>

            <div className="space-y-4">
              {applications.map((app: any) => (
                <div key={app.id} className="bg-grey border border-dark p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-dark border border-dark flex items-center justify-center">
                        <span className="font-mono text-[10px] text-mid">
                          {(app.profiles?.full_name || 'AN').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-mono text-sm text-white">{app.profiles?.full_name || 'Anonymous'}</p>
                        <p className="font-mono text-[10px] text-mid">
                          {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`font-mono text-[10px] uppercase tracking-widest border px-2 py-0.5 ${statusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {app.expertise_relevant && (
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-mid mb-1">EXPERTISE</p>
                        <p className="font-mono text-xs text-white leading-relaxed">{app.expertise_relevant}</p>
                      </div>
                    )}
                    {app.equity_requested_percent !== null && (
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-mid mb-1">EQUITY REQUESTED</p>
                        <p className="font-mono text-xs text-accent">{app.equity_requested_percent}%</p>
                      </div>
                    )}
                    {app.hours_per_week && (
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-mid mb-1">HOURS/WEEK</p>
                        <p className="font-mono text-xs text-white">{app.hours_per_week}h</p>
                      </div>
                    )}
                    {app.time_horizon && (
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-mid mb-1">TIME HORIZON</p>
                        <p className="font-mono text-xs text-white">{app.time_horizon}</p>
                      </div>
                    )}
                  </div>

                  {app.first_contribution && (
                    <div className="mb-4">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-mid mb-1">FIRST CONTRIBUTION</p>
                      <p className="font-mono text-xs text-white leading-relaxed">{app.first_contribution}</p>
                    </div>
                  )}

                  {/* Counter offer input */}
                  {counterOffer?.id === app.id && (
                    <div className="bg-dark p-4 mb-4">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-mid mb-3">COUNTER OFFER</p>
                      <div className="flex gap-3 mb-3">
                        <input
                          type="number"
                          min="0"
                          max="49"
                          value={counterOffer!.equity}
                          onChange={(e) => setCounterOffer((prev) => prev ? { ...prev, equity: Number(e.target.value) } : null)}
                          className="w-24 bg-grey border border-dark px-3 py-2 text-sm text-white"
                          placeholder="Equity %"
                        />
                        <input
                          type="text"
                          value={counterOffer!.note}
                          onChange={(e) => setCounterOffer((prev) => prev ? { ...prev, note: e.target.value } : null)}
                          className="flex-1 bg-grey border border-dark px-3 py-2 text-sm text-white"
                          placeholder="Note to applicant..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCounterOffer(app.id)}
                          className="bg-accent text-black font-mono text-[10px] uppercase tracking-widest px-4 py-2"
                        >
                          SEND
                        </button>
                        <button
                          onClick={() => setCounterOffer(null)}
                          className="border border-dark text-mid font-mono text-[10px] uppercase tracking-widest px-4 py-2 hover:border-white hover:text-white transition-colors"
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  )}

                  {app.status === 'pending' && (
                    <div className="flex gap-2 pt-3 border-t border-dark">
                      <button
                        onClick={() => handleApplicationAction(app.id, 'approved')}
                        disabled={updatingApp === app.id}
                        className="bg-accent text-black font-mono text-[10px] uppercase tracking-widest px-4 py-2 hover:opacity-90 disabled:opacity-50"
                      >
                        APPROVE
                      </button>
                      <button
                        onClick={() => setCounterOffer({ id: app.id, equity: app.equity_requested_percent || 5, note: '' })}
                        className="border border-amber-400 text-amber-400 font-mono text-[10px] uppercase tracking-widest px-4 py-2 hover:bg-amber-400 hover:text-black transition-colors"
                      >
                        COUNTER
                      </button>
                      <button
                        onClick={() => handleApplicationAction(app.id, 'rejected')}
                        disabled={updatingApp === app.id}
                        className="border border-dark text-mid font-mono text-[10px] uppercase tracking-widest px-4 py-2 hover:border-red-400 hover:text-red-400 transition-colors"
                      >
                        DECLINE
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isCreator && (!applications || applications.length === 0) && (
          <div className="border border-dark p-6 text-center">
            <p className="font-mono text-sm text-mid">No applications yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

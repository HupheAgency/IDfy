'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { InviteRequest } from '@/lib/types'

interface AdminClientProps {
  inviteRequests: InviteRequest[]
  platformStats: {
    users: number
    ideas: number
    projects: number
    applications: number
  }
  adminId: string
}

export default function AdminClient({ inviteRequests, platformStats, adminId }: AdminClientProps) {
  const [requests, setRequests] = useState(inviteRequests)
  const [generating, setGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const supabase = createClient()

  const handleRequestAction = async (requestId: string, action: 'approved' | 'rejected') => {
    setUpdatingId(requestId)

    await supabase
      .from('invite_requests')
      .update({ status: action })
      .eq('id', requestId)

    // If approved, generate an invite code for them
    if (action === 'approved') {
      const code = 'IDFY-' + Math.random().toString(36).substring(2, 6).toUpperCase() +
        Math.random().toString(36).substring(2, 4).toUpperCase()
      await supabase.from('invite_codes').insert({
        code,
        created_by: adminId,
      })
    }

    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: action } : r))
    )
    setUpdatingId(null)
  }

  const generateCode = async () => {
    setGenerating(true)
    const code = 'IDFY-' + Math.random().toString(36).substring(2, 4).toUpperCase() +
      Math.random().toString(36).substring(2, 6).toUpperCase()

    await supabase.from('invite_codes').insert({
      code,
      created_by: adminId,
    })

    setGeneratedCode(code)
    setGenerating(false)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode)
  }

  const statusColor: Record<string, string> = {
    pending: 'text-mid border-mid',
    approved: 'text-accent border-accent',
    rejected: 'text-red-400 border-red-400',
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
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent border border-accent px-2 py-0.5 ml-2">
            ADMIN
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Stats */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-[3px] h-4 bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-mid">PLATFORM STATS</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-dark">
            {[
              { label: 'USERS', value: platformStats.users },
              { label: 'IDEAS', value: platformStats.ideas },
              { label: 'PROJECTS', value: platformStats.projects },
              { label: 'APPLICATIONS', value: platformStats.applications },
            ].map((stat, i) => (
              <div key={stat.label} className={`p-6 ${i < 3 ? 'border-r border-dark' : ''}`}>
                <span className="font-mono text-[9px] uppercase tracking-widest text-mid block mb-2">{stat.label}</span>
                <span className="font-syne font-bold text-3xl text-white">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Generate invite code */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-[3px] h-4 bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-mid">GENERATE INVITE CODE</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={generateCode}
              disabled={generating}
              className="bg-accent text-black font-mono text-[11px] uppercase tracking-widest px-6 py-3 hover:opacity-90 disabled:opacity-50"
            >
              {generating ? 'GENERATING...' : 'GENERATE CODE'}
            </button>
            {generatedCode && (
              <div className="flex items-center gap-3 bg-grey border border-dark px-4 py-3">
                <span className="font-mono text-sm text-white tracking-[0.15em]">{generatedCode}</span>
                <button
                  onClick={copyCode}
                  className="font-mono text-[10px] uppercase tracking-widest text-accent hover:opacity-70"
                >
                  COPY
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Invite requests */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-[3px] h-4 bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-mid">
              INVITE REQUESTS ({requests.filter((r) => r.status === 'pending').length} PENDING)
            </span>
          </div>

          {requests.length === 0 ? (
            <p className="font-mono text-sm text-mid">No invite requests yet.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="bg-grey border border-dark p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-white">{request.email}</span>
                        <span className={`font-mono text-[9px] uppercase tracking-widest border px-1.5 py-0.5 ${statusColor[request.status] || 'text-mid border-dark'}`}>
                          {request.status}
                        </span>
                      </div>
                      {request.message && (
                        <p className="font-mono text-[11px] text-mid leading-relaxed">{request.message}</p>
                      )}
                      {request.invite_code && (
                        <p className="font-mono text-[10px] text-accent mt-1">Had code: {request.invite_code}</p>
                      )}
                      <p className="font-mono text-[10px] text-mid mt-2">
                        {new Date(request.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleRequestAction(request.id, 'approved')}
                          disabled={updatingId === request.id}
                          className="bg-accent text-black font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 hover:opacity-90 disabled:opacity-50"
                        >
                          APPROVE
                        </button>
                        <button
                          onClick={() => handleRequestAction(request.id, 'rejected')}
                          disabled={updatingId === request.id}
                          className="border border-dark text-mid font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 hover:border-red-400 hover:text-red-400 transition-colors"
                        >
                          REJECT
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

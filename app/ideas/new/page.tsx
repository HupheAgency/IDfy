'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
const categories = ['Technology', 'Media', 'Health', 'Finance', 'Sustainability', 'Creative', 'Other']

async function sha256Hash(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export default function NewIdeaPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [teaser, setTeaser] = useState('')
  const [fullDescription, setFullDescription] = useState('')
  const [whyItDoesntExist, setWhyItDoesntExist] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [category, setCategory] = useState('')
  const [equityPercent, setEquityPercent] = useState(10)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const now = new Date().toISOString()
    const hashInput = fullDescription + now
    const timestampHash = await sha256Hash(hashInput)

    const { data: idea, error: insertError } = await supabase
      .from('ideas')
      .insert({
        creator_id: user.id,
        teaser,
        full_description: fullDescription,
        why_it_doesnt_exist: whyItDoesntExist,
        target_audience: targetAudience,
        category,
        equity_offered_percent: equityPercent,
        timestamp_hash: timestampHash,
        status: 'active',
      })
      .select()
      .single()

    if (insertError) {
      setError('Failed to file idea. Try again.')
      setLoading(false)
      return
    }

    router.push(`/ideas/${idea.id}`)
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-[3px] h-8 bg-accent" />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-mid">FILE AN IDEA</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 flex items-center justify-center font-mono text-[10px] border transition-colors ${
                  s === step
                    ? 'bg-accent text-black border-accent'
                    : s < step
                    ? 'bg-dark border-accent text-accent'
                    : 'border-dark text-mid'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              <span className={`font-mono text-[10px] uppercase tracking-widest ${s === step ? 'text-white' : 'text-mid'}`}>
                {s === 1 ? 'THE TEASER' : s === 2 ? 'THE FULL IDEA' : 'CONFIRM & FILE'}
              </span>
              {s < 3 && <div className={`flex-1 h-px w-8 ${s < step ? 'bg-accent' : 'bg-dark'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h1 className="font-syne font-bold text-3xl text-white mb-2">
              What do you want the world to know?
            </h1>
            <p className="font-mono text-[11px] text-mid mb-8">
              One sentence. Vague enough to protect. Sharp enough to trigger.
            </p>

            <div className="mb-6">
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-mid block mb-3">
                YOUR TEASER
              </label>
              <textarea
                value={teaser}
                onChange={(e) => setTeaser(e.target.value.slice(0, 140))}
                placeholder="A platform that turns your voice memos into fundable startup pitches automatically."
                rows={4}
                className="w-full bg-grey border border-dark px-4 py-3 text-sm text-white placeholder-mid focus:border-accent outline-none resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="font-mono text-[10px] text-mid">
                  Vague enough to intrigue. Not enough to steal.
                </span>
                <span className={`font-mono text-[10px] ${teaser.length > 120 ? 'text-accent' : 'text-mid'}`}>
                  {teaser.length}/140
                </span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={teaser.trim().length < 10}
              className="w-full bg-accent text-black font-mono font-medium text-[12px] uppercase tracking-[0.15em] py-4 hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              CONTINUE →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h1 className="font-syne font-bold text-3xl text-white mb-2">
              Now tell the whole story.
            </h1>
            <p className="font-mono text-[11px] text-mid mb-8">
              This is NDA-gated. Only people who sign will read it.
            </p>

            <div className="space-y-6">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-mid block mb-2">
                  FULL DESCRIPTION — What is it, how does it work?
                </label>
                <textarea
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  placeholder="Describe your idea in full detail..."
                  rows={6}
                  className="w-full bg-grey border border-dark px-4 py-3 text-sm text-white placeholder-mid focus:border-accent outline-none resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-mid block mb-2">
                  WHY DOESN&apos;T IT EXIST YET?
                </label>
                <textarea
                  value={whyItDoesntExist}
                  onChange={(e) => setWhyItDoesntExist(e.target.value)}
                  placeholder="What gap does this fill? Why now?"
                  rows={3}
                  className="w-full bg-grey border border-dark px-4 py-3 text-sm text-white placeholder-mid focus:border-accent outline-none resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-mid block mb-2">
                  WHO IS THE TARGET AUDIENCE?
                </label>
                <textarea
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Who has this problem? How big is the market?"
                  rows={3}
                  className="w-full bg-grey border border-dark px-4 py-3 text-sm text-white placeholder-mid focus:border-accent outline-none resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-mid block mb-2">
                  CATEGORY
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-grey border border-dark px-4 py-3 text-sm text-white focus:border-accent outline-none"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-mid block mb-2">
                  EQUITY AVAILABLE FOR CONTRIBUTORS — {equityPercent}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="49"
                  value={equityPercent}
                  onChange={(e) => setEquityPercent(Number(e.target.value))}
                  className="w-full accent-accent"
                  style={{ accentColor: '#C8F03A' }}
                />
                <div className="flex justify-between mt-1">
                  <span className="font-mono text-[10px] text-mid">0%</span>
                  <span className="font-mono text-[10px] text-accent font-medium">{equityPercent}%</span>
                  <span className="font-mono text-[10px] text-mid">49%</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-dark text-mid font-mono text-[11px] uppercase tracking-widest py-4 hover:border-white hover:text-white transition-colors"
              >
                ← BACK
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!fullDescription.trim() || !category}
                className="flex-1 bg-accent text-black font-mono font-medium text-[12px] uppercase tracking-[0.15em] py-4 hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                CONTINUE →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <h1 className="font-syne font-bold text-3xl text-white mb-2">
              Ready to file.
            </h1>
            <p className="font-mono text-[11px] text-mid mb-8">
              Review what will be public, then file.
            </p>

            <div className="bg-grey border border-dark p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-[3px] h-4 bg-accent" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-mid">PUBLIC TEASER</span>
              </div>
              <p className="font-mono text-sm text-white leading-relaxed">{teaser}</p>
            </div>

            <div className="bg-grey border border-dark p-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-mid block mb-1">CATEGORY</span>
                  <span className="font-mono text-sm text-white">{category}</span>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-mid block mb-1">EQUITY OFFERED</span>
                  <span className="font-mono text-sm text-accent font-medium">{equityPercent}%</span>
                </div>
              </div>
            </div>

            <div className="border border-dark p-5 mb-8">
              <p className="font-mono text-[11px] text-mid leading-relaxed">
                By filing this idea you agree to IDfy&apos;s terms. Your idea will be automatically timestamped
                and a cryptographic record will be created. The full description is stored and protected by NDA.
              </p>
            </div>

            {error && <p className="font-mono text-[11px] text-red-400 mb-4">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-dark text-mid font-mono text-[11px] uppercase tracking-widest py-4 hover:border-white hover:text-white transition-colors"
              >
                ← BACK
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-accent text-black font-mono font-medium text-[12px] uppercase tracking-[0.15em] py-4 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'FILING...' : 'FILE THIS IDEA'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

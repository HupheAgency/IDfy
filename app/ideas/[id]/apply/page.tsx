'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ApplyPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const [expertise, setExpertise] = useState('')
  const [hoursPerWeek, setHoursPerWeek] = useState('')
  const [expectedReturn, setExpectedReturn] = useState('')
  const [equityPercent, setEquityPercent] = useState('')
  const [equityReasoning, setEquityReasoning] = useState('')
  const [firstContribution, setFirstContribution] = useState('')
  const [timeHorizon, setTimeHorizon] = useState('')

  const questions = [
    {
      label: 'RELEVANT EXPERTISE',
      question: 'What is your relevant expertise for this idea?',
      content: (
        <textarea
          value={expertise}
          onChange={(e) => setExpertise(e.target.value)}
          placeholder="Describe your relevant skills, experience, and background..."
          rows={5}
          className="w-full bg-grey border border-dark px-4 py-3 text-sm text-white placeholder-mid focus:border-accent outline-none resize-none leading-relaxed"
        />
      ),
      valid: expertise.trim().length > 10,
    },
    {
      label: 'TIME COMMITMENT',
      question: 'How many hours per week can you realistically commit?',
      content: (
        <div>
          <input
            type="number"
            min="1"
            max="80"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(e.target.value)}
            placeholder="e.g. 20"
            className="w-full bg-grey border border-dark px-4 py-3 text-sm text-white placeholder-mid focus:border-accent outline-none"
          />
          <p className="font-mono text-[10px] text-mid mt-2">Hours per week</p>
        </div>
      ),
      valid: Number(hoursPerWeek) > 0,
    },
    {
      label: 'EXPECTED RETURN',
      question: 'What do you expect in return?',
      content: (
        <div className="grid grid-cols-2 gap-3">
          {['Equity', 'Payment', 'Both', 'Open to discuss'].map((opt) => (
            <button
              key={opt}
              onClick={() => setExpectedReturn(opt)}
              className={`py-3 px-4 font-mono text-[11px] uppercase tracking-widest border transition-colors ${
                expectedReturn === opt
                  ? 'border-accent text-accent bg-dark'
                  : 'border-dark text-mid hover:border-white hover:text-white'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      ),
      valid: expectedReturn !== '',
    },
    {
      label: 'EQUITY TERMS',
      question: 'What equity percentage do you consider fair, and why?',
      content: (
        <div className="space-y-4">
          <input
            type="number"
            min="0"
            max="49"
            value={equityPercent}
            onChange={(e) => setEquityPercent(e.target.value)}
            placeholder="e.g. 15"
            className="w-full bg-grey border border-dark px-4 py-3 text-sm text-white placeholder-mid focus:border-accent outline-none"
          />
          <textarea
            value={equityReasoning}
            onChange={(e) => setEquityReasoning(e.target.value)}
            placeholder="Explain your reasoning..."
            rows={4}
            className="w-full bg-grey border border-dark px-4 py-3 text-sm text-white placeholder-mid focus:border-accent outline-none resize-none leading-relaxed"
          />
        </div>
      ),
      valid: equityPercent !== '' && equityReasoning.trim().length > 5,
    },
    {
      label: 'FIRST CONTRIBUTION',
      question: 'What would be your first concrete contribution if accepted?',
      content: (
        <textarea
          value={firstContribution}
          onChange={(e) => setFirstContribution(e.target.value)}
          placeholder="Be specific. What would you ship in the first 30 days?"
          rows={5}
          className="w-full bg-grey border border-dark px-4 py-3 text-sm text-white placeholder-mid focus:border-accent outline-none resize-none leading-relaxed"
        />
      ),
      valid: firstContribution.trim().length > 10,
    },
    {
      label: 'TIME HORIZON',
      question: 'What is your time horizon?',
      content: (
        <div className="space-y-3">
          {[
            { val: 'Short term <6mo', label: 'Short term', sub: 'Less than 6 months' },
            { val: 'Medium 6-18mo', label: 'Medium term', sub: '6 to 18 months' },
            { val: 'Long term 18mo+', label: 'Long term', sub: '18 months or more' },
          ].map((opt) => (
            <button
              key={opt.val}
              onClick={() => setTimeHorizon(opt.val)}
              className={`w-full flex items-center justify-between py-3 px-4 font-mono border transition-colors ${
                timeHorizon === opt.val
                  ? 'border-accent bg-dark'
                  : 'border-dark hover:border-white'
              }`}
            >
              <span className={`text-[11px] uppercase tracking-widest ${timeHorizon === opt.val ? 'text-accent' : 'text-mid'}`}>
                {opt.label}
              </span>
              <span className="text-[10px] text-mid">{opt.sub}</span>
            </button>
          ))}
        </div>
      ),
      valid: timeHorizon !== '',
    },
  ]

  const currentQ = questions[step]

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error: insertError } = await supabase.from('applications').insert({
      idea_id: params.id,
      applicant_id: user.id,
      expertise_relevant: expertise,
      hours_per_week: Number(hoursPerWeek),
      expected_return: expectedReturn,
      equity_requested_percent: Number(equityPercent),
      equity_reasoning: equityReasoning,
      first_contribution: firstContribution,
      time_horizon: timeHorizon,
      status: 'pending',
    })

    if (insertError) {
      if (insertError.code === '23505') {
        setError('You have already applied to this idea.')
      } else {
        setError('Failed to submit application. Try again.')
      }
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="max-w-lg w-full">
          <div className="border border-dark p-8">
            <div className="w-[3px] h-6 bg-accent mb-6" />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent block mb-4">APPLICATION SENT</span>
            <h1 className="font-syne font-bold text-3xl text-white mb-4">
              Your application has been sent.
            </h1>
            <p className="font-mono text-sm text-mid leading-relaxed mb-8">
              The creator will review your profile and respond within 7 days.
            </p>
            <Link
              href={`/ideas/${params.id}`}
              className="font-mono text-[11px] uppercase tracking-widest text-mid hover:text-white transition-colors"
            >
              ← Back to idea
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/ideas/${params.id}`}
            className="font-mono text-[11px] uppercase tracking-widest text-mid hover:text-white transition-colors"
          >
            ← BACK
          </Link>
          <span className="font-mono text-[10px] text-mid">
            {step + 1} / {questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-[2px] bg-dark mb-12">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-[3px] h-4 bg-accent" />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-mid">
            {currentQ.label}
          </span>
        </div>

        <h2 className="font-syne font-bold text-2xl md:text-3xl text-white mb-8">
          {currentQ.question}
        </h2>

        <div className="mb-8">
          {currentQ.content}
        </div>

        {error && <p className="font-mono text-[11px] text-red-400 mb-4">{error}</p>}

        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="border border-dark text-mid font-mono text-[11px] uppercase tracking-widest py-4 px-6 hover:border-white hover:text-white transition-colors"
            >
              ← BACK
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!currentQ.valid || loading}
            className="flex-1 bg-accent text-black font-mono font-medium text-[12px] uppercase tracking-[0.15em] py-4 hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {loading
              ? 'SUBMITTING...'
              : step === questions.length - 1
              ? 'SUBMIT APPLICATION'
              : 'CONTINUE →'}
          </button>
        </div>
      </div>
    </div>
  )
}

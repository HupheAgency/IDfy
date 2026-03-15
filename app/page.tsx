'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const tickerText = "DON'T LET YOUR IDEAS SIT IDLY ◆ BY INVITATION ONLY ◆ TIMESTAMP YOUR IDEA TODAY ◆ PROTECT WHAT'S YOURS ◆ FIND YOUR TEAM ◆ "

export default function LandingPage() {
  const [heroVisible, setHeroVisible] = useState(false)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = '1'
            ;(entry.target as HTMLElement).style.transform = 'translateY(0)'
          }
        })
      },
      { threshold: 0.1 }
    )

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  const sectionStyle = {
    opacity: 0,
    transform: 'translateY(24px)',
    transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero */}
      <section className="relative flex min-h-screen">
        <div className="w-[3px] bg-accent flex-shrink-0" />

        <div className="flex-1 flex flex-col justify-center px-12 md:px-20 py-20">
          {/* Nav */}
          <div className="absolute top-0 left-3 right-0 flex items-center justify-between px-12 md:px-20 py-8">
            <div className="flex items-center gap-2">
              <span className="font-syne font-extrabold text-lg text-white tracking-tight">IDfy</span>
            </div>
            <Link
              href="/login"
              className="font-mono text-[11px] uppercase tracking-[0.15em] text-mid hover:text-white transition-colors"
            >
              Sign in
            </Link>
          </div>

          <div className="max-w-4xl">
            <div
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
                transitionDelay: '0s',
              }}
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-mid block mb-8">
                CO-CREATION PLATFORM
              </span>
            </div>

            <h1 className="font-syne font-extrabold leading-[0.95] mb-8">
              {['Your idea.', 'Timestamped.', 'Protected.', 'Executed.'].map((line, i) => (
                <div
                  key={line}
                  className={`block text-[clamp(3rem,8vw,7rem)] ${i === 2 ? 'text-accent' : 'text-white'}`}
                  style={{
                    opacity: heroVisible ? 1 : 0,
                    transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
                    transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
                    transitionDelay: `${0.15 + i * 0.15}s`,
                  }}
                >
                  {line}
                </div>
              ))}
            </h1>

            <p
              className="font-mono text-mid text-sm md:text-base leading-relaxed max-w-lg mb-12"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
                transitionDelay: '0.75s',
              }}
            >
              The co-creation platform where ideas find the people who make them real.
            </p>

            <div
              className="flex items-center gap-6"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
                transitionDelay: '0.9s',
              }}
            >
              <Link
                href="/request-invite"
                className="inline-block bg-accent text-black font-mono font-medium text-[12px] uppercase tracking-[0.15em] px-8 py-4 hover:opacity-90 transition-opacity"
              >
                Request an invite
              </Link>
              <span className="font-mono text-[10px] text-mid uppercase tracking-widest">
                By invitation only
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="bg-accent text-black overflow-hidden py-3">
        <div className="ticker-track">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="font-mono text-[11px] uppercase tracking-[0.2em] font-medium">
              {tickerText}
            </span>
          ))}
        </div>
      </div>

      {/* For Creators */}
      <section className="py-24 px-12 md:px-20 border-t border-dark">
        <div
          ref={(el) => { sectionRefs.current[0] = el }}
          style={sectionStyle}
          className="max-w-5xl mx-auto"
        >
          <div className="flex gap-8 md:gap-16 items-start">
            <div className="w-[3px] bg-accent flex-shrink-0 self-stretch" />
            <div className="flex-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-mid block mb-4">
                FOR CREATORS
              </span>
              <h2 className="font-syne font-bold text-[clamp(2rem,4vw,3.5rem)] leading-tight mb-6 text-white">
                You have ideas.<br />Protect them.<br />Find your team.
              </h2>
              <p className="font-mono text-sm text-mid leading-relaxed max-w-lg">
                File your idea in minutes. Get an automatic timestamp and cryptographic record.
                Share only what you choose, protected by NDAs. Find contributors who are as serious as you are.
              </p>
            </div>
            <div className="hidden md:block flex-1">
              <div className="bg-grey border border-dark p-6">
                {[
                  { n: '01', t: 'FILE YOUR IDEA', d: 'Teaser only visible. Full concept stays protected.' },
                  { n: '02', t: 'TIMESTAMP CREATED', d: 'SHA256 hash logged. Proof of filing instant.' },
                  { n: '03', t: 'CONTRIBUTORS APPLY', d: 'NDA-gated. Equity defined upfront.' },
                  { n: '04', t: 'TEAM FORMED', d: 'Deal agreed. Project workspace activated.' },
                ].map((s) => (
                  <div key={s.n} className="flex items-start gap-3 mb-4 last:mb-0">
                    <span className="font-mono text-[10px] text-accent mt-0.5">{s.n}</span>
                    <div>
                      <p className="font-mono text-xs text-white mb-1">{s.t}</p>
                      <p className="font-mono text-[11px] text-mid">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Builders */}
      <section className="py-24 px-12 md:px-20 border-t border-dark">
        <div
          ref={(el) => { sectionRefs.current[1] = el }}
          style={sectionStyle}
          className="max-w-5xl mx-auto"
        >
          <div className="flex gap-8 md:gap-16 items-start">
            <div className="w-[3px] bg-accent flex-shrink-0 self-stretch" />
            <div className="flex-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-mid block mb-4">
                FOR BUILDERS
              </span>
              <h2 className="font-syne font-bold text-[clamp(2rem,4vw,3.5rem)] leading-tight mb-6 text-white">
                You can execute.<br />Find the right idea.
              </h2>
              <p className="font-mono text-sm text-mid leading-relaxed max-w-lg">
                Browse real ideas from people who have thought hard about what they want to build.
                Apply with your terms. Get equity from day one. Build something that matters.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {['Technology', 'Health', 'Finance', 'Sustainability', 'Media', 'Creative'].map((cat) => (
                  <span key={cat} className="font-mono text-[10px] uppercase tracking-widest text-mid border border-dark px-3 py-1.5">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-12 md:px-20 border-t border-dark">
        <div
          ref={(el) => { sectionRefs.current[2] = el }}
          style={sectionStyle}
          className="max-w-5xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-16">
            <div className="w-[3px] h-6 bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-mid">HOW IT WORKS</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-dark">
            {[
              { num: '01', label: 'FILE', desc: 'Submit your idea with a teaser. Full details stay hidden.' },
              { num: '02', label: 'TEASE', desc: 'Your teaser surfaces in the feed. Contributors discover it.' },
              { num: '03', label: 'GATE', desc: 'Interested parties sign an NDA. Then they read everything.' },
              { num: '04', label: 'DEAL', desc: 'Agree on equity. Project workspace opens. Build.' },
            ].map((step, i) => (
              <div key={step.num} className={`p-8 ${i < 3 ? 'border-r border-dark' : ''}`}>
                <span className="font-mono text-[10px] text-accent tracking-widest block mb-4">{step.num}</span>
                <h3 className="font-syne font-bold text-2xl text-white mb-3">{step.label}</h3>
                <p className="font-mono text-[11px] text-mid leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-12 md:px-20 border-t border-dark">
        <div
          ref={(el) => { sectionRefs.current[3] = el }}
          style={sectionStyle}
          className="max-w-5xl mx-auto text-center"
        >
          <h2 className="font-syne font-extrabold text-[clamp(2.5rem,6vw,5rem)] leading-tight mb-6 text-white">
            Your idea is worth<br />
            <span className="text-accent">protecting.</span>
          </h2>
          <p className="font-mono text-sm text-mid mb-10">
            Don&apos;t let it sit in a notes app. File it today.
          </p>
          <Link
            href="/request-invite"
            className="inline-block bg-accent text-black font-mono font-medium text-[12px] uppercase tracking-[0.15em] px-10 py-4 hover:opacity-90 transition-opacity"
          >
            Request an invite
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark px-12 md:px-20 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-accent" />
            <span className="font-mono text-[11px] text-mid">idfy.io</span>
          </div>
          <span className="font-mono text-[10px] text-mid uppercase tracking-widest">By invitation only.</span>
          <span className="font-mono text-[10px] text-mid">© 2026</span>
        </div>
      </footer>
    </div>
  )
}

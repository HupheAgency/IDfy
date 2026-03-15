'use client'

import { useState } from 'react'

interface InviteCodeProps {
  code: string
  used?: boolean
  className?: string
}

export default function InviteCode({ code, used = false, className = '' }: InviteCodeProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (used) return
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`flex items-center justify-between bg-grey border border-dark px-4 py-3 ${className}`}
    >
      <span className={`font-mono text-sm tracking-[0.15em] ${used ? 'line-through text-mid' : 'text-white'}`}>
        {code}
      </span>
      <div className="flex items-center gap-3">
        {used && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-mid">USED</span>
        )}
        {!used && (
          <button
            onClick={handleCopy}
            className="font-mono text-[10px] uppercase tracking-widest text-accent hover:opacity-70 transition-opacity"
          >
            {copied ? 'COPIED' : 'COPY'}
          </button>
        )}
      </div>
    </div>
  )
}

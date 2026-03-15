'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'

interface DashboardSidebarProps {
  profile: Profile | null
}

const navItems = [
  { href: '/dashboard', label: 'FEED', icon: '◈' },
  { href: '/dashboard/my-ideas', label: 'MY IDEAS', icon: '◎' },
  { href: '/dashboard/my-projects', label: 'MY PROJECTS', icon: '◉' },
  { href: '/profile', label: 'PROFILE', icon: '◐' },
]

export default function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const name = profile?.full_name || 'Anonymous'
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <aside className="w-60 flex-shrink-0 bg-grey border-r border-dark flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-dark">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-1 h-6 bg-accent" />
          <span className="font-syne font-extrabold text-xl text-white tracking-tight">IDfy</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 transition-colors duration-150 ${
                  isActive
                    ? 'bg-dark text-accent'
                    : 'text-mid hover:text-white hover:bg-dark'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.15em]">{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-dark">
          <Link
            href="/ideas/new"
            className="flex items-center justify-center gap-2 w-full bg-accent text-black py-2.5 px-3 hover:opacity-90 transition-opacity"
          >
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em]">+ FILE IDEA</span>
          </Link>
        </div>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-dark">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-dark border border-dark flex items-center justify-center flex-shrink-0">
            <span className="font-mono text-[11px] text-mid">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs text-white truncate">{name}</p>
            {profile?.is_admin && (
              <p className="font-mono text-[10px] text-accent">ADMIN</p>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full font-mono text-[10px] uppercase tracking-widest text-mid hover:text-white transition-colors text-left px-3 py-1.5 hover:bg-dark"
        >
          SIGN OUT
        </button>
        {profile?.is_admin && (
          <Link
            href="/admin"
            className="mt-1 block w-full font-mono text-[10px] uppercase tracking-widest text-mid hover:text-accent transition-colors text-left px-3 py-1.5 hover:bg-dark"
          >
            ADMIN →
          </Link>
        )}
      </div>
    </aside>
  )
}

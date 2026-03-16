'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'

interface DashboardSidebarProps {
  profile: Profile | null
}

const navItems = [
  { href: '/dashboard', label: 'Feed', icon: '◈' },
  { href: '/dashboard/my-ideas', label: 'My Ideas', icon: '◎' },
  { href: '/dashboard/my-projects', label: 'My Projects', icon: '◉' },
  { href: '/profile', label: 'Profile', icon: '◐' },
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
    <aside
      style={{
        width: 240, flexShrink: 0,
        background: '#FFFFFF', borderRight: '1px solid #E5E3DC',
        display: 'flex', flexDirection: 'column',
        height: '100vh', position: 'sticky', top: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '1.4rem 1.25rem', borderBottom: '1px solid #E5E3DC' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.15rem', color: '#111' }}>
            <span style={{ color: '#3B6B4A' }}>ID</span>fy
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 10,
                  textDecoration: 'none',
                  background: isActive ? '#EEF5F0' : 'transparent',
                  color: isActive ? '#3B6B4A' : '#999999',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>{item.icon}</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', fontWeight: isActive ? 500 : 400 }}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>

        <div style={{ marginTop: '1.2rem', paddingTop: '1.2rem', borderTop: '1px solid #E5E3DC' }}>
          <Link
            href="/ideas/new"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              background: '#111', color: '#F7F6F3',
              borderRadius: 100, padding: '0.65rem 1rem',
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', fontWeight: 500,
              textDecoration: 'none', transition: 'background 0.2s',
            }}
          >
            + File an idea
          </Link>
        </div>
      </nav>

      {/* User section */}
      <div style={{ padding: '0.9rem 1rem', borderTop: '1px solid #E5E3DC' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#EEF5F0', border: '1px solid #E5E3DC',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', fontWeight: 500, color: '#3B6B4A' }}>
              {initials}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', fontWeight: 400, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name}
            </p>
            {profile?.is_admin && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: '#3B6B4A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Admin
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem',
            color: '#CCCCCC', background: 'transparent', border: 'none',
            textAlign: 'left', padding: '0.35rem 0.75rem', borderRadius: 8, cursor: 'pointer',
            transition: 'color 0.15s',
          }}
        >
          Sign out
        </button>
        {profile?.is_admin && (
          <Link
            href="/admin"
            style={{
              display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem',
              color: '#CCCCCC', padding: '0.35rem 0.75rem', borderRadius: 8,
              textDecoration: 'none',
            }}
          >
            Admin →
          </Link>
        )}
      </div>
    </aside>
  )
}

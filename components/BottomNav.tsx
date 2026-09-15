'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactElement } from 'react'

const ONGLETS = [
  { href: '/accueil', icon: 'home', label: 'Accueil' },
  { href: '/agenda', icon: 'calendar', label: 'Agenda' },
  { href: '/repartition', icon: 'coin', label: 'Chapeau' },
  { href: '/mes-revenus', icon: 'user', label: 'Profil' }
]

function Icone({ nom, actif }: { nom: string; actif: boolean }) {
  const couleur = actif ? '#FFFFFF' : '#F4E9DF'
  const opacite = actif ? 1 : 0.55

  const icones: Record<string, ReactElement> = {
    home: (
      <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" stroke={couleur} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" stroke={couleur} strokeWidth="2" fill="none" />
        <path d="M3 10h18M8 3v4M16 3v4" stroke={couleur} strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    coin: (
      <>
        <circle cx="12" cy="12" r="9" stroke={couleur} strokeWidth="2" fill="none" />
        <path d="M12 7v10M9.5 9.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5c0 3-5 1.5-5 4.5 0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5" stroke={couleur} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" stroke={couleur} strokeWidth="2" fill="none" />
        <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" stroke={couleur} strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    )
  }

  return (
    <svg width="19" height="19" viewBox="0 0 24 24" style={{ opacity: opacite }}>
      {icones[nom]}
    </svg>
  )
}

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 14,
        left: 20,
        right: 20,
        maxWidth: 380,
        margin: '0 auto',
        background: '#1B3A63',
        borderRadius: 32,
        padding: '12px 10px',
        display: 'flex',
        justifyContent: 'space-around',
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
        zIndex: 50
      }}
    >
      {ONGLETS.map((onglet) => {
        const actif = pathname === onglet.href
        return (
          <Link key={onglet.href} href={onglet.href} style={{ textDecoration: 'none' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: actif ? '#E08A34' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icone nom={onglet.icon} actif={actif} />
            </div>
          </Link>
        )
      })}
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Coins, Calendar, Wallet, ArrowRight } from 'lucide-react'

const MARINE = '#1B3A63'
const ORANGE = '#E08A34'
const CREME = '#F4E9DF'
const CREME_HEADER = '#EDE4D9'
const TEXTE_CLAIR = '#8A7C70'

function useLargeurFenetre() {
  const [largeur, setLargeur] = useState(0)
  useEffect(() => {
    function maj() { setLargeur(window.innerWidth) }
    maj()
    window.addEventListener('resize', maj)
    return () => window.removeEventListener('resize', maj)
  }, [])
  return largeur
}

function LogoMark({ taille = 42 }: { taille?: number }) {
  return (
    <svg width={taille} height={taille * (376.67 / 366.66)} viewBox="0 0 366.66 376.67" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>{`.cls-1{stroke:${CREME_HEADER};stroke-width:4px;}.cls-1,.cls-2{stroke-miterlimit:10;}.cls-1,.cls-2,.cls-3{fill:${CREME_HEADER};}.cls-2{stroke:${MARINE};stroke-width:11px;}.cls-4{fill:${MARINE};}`}</style>
      </defs>
      <path className="cls-4" d="M354.99,232.54c-72.2,32.07-56.15,27.82-71.47-33.03C230.95-9.2,252.69-5.53,166.59,2.86,83.31,10.97-15.42,32.56,6.55,112.22c44.71,162.09,36.59,166.37,36.59,166.37,0,0-8.55-.63-29.61,16.14-40.57,32.31,8.41,113.27,169.56,68.06,186.54-52.33,201.04-143.21,171.9-130.26ZM271.04,260.6c-18.41,12.83-51.68,1.08-107.01-.03-63.34-1.27-125.8,24.28-111.03,16.12,53.77-29.67,240.48-31.74,218.04-16.09ZM264.77,293.15c-37.99,27.2-161.14-5.08-209.93,19.38-20.16,10.1-27.53,16.36,11.63,25.21,9.48,2.14-30.45,4.91-33.7-7.39-3.48-13.17,27.27-35.08,74.53-32.86,26.65,1.25,122.25,19.8,170.49-2.27,3.31-1.51-10.26-4.05-13.02-2.07Z" />
      <ellipse className="cls-2" cx="286.78" cy="251.61" rx="57.38" ry="101.3" transform="translate(-42.5 58.93) rotate(-10.93)" />
      <ellipse className="cls-2" cx="169.81" cy="270.99" rx="57.39" ry="101.27" transform="translate(-45.69 34.7) rotate(-10.29)" />
      <ellipse className="cls-4" cx="172.6" cy="253.73" rx="30" ry="48" />
      <ellipse className="cls-4" cx="288.6" cy="232.26" rx="30" ry="48" />
    </svg>
  )
}

const FONCTIONNALITES = [
  {
    icone: Coins,
    titre: 'Répartition équitable',
    description: 'Compte les billets récoltés au chapeau et partage-les entre artistes, au centime près, sans prise de tête.'
  },
  {
    icone: Calendar,
    titre: 'Agenda des scènes ouvertes',
    description: 'Retrouve les meilleures scènes ouvertes près de chez toi, ou publie la tienne pour te faire connaître.'
  },
  {
    icone: Wallet,
    titre: 'Suivi de tes revenus',
    description: 'Garde une trace de chaque cachet, scène après scène, et visualise ton activité en un coup d\'oeil.'
  }
]

export default function LandingPage() {
  const largeur = useLargeurFenetre()
  const estTablette = largeur >= 700
  const estDesktop = largeur >= 1024
  const colonnesFeatures = estDesktop ? 3 : estTablette ? 2 : 1

  return (
    <div style={{ background: CREME }}>
      {estDesktop && (
        <header style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogoMark taille={30} />
            <span style={{ fontSize: 17, fontWeight: 800, color: MARINE }}>O'Chapeau</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/connexion" style={{ fontSize: 14, fontWeight: 600, color: MARINE, textDecoration: 'none' }}>Se connecter</Link>
            <Link
              href="/connexion"
              style={{ height: 44, padding: '0 22px', borderRadius: 22, background: ORANGE, color: '#FFFFFF', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              Créer un compte
            </Link>
          </div>
        </header>
      )}

      <section style={{ maxWidth: 1120, margin: '0 auto', padding: estDesktop ? '40px 40px 56px' : '48px 20px 40px', display: 'flex', flexDirection: estDesktop ? 'row' : 'column', alignItems: 'center', gap: estDesktop ? 60 : 0 }}>
        <div style={{ flex: 1, textAlign: estDesktop ? 'left' : 'center' }}>
          {!estDesktop && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <LogoMark taille={56} />
            </div>
          )}
          <h1 style={{ fontSize: estDesktop ? 42 : 30, fontWeight: 800, color: MARINE, lineHeight: 1.15, marginBottom: 16 }}>
            Le chapeau, compté et partagé sans prise de tête
          </h1>
          <p style={{ fontSize: 16, color: TEXTE_CLAIR, lineHeight: 1.6, marginBottom: 32, maxWidth: 440, marginLeft: estDesktop ? 0 : 'auto', marginRight: estDesktop ? 0 : 'auto' }}>
            O'Chapeau aide les artistes de rue et de scènes ouvertes à répartir leurs gains équitablement, suivre leurs revenus et trouver leur prochaine scène.
          </p>
          <div style={{ display: 'flex', flexDirection: estDesktop ? 'row' : 'column', gap: 12, justifyContent: estDesktop ? 'flex-start' : 'center' }}>
            <Link
              href="/connexion"
              style={{ height: 54, padding: '0 28px', borderRadius: 27, background: ORANGE, color: '#FFFFFF', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}
            >
              Créer un compte <ArrowRight size={18} />
            </Link>
            {!estDesktop && (
              <Link
                href="/connexion"
                style={{ height: 54, padding: '0 28px', borderRadius: 27, background: '#FFFFFF', color: MARINE, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', boxShadow: '0 2px 8px rgba(27,58,99,0.08)' }}
              >
                Se connecter
              </Link>
            )}
          </div>
        </div>

        {estDesktop && (
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ background: MARINE, borderRadius: 32, height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ transform: 'scale(2.4)', opacity: 0.9 }}>
                <LogoMark taille={70} />
              </div>
            </div>
            <div style={{ position: 'absolute', top: -18, right: -18, background: '#FFFFFF', borderRadius: 20, padding: '14px 18px', boxShadow: '0 8px 20px rgba(27,58,99,0.15)' }}>
              <div style={{ fontSize: 11, color: TEXTE_CLAIR, fontWeight: 600 }}>Récolté ce soir</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: MARINE }}>127 €</div>
            </div>
            <div style={{ position: 'absolute', bottom: -16, left: -16, background: '#FFFFFF', borderRadius: 20, padding: '14px 18px', boxShadow: '0 8px 20px rgba(27,58,99,0.15)' }}>
              <div style={{ fontSize: 11, color: TEXTE_CLAIR, fontWeight: 600 }}>Artistes ce soir</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: MARINE }}>4</div>
            </div>
          </div>
        )}
      </section>

      <section style={{ maxWidth: 1120, margin: '0 auto', padding: estDesktop ? '0 40px 40px' : '0 20px 32px' }}>
        <Link href="/repartition" style={{ textDecoration: 'none', display: 'block' }}>
          <div
            style={{
              background: MARINE,
              borderRadius: 28,
              padding: estDesktop ? '32px 40px' : '24px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
              flexDirection: estDesktop ? 'row' : 'column',
              textAlign: estDesktop ? 'left' : 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexDirection: estDesktop ? 'row' : 'column' }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Coins size={26} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontSize: estDesktop ? 20 : 17, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>
                  Tu sors de scène ce soir ?
                </div>
                <div style={{ fontSize: 13, color: CREME, opacity: 0.85, maxWidth: 380 }}>
                  Compte et répartis le chapeau entre artistes en quelques secondes, sans créer de compte.
                </div>
              </div>
            </div>
            <div
              style={{
                height: 48, padding: '0 24px', borderRadius: 24, background: ORANGE, color: '#FFFFFF',
                fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, whiteSpace: 'nowrap'
              }}
            >
              Répartir maintenant <ArrowRight size={16} />
            </div>
          </div>
        </Link>
      </section>

      <section style={{ maxWidth: 1120, margin: '0 auto', padding: estDesktop ? '0 40px 80px' : '0 20px 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colonnesFeatures}, 1fr)`, gap: 16 }}>
          {FONCTIONNALITES.map((f) => {
            const Icone = f.icone
            return (
              <div key={f.titre} style={{ background: '#FFFFFF', borderRadius: 24, padding: 24, boxShadow: '0 2px 8px rgba(27,58,99,0.06)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: CREME_HEADER, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icone size={20} color={MARINE} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: MARINE, marginBottom: 6 }}>{f.titre}</div>
                <div style={{ fontSize: 13, color: TEXTE_CLAIR, lineHeight: 1.5 }}>{f.description}</div>
              </div>
            )
          })}
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${CREME_HEADER}`, padding: '28px 20px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexDirection: estDesktop ? 'row' : 'column', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 12, color: TEXTE_CLAIR }}>© {new Date().getFullYear()} O'Chapeau</span>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/mentions-legales" style={{ fontSize: 12, color: TEXTE_CLAIR, textDecoration: 'none' }}>Mentions légales</Link>
            <Link href="/confidentialite" style={{ fontSize: 12, color: TEXTE_CLAIR, textDecoration: 'none' }}>Politique de confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
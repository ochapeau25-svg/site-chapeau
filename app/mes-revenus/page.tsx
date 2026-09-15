'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Edit3, LogOut, Plus } from 'lucide-react'

const MARINE = '#1B3A63'
const ORANGE = '#E08A34'
const TEXTE_CLAIR = '#8A7C70'
const CREME = '#F4E9DF'

type Revenu = {
  id: string
  evenement_nom: string
  montant: number
  date_revenu: string
}

function formatDateLongue(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function MesRevenusPage() {
  const [revenus, setRevenus] = useState<Revenu[]>([])
  const [chargement, setChargement] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    verifierUtilisateurEtCharger()
  }, [])

  async function verifierUtilisateurEtCharger() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/connexion')
      return
    }
    setUserEmail(user.email || '')
    await chargerRevenus()
    setChargement(false)
  }

  async function chargerRevenus() {
    const { data, error } = await supabase
      .from('revenus')
      .select('*')
      .order('date_revenu', { ascending: false })
    if (!error && data) setRevenus(data)
  }

  async function deconnexion() {
    await supabase.auth.signOut()
    router.push('/connexion')
  }

  if (chargement) return <p style={{ padding: 24, color: TEXTE_CLAIR }}>Chargement...</p>

  const total = revenus.reduce((somme, r) => somme + Number(r.montant), 0)
  const initiale = userEmail ? userEmail[0].toUpperCase() : '?'

  return (
    <div style={{ maxWidth: 448, margin: '0 auto', padding: '24px 20px 128px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: MARINE, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CREME, fontSize: 22, fontWeight: 800 }}>
          {initiale}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: MARINE, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {userEmail.split('@')[0]}
          </div>
          <div style={{ fontSize: 12, color: TEXTE_CLAIR, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {userEmail}
          </div>
          <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 600, color: MARINE, background: '#EDE4D9', padding: '4px 10px', borderRadius: 999 }}>
            Artiste
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button style={{ flex: 1, height: 44, borderRadius: 22, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: MARINE, boxShadow: '0 2px 8px rgba(27,58,99,0.06)', border: 'none' }}>
          <Edit3 size={15} /> Modifier
        </button>
        <button onClick={deconnexion} style={{ flex: 1, height: 44, borderRadius: 22, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#9E2418', boxShadow: '0 2px 8px rgba(27,58,99,0.06)', border: 'none' }}>
          <LogOut size={15} /> Déconnexion
        </button>
      </div>

      <div style={{ background: MARINE, borderRadius: 26, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: CREME, opacity: 0.8, marginBottom: 4 }}>Total de mes revenus</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#FFFFFF' }}>{total.toFixed(2)} €</div>
      </div>

      <Link
        href="/mes-revenus/nouveau"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 24, background: ORANGE, padding: '0 20px', marginBottom: 22, gap: 8, textDecoration: 'none' }}
      >
        <Plus size={16} color="#FFFFFF" />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>Ajouter un revenu</span>
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: MARINE }}>Historique</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: TEXTE_CLAIR }}>{revenus.length} entrée{revenus.length > 1 ? 's' : ''}</span>
      </div>

      {revenus.length === 0 ? (
        <p style={{ fontSize: 14, color: TEXTE_CLAIR }}>Aucun revenu enregistré pour l'instant.</p>
      ) : (
        <div style={{ background: '#FFFFFF', borderRadius: 24, padding: '6px 16px', boxShadow: '0 2px 8px rgba(27,58,99,0.06)' }}>
          {revenus.map((r, i) => (
            <div
              key={r.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0',
                borderBottom: i < revenus.length - 1 ? '1px solid #F0E8DE' : 'none'
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: MARINE }}>{r.evenement_nom}</div>
                <div style={{ fontSize: 11, color: TEXTE_CLAIR, marginTop: 2 }}>{formatDateLongue(r.date_revenu)}</div>
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: MARINE }}>{Number(r.montant).toFixed(2)} €</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
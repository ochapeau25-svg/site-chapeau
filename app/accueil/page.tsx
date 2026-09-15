'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { CalendarClock, Coins, ChevronRight, MapPin, Mic2, Guitar, Drama, Calendar, User } from 'lucide-react'

const MARINE = '#1B3A63'
const TERRACOTTA = '#9E2418'
const ORANGE = '#E08A34'
const CREME_HEADER = '#EDE4D9'
const TEXTE_CLAIR = '#8A7C70'

type Evenement = {
  id: string
  titre: string
  ville: string
  categorie: string
  date_evenement: string
}

type Revenu = {
  evenement_nom: string
  montant: number
  date_revenu: string
}

const ICONES_CATEGORIE: Record<string, any> = { 'stand up': Mic2, musique: Guitar, theatre: Drama }
const COULEURS_CATEGORIE: Record<string, string> = { 'stand up': MARINE, musique: TERRACOTTA, theatre: ORANGE }

function formatDateCourte(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function AccueilPage() {
  const [prenom, setPrenom] = useState('')
  const [prochainEvenement, setProchainEvenement] = useState<Evenement | null>(null)
  const [dernierRevenu, setDernierRevenu] = useState<Revenu | null>(null)
  const [autresEvenements, setAutresEvenements] = useState<Evenement[]>([])

  const supabase = createClient()

  useEffect(() => {
    charger()
  }, [])

  async function charger() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) setPrenom(user.email.split('@')[0])

    const aujourdHui = new Date().toISOString().split('T')[0]

    const { data: evenements } = await supabase
      .from('evenements')
      .select('*')
      .gte('date_evenement', aujourdHui)
      .order('date_evenement', { ascending: true })
      .limit(6)

    if (evenements && evenements.length > 0) {
      setProchainEvenement(evenements[0])
      setAutresEvenements(evenements.slice(1))
    }

    if (user) {
      const { data: revenus } = await supabase
        .from('revenus')
        .select('evenement_nom, montant, date_revenu')
        .order('created_at', { ascending: false })
        .limit(1)

      if (revenus && revenus.length > 0) setDernierRevenu(revenus[0])
    }
  }

  return (
    <div style={{ maxWidth: 448, margin: '0 auto', padding: '24px 20px 128px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: MARINE, marginBottom: 2 }}>
        Salut {prenom || 'toi'} 👋
      </h1>
      <p style={{ fontSize: 14, color: TEXTE_CLAIR, marginBottom: 20 }}>Voici où tu en es</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <div style={{ flex: 1, background: MARINE, borderRadius: 22, padding: 14 }}>
          <CalendarClock size={18} color="#F4E9DF" style={{ opacity: 0.85 }} />
          <div style={{ fontSize: 11, color: '#F4E9DF', opacity: 0.75, marginTop: 8 }}>Ton prochain événement</div>
          {prochainEvenement ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginTop: 2 }}>{prochainEvenement.titre}</div>
              <div style={{ fontSize: 11, color: '#F4E9DF', opacity: 0.75, marginTop: 2 }}>{formatDateCourte(prochainEvenement.date_evenement)}</div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: '#F4E9DF', opacity: 0.85, marginTop: 4 }}>Aucun pour l'instant</div>
          )}
        </div>
        <div style={{ flex: 1, background: ORANGE, borderRadius: 22, padding: 14 }}>
          <Coins size={18} color="#FFFFFF" style={{ opacity: 0.9 }} />
          <div style={{ fontSize: 11, color: '#FFFFFF', opacity: 0.85, marginTop: 8 }}>Dernier revenu ajouté</div>
          {dernierRevenu ? (
            <>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', marginTop: 2 }}>{Number(dernierRevenu.montant).toFixed(0)} €</div>
              <div style={{ fontSize: 11, color: '#FFFFFF', opacity: 0.85, marginTop: 2 }}>{formatDateCourte(dernierRevenu.date_revenu)}</div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: '#FFFFFF', opacity: 0.9, marginTop: 4 }}>Rien enregistré</div>
          )}
        </div>
      </div>

      {autresEvenements.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: MARINE }}>À ne pas manquer</span>
            <Link href="/agenda" style={{ fontSize: 12, fontWeight: 600, color: ORANGE, textDecoration: 'none' }}>Voir tout</Link>
          </div>

          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', margin: '0 -20px 24px', padding: '0 20px' }}>
            {autresEvenements.map((e) => {
              const Icone = ICONES_CATEGORIE[e.categorie] || Mic2
              return (
                <div key={e.id} style={{ flexShrink: 0, width: 180, background: '#FFFFFF', borderRadius: 24, padding: 12, boxShadow: '0 2px 8px rgba(27,58,99,0.06)' }}>
                  <div style={{ width: '100%', height: 90, borderRadius: 16, background: COULEURS_CATEGORIE[e.categorie] || MARINE, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <Icone size={30} color="#F4E9DF" />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: MARINE, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.titre}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <MapPin size={11} color={TEXTE_CLAIR} />
                    <span style={{ fontSize: 11, color: TEXTE_CLAIR }}>{e.ville} · {formatDateCourte(e.date_evenement)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <div style={{ fontSize: 17, fontWeight: 800, color: MARINE, marginBottom: 12 }}>Accès rapide</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Link href="/agenda" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#FFFFFF', borderRadius: 22, padding: '14px 16px', boxShadow: '0 2px 8px rgba(27,58,99,0.06)', textDecoration: 'none' }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: CREME_HEADER, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={19} color={MARINE} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: MARINE }}>Agenda</div>
            <div style={{ fontSize: 11, color: TEXTE_CLAIR }}>Toutes les scènes ouvertes</div>
          </div>
          <ChevronRight size={16} color="#C4B8AB" />
        </Link>

        <Link href="/repartition" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#FFFFFF', borderRadius: 22, padding: '14px 16px', boxShadow: '0 2px 8px rgba(27,58,99,0.06)', textDecoration: 'none' }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: CREME_HEADER, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Coins size={19} color={MARINE} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: MARINE }}>Répartition</div>
            <div style={{ fontSize: 11, color: TEXTE_CLAIR }}>Compter et partager le chapeau</div>
          </div>
          <ChevronRight size={16} color="#C4B8AB" />
        </Link>

        <Link href="/mes-revenus" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#FFFFFF', borderRadius: 22, padding: '14px 16px', boxShadow: '0 2px 8px rgba(27,58,99,0.06)', textDecoration: 'none' }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: CREME_HEADER, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={19} color={MARINE} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: MARINE }}>Mon profil</div>
            <div style={{ fontSize: 11, color: TEXTE_CLAIR }}>Revenus et événements publiés</div>
          </div>
          <ChevronRight size={16} color="#C4B8AB" />
        </Link>
      </div>
    </div>
  )
}
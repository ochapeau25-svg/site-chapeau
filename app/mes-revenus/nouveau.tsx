'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Check } from 'lucide-react'

const MARINE = '#1B3A63'
const ORANGE = '#E08A34'
const TERRACOTTA = '#9E2418'
const TEXTE_CLAIR = '#8A7C70'

type Evenement = {
  id: string
  titre: string
  date_evenement: string
  categorie: string
}

const COULEURS_CATEGORIE: Record<string, string> = { 'stand up': MARINE, musique: TERRACOTTA, theatre: ORANGE }

export default function NouveauRevenuPage() {
  const [evenementNom, setEvenementNom] = useState('')
  const [montant, setMontant] = useState('')
  const [dateRevenu, setDateRevenu] = useState('')
  const [message, setMessage] = useState('')
  const [chargement, setChargement] = useState(false)
  const [evenements, setEvenements] = useState<Evenement[]>([])
  const [evenementLie, setEvenementLie] = useState<string | null>(null)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    chargerEvenements()
  }, [])

  async function chargerEvenements() {
    const { data } = await supabase
      .from('evenements')
      .select('id, titre, date_evenement, categorie')
      .order('date_evenement', { ascending: false })
      .limit(10)
    if (data) setEvenements(data)
  }

  function selectionnerEvenement(e: Evenement) {
    setEvenementLie(e.id)
    setEvenementNom(e.titre)
    setDateRevenu(e.date_evenement)
  }

  async function ajouterRevenu() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !evenementNom || !montant || !dateRevenu) {
      setMessage('Merci de remplir tous les champs.')
      return
    }

    setChargement(true)
    const { error } = await supabase.from('revenus').insert({
      artiste_id: user.id,
      evenement_nom: evenementNom,
      montant: parseFloat(montant),
      date_revenu: dateRevenu
    })
    setChargement(false)

    if (error) setMessage('Erreur : ' + error.message)
    else router.push('/mes-revenus')
  }

  return (
    <div style={{ maxWidth: 448, margin: '0 auto', padding: '24px 20px 128px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={() => router.back()} style={{ width: 32, height: 32, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: MARINE, border: 'none' }}>
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: MARINE }}>Ajouter un revenu</h1>
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: TEXTE_CLAIR, marginBottom: 8, marginLeft: 4 }}>NOM DE LA SCÈNE / ÉVÉNEMENT</div>
      <div style={{ display: 'flex', alignItems: 'center', height: 52, borderRadius: 26, background: '#FFFFFF', padding: '0 18px', marginBottom: 16, boxShadow: '0 2px 8px rgba(27,58,99,0.06)' }}>
        <input
          type="text"
          placeholder="Golry Comedy Club"
          value={evenementNom}
          onChange={(e) => { setEvenementNom(e.target.value); setEvenementLie(null) }}
          style={{ fontSize: 14, color: MARINE, outline: 'none', flex: 1, background: 'transparent', border: 'none' }}
        />
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: TEXTE_CLAIR, marginBottom: 8, marginLeft: 4 }}>MONTANT REÇU</div>
      <div style={{ display: 'flex', alignItems: 'center', height: 52, borderRadius: 26, background: '#FFFFFF', padding: '0 18px', marginBottom: 16, boxShadow: '0 2px 8px rgba(27,58,99,0.06)' }}>
        <input
          type="number"
          placeholder="0"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          style={{ fontSize: 14, color: MARINE, outline: 'none', flex: 1, background: 'transparent', border: 'none' }}
        />
        <span style={{ fontSize: 14, color: TEXTE_CLAIR }}>€</span>
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: TEXTE_CLAIR, marginBottom: 8, marginLeft: 4 }}>DATE</div>
      <div style={{ display: 'flex', alignItems: 'center', height: 52, borderRadius: 26, background: '#FFFFFF', padding: '0 18px', marginBottom: 24, boxShadow: '0 2px 8px rgba(27,58,99,0.06)' }}>
        <Calendar size={16} color={TEXTE_CLAIR} style={{ marginRight: 10 }} />
        <input
          type="date"
          value={dateRevenu}
          onChange={(e) => setDateRevenu(e.target.value)}
          style={{ fontSize: 14, color: MARINE, outline: 'none', flex: 1, background: 'transparent', border: 'none' }}
        />
      </div>

      {evenements.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 600, color: TEXTE_CLAIR, marginBottom: 8, marginLeft: 4 }}>
            LIER À UN ÉVÉNEMENT DE L'AGENDA (OPTIONNEL)
          </div>
          <div style={{ background: '#FFFFFF', borderRadius: 24, padding: '4px 16px', marginBottom: 24, boxShadow: '0 2px 8px rgba(27,58,99,0.06)' }}>
            {evenements.map((e, i) => (
              <div
                key={e.id}
                onClick={() => selectionnerEvenement(e)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', cursor: 'pointer',
                  borderBottom: i < evenements.length - 1 ? '1px solid #F0E8DE' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: COULEURS_CATEGORIE[e.categorie] || MARINE, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: MARINE }}>
                    {e.titre} · {new Date(e.date_evenement).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  border: `2px solid ${evenementLie === e.id ? MARINE : '#C4B8AB'}`,
                  background: evenementLie === e.id ? MARINE : 'transparent'
                }} />
              </div>
            ))}
          </div>
        </>
      )}

      <button
        onClick={ajouterRevenu}
        disabled={chargement}
        style={{ width: '100%', height: 56, borderRadius: 999, background: ORANGE, color: '#FFFFFF', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 'none', opacity: chargement ? 0.7 : 1 }}
      >
        {chargement ? 'Enregistrement...' : 'Enregistrer'}
        {!chargement && <Check size={18} />}
      </button>

      {message && (
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: MARINE }}>{message}</p>
      )}
    </div>
  )
}
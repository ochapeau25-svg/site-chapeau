'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, ChevronDown, ChevronUp, User, AlertTriangle,
  Coins, Clock, Check, ArrowRight, Minus, RotateCcw, RefreshCw, CreditCard
} from 'lucide-react'

const MARINE = '#1B3A63'
const TERRACOTTA = '#9E2418'
const ORANGE = '#E08A34'
const CREME = '#F4E9DF'
const CREME_HEADER = '#EDE4D9'
const TEXTE_CLAIR = '#8A7C70'
const BORDURE_CLAIRE = '#C4B8AB'
const GRIS_DESACTIVE = '#C9BFB2'

const DENOMINATIONS = [50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01]

const PARTS_OPTIONS = [
  { label: 'Quart de part', value: 0.25 },
  { label: 'Demi-part', value: 0.5 },
  { label: 'Part entière', value: 1 },
  { label: 'Double part', value: 2 }
]

const COULEURS_AVATAR = [ORANGE, MARINE, TERRACOTTA]

type Artiste = { nom: string; parts: number }
type ArtisteResultat = {
  nom: string
  target: number
  carte: number
  billets: number[]
  received: number
  total: number
  ecart: number
}
type MontantCarte = { id: string; montant: number; label: string; artisteNom: string }

function formatDenom(d: number) {
  return d >= 1 ? `${d} €` : `${(d * 100).toFixed(0)} cts`
}

function calculerConversionCaisse(montant: number, n: number) {
  if (n === 0 || montant <= 0) return null
  const centimesTotal = Math.round(montant * 100)
  const centimesParPersonne = Math.floor(centimesTotal / n)
  if (centimesParPersonne <= 0) return null

  let reste = centimesParPersonne
  const parPersonne: { denom: number; qty: number }[] = []
  DENOMINATIONS.forEach((d) => {
    const dc = Math.round(d * 100)
    const qty = Math.floor(reste / dc)
    if (qty > 0) {
      parPersonne.push({ denom: d, qty })
      reste -= qty * dc
    }
  })

  return {
    parPersonneMontant: centimesParPersonne / 100,
    total: parPersonne.map((p) => ({ denom: p.denom, qty: p.qty * n }))
  }
}

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

function CompteurDenom({ valeur, onChange }: { valeur: number; onChange: (v: number) => void }) {
  const [ouvert, setOuvert] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function gererClicExterieur(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOuvert(false)
    }
    document.addEventListener('mousedown', gererClicExterieur)
    return () => document.removeEventListener('mousedown', gererClicExterieur)
  }, [])

  function gererSaisie(e: React.ChangeEvent<HTMLInputElement>) {
    const brut = e.target.value.replace(/[^0-9]/g, '')
    onChange(brut === '' ? 0 : parseInt(brut, 10))
  }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
      <button
        onClick={() => onChange(Math.max(0, valeur - 1))}
        style={{ width: 28, height: 28, borderRadius: '50%', background: CREME_HEADER, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MARINE, border: 'none', flexShrink: 0 }}
      >
        <Minus size={13} />
      </button>

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={valeur}
          onFocus={() => setOuvert(true)}
          onChange={gererSaisie}
          style={{ width: 26, textAlign: 'center', fontSize: 14, fontWeight: 700, color: MARINE, border: 'none', outline: 'none', background: 'transparent' }}
        />
        {ouvert && (
          <div style={{ position: 'absolute', top: '130%', left: '50%', transform: 'translateX(-50%)', background: '#FFFFFF', borderRadius: 12, boxShadow: '0 6px 20px rgba(27,58,99,0.2)', padding: 6, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, zIndex: 20 }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                onClick={() => { onChange(n); setOuvert(false) }}
                style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: n === valeur ? MARINE : CREME_HEADER, color: n === valeur ? '#FFFFFF' : MARINE, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => onChange(valeur + 1)}
        style={{ width: 28, height: 28, borderRadius: '50%', background: MARINE, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', border: 'none', flexShrink: 0 }}
      >
        <Plus size={13} />
      </button>
    </div>
  )
}

export default function RepartitionPage() {
  const router = useRouter()
  const largeur = useLargeurFenetre()
  const estTablette = largeur >= 700
  const estDesktop = largeur >= 1024
  const maxWidthPage = estDesktop ? 860 : estTablette ? 700 : 448
  const colonnesDenoms = estDesktop ? 4 : estTablette ? 3 : 2

  const [repartitionMode, setRepartitionMode] = useState<'egale' | 'parts'>('egale')
  const [artistes, setArtistes] = useState<Artiste[]>([
    { nom: '', parts: 1 },
    { nom: '', parts: 1 }
  ])
  const [denoms, setDenoms] = useState<Record<number, number>>({})
  const [voirToutesDenoms, setVoirToutesDenoms] = useState(false)

  const [montantsCarte, setMontantsCarte] = useState<MontantCarte[]>([])
  const [nouveauMontantCarte, setNouveauMontantCarte] = useState('')
  const [nouveauLabelCarte, setNouveauLabelCarte] = useState('')
  const [nouveauArtisteCarte, setNouveauArtisteCarte] = useState('')

  const [resultat, setResultat] = useState<{
    state: ArtisteResultat[]
    total: number
    totalEspeces: number
    totalCarte: number
    surplus: number
  } | null>(null)

  const [surplusChoix, setSurplusChoix] = useState<'aucun' | 'artiste' | 'pourboire' | 'reporter' | 'conversion'>('aucun')
  const [surplusArtiste, setSurplusArtiste] = useState('')

  function ajouterArtiste() {
    setArtistes([...artistes, { nom: '', parts: 1 }])
  }
  function modifierNom(i: number, v: string) {
    const c = [...artistes]; c[i].nom = v; setArtistes(c)
  }
  function modifierParts(i: number, v: number) {
    const c = [...artistes]; c[i].parts = v; setArtistes(c)
  }
  function supprimerArtiste(i: number) {
    setArtistes(artistes.filter((_, idx) => idx !== i))
  }
  function getArtistesValides() {
    return artistes.filter((a) => a.nom.trim() !== '')
  }
  function getTargets(noms: Artiste[], total: number) {
    if (repartitionMode === 'egale') {
      const part = total / noms.length
      return noms.map(() => part)
    }
    const totalParts = noms.reduce((s, a) => s + a.parts, 0)
    return noms.map((a) => (total * a.parts) / totalParts)
  }

  function ajouterMontantCarte() {
    const montant = parseFloat(nouveauMontantCarte)
    if (!montant || montant <= 0 || !nouveauArtisteCarte) return
    setMontantsCarte([...montantsCarte, { id: crypto.randomUUID(), montant, label: nouveauLabelCarte.trim(), artisteNom: nouveauArtisteCarte }])
    setNouveauMontantCarte('')
    setNouveauLabelCarte('')
    setNouveauArtisteCarte('')
  }
  function supprimerMontantCarte(id: string) {
    setMontantsCarte(montantsCarte.filter((m) => m.id !== id))
  }

  function reinitialiserDenoms() {
    const total = DENOMINATIONS.reduce((s, d) => s + (denoms[d] || 0), 0)
    if (total === 0) return
    if (window.confirm('Remettre tous les compteurs de billets/pièces à 0 ?')) {
      setDenoms({})
    }
  }

  function calculerEspeces() {
    const noms = getArtistesValides()
    if (noms.length === 0) return

    const totalEspeces = +DENOMINATIONS.reduce((s, d) => s + (denoms[d] || 0) * d, 0).toFixed(2)
    const totalCarteMontant = +montantsCarte.reduce((s, m) => s + m.montant, 0).toFixed(2)
    const totalPot = +(totalEspeces + totalCarteMontant).toFixed(2)
    const n = noms.length

    function carteRecuePar(nom: string) {
      return +montantsCarte.filter((m) => m.artisteNom === nom).reduce((s, m) => s + m.montant, 0).toFixed(2)
    }

    const items: number[] = []
    DENOMINATIONS.forEach((d) => {
      const qty = denoms[d] || 0
      for (let i = 0; i < qty; i++) items.push(d)
    })

    let state: ArtisteResultat[]
    let surplus = 0

    if (repartitionMode === 'egale' && montantsCarte.length === 0) {
      // Cas simple : personne n'a reçu de carte, division stricte billet par billet
      const targetGlobal = +(totalPot / n).toFixed(2)
      const billetsCommuns: number[] = []
      let especesParArtiste = 0
      let leftoverValue = 0
      DENOMINATIONS.forEach((d) => {
        const qty = denoms[d] || 0
        const parArtiste = Math.floor(qty / n)
        const reste = qty - parArtiste * n
        for (let i = 0; i < parArtiste; i++) billetsCommuns.push(d)
        especesParArtiste += parArtiste * d
        leftoverValue += reste * d
      })
      especesParArtiste = +especesParArtiste.toFixed(2)
      leftoverValue = +leftoverValue.toFixed(2)

      state = noms.map((a) => ({
        nom: a.nom,
        target: targetGlobal,
        carte: 0,
        billets: [...billetsCommuns],
        received: especesParArtiste,
        total: especesParArtiste,
        ecart: 0
      }))
      surplus = leftoverValue
    } else {
      // Un ou plusieurs artistes ont reçu de la carte : on retire ce montant de leur besoin en espèces,
      // le reste des billets est réparti pour s'approcher au mieux de chaque part.
      const targetsGlobal = repartitionMode === 'egale'
        ? noms.map(() => +(totalPot / n).toFixed(2))
        : getTargets(noms, totalPot).map((t) => +t.toFixed(2))

      const cartes = noms.map((a) => carteRecuePar(a.nom))
      const cibles = targetsGlobal.map((t, i) => Math.max(0, +(t - cartes[i]).toFixed(2)))

      const receivedArr = cibles.map(() => 0)
      const billetsArr: number[][] = cibles.map(() => [])
      const sortedItems = [...items].sort((a, b) => b - a)
      sortedItems.forEach((billet) => {
        let bestIdx = 0
        let bestDeficit = cibles[0] - receivedArr[0]
        for (let i = 1; i < cibles.length; i++) {
          const deficit = cibles[i] - receivedArr[i]
          if (deficit > bestDeficit) { bestDeficit = deficit; bestIdx = i }
        }
        receivedArr[bestIdx] += billet
        billetsArr[bestIdx].push(billet)
      })

      state = noms.map((a, i) => {
        const received = +receivedArr[i].toFixed(2)
        const carte = cartes[i]
        const total = +(received + carte).toFixed(2)
        const ecart = +(total - targetsGlobal[i]).toFixed(2)
        if (ecart > 0) surplus += ecart
        return { nom: a.nom, target: targetsGlobal[i], carte, billets: billetsArr[i], received, total, ecart }
      })
      surplus = +surplus.toFixed(2)
    }

    setResultat({ state, total: totalPot, totalEspeces, totalCarte: totalCarteMontant, surplus })
    setSurplusChoix('aucun')
  }

  function handleValider() {
    router.push('/accueil?chapeauDistribue=1')
  }

  const denomsPrincipales = DENOMINATIONS.slice(0, voirToutesDenoms ? DENOMINATIONS.length : colonnesDenoms * 2)
  const totalEspecesPreview = DENOMINATIONS.reduce((s, d) => s + (denoms[d] || 0) * d, 0)
  const totalCartePreview = montantsCarte.reduce((s, m) => s + m.montant, 0)
  const surplusNonResolu = !!resultat && resultat.surplus > 0.001 && surplusChoix === 'aucun'
  const artistesValides = getArtistesValides()

  return (
    <div style={{ maxWidth: maxWidthPage, margin: '0 auto', padding: '24px 20px 128px' }}>
      {!resultat && (
        <>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: MARINE, marginBottom: 2 }}>Répartition</h1>
          <p style={{ fontSize: 14, color: TEXTE_CLAIR, marginBottom: 20 }}>Renseigne les artistes et la collecte</p>

          <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: MARINE, cursor: 'pointer' }}>
              <input type="radio" checked={repartitionMode === 'egale'} onChange={() => setRepartitionMode('egale')} />
              Parts égales
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: MARINE, cursor: 'pointer' }}>
              <input type="radio" checked={repartitionMode === 'parts'} onChange={() => setRepartitionMode('parts')} />
              Parts réparties
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: MARINE }}>Artistes</span>
            <button onClick={ajouterArtiste} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 600, color: ORANGE, background: 'none', border: 'none' }}>
              <Plus size={14} /> Ajouter
            </button>
          </div>

          {artistes.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, height: 56, borderRadius: 28, background: '#FFFFFF', padding: '0 8px', marginBottom: 10, boxShadow: '0 2px 8px rgba(27,58,99,0.06)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: COULEURS_AVATAR[i % COULEURS_AVATAR.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                {a.nom.trim() ? a.nom.trim()[0].toUpperCase() : '?'}
              </div>
              <input
                type="text"
                placeholder="Prénom"
                value={a.nom}
                onChange={(e) => modifierNom(i, e.target.value)}
                style={{ flex: 1, fontSize: 14, fontWeight: 600, color: MARINE, outline: 'none', background: 'transparent', border: 'none' }}
              />
              {repartitionMode === 'parts' && (
                <select
                  value={a.parts}
                  onChange={(e) => modifierParts(i, parseFloat(e.target.value))}
                  style={{ fontSize: 12, fontWeight: 600, color: MARINE, background: CREME_HEADER, borderRadius: 999, padding: '8px 12px', outline: 'none', border: 'none' }}
                >
                  {PARTS_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              )}
              <button onClick={() => supprimerArtiste(i)} style={{ color: TEXTE_CLAIR, fontSize: 12, padding: '0 4px', background: 'none', border: 'none' }}>✕</button>
            </div>
          ))}
          <button
            onClick={ajouterArtiste}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 48, borderRadius: 24, border: `2px dashed ${BORDURE_CLAIRE}`, width: '100%', fontSize: 14, fontWeight: 600, color: TEXTE_CLAIR, marginBottom: 24, background: 'none' }}
          >
            <Plus size={14} /> Ajouter un artiste
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: MARINE }}>Espèces récoltées</span>
            <button onClick={reinitialiserDenoms} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: TEXTE_CLAIR, background: 'none', border: 'none' }}>
              <RotateCcw size={12} /> Réinitialiser
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colonnesDenoms}, 1fr)`, gap: 10, marginBottom: 8 }}>
            {denomsPrincipales.map((d) => (
              <div key={d} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58, borderRadius: 28, background: '#FFFFFF', padding: '0 14px', boxShadow: '0 2px 8px rgba(27,58,99,0.06)' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: MARINE }}>{formatDenom(d)}</span>
                <CompteurDenom valeur={denoms[d] || 0} onChange={(v) => setDenoms({ ...denoms, [d]: Math.max(0, v) })} />
              </div>
            ))}
            {!voirToutesDenoms && DENOMINATIONS.length > denomsPrincipales.length && (
              <button
                onClick={() => setVoirToutesDenoms(true)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, height: 58, borderRadius: 28, border: `2px solid ${MARINE}`, fontSize: 14, fontWeight: 600, color: MARINE, background: 'none' }}
              >
                Voir tout <ChevronDown size={14} />
              </button>
            )}
          </div>

          {voirToutesDenoms && (
            <button
              onClick={() => setVoirToutesDenoms(false)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, width: '100%', background: 'none', border: 'none', color: TEXTE_CLAIR, fontSize: 13, fontWeight: 600, marginBottom: 20, cursor: 'pointer', padding: '8px 0' }}
            >
              Voir moins <ChevronUp size={14} />
            </button>
          )}

          <div style={{ fontSize: 16, fontWeight: 700, color: MARINE, marginBottom: 12, marginTop: voirToutesDenoms ? 0 : 12 }}>
            Virements PayPal reçus pendant la collecte
          </div>

          {montantsCarte.map((m) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, height: 52, borderRadius: 26, background: '#FFFFFF', padding: '0 16px', marginBottom: 10, boxShadow: '0 2px 8px rgba(27,58,99,0.06)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: MARINE }}>{m.artisteNom}</div>
                {m.label && <div style={{ fontSize: 11, color: TEXTE_CLAIR }}>{m.label}</div>}
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: MARINE }}>{m.montant.toFixed(2)} €</span>
              <button onClick={() => supprimerMontantCarte(m.id)} style={{ color: TEXTE_CLAIR, fontSize: 12, background: 'none', border: 'none' }}>✕</button>
            </div>
          ))}

          {artistesValides.length === 0 ? (
            <p style={{ fontSize: 12, color: TEXTE_CLAIR, marginBottom: 24 }}>Ajoute d'abord des artistes pour pouvoir leur associer un virement reçu directement.</p>
          ) : (
            <div style={{ marginBottom: 24 }}>
              <select
                value={nouveauArtisteCarte}
                onChange={(e) => setNouveauArtisteCarte(e.target.value)}
                style={{ width: '100%', height: 48, borderRadius: 24, background: '#FFFFFF', padding: '0 16px', fontSize: 13, color: MARINE, border: 'none', outline: 'none', boxShadow: '0 2px 8px rgba(27,58,99,0.06)', marginBottom: 8 }}
              >
                <option value="">Qui a reçu ce virement ?</option>
                {artistesValides.map((a) => <option key={a.nom} value={a.nom}>{a.nom}</option>)}
              </select>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Libellé (optionnel)"
                  value={nouveauLabelCarte}
                  onChange={(e) => setNouveauLabelCarte(e.target.value)}
                  style={{ flex: 1, height: 48, borderRadius: 24, background: '#FFFFFF', padding: '0 14px', fontSize: 13, color: MARINE, border: 'none', outline: 'none', boxShadow: '0 2px 8px rgba(27,58,99,0.06)' }}
                />
                <input
                  type="number"
                  placeholder="0"
                  value={nouveauMontantCarte}
                  onChange={(e) => setNouveauMontantCarte(e.target.value)}
                  style={{ width: 90, height: 48, borderRadius: 24, background: '#FFFFFF', padding: '0 14px', fontSize: 13, color: MARINE, border: 'none', outline: 'none', boxShadow: '0 2px 8px rgba(27,58,99,0.06)' }}
                />
                <button onClick={ajouterMontantCarte} style={{ width: 48, height: 48, borderRadius: 24, background: MARINE, color: '#FFFFFF', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}

          <div style={{ background: MARINE, borderRadius: 24, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: totalCartePreview > 0 ? 4 : 20 }}>
            <span style={{ fontSize: 14, color: CREME, opacity: 0.85 }}>Total récolté</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF' }}>
              {(totalEspecesPreview + totalCartePreview).toFixed(2)} €
            </span>
          </div>
          {totalCartePreview > 0 && (
            <p style={{ fontSize: 12, color: TEXTE_CLAIR, marginBottom: 20, textAlign: 'right' }}>
              dont {totalCartePreview.toFixed(2)} € déjà reçus directement par virement
            </p>
          )}

          <button
            onClick={calculerEspeces}
            style={{ width: '100%', height: 56, borderRadius: 999, background: ORANGE, color: '#FFFFFF', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 'none' }}
          >
            Calculer la répartition <ArrowRight size={18} />
          </button>
        </>
      )}

      {resultat && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <button onClick={() => setResultat(null)} style={{ width: 32, height: 32, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: MARINE, border: 'none' }}>←</button>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: MARINE }}>Résultat</h1>
          </div>
          <p style={{ fontSize: 14, color: TEXTE_CLAIR, marginBottom: 20, marginLeft: 42 }}>Voici la répartition calculée</p>

          <div style={{ background: MARINE, borderRadius: 24, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: resultat.totalCarte > 0.001 ? 4 : 20 }}>
            <span style={{ fontSize: 14, color: CREME, opacity: 0.85 }}>Total à répartir</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF' }}>{resultat.total.toFixed(2)} €</span>
          </div>
          {resultat.totalCarte > 0.001 && (
            <p style={{ fontSize: 12, color: TEXTE_CLAIR, marginBottom: 20, textAlign: 'right' }}>
              dont {resultat.totalEspeces.toFixed(2)} € en espèces et {resultat.totalCarte.toFixed(2)} € déjà reçus par virement
            </p>
          )}

          <div style={{ fontSize: 16, fontWeight: 700, color: MARINE, marginBottom: 12 }}>Par artiste</div>
          {resultat.state.map((s, i) => (
            <div key={s.nom} style={{ background: '#FFFFFF', borderRadius: 24, padding: 16, marginBottom: 10, boxShadow: '0 2px 8px rgba(27,58,99,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: COULEURS_AVATAR[i % COULEURS_AVATAR.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                  {s.nom[0].toUpperCase()}
                </div>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: MARINE }}>{s.nom}</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: MARINE }}>{s.total.toFixed(2)} €</span>
              </div>

              {s.billets.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginLeft: 46 }}>
                  {[...s.billets].sort((a, b) => b - a).map((b, idx) => (
                    <span key={idx} style={{ fontSize: 11, fontWeight: 600, color: MARINE, background: CREME_HEADER, padding: '4px 10px', borderRadius: 999 }}>
                      {b >= 1 ? `${b}€` : `${(b * 100).toFixed(0)}c`}
                    </span>
                  ))}
                </div>
              )}

              {s.carte > 0.001 && (
                <div style={{ marginLeft: 46, marginTop: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: MARINE, background: CREME_HEADER, padding: '4px 10px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <CreditCard size={11} /> dont {s.carte.toFixed(2)} € déjà reçus par virement
                  </span>
                </div>
              )}
            </div>
          ))}

          {resultat.surplus > 0.001 ? (
            <div style={{ background: `${ORANGE}1A`, border: `2px solid ${ORANGE}`, borderRadius: 24, padding: 16, margin: '20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={14} color="#FFFFFF" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: MARINE }}>Surplus de {resultat.surplus.toFixed(2)} €</span>
              </div>
              <p style={{ fontSize: 12, color: TEXTE_CLAIR, marginBottom: 12, marginLeft: 36 }}>Ces billets ne peuvent pas être partagés à l'identique. Que veux-tu en faire ?</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() => setSurplusChoix('artiste')}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#FFFFFF', borderRadius: 16, fontSize: 14, fontWeight: 600, color: MARINE, border: surplusChoix === 'artiste' ? `2px solid ${MARINE}` : 'none' }}
                >
                  <User size={16} /> Donner à un artiste en particulier
                </button>
                {surplusChoix === 'artiste' && (
                  <select
                    value={surplusArtiste}
                    onChange={(e) => setSurplusArtiste(e.target.value)}
                    style={{ fontSize: 14, background: '#FFFFFF', borderRadius: 16, padding: '12px 14px', color: MARINE, outline: 'none', border: 'none' }}
                  >
                    <option value="">-- Choisir un artiste --</option>
                    {resultat.state.map((s) => <option key={s.nom} value={s.nom}>{s.nom}</option>)}
                  </select>
                )}
                <button
                  onClick={() => setSurplusChoix('pourboire')}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#FFFFFF', borderRadius: 16, fontSize: 14, fontWeight: 600, color: MARINE, border: surplusChoix === 'pourboire' ? `2px solid ${MARINE}` : 'none' }}
                >
                  <Coins size={16} /> Mettre en pourboire commun
                </button>
                <button
                  onClick={() => setSurplusChoix('reporter')}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#FFFFFF', borderRadius: 16, fontSize: 14, fontWeight: 600, color: MARINE, border: surplusChoix === 'reporter' ? `2px solid ${MARINE}` : 'none' }}
                >
                  <Clock size={16} /> Garder pour la prochaine scène
                </button>
                <button
                  onClick={() => setSurplusChoix('conversion')}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#FFFFFF', borderRadius: 16, fontSize: 14, fontWeight: 600, color: MARINE, border: surplusChoix === 'conversion' ? `2px solid ${MARINE}` : 'none' }}
                >
                  <RefreshCw size={16} /> Convertir à la caisse (parts égales)
                </button>
                {surplusChoix === 'conversion' && (() => {
                  const conversion = calculerConversionCaisse(resultat.surplus, resultat.state.length)
                  if (!conversion) return null
                  return (
                    <div style={{ background: CREME_HEADER, borderRadius: 16, padding: '12px 14px' }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: MARINE, marginBottom: 4 }}>À demander en échange à la caisse :</p>
                      <p style={{ fontSize: 12, color: MARINE, marginBottom: 8 }}>
                        {conversion.total.map((t) => `${t.qty} x ${formatDenom(t.denom)}`).join(', ')}
                      </p>
                      <p style={{ fontSize: 12, color: TEXTE_CLAIR }}>
                        Soit {conversion.parPersonneMontant.toFixed(2)} € pile pour chacun des {resultat.state.length} artistes.
                      </p>
                    </div>
                  )
                })()}
              </div>
            </div>
          ) : (
            <p style={{ margin: '20px 0', fontSize: 14, fontWeight: 700, color: MARINE }}>Répartition parfaitement égale, aucun écart.</p>
          )}

          <button
            onClick={surplusNonResolu ? undefined : handleValider}
            disabled={surplusNonResolu}
            style={{
              width: '100%', height: 56, borderRadius: 999,
              background: surplusNonResolu ? GRIS_DESACTIVE : ORANGE,
              color: '#FFFFFF', fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              border: 'none', cursor: surplusNonResolu ? 'not-allowed' : 'pointer'
            }}
          >
            Valider la répartition <Check size={18} />
          </button>
        </>
      )}
    </div>
  )
}
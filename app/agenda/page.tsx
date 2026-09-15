'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { MapPin, Plus, Mic2, Guitar, Drama } from 'lucide-react'

type Evenement = {
  id: string
  titre: string
  ville: string
  type: string
  categorie: string
  date_evenement: string
  description: string
}

const CATEGORIES = ['Toutes', 'musique', 'stand up', 'theatre']

const ICONES_CATEGORIE: Record<string, any> = {
  'stand up': Mic2,
  musique: Guitar,
  theatre: Drama
}

const COULEURS_CATEGORIE: Record<string, string> = {
  'stand up': 'bg-marine',
  musique: 'bg-terracotta',
  theatre: 'bg-orange'
}

const STYLE_BADGE: Record<string, string> = {
  'stand up': 'bg-orange/15 text-terracotta',
  musique: 'bg-creme-header text-marine',
  theatre: 'bg-orange/15 text-orange'
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const jour = d.getDate()
  const mois = d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')
  return { jour, mois }
}

export default function AgendaPage() {
  const [evenements, setEvenements] = useState<Evenement[]>([])
  const [filtreVille, setFiltreVille] = useState('')
  const [filtreCategorie, setFiltreCategorie] = useState('Toutes')
  const [chargement, setChargement] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    chargerEvenements()
  }, [])

  async function chargerEvenements() {
    const { data, error } = await supabase
      .from('evenements')
      .select('*')
      .order('date_evenement', { ascending: true })

    if (!error && data) setEvenements(data)
    setChargement(false)
  }

  const evenementsFiltres = evenements.filter((e) => {
    const matchVille = filtreVille === '' || e.ville.toLowerCase().includes(filtreVille.toLowerCase())
    const matchCategorie = filtreCategorie === 'Toutes' || e.categorie === filtreCategorie
    return matchVille && matchCategorie
  })

  return (
    <div className="max-w-md mx-auto px-5 pt-6 pb-32">
      <h1 className="text-2xl font-extrabold text-marine mb-0.5">Agenda</h1>
      <p className="text-sm text-texte-clair mb-4">Les scènes ouvertes à venir</p>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltreCategorie(cat)}
            className={`flex-shrink-0 h-9 px-4 rounded-full text-xs font-semibold transition-colors ${
              filtreCategorie === cat ? 'bg-marine text-white' : 'bg-white text-marine'
            }`}
          >
            {cat === 'Toutes' ? 'Toutes' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex items-center h-12 rounded-full bg-white px-4 mb-5 shadow-sm">
        <MapPin size={16} className="text-texte-clair" />
        <input
          type="text"
          placeholder="Filtrer par ville..."
          value={filtreVille}
          onChange={(e) => setFiltreVille(e.target.value)}
          className="ml-2.5 text-sm text-marine placeholder:text-texte-clair outline-none flex-1 bg-transparent"
        />
      </div>

      {chargement && <p className="text-sm text-texte-clair">Chargement...</p>}
      {!chargement && evenementsFiltres.length === 0 && (
        <p className="text-sm text-texte-clair">Aucun événement pour l'instant.</p>
      )}

      <div className="flex flex-col gap-3 mb-6">
        {evenementsFiltres.map((e) => {
          const Icone = ICONES_CATEGORIE[e.categorie] || Mic2
          const { jour, mois } = formatDate(e.date_evenement)
          return (
            <div key={e.id} className="flex items-center gap-3 bg-white rounded-3xl p-2.5 shadow-sm">
              <div className={`w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center ${COULEURS_CATEGORIE[e.categorie] || 'bg-marine'}`}>
                <Icone size={24} className="text-creme" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-marine truncate mb-1">{e.titre}</div>
                <div className="flex items-center gap-1 mb-1">
                  <MapPin size={12} className="text-texte-clair" />
                  <span className="text-xs text-texte-clair">{e.ville}</span>
                </div>
                <span className={`inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${STYLE_BADGE[e.categorie] || 'bg-creme-header text-marine'}`}>
                  {e.categorie}
                </span>
              </div>
              <div className="flex-shrink-0 text-center pr-1">
                <div className="text-xl font-extrabold text-marine leading-none">{jour}</div>
                <div className="text-[11px] font-semibold text-texte-clair uppercase">{mois}</div>
              </div>
            </div>
          )
        })}
      </div>

      <Link
        href="/agenda/nouveau"
        className="flex items-center justify-center gap-2 h-14 rounded-full bg-orange text-white text-sm font-bold"
      >
        <Plus size={18} />
        Ajouter un événement
      </Link>
    </div>
  )
}
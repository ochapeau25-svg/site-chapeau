'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NouvelEvenementPage() {
  const [titre, setTitre] = useState('')
  const [ville, setVille] = useState('')
  const [type, setType] = useState('')
  const [categorie, setCategorie] = useState('musique')
  const [dateEvenement, setDateEvenement] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')

  const supabase = createClient()
  const router = useRouter()

  async function creerEvenement() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setMessage('Tu dois être connecté pour ajouter un événement.')
      router.push('/connexion')
      return
    }

    if (!titre || !ville || !type || !dateEvenement) {
      setMessage('Merci de remplir tous les champs obligatoires.')
      return
    }

    const { error } = await supabase.from('evenements').insert({
      organisateur_id: user.id,
      titre,
      ville,
      type,
      categorie,
      date_evenement: dateEvenement,
      description
    })

    if (error) {
      setMessage('Erreur : ' + error.message)
    } else {
      router.push('/agenda')
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: '50px auto', padding: 20 }}>
      <h1>Ajouter un événement</h1>

      <input
        type="text"
        placeholder="Titre de l'événement"
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }}
      />
      <input
        type="text"
        placeholder="Ville"
        value={ville}
        onChange={(e) => setVille(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }}
      />
      <input
        type="text"
        placeholder="Type (scène ouverte, expérience...)"
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }}
      />
      <select
        value={categorie}
        onChange={(e) => setCategorie(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }}
      >
        <option value="musique">Musique</option>
        <option value="stand up">Stand up</option>
        <option value="theatre">Théâtre</option>
      </select>
      <input
        type="date"
        value={dateEvenement}
        onChange={(e) => setDateEvenement(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }}
      />
      <textarea
        placeholder="Description (optionnel)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8, minHeight: 80 }}
      />

      <button onClick={creerEvenement} style={{ padding: 10, width: '100%' }}>
        Publier l'événement
      </button>

      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </div>
  )
}
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Lock, ArrowRight } from 'lucide-react'

const MARINE = '#1B3A63'
const ORANGE = '#E08A34'
const TEXTE_CLAIR = '#8A7C70'

export default function ReinitialiserMotDePassePage() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [chargement, setChargement] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  const handleReinitialisation = async () => {
    if (password.length < 6) {
      setMessage('Le mot de passe doit faire au moins 6 caractères.')
      return
    }
    setChargement(true)
    const { error } = await supabase.auth.updateUser({ password })
    setChargement(false)
    if (error) {
      setMessage('Erreur : ' + error.message)
    } else {
      setMessage('Mot de passe mis à jour !')
      setTimeout(() => router.push('/accueil'), 1500)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '60px 24px 40px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: MARINE, textAlign: 'center', marginBottom: 6 }}>Nouveau mot de passe</h1>
      <p style={{ fontSize: 14, color: TEXTE_CLAIR, textAlign: 'center', marginBottom: 32 }}>Choisis un mot de passe pour ton compte</p>

      <div style={{ display: 'flex', alignItems: 'center', height: 52, borderRadius: 26, background: '#FFFFFF', padding: '0 18px', marginBottom: 20, boxShadow: '0 2px 8px rgba(27,58,99,0.06)' }}>
        <Lock size={16} color={TEXTE_CLAIR} />
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginLeft: 10, fontSize: 14, color: MARINE, outline: 'none', flex: 1, background: 'transparent', border: 'none' }}
        />
      </div>

      <button
        onClick={handleReinitialisation}
        disabled={chargement}
        style={{ width: '100%', height: 54, borderRadius: 27, background: ORANGE, color: '#FFFFFF', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 'none', opacity: chargement ? 0.7 : 1 }}
      >
        {chargement ? 'Chargement...' : 'Valider'}
        {!chargement && <ArrowRight size={18} />}
      </button>

      {message && (
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: message.startsWith('Erreur') ? '#9E2418' : MARINE }}>
          {message}
        </p>
      )}
    </div>
  )
}
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ArrowRight } from 'lucide-react'

const MARINE = '#1B3A63'
const ORANGE = '#E08A34'
const TEXTE_CLAIR = '#8A7C70'
const CREME_HEADER = '#EDE4D9'

type Mode = 'connexion' | 'inscription' | 'reinitialisation'

export default function ConnexionPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<Mode>('connexion')
  const [chargement, setChargement] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  const handleInscription = async () => {
    setChargement(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setChargement(false)
    if (error) setMessage('Erreur : ' + error.message)
    else setMessage('Compte créé ! Vérifie ton email pour confirmer.')
  }

  const handleConnexion = async () => {
    setChargement(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setChargement(false)
    if (error) setMessage('Erreur : ' + error.message)
    else router.push('/accueil')
  }

  const handleReinitialisation = async () => {
    setChargement(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`
    })
    setChargement(false)
    if (error) setMessage('Erreur : ' + error.message)
    else setMessage('Email envoyé ! Vérifie ta boîte de réception pour réinitialiser ton mot de passe.')
  }

  const handleSubmit = () => {
    setMessage('')
    if (mode === 'connexion') handleConnexion()
    else if (mode === 'inscription') handleInscription()
    else handleReinitialisation()
  }

  const titres: Record<Mode, string> = {
    connexion: 'Se connecter',
    inscription: 'Créer un compte',
    reinitialisation: 'Mot de passe oublié'
  }
  const sousTitres: Record<Mode, string> = {
    connexion: 'Content de te revoir',
    inscription: "Rejoins la communauté O'Chapeau",
    reinitialisation: 'On t\'envoie un lien par email'
  }
  const boutons: Record<Mode, string> = {
    connexion: 'Se connecter',
    inscription: "S'inscrire",
    reinitialisation: 'Envoyer le lien'
  }

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '60px 24px 40px' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: CREME_HEADER, margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="42" height="43" viewBox="0 0 366.66 376.67" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>{`.cls-1{stroke:${CREME_HEADER};stroke-width:4px;}.cls-1,.cls-2{stroke-miterlimit:10;}.cls-1,.cls-2,.cls-3{fill:${CREME_HEADER};}.cls-2{stroke:${MARINE};stroke-width:11px;}.cls-4{fill:${MARINE};}`}</style>
          </defs>
          <path className="cls-4" d="M354.99,232.54c-72.2,32.07-56.15,27.82-71.47-33.03C230.95-9.2,252.69-5.53,166.59,2.86,83.31,10.97-15.42,32.56,6.55,112.22c44.71,162.09,36.59,166.37,36.59,166.37,0,0-8.55-.63-29.61,16.14-40.57,32.31,8.41,113.27,169.56,68.06,186.54-52.33,201.04-143.21,171.9-130.26ZM271.04,260.6c-18.41,12.83-51.68,1.08-107.01-.03-63.34-1.27-125.8,24.28-111.03,16.12,53.77-29.67,240.48-31.74,218.04-16.09ZM264.77,293.15c-37.99,27.2-161.14-5.08-209.93,19.38-20.16,10.1-27.53,16.36,11.63,25.21,9.48,2.14-30.45,4.91-33.7-7.39-3.48-13.17,27.27-35.08,74.53-32.86,26.65,1.25,122.25,19.8,170.49-2.27,3.31-1.51-10.26-4.05-13.02-2.07Z" />
          <ellipse className="cls-2" cx="286.78" cy="251.61" rx="57.38" ry="101.3" transform="translate(-42.5 58.93) rotate(-10.93)" />
          <ellipse className="cls-2" cx="169.81" cy="270.99" rx="57.39" ry="101.27" transform="translate(-45.69 34.7) rotate(-10.29)" />
          <ellipse className="cls-4" cx="172.6" cy="253.73" rx="30" ry="48" />
          <ellipse className="cls-4" cx="288.6" cy="232.26" rx="30" ry="48" />
        </svg>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 800, color: MARINE, textAlign: 'center', marginBottom: 6 }}>{titres[mode]}</h1>
      <p style={{ fontSize: 14, color: TEXTE_CLAIR, textAlign: 'center', marginBottom: 32 }}>{sousTitres[mode]}</p>

      <div style={{ display: 'flex', alignItems: 'center', height: 52, borderRadius: 26, background: '#FFFFFF', padding: '0 18px', marginBottom: 12, boxShadow: '0 2px 8px rgba(27,58,99,0.06)' }}>
        <Mail size={16} color={TEXTE_CLAIR} />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginLeft: 10, fontSize: 14, color: MARINE, outline: 'none', flex: 1, background: 'transparent', border: 'none' }}
        />
      </div>

      {mode !== 'reinitialisation' && (
        <div style={{ display: 'flex', alignItems: 'center', height: 52, borderRadius: 26, background: '#FFFFFF', padding: '0 18px', marginBottom: 20, boxShadow: '0 2px 8px rgba(27,58,99,0.06)' }}>
          <Lock size={16} color={TEXTE_CLAIR} />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginLeft: 10, fontSize: 14, color: MARINE, outline: 'none', flex: 1, background: 'transparent', border: 'none' }}
          />
        </div>
      )}

      {mode === 'connexion' && (
        <p
          onClick={() => { setMode('reinitialisation'); setMessage('') }}
          style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, color: TEXTE_CLAIR, cursor: 'pointer', marginBottom: 20, marginTop: -8 }}
        >
          Mot de passe oublié ?
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={chargement}
        style={{ width: '100%', height: 54, borderRadius: 27, background: ORANGE, color: '#FFFFFF', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 'none', opacity: chargement ? 0.7 : 1 }}
      >
        {chargement ? 'Chargement...' : boutons[mode]}
        {!chargement && <ArrowRight size={18} />}
      </button>

      <p
        onClick={() => { setMode(mode === 'inscription' ? 'connexion' : mode === 'reinitialisation' ? 'connexion' : 'inscription'); setMessage('') }}
        style={{ marginTop: 18, textAlign: 'center', fontSize: 13, fontWeight: 600, color: MARINE, cursor: 'pointer' }}
      >
        {mode === 'reinitialisation' ? '← Retour à la connexion' : mode === 'inscription' ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}
      </p>

      {message && (
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: message.startsWith('Erreur') ? '#9E2418' : MARINE }}>
          {message}
        </p>
      )}
    </div>
  )
}
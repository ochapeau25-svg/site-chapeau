'use client'

import { useEffect, useState } from 'react'

const MARINE = '#1B3A63'

export default function Toast({ message, dureeMs = 2500 }: { message: string; dureeMs?: number }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), dureeMs)
    return () => clearTimeout(timer)
  }, [dureeMs])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: MARINE,
        color: '#FFFFFF',
        padding: '14px 24px',
        borderRadius: 999,
        fontSize: 14,
        fontWeight: 700,
        boxShadow: '0 8px 24px rgba(27,58,99,0.25)',
        zIndex: 100
      }}
    >
      {message}
    </div>
  )
}
'use client'

import { createClient } from './client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  console.log('🔑 useAuth inicializado')

  useEffect(() => {
    console.log('🔑 useAuth useEffect executado')

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔑 Sessão inicial obtida:', session ? { user: session.user ? 'exists' : null } : 'nenhuma sessão')
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔑 Mudança de estado de auth:', _event, session ? { user: session.user ? 'exists' : null } : 'nenhuma sessão')
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [router, supabase.auth])

  return {
    user,
    loading,
    signOut: async () => {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    },
  }
}


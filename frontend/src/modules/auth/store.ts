'use client'

import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: any | null
  session: any | null
  loading: boolean
}

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  setSession: (session: any) => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  loading: false,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, user: session?.user || null, loading: false })
  },

  login: async (email: string, password: string) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        set({ loading: false })
        return { error: error.message }
      }

      set({
        user: data.user,
        session: data.session,
        loading: false,
      })
      return {}
    } catch (err: any) {
      set({ loading: false })
      return { error: err.message }
    }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },

  setSession: (session: any) => {
    set({ session, user: session?.user || null })
  },
}))
'use client'

import { create } from 'zustand'
import { createSupabaseClient, setSupabaseClient, getSupabaseClient } from '@/lib/supabase'

interface AuthState {
  user: any | null
  session: any | null
  loading: boolean
  initialized: boolean
}

interface AuthStore extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ error?: string }>
  logout: () => Promise<void>
  setSession: (session: any) => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    set({ loading: true })
    
    // Check if we have a persistence preference stored
    const persistSession = sessionStorage.getItem('persistSession') !== 'false' // default true
    
    // Set the appropriate Supabase client based on preference
    const client = createSupabaseClient(persistSession)
    setSupabaseClient(client)
    
    const { data: { session } } = await client.auth.getSession()
    set({ session, user: session?.user || null, loading: false, initialized: true })
  },

  login: async (email: string, password: string, rememberMe: boolean = true) => {
    set({ loading: true })
    
    try {
      // Create client with appropriate persistence based on rememberMe
      const client = createSupabaseClient(rememberMe)
      setSupabaseClient(client)
      
      // Store preference for future sessions
      sessionStorage.setItem('persistSession', rememberMe ? 'true' : 'false')
      
      const { data, error } = await client.auth.signInWithPassword({
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
    const client = getSupabaseClient()
    await client.auth.signOut()
    set({ user: null, session: null })
    // Reset to default client (localStorage) after logout
    setSupabaseClient(createSupabaseClient(true))
    sessionStorage.removeItem('persistSession')
  },

  setSession: (session: any) => {
    set({ session, user: session?.user || null })
  },
}))
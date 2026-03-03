import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a client with custom persistence (sessionStorage for "don't remember")
export function createSupabaseClient(persistSession: boolean = true): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: persistSession ? undefined : {
        getItem: (key) => sessionStorage.getItem(key),
        setItem: (key, value) => sessionStorage.setItem(key, value),
        removeItem: (key) => sessionStorage.removeItem(key),
      },
    },
  })
}

// Mutable client reference
let currentClient: SupabaseClient = createSupabaseClient(true)

// Function to update the global client
export function setSupabaseClient(client: SupabaseClient) {
  currentClient = client
}

// Getter function to access the current client
export function getSupabaseClient(): SupabaseClient {
  return currentClient
}

// Create a Proxy that forwards all method calls to the current client
// This allows other modules to import `supabase` and always use the current client
const supabaseProxy = new Proxy(
  {},
  {
    get(_, prop) {
      const value = currentClient[prop as keyof SupabaseClient]
      if (typeof value === 'function') {
        return value.bind(currentClient)
      }
      return value
    },
    has(_, prop) {
      return prop in currentClient
    },
  }
) as SupabaseClient

export const supabase = supabaseProxy
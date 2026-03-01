import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zwfklojxdghhbeaqcyww.supabase.co'
const supabaseAnonKey = 'sb_publishable_j5pG83lhPvtFTPHTnhPBZA_v2InaKQn'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection
async function test() {
  try {
    const { data, error } = await supabase.auth.getSession()
    console.log('Session:', data)
    console.log('Error:', error)
  } catch (err) {
    console.error('Exception:', err)
  }
}

test()

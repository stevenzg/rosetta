'use client'

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabasePublicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY ?? ''

if (!supabaseUrl || !supabasePublicKey) {
  const missing = [
    !supabaseUrl && 'NEXT_PUBLIC_SUPABASE_URL',
    !supabasePublicKey && 'NEXT_PUBLIC_SUPABASE_PUBLIC_KEY',
  ].filter(Boolean)
  // eslint-disable-next-line no-console
  console.error(
    `Missing required Supabase environment variable(s): ${missing.join(', ')}. ` +
      'The Supabase client will not work correctly. ' +
      'Please set these in your .env.local file.'
  )
}

export function createClient() {
  return createBrowserClient(supabaseUrl, supabasePublicKey)
}

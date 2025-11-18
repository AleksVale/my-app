import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  console.log('🔄 Callback executado, código presente:', !!code)

  if (code) {
    const supabase = await createClient()
    console.log('🔄 Trocando código por sessão...')
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('🔄 Resultado da troca:', { user: data.user ? 'exists' : null, session: data.session ? 'exists' : null, error })
  }

  // URL to redirect to after sign in process completes
  console.log('🏠 Redirecionando para home após callback')
  return NextResponse.redirect(`${origin}/`)
}


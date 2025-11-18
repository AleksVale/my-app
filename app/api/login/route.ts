import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('❌ Server login error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    // Retornar sucesso - os cookies serão automaticamente salvos pelo Supabase
    return NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
      }
    })

  } catch (error) {
    console.error('❌ Server login exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          supabaseResponse = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  // Refresh the session by calling getUser(). This does NOT enforce authentication
  // on the /articles route — unauthenticated users can still view articles, relying
  // on Supabase RLS to restrict draft visibility. The server-side fetch in
  // articles/page.tsx runs without a user session and returns only publicly visible
  // rows (published articles). Authenticated users get their own drafts via the
  // client-side hook which has the session cookie attached.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoginPage = request.nextUrl.pathname === '/login'

  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/articles'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 관리자 페이지 경로만 체크
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    return res
  }

  // 다른 페이지는 인증 체크 없이 통과
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']  // admin 경로만 미들웨어 적용
} 
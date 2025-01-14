import { createClient } from '@supabase/supabase-js'

console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// Supabase 프로젝트 URL과 anon key를 환경변수에서 가져옴
// '!'는 TypeScript에게 해당 값이 반드시 존재함을 알려주는 표시
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Supabase 클라이언트 인스턴스 생성
// 이 인스턴스를 통해 데이터베이스 작업을 수행
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',  // PKCE 인증 플로우 사용
  },
})

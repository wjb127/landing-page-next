'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const inviteToken = hashParams.get('invite_token')

        if (inviteToken) {
          // 초대 토큰이 있으면 회원가입 페이지로
          router.push(`/auth/signup#invite_token=${inviteToken}`)
        } else {
          // 그 외의 경우 관리자 페이지로
          router.push('/admin')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/auth/error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">인증 처리 중...</h2>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  )
} 
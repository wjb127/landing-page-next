'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'

export default function Home() {
  const [email, setEmail] = useState('')
  const [isMarketingAgreed, setIsMarketingAgreed] = useState(false)
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  // 최신 PDF 파일 URL 가져오기
  useEffect(() => {
    const fetchLatestPdf = async () => {
      try {
        const { data, error } = await supabase
          .storage
          .from('pdf-files')
          .list('', {
            limit: 1,
            sortBy: { column: 'created_at', order: 'desc' }
          })

        if (error) throw error

        if (data && data.length > 0) {
          const { data: { publicUrl } } = supabase
            .storage
            .from('pdf-files')
            .getPublicUrl(data[0].name)

          setPdfUrl(publicUrl)
        }
      } catch (error) {
        console.error('Error fetching PDF:', error)
      }
    }

    fetchLatestPdf()
  }, [])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isPrivacyAgreed) {
      toast.error('개인정보 수집에 동의해주세요.')
      return
    }

    try {
      const result = await supabase
        .from('email_subscribers')
        .insert([
          { 
            email, 
            marketing_agreed: isMarketingAgreed,
            privacy_agreed: isPrivacyAgreed
          }
        ])
        .select()

      if (result.error) {
        console.error('Error:', result.error)
        throw result.error
      }

      // PDF 다운로드
      if (pdfUrl) {
        window.open(pdfUrl, '_blank')
      } else {
        toast.error('PDF 파일을 찾을 수 없습니다.')
        return
      }

      toast.success('PDF 다운로드가 시작됩니다!')
      setEmail('')
      setIsMarketingAgreed(false)
      setIsPrivacyAgreed(false)
    } catch (err) {
      console.error('Error:', err)
      toast.error('오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  const handlePaymentClick = async () => {
    try {
      const result = await supabase
        .from('payment_clicks')
        .insert([
          { 
            email: email || 'anonymous',
            clicked_at: new Date().toISOString()
          }
        ])
        .select()

      if (result.error) {
        console.error('Error:', result.error)
      }
      
      setShowPopup(true)
    } catch (error) {
      console.error('Click logging failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Toaster />
      
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-bold text-center text-gray-800 dark:text-white mb-8">
            무료 PDF로 시작해보세요!
          </h1>
          <p className="text-xl text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl">
            이메일 등록 후 상품 정보를 버튼으로 다운로드 받으세요.
          </p>

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="w-full max-w-md space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력해주세요"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isPrivacyAgreed}
                  onChange={(e) => setIsPrivacyAgreed(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  개인정보 수집 및 이용에 동의합니다. (필수)
                </span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isMarketingAgreed}
                  onChange={(e) => setIsMarketingAgreed(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  마케팅 정보 수신에 동의합니다. (선택)
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              PDF 다운로드하기
            </button>
          </form>

          {/* Payment Button */}
          <button
            onClick={handlePaymentClick}
            className="mt-8 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            프리미엄 멤버십 가입하기
          </button>
        </div>
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              죄송합니다
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              죄송합니다, 아직 결제 기능이 준비되지 않았습니다.
              지금은 PDF 자료를 받아보실 수 있습니다!
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Footer에 관리자 링크 추가 */}
      <footer className="py-4 text-center text-gray-500 text-sm">
        <p>© 2024 Your Company</p>
        <Link 
          href="/admin/login" 
          className="mt-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          관리자 로그인
        </Link>
      </footer>
    </div>
  )
}

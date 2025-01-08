'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Subscriber {
  id: string
  email: string
  marketing_agreed: boolean
  privacy_agreed: boolean
  created_at: string
}

interface PaymentClick {
  id: string
  email: string
  clicked_at: string
}

export default function AdminDashboard() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [paymentClicks, setPaymentClicks] = useState<PaymentClick[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // 이메일 구독자 데이터 가져오기
      const { data: subscriberData, error: subscriberError } = await supabase
        .from('email_subscribers')
        .select('*')
        .order('created_at', { ascending: false })

      if (subscriberError) throw subscriberError

      // 결제 클릭 데이터 가져오기
      const { data: clickData, error: clickError } = await supabase
        .from('payment_clicks')
        .select('*')
        .order('clicked_at', { ascending: false })

      if (clickError) throw clickError

      setSubscribers(subscriberData)
      setPaymentClicks(clickData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
          관리자 대시보드
        </h1>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
              총 구독자 수
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {subscribers.length}명
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
              총 결제 시도 수
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {paymentClicks.length}회
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
              마케팅 동의율
            </h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {subscribers.length > 0
                ? Math.round((subscribers.filter(s => s.marketing_agreed).length / subscribers.length) * 100)
                : 0}%
            </p>
          </div>
        </div>

        {/* 구독자 목록 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              구독자 목록
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left p-3">이메일</th>
                    <th className="text-left p-3">마케팅 동의</th>
                    <th className="text-left p-3">가입일</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="border-b dark:border-gray-700">
                      <td className="p-3">{subscriber.email}</td>
                      <td className="p-3">
                        {subscriber.marketing_agreed ? '동의' : '미동의'}
                      </td>
                      <td className="p-3">{formatDate(subscriber.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 결제 시도 로그 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              결제 시도 로그
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left p-3">이메일</th>
                    <th className="text-left p-3">시도 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentClicks.map((click) => (
                    <tr key={click.id} className="border-b dark:border-gray-700">
                      <td className="p-3">{click.email}</td>
                      <td className="p-3">{formatDate(click.clicked_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
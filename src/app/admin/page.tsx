'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { User } from '@supabase/supabase-js'

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

interface FileInfo {
  name: string
  url: string
  created_at: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [paymentClicks, setPaymentClicks] = useState<PaymentClick[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [files, setFiles] = useState<FileInfo[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const checkUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/admin/login')
        return
      }

      setUser(user)
      fetchData()
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/admin/login')
    }
  }, [router])

  useEffect(() => {
    checkUser()
  }, [checkUser])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/admin/login')
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('로그아웃 중 오류가 발생했습니다.')
    }
  }

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

      if (subscriberError) {
        console.error('Subscriber fetch error:', subscriberError)
        throw subscriberError
      }

      console.log('Fetched subscribers:', subscriberData) // 데이터 로깅

      // 결제 클릭 데이터 가져오기
      const { data: clickData, error: clickError } = await supabase
        .from('payment_clicks')
        .select('*')
        .order('clicked_at', { ascending: false })

      if (clickError) {
        console.error('Payment clicks fetch error:', clickError)
        throw clickError
      }

      console.log('Fetched payment clicks:', clickData) // 데이터 로깅

      setSubscribers(subscriberData || [])
      setPaymentClicks(clickData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .storage
        .from('pdf-files')
        .list()

      if (error) throw error

      const filesWithUrls = await Promise.all(
        data.map(async (file) => {
          const { data: { publicUrl } } = supabase
            .storage
            .from('pdf-files')
            .getPublicUrl(file.name)

          return {
            name: file.name,
            url: publicUrl,
            created_at: file.created_at
          }
        })
      )

      setFiles(filesWithUrls)
    } catch (error) {
      console.error('Error fetching files:', error)
      toast.error('파일 목록을 불러오는데 실패했습니다.')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null)
      return
    }
    setSelectedFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('파일을 선택해주세요.')
      return
    }

    try {
      setUploading(true)
      
      const { error } = await supabase
        .storage
        .from('pdf-files')
        .upload(`product-guide-${Date.now()}.pdf`, selectedFile, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) throw error

      toast.success('파일이 업로드되었습니다.')
      fetchFiles() // 파일 목록 새로고침
      setSelectedFile(null) // 선택된 파일 초기화
      
      // 파일 input 초기화
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('파일 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileDelete = async (fileName: string) => {
    try {
      const { error } = await supabase
        .storage
        .from('pdf-files')
        .remove([fileName])

      if (error) throw error

      toast.success('파일이 삭제되었습니다.')
      fetchFiles() // 파일 목록 새로고침
    } catch (error) {
      console.error('Error deleting file:', error)
      toast.error('파일 삭제에 실패했습니다.')
    }
  }

  useEffect(() => {
    if (user) {
      fetchFiles()
    }
  }, [user])

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
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">로딩 중...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            관리자 대시보드
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-gray-300">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              로그아웃
            </button>
          </div>
        </div>

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

        {/* 파일 업로드 섹션 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              PDF 파일 관리
            </h2>
            
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex-1">
                  <span className="sr-only">PDF 파일 선택</span>
                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </label>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg
                    hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? '업로드 중...' : '업로드'}
                </button>
              </div>
              {selectedFile && (
                <p className="text-sm text-gray-600">
                  선택된 파일: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left p-3">파일명</th>
                    <th className="text-left p-3">업로드 일시</th>
                    <th className="text-left p-3">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.name} className="border-b dark:border-gray-700">
                      <td className="p-3">{file.name}</td>
                      <td className="p-3">
                        {new Date(file.created_at).toLocaleString('ko-KR')}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleFileDelete(file.name)}
                          className="text-red-600 hover:text-red-800"
                        >
                          삭제
                        </button>
                      </td>
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
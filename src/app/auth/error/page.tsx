export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">인증 오류</h2>
        <p className="text-gray-600 mb-4">
          인증 처리 중 문제가 발생했습니다.
        </p>
        <a 
          href="/admin/login"
          className="text-blue-600 hover:underline"
        >
          로그인 페이지로 돌아가기
        </a>
      </div>
    </div>
  )
} 
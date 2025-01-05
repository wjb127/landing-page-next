export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-bold text-center text-gray-800 dark:text-white mb-8">
            당신의 비즈니스를 위한
            <span className="text-blue-600 dark:text-blue-400"> 최고의 솔루션</span>
          </h1>
          <p className="text-xl text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl">
            혁신적인 기술과 전문적인 서비스로 비즈니스의 성장을 함께 만들어갑니다.
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              시작하기
            </button>
            <button className="px-8 py-3 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors">
              더 알아보기
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "빠른 개발",
                description: "최신 기술로 신속한 개발과 배포를 지원합니다."
              },
              {
                title: "확장성",
                description: "비즈니스 성장에 맞춰 유연하게 확장 가능합니다."
              },
              {
                title: "보안",
                description: "철저한 보안 시스템으로 데이터를 안전하게 보호합니다."
              }
            ].map((feature, index) => (
              <div key={index} className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
            지금 바로 시작하세요
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            무료로 체험해보세요. 설치나 신용카드가 필요하지 않습니다.
          </p>
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            무료로 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}

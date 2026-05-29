import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-subtle">
      <p className="text-6xl font-bold text-text-primary mb-4">404</p>
      <p className="text-lg text-text-secondary mb-8">페이지를 찾을 수 없습니다</p>
      <Link
        to="/"
        className="px-6 py-2 text-sm font-medium text-white bg-[#4A7AAF] rounded-[10px] hover:bg-[#3A6A9F] transition-colors"
      >
        홈으로 가기
      </Link>
    </div>
  );
}

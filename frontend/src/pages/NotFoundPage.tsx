import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB]">
      <p className="text-6xl font-bold text-[#111827] mb-4">404</p>
      <p className="text-lg text-[#6B7280] mb-8">페이지를 찾을 수 없습니다</p>
      <Link
        to="/"
        className="px-6 py-2 text-sm font-medium text-white bg-[#111827] rounded-[10px] hover:bg-[#374151] transition-colors"
      >
        홈으로 가기
      </Link>
    </div>
  );
}

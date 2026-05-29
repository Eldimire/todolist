import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useLogout } from '../../hooks/useAuth';

export function Header() {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <header className="h-14 bg-bg-base border-b border-[#A3BDD8] flex items-center justify-between px-4 md:px-8">
      <Link to="/" className="text-lg font-bold text-text-primary">
        TodoList
      </Link>

      {/* 태블릿/데스크톱 네비게이션 */}
      <nav className="hidden md:flex items-center gap-4">
        {user && (
          <span className="text-sm text-text-secondary">
            안녕하세요, {user.name}님
          </span>
        )}
        <Link
          to="/profile"
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          내 정보 수정
        </Link>
        <button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
        >
          로그아웃
        </button>
      </nav>

      {/* 모바일 햄버거 버튼 */}
      <button
        className="md:hidden p-2 text-text-primary text-xl leading-none"
        onClick={() => setDrawerOpen(true)}
        aria-label="메뉴 열기"
      >
        ☰
      </button>

      {/* 모바일 드로어 */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-64 bg-bg-base z-50 shadow-lg md:hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#A3BDD8]">
              <span className="font-bold text-text-primary">메뉴</span>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="메뉴 닫기"
                className="text-text-secondary text-xl leading-none"
              >
                ✕
              </button>
            </div>
            {user && (
              <p className="px-5 py-3 text-sm text-text-secondary border-b border-[#A3BDD8]">
                안녕하세요, {user.name}님
              </p>
            )}
            <nav className="flex flex-col px-5 pt-2">
              <Link
                to="/profile"
                onClick={() => setDrawerOpen(false)}
                className="py-3 text-sm text-text-primary hover:text-text-primary transition-colors border-b border-[#A3BDD8]"
              >
                내 정보 수정
              </Link>
              <button
                onClick={() => { setDrawerOpen(false); logoutMutation.mutate(); }}
                disabled={logoutMutation.isPending}
                className="py-3 text-left text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
              >
                로그아웃
              </button>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

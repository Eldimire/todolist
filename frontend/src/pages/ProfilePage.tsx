import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { CategoryList } from '../components/category/CategoryList';
import { useUpdateProfile, useLogout } from '../hooks/useAuth';
import { useAuthStore } from '../stores/authStore';
import { parseApiError, getErrorMessage } from '../utils/errorHandler';
import { isNotEmpty, isValidPassword } from '../utils/validation';

interface FormErrors {
  name?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [name, setName] = useState(user?.name ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const updateMutation = useUpdateProfile();
  const logoutMutation = useLogout();

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!isNotEmpty(name)) newErrors.name = '이름은 필수 입력 항목입니다.';
    if (password && !isValidPassword(password)) newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    if (password && password !== confirmPassword) newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      name: name.trim(),
      ...(password ? { password } : {}),
    };

    updateMutation.mutate(data, {
      onSuccess: () => navigate('/'),
      onError: (err) => {
        const { code } = parseApiError(err);
        setErrors({ form: getErrorMessage(code) });
      },
    });
  }

  return (
    <MainLayout>
      <div className="max-w-[520px] mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          ← 목록으로
        </button>

        <div className="bg-white border border-[#E5E7EB] rounded-[14px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-6">
          <h1 className="text-lg font-bold text-[#111827] mb-6">내 정보 수정</h1>

          {errors.form && (
            <p role="alert" className="mb-4 text-sm text-red-500">
              {errors.form}
            </p>
          )}

          <div className="mb-4">
            <p className="text-xs font-medium text-[#6B7280] mb-1">현재 이메일 (변경 불가)</p>
            <p className="text-sm text-[#111827]">{user?.email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#374151] mb-1">
                이름
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-[10px] text-sm text-[#111827] outline-none focus:border-[#9CA3AF] transition-colors ${
                  errors.name ? 'border-red-400' : 'border-[#E5E7EB]'
                }`}
              />
              {errors.name && (
                <p role="alert" className="mt-1 text-xs text-red-500">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#374151] mb-1">
                새 비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="변경 시에만 입력"
                className={`w-full px-3 py-2 border rounded-[10px] text-sm text-[#111827] outline-none focus:border-[#9CA3AF] transition-colors ${
                  errors.password ? 'border-red-400' : 'border-[#E5E7EB]'
                }`}
              />
              {errors.password && (
                <p role="alert" className="mt-1 text-xs text-red-500">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#374151] mb-1">
                새 비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-[10px] text-sm text-[#111827] outline-none focus:border-[#9CA3AF] transition-colors ${
                  errors.confirmPassword ? 'border-red-400' : 'border-[#E5E7EB]'
                }`}
              />
              {errors.confirmPassword && (
                <p role="alert" className="mt-1 text-xs text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 text-sm font-medium text-[#374151] border border-[#E5E7EB] rounded-[10px] hover:bg-[#F8F8F8] transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-[#111827] rounded-[10px] hover:bg-[#374151] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updateMutation.isPending ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-[14px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-6">
          <h2 className="text-base font-semibold text-[#111827] mb-4">카테고리 관리</h2>
          <CategoryList />
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-red-500 border border-red-200 rounded-[10px] hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    </MainLayout>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../../hooks/useAuth';
import { isValidEmail, isValidPassword, isNotEmpty } from '../../utils/validation';
import { parseApiError, getErrorMessage } from '../../utils/errorHandler';

interface FormErrors {
  email?: string;
  password?: string;
  form?: string;
}

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const loginMutation = useLogin();

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!isNotEmpty(email)) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!isValidEmail(email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }
    if (!isNotEmpty(password)) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (!isValidPassword(password)) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    loginMutation.mutate({ email, password });
  }

  const apiErrorMsg = loginMutation.isError
    ? getErrorMessage(parseApiError(loginMutation.error).code)
    : null;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-4">
        <label
          htmlFor="login-email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          이메일
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일을 입력하세요"
          autoComplete="email"
          className="w-full px-3 py-2 border border-gray-200 rounded-[10px] text-sm outline-none focus:border-blue-400"
        />
        {errors.email && (
          <p role="alert" className="mt-1 text-xs text-red-500">
            {errors.email}
          </p>
        )}
      </div>

      <div className="mb-6">
        <label
          htmlFor="login-password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          비밀번호
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호를 입력하세요"
          autoComplete="current-password"
          className="w-full px-3 py-2 border border-gray-200 rounded-[10px] text-sm outline-none focus:border-blue-400"
        />
        {errors.password && (
          <p role="alert" className="mt-1 text-xs text-red-500">
            {errors.password}
          </p>
        )}
      </div>

      {(errors.form || apiErrorMsg) && (
        <p role="alert" className="mb-4 text-sm text-red-500 text-center">
          {errors.form || apiErrorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-[10px] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loginMutation.isPending ? '로그인 중...' : '로그인'}
      </button>

      <p className="mt-4 text-center text-sm text-gray-500">
        계정이 없으신가요?{' '}
        <Link to="/signup" className="text-blue-600 font-medium hover:underline">
          회원가입
        </Link>
      </p>
    </form>
  );
}

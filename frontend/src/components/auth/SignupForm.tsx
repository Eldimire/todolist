import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSignup } from '../../hooks/useAuth';
import { isValidEmail, isValidPassword, isNotEmpty } from '../../utils/validation';
import { parseApiError, getErrorMessage } from '../../utils/errorHandler';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

export function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const signupMutation = useSignup();

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!isNotEmpty(name)) {
      newErrors.name = '이름을 입력해주세요.';
    }
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
    if (!isNotEmpty(confirmPassword)) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    signupMutation.mutate(
      { email, password, name },
      {
        onError: (error) => {
          const { code } = parseApiError(error);
          setErrors({ form: getErrorMessage(code) });
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-4">
        <label
          htmlFor="signup-name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          이름
        </label>
        <input
          id="signup-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력하세요"
          autoComplete="name"
          className="w-full px-3 py-2 border border-gray-200 rounded-[10px] text-sm outline-none focus:border-blue-400"
        />
        {errors.name && (
          <p role="alert" className="mt-1 text-xs text-red-500">
            {errors.name}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="signup-email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          이메일
        </label>
        <input
          id="signup-email"
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

      <div className="mb-4">
        <label
          htmlFor="signup-password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          비밀번호
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="8자 이상 입력하세요"
          autoComplete="new-password"
          className="w-full px-3 py-2 border border-gray-200 rounded-[10px] text-sm outline-none focus:border-blue-400"
        />
        {errors.password && (
          <p role="alert" className="mt-1 text-xs text-red-500">
            {errors.password}
          </p>
        )}
      </div>

      <div className="mb-6">
        <label
          htmlFor="signup-confirm-password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          비밀번호 확인
        </label>
        <input
          id="signup-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="비밀번호를 다시 입력하세요"
          autoComplete="new-password"
          className="w-full px-3 py-2 border border-gray-200 rounded-[10px] text-sm outline-none focus:border-blue-400"
        />
        {errors.confirmPassword && (
          <p role="alert" className="mt-1 text-xs text-red-500">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {errors.form && (
        <p role="alert" className="mb-4 text-sm text-red-500 text-center">
          {errors.form}
        </p>
      )}

      <button
        type="submit"
        disabled={signupMutation.isPending}
        className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-[10px] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {signupMutation.isPending ? '가입 중...' : '가입하기'}
      </button>

      <p className="mt-4 text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="text-blue-600 font-medium hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}

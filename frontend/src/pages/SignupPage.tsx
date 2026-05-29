import { AuthLayout } from '../components/layout/AuthLayout';
import { SignupForm } from '../components/auth/SignupForm';

export function SignupPage() {
  return (
    <AuthLayout title="회원가입">
      <SignupForm />
    </AuthLayout>
  );
}

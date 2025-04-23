
interface AuthErrorProps {
  error: string | null;
}
const AuthError: React.FC<AuthErrorProps> = ({ error }) =>
  error ? <div className="mt-3 text-red-500 text-sm text-center">{error}</div> : null;
export default AuthError;

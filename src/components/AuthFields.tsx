
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthFieldsProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  loading: boolean;
  variant: "login" | "signup";
}

const AuthFields: React.FC<AuthFieldsProps> = ({
  email, setEmail, password, setPassword, loading, variant
}) => (
  <>
    <div>
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
    </div>
    <div>
      <Label htmlFor="password">Password</Label>
      <Input
        id="password"
        type="password"
        autoComplete={variant === "login" ? "current-password" : "new-password"}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
    </div>
  </>
);

export default AuthFields;

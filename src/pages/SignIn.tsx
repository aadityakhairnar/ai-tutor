
import { SignIn as ClerkSignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl mb-2">Welcome back to <span className="text-primary">acampus<span className="text-accent-foreground">ai</span></span></h1>
          <p className="text-muted-foreground">Sign in to continue your learning journey</p>
        </div>
        <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          <ClerkSignIn 
            routing="path" 
            path="/sign-in" 
            signUpUrl="/sign-up"
            afterSignInUrl="/dashboard"
            redirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
};

export default SignIn;

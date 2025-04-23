
import { SignUp as ClerkSignUp } from "@clerk/clerk-react";

const SignUp = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl mb-2">Join <span className="text-primary">acampus<span className="text-accent-foreground">ai</span></span> today</h1>
          <p className="text-muted-foreground">Create an account to start your learning journey</p>
        </div>
        <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          <ClerkSignUp 
            routing="path" 
            path="/sign-up" 
            signInUrl="/sign-in"
            afterSignUpUrl="/dashboard"
            redirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
};

export default SignUp;

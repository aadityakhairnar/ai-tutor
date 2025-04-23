
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";

const CreateTestUser = () => {
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createTestUser = async () => {
    setCreating(true);
    setMessage(null);
    setError(null);

    try {
      // Create a test user
      const testEmail = "test@example.com";
      const testPassword = "Test12345!";

      const { data, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (signupError) {
        console.error("Error creating test user:", signupError.message);
        setError(`Failed to create test user: ${signupError.message}`);
      } else if (data.user) {
        console.log("Test user created successfully", data.user);
        setMessage(`Test user created successfully! Email: ${testEmail}, Password: ${testPassword}`);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t">
      <h3 className="text-sm font-medium mb-2">Create Test User</h3>
      <Button 
        onClick={createTestUser}
        disabled={creating}
        size="sm"
        variant="outline"
        className="w-full"
      >
        {creating ? "Creating..." : "Create Test User"}
      </Button>
      
      {message && <p className="mt-2 text-xs text-green-600">{message}</p>}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default CreateTestUser;

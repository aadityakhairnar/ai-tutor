
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

const CreateTestUser = () => {
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const createTestUser = async () => {
    setCreating(true);

    try {
      // Use a more robust email format
      const testEmail = "test_user@example.com";
      const testPassword = "Test12345!";

      const { data, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (signupError) {
        console.error("Error creating test user:", signupError.message);
        toast({
          title: "Error",
          description: `Failed to create test user: ${signupError.message}`,
          variant: "destructive"
        });
      } else if (data.user) {
        console.log("Test user created successfully", data.user);
        toast({
          title: "Success",
          description: `Test user created successfully! Email: ${testEmail}`
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred while creating the test user",
        variant: "destructive"
      });
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
    </div>
  );
};

export default CreateTestUser;

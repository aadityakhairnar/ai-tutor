import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UserPreferencesForm } from '@/components/UserPreferencesForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface UserPreferences {
  id: string;
  user_id: string;
  education_level: string;
  age: number;
  content_tone: string;
  experience_level: string;
  interested_topics: string[];
  created_at: string;
  updated_at: string;
}

const Profile = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw error;
        }

        setPreferences(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isEditing || !preferences) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">
              {preferences ? 'Edit Profile' : 'Complete Your Profile'}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {preferences 
                ? 'Update your preferences to improve your learning experience'
                : 'Tell us about yourself to personalize your learning journey'}
            </p>
          </div>
          <UserPreferencesForm onSuccess={() => {
            setIsEditing(false);
            // Refresh the page to show updated preferences
            window.location.reload();
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Profile</h2>
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Education Level</h3>
              <p className="mt-1">{preferences.education_level}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Age</h3>
              <p className="mt-1">{preferences.age} years</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Preferred Content Tone</h3>
              <p className="mt-1">{preferences.content_tone}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Experience Level</h3>
              <p className="mt-1">{preferences.experience_level}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Interested Topics</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {preferences.interested_topics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
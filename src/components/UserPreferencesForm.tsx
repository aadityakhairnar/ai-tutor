import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const educationLevels = [
  'High School',
  'Undergraduate',
  'Graduate',
  'PhD',
  'Professional'
];

const contentTones = [
  'Formal',
  'Casual',
  'Technical',
  'Conversational',
  'Academic'
];

const experienceLevels = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert'
];

const topics = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Engineering',
  'Business',
  'Humanities',
  'Social Sciences',
  'Languages'
];

interface UserPreferencesFormProps {
  onSuccess?: () => void;
  initialValues?: {
    education_level: string;
    age: number;
    content_tone: string;
    experience_level: string;
    interested_topics: string[];
  };
}

export const UserPreferencesForm = ({ onSuccess, initialValues }: UserPreferencesFormProps) => {
  const [loading, setLoading] = useState(false);
  const [educationLevel, setEducationLevel] = useState(initialValues?.education_level || '');
  const [age, setAge] = useState(initialValues?.age?.toString() || '');
  const [contentTone, setContentTone] = useState(initialValues?.content_tone || '');
  const [experienceLevel, setExperienceLevel] = useState(initialValues?.experience_level || '');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(initialValues?.interested_topics || []);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          education_level: educationLevel,
          age: parseInt(age),
          content_tone: contentTone,
          experience_level: experienceLevel,
          interested_topics: selectedTopics,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your preferences have been saved.",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
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

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto p-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="education">Education Level</Label>
          <Select value={educationLevel} onValueChange={setEducationLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Select your education level" />
            </SelectTrigger>
            <SelectContent>
              {educationLevels.map(level => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            min="13"
            max="100"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter your age"
          />
        </div>

        <div>
          <Label htmlFor="contentTone">Preferred Content Tone</Label>
          <Select value={contentTone} onValueChange={setContentTone}>
            <SelectTrigger>
              <SelectValue placeholder="Select preferred content tone" />
            </SelectTrigger>
            <SelectContent>
              {contentTones.map(tone => (
                <SelectItem key={tone} value={tone}>
                  {tone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="experience">Experience Level</Label>
          <Select value={experienceLevel} onValueChange={setExperienceLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              {experienceLevels.map(level => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Interested Topics</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {topics.map(topic => (
              <Button
                key={topic}
                type="button"
                variant={selectedTopics.includes(topic) ? "default" : "outline"}
                onClick={() => toggleTopic(topic)}
                className="justify-start"
              >
                {topic}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : 'Save Preferences'}
      </Button>
    </form>
  );
}; 
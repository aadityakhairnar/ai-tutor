import { toast } from "sonner";
import { getOpenAIKey } from "./openai";
import { supabase } from "@/integrations/supabase/client";

const API_URL = 'https://api.openai.com/v1/chat/completions';

interface UserPreferences {
  education_level: string;
  age: number;
  content_tone: string;
  experience_level: string;
  interested_topics: string[];
}

const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return null;
  }
};

export const generateChapterContent = async (chapterTitle: string, chapterDescription: string, userId: string): Promise<string> => {
  const apiKey = getOpenAIKey();
  
  if (!apiKey) {
    toast.error("OpenAI API key is not set. Please enter your API key in settings.");
    throw new Error("OpenAI API key is not set");
  }

  // Get user preferences
  const preferences = await getUserPreferences(userId);
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert educational content creator specialized in creating comprehensive, engaging and educational content. 
            Format your response with clear headings, paragraphs, and use proper markdown for any mathematical formulas, code blocks, or specialized notation.
            ${preferences ? `
            Consider the following user preferences when creating content:
            - Education Level: ${preferences.education_level}
            - Age: ${preferences.age} years
            - Preferred Content Tone: ${preferences.content_tone}
            - Experience Level: ${preferences.experience_level}
            - Interested Topics: ${preferences.interested_topics.join(', ')}
            
            Adjust your content accordingly:
            - Use appropriate complexity based on education and experience level
            - Match the preferred content tone
            - Include examples and references relevant to the user's age
            - Connect concepts to the user's interested topics where possible
            - Use age-appropriate language and examples
            ` : ''}`
          },
          {
            role: "user",
            content: `Create detailed educational content for a chapter titled "${chapterTitle}" with the following description: "${chapterDescription}".
            
            You are a patient, thorough, and engaging instructor. Teach this topic completely as if you're teaching a class, covering:
            - A conversational introduction to the topic
            - All core concepts explained in detail with simple examples first, then more complex ones
            - Detailed breakdown of all important theories, principles and formulas
            - Step-by-step explanations with worked examples where applicable
            - Any relevant mathematical formulas properly formatted in LaTeX (e.g. $E=mc^2$)
            - Code examples if relevant (in appropriate language for the topic)
            - Clear descriptions of any diagrams or visual concepts
            - Practical applications and real-world relevance
            - Historical context and development of key ideas
            - Key takeaways and summary
            - Questions to test understanding
            
            Format your response with proper markdown:
            - Use # for main headings, ## for subheadings, etc.
            - Use **bold** and *italic* for emphasis
            - Use LaTeX formatting for mathematical equations ($...$ for inline, $$...$$) for block equations)
            - Use proper code blocks with language specification
            
            The content should be comprehensive, educational, engaging and suitable for the user's level.`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to generate content");
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error("Error generating chapter content:", error);
    toast.error("Failed to generate content. Please try again.");
    throw error;
  }
};

export interface FlashcardData {
  front: string;
  back: string;
}

export const generateFlashcards = async (chapterContent: string, userId: string): Promise<Array<{ question: string; answer: string }>> => {
  const apiKey = getOpenAIKey();
  
  if (!apiKey) {
    toast.error("OpenAI API key is not set. Please enter your API key in settings.");
    throw new Error("OpenAI API key is not set");
  }

  // Get user preferences
  const preferences = await getUserPreferences(userId);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert educational content creator specialized in creating effective flashcards.
            ${preferences ? `
            Consider the following user preferences when creating flashcards:
            - Education Level: ${preferences.education_level}
            - Age: ${preferences.age} years
            - Experience Level: ${preferences.experience_level}
            
            Adjust your flashcards accordingly:
            - Use appropriate complexity based on education and experience level
            - Use age-appropriate language and examples
            - Focus on key concepts that match the user's learning level
            ` : ''}`
          },
          {
            role: "user",
            content: `Create a set of flashcards based on this chapter content. For each flashcard:
            - Create a clear, concise question that tests understanding
            - Provide a detailed, educational answer
            - Include examples where appropriate
            - Use proper markdown formatting for any mathematical formulas or code
            
            Chapter content:
            ${chapterContent}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to generate flashcards");
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the response into flashcards
    const flashcards = content.split('\n\n').map(card => {
      const [question, answer] = card.split('\n').filter(line => line.trim());
      return { question, answer };
    });
    
    return flashcards;
    
  } catch (error) {
    console.error("Error generating flashcards:", error);
    toast.error("Failed to generate flashcards. Please try again.");
    throw error;
  }
};

export interface TestQuestionData {
  question: string;
  options: string[];
  correctAnswer: number;
}

export const generateTestQuestions = async (chapterContent: string, userId: string): Promise<Array<{ question: string; options: string[]; correctAnswer: string }>> => {
  const apiKey = getOpenAIKey();
  
  if (!apiKey) {
    toast.error("OpenAI API key is not set. Please enter your API key in settings.");
    throw new Error("OpenAI API key is not set");
  }

  // Get user preferences
  const preferences = await getUserPreferences(userId);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert educational content creator specialized in creating effective test questions.
            ${preferences ? `
            Consider the following user preferences when creating test questions:
            - Education Level: ${preferences.education_level}
            - Age: ${preferences.age} years
            - Experience Level: ${preferences.experience_level}
            
            Adjust your questions accordingly:
            - Use appropriate complexity based on education and experience level
            - Use age-appropriate language and examples
            - Create questions that match the user's learning level
            - Include a mix of difficulty levels appropriate for the user
            ` : ''}`
          },
          {
            role: "user",
            content: `Create a set of multiple choice questions based on this chapter content. For each question:
            - Create a clear, well-structured question
            - Provide 4 options (A, B, C, D)
            - Mark the correct answer
            - Use proper markdown formatting for any mathematical formulas or code
            
            Chapter content:
            ${chapterContent}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to generate test questions");
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the response into test questions
    const questions = content.split('\n\n').map(q => {
      const lines = q.split('\n').filter(line => line.trim());
      const question = lines[0];
      const options = lines.slice(1, 5);
      const correctAnswer = lines[5]?.match(/Correct: ([A-D])/)?.[1] || 'A';
      return { question, options, correctAnswer };
    });
    
    return questions;
    
  } catch (error) {
    console.error("Error generating test questions:", error);
    toast.error("Failed to generate test questions. Please try again.");
    throw error;
  }
};

export const getAnswerExplanation = async (
  question: string,
  userAnswer: string,
  correctAnswer: string
): Promise<string> => {
  const apiKey = getOpenAIKey();
  
  if (!apiKey) {
    toast.error("OpenAI API key is not set. Please enter your API key in settings.");
    throw new Error("OpenAI API key is not set");
  }
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert educational assistant. Your task is to provide clear, concise explanations for test questions, helping students understand why their answer was incorrect and why the correct answer is right."
          },
          {
            role: "user",
            content: `I answered a test question incorrectly. Please explain why my answer was wrong and why the correct answer is right.
            
            Question: "${question}"
            My answer: "${userAnswer}"
            Correct answer: "${correctAnswer}"
            
            Provide a detailed but concise explanation that helps me understand the concept better.`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to generate explanation");
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error("Error generating answer explanation:", error);
    toast.error("Failed to generate explanation. Please try again.");
    throw error;
  }
};

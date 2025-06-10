import { toast } from "sonner";

const API_URL = 'https://api.openai.com/v1/chat/completions';

// Get API key from localStorage or environment variable
export const getOpenAIKey = () => {
  return localStorage.getItem('openai_key') || '';
};

export const setOpenAIKey = (key: string) => {
  localStorage.setItem('openai_key', key);
};

export interface SyllabusChapter {
  title: string;
  content: string;
}

export const generateSyllabus = async (topic: string): Promise<SyllabusChapter[]> => {
  const apiKey = getOpenAIKey();
  
  if (!apiKey) {
    toast.error("OpenAI API key is not set. Please set your API key in settings.");
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
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert educational content creator specialized in creating comprehensive course syllabi. Structure your response as a JSON array without any additional text."
          },
          {
            role: "user",
            content: `Create a detailed syllabus for learning about "${topic}". 
            Return a JSON array of chapters, where each chapter has a "title" and "content" fields. 
            The content should be a comprehensive overview of what will be covered in that chapter.
            Include 8-12 chapters that cover the topic thoroughly from beginner to advanced concepts.
            Format your response ONLY as a valid JSON array, with no additional explanations or text outside the JSON.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to generate syllabus");
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const cleanedContent = content.replace(/```json\n|\n```|```/g, '');
      console.log("Cleaned content for parsing:", cleanedContent);
      
      const syllabusContent = JSON.parse(cleanedContent);
      if (Array.isArray(syllabusContent)) {
        return syllabusContent;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (e) {
      console.error("Failed to parse syllabus JSON:", content);
      throw new Error("Failed to parse syllabus data");
    }
  } catch (error) {
    console.error("Error generating syllabus:", error);
    toast.error("Failed to generate syllabus. Please try again.");
    throw error;
  }
}; 

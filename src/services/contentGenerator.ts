import { toast } from "sonner";
import { getOpenAIKey } from "./openai";

const API_URL = 'https://api.openai.com/v1/chat/completions';

export const generateChapterContent = async (chapterTitle: string, chapterDescription: string): Promise<string> => {
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
            content: "You are an expert educational content creator specialized in creating comprehensive, engaging and educational content. Format your response with clear headings, paragraphs, and use proper markdown for any mathematical formulas, code blocks, or specialized notation."
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
            
            The content should be comprehensive, educational, engaging and suitable for learners at various levels.`
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
    toast.error("Failed to generate chapter content. Please try again.");
    throw error;
  }
};

export interface FlashcardData {
  front: string;
  back: string;
}

export const generateFlashcards = async (chapterTitle: string, chapterContent: string): Promise<FlashcardData[]> => {
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
            content: "You are an expert educational flashcard creator. Your task is to create effective flashcards that help students learn and recall key information. Respond with only the JSON array of flashcards, with no additional text."
          },
          {
            role: "user",
            content: `Create 5 educational flashcards for the topic: "${chapterTitle}".
            
            If provided, use this content as reference: "${chapterContent.substring(0, 3000)}..."
            
            Each flashcard should have:
            1. A clear, concise question or term on the front
            2. A comprehensive but concise answer or explanation on the back
            
            Format your response as a JSON array of objects with "front" and "back" properties.
            Example format:
            [
              {
                "front": "What is photosynthesis?",
                "back": "The process by which green plants and some other organisms use sunlight to synthesize nutrients from carbon dioxide and water."
              },
              ...
            ]
            
            Make sure your flashcards:
            - Cover the most important concepts from the topic
            - Are well-phrased and educational
            - Encourage critical thinking
            - Have a clear connection between front and back sides
            
            Return ONLY a valid JSON array, no additional explanation or text.`
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
    
    // Parse the JSON response
    try {
      // Clean the response: Remove markdown code blocks if present
      const cleanedContent = content.replace(/```json\n|\n```|```/g, '');
      console.log("Cleaned flashcard content for parsing:", cleanedContent);
      
      const flashcards = JSON.parse(cleanedContent);
      if (Array.isArray(flashcards)) {
        return flashcards;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (e) {
      console.error("Failed to parse flashcards JSON:", content);
      throw new Error("Failed to parse flashcard data");
    }
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

export const generateTestQuestions = async (chapterTitle: string, chapterContent: string, count: number = 5): Promise<TestQuestionData[]> => {
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
            content: "You are an expert educational test creator. Your task is to create effective multiple-choice test questions that accurately assess student knowledge. Respond with only the JSON array of questions, with no additional text."
          },
          {
            role: "user",
            content: `Create ${count} multiple-choice test questions for the topic: "${chapterTitle}".
            
            If provided, use this content as reference: "${chapterContent.substring(0, 3000)}..."
            
            Each question should have:
            1. A clear, well-formulated question
            2. Four answer options (A, B, C, D)
            3. The index of the correct answer (0 for A, 1 for B, 2 for C, 3 for D)
            
            Format your response as a JSON array of objects with "question", "options" (array of strings), and "correctAnswer" (number 0-3) properties.
            Example format:
            [
              {
                "question": "What is the capital of France?",
                "options": ["London", "Paris", "Berlin", "Madrid"],
                "correctAnswer": 1
              },
              ...
            ]
            
            Make sure your questions:
            - Cover the most important concepts from the topic
            - Are clear and unambiguous
            - Have one definitively correct answer and three plausible distractors
            - Vary in difficulty
            
            Return ONLY a valid JSON array, no additional explanation or text.`
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
    
    // Parse the JSON response
    try {
      // Clean the response: Remove markdown code blocks if present
      const cleanedContent = content.replace(/```json\n|\n```|```/g, '');
      console.log("Cleaned test questions content for parsing:", cleanedContent);
      
      const questions = JSON.parse(cleanedContent);
      if (Array.isArray(questions)) {
        return questions;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (e) {
      console.error("Failed to parse test questions JSON:", content);
      throw new Error("Failed to parse test question data");
    }
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

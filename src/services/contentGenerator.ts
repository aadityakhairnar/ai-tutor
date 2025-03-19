
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

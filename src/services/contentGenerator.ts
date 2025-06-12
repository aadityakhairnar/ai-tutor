import { toast } from "sonner"; import { getOpenAIKey } from "./openai"; import { supabase } from "@/integrations/supabase/client";

const API_URL = 'https://api.openai.com/v1/chat/completions';

interface UserPreferences { education_level: string; age: number; content_tone: string; experience_level: string; interested_topics: string[]; }

const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => { try { const { data, error } = await supabase .from('user_preferences') .select('*') .eq('user_id', userId) .single();

if (error) throw error;
return data;

} catch (error) { console.error("Error fetching user preferences:", error); return null; } };

export const generateChapterContent = async ( chapterTitle: string, chapterDescription: string, userId: string ): Promise<string> => { const apiKey = getOpenAIKey(); if (!apiKey) { toast.error("OpenAI API key is not set. Please enter your API key in settings."); throw new Error("OpenAI API key is not set"); }

const preferences = await getUserPreferences(userId);

const systemMessage = You are an expert educational content creator specialized in creating comprehensive, engaging educational content. Format your response with clear headings, paragraphs, and proper markdown for formulas and code blocks. ${preferences ? Consider these user preferences:

Education Level: ${preferences.education_level}

Age: ${preferences.age}

Tone: ${preferences.content_tone}

Experience: ${preferences.experience_level}

Topics: ${preferences.interested_topics.join(', ')}  : ''};

try { const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': Bearer ${apiKey} }, body: JSON.stringify({ model: "gpt-4o-mini", messages: [ { role: "system", content: systemMessage }, { role: "user", content: `Create detailed educational content for chapter "${chapterTitle}" (${chapterDescription}).

Conversational introduction

Core concepts with simple→complex examples

Theories, principles, formulas (LaTeX if needed)

Step-by-step worked examples

Code snippets where relevant

Diagram descriptions

Practical applications

Historical context

Summary and key takeaways

Questions for review


Use #, ## for headings, bold, italic, code fences, and LaTeX for math.` } ], temperature: 0.7, max_tokens: 4000 }) });

if (!response.ok) {
  const err = await response.json();
  throw new Error(err.error?.message || "Failed to generate content");
}

const { choices } = await response.json();
return choices[0].message.content;

} catch (error) { console.error("Error generating chapter content:", error); toast.error("Failed to generate content. Please try again."); throw error; } };

export interface FlashcardData { question: string; answer: string; }

export const generateFlashcards = async ( chapterContent: string, userId: string, count: number = 5 ): Promise<FlashcardData[]> => { const apiKey = getOpenAIKey(); if (!apiKey) { toast.error("OpenAI API key is not set. Please enter your API key in settings."); throw new Error("OpenAI API key is not set"); }

const preferences = await getUserPreferences(userId); const systemMessage = You are an expert flashcard creator. Respond with ONLY a JSON array of ${count} objects: [ { "question": "...", "answer": "..." }, ... ] No extra text or markdown. ${preferences ? Level: ${preferences.education_level}, Age: ${preferences.age}, Experience: ${preferences.experience_level} : ''};

try { const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': Bearer ${apiKey} }, body: JSON.stringify({ model: "gpt-4o-mini", messages: [ { role: "system", content: systemMessage }, { role: "user", content: Generate ${count} flashcards from the following chapter content: """ ${chapterContent} """ Each card must have \"question\" and \"answer\" fields. } ], temperature: 0.7, max_tokens: 2000 }) });

if (!response.ok) {
  const err = await response.json();
  throw new Error(err.error?.message || "Failed to generate flashcards");
}

const { choices } = await response.json();
let text = choices[0].message.content.trim();
text = text.replace(/```json|```/g, '');
const flashcards: FlashcardData[] = JSON.parse(text);
return flashcards;

} catch (error) { console.error("Error generating flashcards:", error); toast.error("Failed to generate flashcards. Please try again."); throw error; } };

export interface TestQuestionData { question: string; options: string[]; correctAnswer: number; }

export const generateTestQuestions = async ( chapterContent: string, userId: string, count: number = 5 ): Promise<TestQuestionData[]> => { const apiKey = getOpenAIKey(); if (!apiKey) { toast.error("OpenAI API key is not set. Please enter your API key in settings."); throw new Error("OpenAI API key is not set"); }

const preferences = await getUserPreferences(userId); const systemMessage = You are an expert test question creator. Respond with ONLY a JSON array of ${count} objects: [ { "question": "...", "options": ["...","...","...","..."], "correctAnswer": 0 }, ... ] No extra text or markdown. ${preferences ? Level: ${preferences.education_level}, Age: ${preferences.age}, Experience: ${preferences.experience_level} : ''};

try { const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': Bearer ${apiKey} }, body: JSON.stringify({ model: "gpt-4o-mini", messages: [ { role: "system", content: systemMessage }, { role: "user", content: Generate ${count} multiple-choice questions from the chapter content: """ ${chapterContent} """ Each must have question, 4 options, and correctAnswer index. } ], temperature: 0.7, max_tokens: 2000 }) });

if (!response.ok) {
  const err = await response.json();
  throw new Error(err.error?.message || "Failed to generate test questions");
}

const { choices } = await response.json();
let text = choices[0].message.content.trim();
text = text.replace(/```json|```/g, '');
const questions: TestQuestionData[] = JSON.parse(text);
return questions;

} catch (error) { console.error("Error generating test questions:", error); toast.error("Failed to generate test questions. Please try again."); throw error; } };

export const getAnswerExplanation = async ( question: string, userAnswer: string, correctAnswer: string ): Promise<string> => { const apiKey = getOpenAIKey(); if (!apiKey) { toast.error("OpenAI API key is not set. Please enter your API key in settings."); throw new Error("OpenAI API key is not set"); }

try { const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': Bearer ${apiKey} }, body: JSON.stringify({ model: "gpt-4o-mini", messages: [ { role: "system", content: "You are an expert educational assistant. Provide concise explanations why an answer is correct or incorrect." }, { role: "user", content: Question: "${question}"\nMy answer: "${userAnswer}"\nCorrect: "${correctAnswer}"\nExplain concisely. } ], temperature: 0.7, max_tokens: 300 }) });

if (!response.ok) {
  const err = await response.json();
  throw new Error(err.error?.message || "Failed to generate explanation");
}

const { choices } = await response.json();
return choices[0].message.content;

} catch (error) { console.error("Error generating answer explanation:", error); toast.error("Failed to generate explanation. Please try again."); throw error; } };


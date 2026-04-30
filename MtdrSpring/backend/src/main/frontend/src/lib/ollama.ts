import { createOpenAI } from '@ai-sdk/openai';

// Cliente aislado y reutilizable para conectarse a nuestro motor local
export const ollama = createOpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama', 
});
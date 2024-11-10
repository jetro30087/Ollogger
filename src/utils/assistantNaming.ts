import { Message } from '../types/chat';
import { OpenAISettings } from '../components/SettingsModal';
import { getChatCompletion } from './openai';

const NAMING_SYSTEM_PROMPT = `You are a specialized assistant responsible for generating concise, relevant names for AI logging assistants. Based on the conversation history provided, generate a name that reflects the assistant's specific logging and categorization purpose.

IMPORTANT: Your response must be ONLY the suggested name, nothing else.

Guidelines for naming:
1. Keep names concise (2-6 words)
2. Make names descriptive of the logging purpose
3. Include relevant domain terminology
4. Ensure names are professional and clear
5. Do not include any explanations or additional text

Example outputs:
- Medical Records Logger
- Financial Transaction Tracker
- Equipment Maintenance Logger
- Research Data Cataloger`;

export const generateAssistantName = async (
  settings: OpenAISettings,
  messages: Message[]
): Promise<string> => {
  try {
    const response = await getChatCompletion(settings, [
      { role: 'system', content: NAMING_SYSTEM_PROMPT },
      { role: 'user', content: JSON.stringify(messages.map(m => ({
        role: m.role,
        content: m.content
      }))) }
    ]);

    // For Ollama responses, take the first line as the name
    if (settings.useOllama) {
      const firstLine = response.split('\n')[0];
      return firstLine.replace(/^["']|["']$/g, '').trim();
    }

    // For OpenAI responses
    return response.replace(/^["']|["']$/g, '').trim();
  } catch (error) {
    console.error('Error generating assistant name:', error);
    return 'Custom Logging Assistant';
  }
};
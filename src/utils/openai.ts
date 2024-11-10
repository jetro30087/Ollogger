import OpenAI from 'openai';
import { OpenAISettings } from '../components/SettingsModal';
import { getOllamaResponse } from './ollama';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const createOpenAIClient = (settings: OpenAISettings) => {
  return new OpenAI({
    apiKey: settings.apiKey,
    dangerouslyAllowBrowser: true,
    maxRetries: MAX_RETRIES,
    timeout: 30000
  });
};

const handleAPIError = (error: any) => {
  let errorMessage = 'An error occurred while processing your request.';
  
  if (error?.error?.message) {
    errorMessage = error.error.message;
  } else if (error?.message) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  console.error('API Error:', {
    message: errorMessage,
    details: error
  });

  throw new Error(errorMessage);
};

export const getChatCompletion = async (
  settings: OpenAISettings,
  messages: { role: string; content: string }[],
  onChunk?: (chunk: string) => void
) => {
  if (settings.useOllama) {
    return getOllamaResponse(settings, messages, onChunk);
  }

  const client = createOpenAIClient(settings);
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const hasImage = messages.some(m => m.content.includes('[Image:'));
      
      if (hasImage) {
        const formattedMessages = messages.map(m => {
          if (m.content.includes('[Image:')) {
            const match = m.content.match(/\[Image:\s*(.*?)\]/);
            const text = m.content.replace(/\[Image:\s*.*?\]/, '').trim();
            if (!match?.[1]) {
              throw new Error('Invalid image format in message');
            }
            return {
              role: m.role,
              content: [
                { type: 'text', text },
                { 
                  type: 'image_url',
                  image_url: {
                    url: match[1],
                    detail: 'auto'
                  }
                }
              ]
            };
          }
          return { role: m.role, content: m.content };
        });

        const stream = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: formattedMessages as any,
          stream: true,
          max_tokens: 4096
        });

        let fullResponse = '';
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;
          if (onChunk) {
            onChunk(content);
          }
        }

        if (!fullResponse) {
          throw new Error('No response received from GPT-4 Vision');
        }

        return fullResponse;
      } else {
        const stream = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          stream: true,
          temperature: 0.7,
          max_tokens: 2000
        });

        let fullResponse = '';
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;
          if (onChunk) {
            onChunk(content);
          }
        }

        if (!fullResponse) {
          throw new Error('No response received from GPT-4');
        }

        return fullResponse;
      }
    } catch (error) {
      if (attempt === MAX_RETRIES - 1) {
        throw handleAPIError(error);
      }
      await sleep(RETRY_DELAY * (attempt + 1));
    }
  }
  
  throw new Error('Maximum retries exceeded: Please try again later');
};
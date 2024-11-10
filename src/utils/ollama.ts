import { OpenAISettings } from '../components/SettingsModal';

interface OllamaMessage {
  role: string;
  content: string;
  images?: string[];
}

interface OllamaResponse {
  message: {
    content: string;
  };
  done: boolean;
}

const FUNCTION_CALL_TEMPLATE = `You have access to the following function:

{functionName}
Description: {description}
Parameters:
{parameters}

To call this function, respond in this exact format:
<function_call>
{functionName}
parameters:
{parameterValues}
</function_call>

Remember:
1. Only respond with the function call format when a function should be called
2. Otherwise respond normally to continue the conversation
3. Never explain the function call or add additional text around it`;

export const getOllamaResponse = async (
  settings: OpenAISettings,
  messages: { role: string; content: string }[],
  onChunk?: (chunk: string) => void
): Promise<string> => {
  try {
    // Check if the system message contains function call template
    const systemMessage = messages.find(m => m.role === 'system');
    const hasFunctionTemplate = systemMessage?.content.includes('<function_call>');

    // Format messages for vision support
    const formattedMessages: OllamaMessage[] = messages.map(msg => {
      if (msg.content.includes('[Image:')) {
        const match = msg.content.match(/\[Image:\s*(.*?)\]/);
        const text = msg.content.replace(/\[Image:\s*.*?\]/, '').trim();
        
        if (!match?.[1]) {
          return { role: msg.role, content: text };
        }

        // Extract base64 data and convert to proper format
        const base64Data = match[1].replace(/^data:image\/\w+;base64,/, '');
        
        return {
          role: msg.role,
          content: text || 'What is in this image?',
          images: [base64Data]
        };
      }
      return { role: msg.role, content: msg.content };
    });

    const response = await fetch(`${settings.ollamaEndpoint}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: settings.ollamaModel,
        messages: formattedMessages,
        stream: true,
        options: {
          temperature: 0.7,
          num_predict: 1000,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    let fullResponse = '';
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const parsed: OllamaResponse = JSON.parse(line);
          const content = parsed.message?.content || '';
          fullResponse += content;
          if (onChunk) {
            onChunk(content);
          }
        } catch (e) {
          console.error('Error parsing Ollama response:', e);
        }
      }
    }

    // If the response contains a function call template and includes the function call syntax
    if (hasFunctionTemplate && fullResponse.includes('<function_call>')) {
      const match = fullResponse.match(/<function_call>\n([\s\S]*?)\n<\/function_call>/);
      if (match) {
        return fullResponse; // Return the full response with function call
      }
    }

    return fullResponse;
  } catch (error) {
    console.error('Ollama API Error:', error);
    throw error;
  }
};
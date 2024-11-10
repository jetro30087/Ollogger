import { Message } from '../types/chat';
import { OpenAISettings } from '../components/SettingsModal';
import { getChatCompletion } from './openai';

const PROMPT_GENERATOR_SYSTEM_PROMPT = `You are an assistant designed to finalize and generate a structured system prompt for logging and categorizing data based on the user's requirements. You have been provided with detailed input from the user, including log categories, data fields, formatting preferences, and any custom requirements for logging.

Your response MUST be in the following JSON format:
{
  "systemPrompt": "The complete system prompt including all logging instructions",
  "icebreaker": "The contextual first message the assistant should use"
}

Follow these guidelines while crafting the system prompt:

1. Incorporate Key Categories and Fields: Ensure that each specified log category and data field is explicitly outlined in the prompt.
2. Apply Formatting Preferences: Use any formatting instructions provided to present data consistently.
3. Include Custom Requirements: Reflect any special instructions or custom rules for logging specified by the user.
4. Use Clarity and Precision: Structure the language for clear understanding, minimizing ambiguity in how data should be logged and categorized.
5. Adjust for User Level: If specified, adjust the tone and detail of the prompt to align with the user's technical expertise.
6. Create Initial Message: Include a contextual icebreaker message that:
   - References the specific logging purpose
   - Mentions key categories or fields to be logged
   - Provides a brief example of the expected data format
   - Encourages the user to start logging with a relevant prompt

Remember: Your entire response must be valid JSON with the exact format shown above.`;

export const generateSystemPrompt = async (
  settings: OpenAISettings,
  messages: Message[]
): Promise<string | null> => {
  try {
    const response = await getChatCompletion(settings, [
      { role: 'system', content: PROMPT_GENERATOR_SYSTEM_PROMPT },
      { role: 'user', content: JSON.stringify(messages.map(m => ({
        role: m.role,
        content: m.content
      }))) }
    ]);

    try {
      // For Ollama responses, try to extract JSON from the text
      if (settings.useOllama) {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return `${parsed.systemPrompt}\n\nINITIAL_MESSAGE: ${parsed.icebreaker}`;
        }
        // Fallback for non-JSON Ollama responses
        return `${response}\n\nINITIAL_MESSAGE: Hello! I'm ready to help you with logging. What would you like to log today?`;
      }

      // For OpenAI responses
      const parsed = JSON.parse(response);
      return `${parsed.systemPrompt}\n\nINITIAL_MESSAGE: ${parsed.icebreaker}`;
    } catch (error) {
      console.error('Error parsing prompt response:', error);
      return response;
    }
  } catch (error) {
    console.error('Error generating system prompt:', error);
    return null;
  }
};
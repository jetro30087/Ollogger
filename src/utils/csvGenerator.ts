import { Message } from '../types/chat';
import { OpenAISettings } from '../components/SettingsModal';
import { getChatCompletion } from './openai';

const CSV_GENERATOR_PROMPT = `You are a data extraction specialist that converts logged information into CSV format. Analyze the provided chat messages and extract structured data into a CSV format. Follow these guidelines:

1. Only process assistant responses (ignore user messages)
2. Identify key data points and patterns in the logs
3. Create appropriate column headers based on the data structure
4. Format data consistently across rows
5. Handle missing or incomplete data appropriately
6. Return ONLY the CSV content, with headers as the first row
7. Use comma as the delimiter and properly escape any commas in the data
8. Include a timestamp column if temporal data is present

The output should be valid CSV format, ready for direct use in spreadsheet software.`;

export const generateCSV = async (
  messages: Message[],
  settings: OpenAISettings
): Promise<string> => {
  try {
    // Filter only assistant messages as they contain the logged data
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    
    if (assistantMessages.length === 0) {
      return 'Timestamp,Message\n'; // Return empty CSV with headers
    }

    const response = await getChatCompletion(
      settings,
      [
        { role: 'system', content: CSV_GENERATOR_PROMPT },
        { 
          role: 'user', 
          content: JSON.stringify(assistantMessages.map(m => ({
            content: m.content,
            timestamp: m.timestamp
          })))
        }
      ]
    );

    // Ensure the response starts with headers
    if (!response.includes(',')) {
      throw new Error('Invalid CSV format received');
    }

    return response;
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw error;
  }
};
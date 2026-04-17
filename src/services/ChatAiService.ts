export interface ChatAiResponse {
  output: string;
  token?: number;
  model?: string;
  error?: string;
}

export class ChatAiService {
  private static WRAPPER_URL = 'https://dev.outsystems.byte.enterprises/FujitsuChatAI_API/rest/OpenAIWrapper/v1/chat/completions';

  static async analyzeJira(jiraDescription: string): Promise<ChatAiResponse> {
    const prompt = `You are a technical analyst. Based on the following Jira task description, generate a concise list of features or technical tasks required for implementation. Focus on OutSystems development.
    
    Jira Description:
    ${jiraDescription}
    
    Format the output as a bulleted list of features.`;

    const response = await fetch(this.WRAPPER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Default model for OpenAI-like endpoints
        messages: [
          { role: 'user', content: prompt }
        ],
        stream: false
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`AI Request failed: ${err}`);
    }

    const data = await response.json();
    
    // Standard OpenAI response format: data.choices[0].message.content
    // Adjusting to return the specific format the app expects
    return {
      output: data.choices?.[0]?.message?.content || "No output generated.",
      token: data.usage?.total_tokens,
      model: data.model
    };
  }

  // Keeping these for potential future use or to avoid breaking imports, 
  // but they are no longer needed for the current wrapper.
  static saveConfig(_config: any) {}
  static getConfig() { return null; }
}

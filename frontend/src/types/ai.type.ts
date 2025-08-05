export interface ChatMessage {
  type: 'human' | 'ai';
  content: string;
}

export interface ChatbotRequest {
  query: string;
  history?: ChatMessage[];
}

export interface ChatbotResponse {
  reply: string;
  history: ChatMessage[];
}

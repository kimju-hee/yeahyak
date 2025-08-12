export interface Chatbot {
  id: number;
  userId: number;
  chatType: ChatType;
  question: string;
  createdAt: string;
  reply: string;
  updatedAt?: string;
}

export const CHAT_TYPE = {
  FAQ: 'FAQ',
  QNA: 'QNA',
} as const;
export type ChatType = keyof typeof CHAT_TYPE;

export interface ChatMessage {
  role: ChatRole;
  content: string;
  key?: string;
  loading?: boolean;
}

export const CHAT_ROLE = {
  USER: 'USER',
  AI: 'AI',
} as const;
export type ChatRole = keyof typeof CHAT_ROLE;

export interface ChatbotRequest {
  userId: number;
  chatType: ChatType;
  query: string;
  history: ChatMessage[];
}

export interface ChatbotResponse {
  id: number;
  userId: number;
  chatType: ChatType;
  question: string;
  createdAt: string;
  reply: string;
}

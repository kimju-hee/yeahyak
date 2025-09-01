import type { ApiResponse, ChatRole, ChatType } from '.';

export interface ChatbotRequest {
  userId: number;
  type: ChatType;
  question: string;
  history: ChatMessage[];
}

export interface ChatMessage {
  role: ChatRole;
  content: string;
  key?: string;
  loading?: boolean;
}

export interface Chatbot {
  chatbotId: number;
  userId: number;
  type: ChatType;
  question: string;
  answer: string;
  askedAt: string;
  answeredAt: string;
}

export type ChatbotResponse = ApiResponse<Chatbot>;

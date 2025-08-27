import type { ApiResponse } from './api.type';

export interface ChatbotReq {
  userId: number;
  type: ChatType;
  question: string;
  history: ChatMessage[];
}

export interface ChatbotRes {
  chatbotId: number;
  userId: number;
  type: ChatType;
  question: string;
  askedAt: string;
  answer: string;
  answeredAt?: string;
}

export const CHAT_TYPE = {
  FAQ: 'FAQ',
  QNA: 'QNA',
} as const;
export type ChatType = keyof typeof CHAT_TYPE;

export const CHAT_ROLE = {
  USER: 'USER',
  AI: 'AI',
} as const;
export type ChatRole = keyof typeof CHAT_ROLE;

export interface ChatMessage {
  role: ChatRole;
  content: string;
  key?: string;
  loading?: boolean;
}

export type ChatbotResponse = ApiResponse<ChatbotRes>;

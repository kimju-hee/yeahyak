import type { Chat, ChatMessage } from './types';

export const mockChats: Chat[] = [
  {
    id: 1,
    userId: 2, // 현정약국
    type: 'QnA',
    createdAt: '2025-07-29T14:00:00Z',
  },
  {
    id: 2,
    userId: 3, // 원섭약국
    type: 'FAQ',
    createdAt: '2025-07-29T14:10:00Z',
  },
];

export const mockChatMessages: ChatMessage[] = [
  // Chat 1 (현정약국)
  {
    id: 1,
    chatId: 1,
    sender: 'USER',
    content: '판콜에스내복액 8살 아이한테 먹여도 돼?',
    sentAt: '2025-07-28T14:00:30Z',
  },
  {
    id: 2,
    chatId: 1,
    sender: 'BOT',
    content:
      '8살 아이에게 판콜에스내복액을 복용시킬 수 있습니다. 하지만 복용 전 수두나 인플루엔자 감염이 의심되는 경우, 반드시 의사나 약사와 상담하시기 바랍니다.',
    sentAt: '2025-07-28T14:01:00Z',
  },
  {
    id: 3,
    chatId: 1,
    sender: 'USER',
    content: '페니실린계 항생제 뭐 있어?',
    sentAt: '2025-07-28T14:02:30Z',
  },
  {
    id: 4,
    chatId: 1,
    sender: 'BOT',
    content:
      '페니실린 G(Penicillin G), 페니실린 V(Penicillin V), 아목시실린(Amoxicillin), 암피실린(Ampicillin), 옥사실린(Oxacillin), 클록사실린(Cloxacillin) 등이 있습니다.',
    sentAt: '2025-07-28T14:03:00Z',
  },
  // Chat 2 (원섭약국)
  {
    id: 5,
    chatId: 2,
    sender: 'USER',
    content: '오배송된 제품의 반품은 어떻게 하나요?',
    sentAt: '2025-07-29T14:10:30Z',
  },
  {
    id: 6,
    chatId: 2,
    sender: 'BOT',
    content:
      '본사 물류팀에 온라인 또는 콜센터를 통해 회수 요청을 하면 자동으로 반품 절차가 시작됩니다. 오배송된 제품은 폐기하지 말고 그대로 보관해 주셔야 합니다.',
    sentAt: '2025-07-29T14:11:00Z',
  },
  {
    id: 7,
    chatId: 2,
    sender: 'USER',
    content: '유통기한 지난 제품도 반품되나요?',
    sentAt: '2025-07-29T14:12:30Z',
  },
  {
    id: 8,
    chatId: 2,
    sender: 'BOT',
    content:
      '유통기한이 경과한 제품은 반품 대상이 아니며, 반드시 유통기한 이전에 반품 요청이 이루어져야 합니다. POS에서 자동 알림 기능을 활용해 주기적 확인을 권장합니다.',
    sentAt: '2025-07-29T14:13:00Z',
  },
];

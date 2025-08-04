export const mockNotifications = [
  // 현정약국 (id: 1, userId: 2)
  {
    id: 1,
    userId: 2,
    type: 'BALANCE_UPDATE',
    title: '잔액 충전 완료',
    content: '500,000원 충전이 완료되어 현재 잔액은 500,000원입니다.',
    createdAt: '2025-01-27T09:50:00Z',
    isRead: true,
  },
  {
    id: 2,
    userId: 2,
    type: 'ORDER_STATUS_UPDATE',
    title: '주문 #1 처리 완료',
    content: '주문 번호 #1 배송이 완료되었습니다. (210,000원 결제)',
    createdAt: '2025-01-29T11:35:00Z',
    isRead: true,
  },
  {
    id: 3,
    userId: 2,
    type: 'RETURN_REQUEST_COMPLETED',
    title: '반품 요청 #1 처리 완료',
    content: '반품 요청 #1 (총 51,000원) 이 완료되었습니다. 잔액이 조정됩니다.',
    createdAt: '2025-07-04T15:05:00Z',
    isRead: true,
  },
  {
    id: 4,
    userId: 2,
    type: 'NOTICE',
    title: '시스템 점검 안내',
    content: '8월 1일 시스템 점검이 예정되어 있습니다.',
    createdAt: '2025-07-29T11:05:00Z',
    isRead: true,
  },

  // 원섭약국 (id: 2, userId: 3)
  // 초기 충전 없음
  {
    id: 5,
    userId: 3,
    type: 'ORDER_STATUS_UPDATE',
    title: '주문 #2 처리 완료',
    content: '주문 번호 #2 배송이 완료되었습니다. (440,000원 결제)',
    createdAt: '2025-02-22T11:50:00Z',
    isRead: false,
  },
  {
    id: 6,
    userId: 3,
    type: 'ORDER_STATUS_UPDATE',
    title: '주문 #4 처리 완료',
    content: '주문 번호 #4 배송이 완료되었습니다. (807,800원 결제)',
    createdAt: '2025-03-26T13:35:00Z',
    isRead: false,
  },
  {
    id: 7,
    userId: 3,
    type: 'RETURN_REQUEST_CREATED',
    title: '반품 요청 #2 접수 완료',
    content: '반품 요청 #2 (총 16,000원)이 정상적으로 접수되었습니다.',
    createdAt: '2025-07-28T16:05:00Z',
    isRead: false,
  },

  // 지윤약국 (id: 3, userId: 5)
  {
    id: 8,
    userId: 5,
    type: 'BALANCE_UPDATE',
    title: '잔액 충전 완료',
    content: '1,000,000원 충전이 완료되어 현재 잔액은 1,000,000원입니다.',
    createdAt: '2025-03-22T09:50:00Z',
    isRead: true,
  },
  {
    id: 9,
    userId: 5,
    type: 'ORDER_STATUS_UPDATE',
    title: '주문 #3 처리 완료',
    content: '주문 번호 #3 배송이 완료되었습니다. (101,100원 결제)',
    createdAt: '2025-03-24T16:05:00Z',
    isRead: false,
  },
  {
    id: 10,
    userId: 5,
    type: 'ORDER_STATUS_UPDATE',
    title: '주문 #5 배송 중',
    content: '주문 번호 #5 배송이 시작되었습니다. (200,000원 결제 예정)',
    createdAt: '2025-07-29T12:35:00Z',
    isRead: false,
  },

  // 동현약국 (id: 4, userId: 6)
  {
    id: 11,
    userId: 6,
    type: 'BALANCE_UPDATE',
    title: '잔액 충전 완료',
    content: '200,000원 충전이 완료되어 현재 잔액은 200,000원입니다.',
    createdAt: '2025-07-29T10:40:00Z',
    isRead: true,
  },
  {
    id: 12,
    userId: 6,
    type: 'ORDER_STATUS_UPDATE',
    title: '주문 #6 요청 완료',
    content: '주문 번호 #6 (871,800원)이 성공적으로 요청되었습니다.',
    createdAt: '2025-07-29T10:50:00Z',
    isRead: false,
  },

  // 주희약국 (id: 5, userId: 7) - PENDING
  {
    id: 13,
    userId: 7,
    type: 'REGISTRATION_STATUS',
    title: '가맹점 등록 요청 접수',
    content: '가맹점 등록 요청이 접수되었습니다. 관리자 승인을 기다려주세요.',
    createdAt: '2025-07-27T13:35:00Z',
    isRead: false,
  },

  // 영표약국 (id: 6, userId: 8) - PENDING
  {
    id: 14,
    userId: 8,
    type: 'REGISTRATION_STATUS',
    title: '가맹점 등록 요청 접수',
    content: '가맹점 등록 요청이 접수되었습니다. 관리자 승인을 기다려주세요.',
    createdAt: '2025-07-27T15:45:00Z',
    isRead: false,
  },

  // 관리자 1 (id: 1, userId: 1)
  {
    id: 15,
    userId: 1,
    type: 'NEW_REGISTRATION_REQUEST',
    title: '새로운 약국 등록 요청',
    content: '주희약국에서 새로운 가맹점 등록을 요청했습니다.',
    createdAt: '2025-07-27T13:35:00Z',
    isRead: false,
  },
  {
    id: 16,
    userId: 1,
    type: 'NEW_REGISTRATION_REQUEST',
    title: '새로운 약국 등록 요청',
    content: '영표약국에서 새로운 가맹점 등록을 요청했습니다.',
    createdAt: '2025-07-27T15:45:00Z',
    isRead: false,
  },
  {
    id: 17,
    userId: 1,
    type: 'RETURN_REQUEST_CREATED',
    title: '새로운 반품 요청',
    content: '원섭약국에서 반품 요청 #2 (제품 파손)를 접수했습니다.',
    createdAt: '2025-07-28T16:10:00Z',
    isRead: false,
  },
  {
    id: 18,
    userId: 1,
    type: 'NOTICE_CREATED',
    title: '새로운 공지사항 등록',
    content: '「시스템 점검 안내 (2025년 8월 1일)」 공지사항이 등록되었습니다.',
    createdAt: '2025-07-29T11:00:00Z',
    isRead: false,
  },

  // 관리자 2 (id: 2, userId: 4)
  {
    id: 19,
    userId: 4,
    type: 'RETURN_REQUEST_COMPLETED',
    title: '반품 요청 #1 처리 완료',
    content: '현정약국 반품 요청 #1이 최종 승인 및 처리 완료되었습니다.',
    createdAt: '2025-07-04T15:10:00Z',
    isRead: true,
  },
];

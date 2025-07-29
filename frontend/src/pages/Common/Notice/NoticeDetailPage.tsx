import React from 'react';
import { Typography, Button, Card, Descriptions } from 'antd';
import type { DescriptionsProps } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export default function NoticeDetailPage() {
  const navigate = useNavigate();

  // 예시 데이터
  const items: DescriptionsProps['items'] = [
    {
      key: '1',
      label: '제목',
      children: '7월 신규 의약품 등록 안내',
    },
    {
      key: '2',
      label: '작성자',
      children: '관리자 김약사',
    },
    {
      key: '3',
      label: '작성일',
      children: '2025-07-25',
    },
  ];

  // 예시 ID
  const noticeId = 1;

  return (
    <div>
      <Title>Notice</Title>

      <Descriptions
        bordered
        column={3}
        size="middle"
        style={{ marginBottom: 8 }}
        items={items}
      />

      <Card style={{ marginBottom: 24, padding: 24 }}>
        <p>
          본문내용
        </p>
      </Card>

      <div style={{ display: 'flex', gap: 8 }}>
        <Button type="primary" onClick={() => navigate(`/hq/notices/${noticeId}/edit`)}>
          수정
        </Button>
        <Button type="default" onClick={() => navigate('/hq/notices')}>
          목록
        </Button>
      </div>
    </div>
  );
}

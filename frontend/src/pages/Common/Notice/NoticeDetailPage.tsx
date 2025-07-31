import type { DescriptionsProps } from 'antd';
import { Button, Card, Descriptions, Space, Typography } from 'antd';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockNotices } from '../../../mocks/notice.mock';
import type { User } from '../../../mocks/types';
import { useAuthStore } from '../../../stores/authStore';

export default function NoticeDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const notice = mockNotices.find((notice) => notice.id === Number(id));

  const user = useAuthStore((state) => state.user) as User;

  useEffect(() => {
    if (!notice) {
      navigate('/404', { replace: true });
    }
  }, [notice, navigate]);

  if (!notice) return null;

  const descriptionsItems: DescriptionsProps['items'] = [
    {
      key: 'title',
      label: '제목',
      children: notice.title,
    },
    {
      key: 'createdAt',
      label: '작성일',
      children: new Date(notice.createdAt).toLocaleDateString(),
    },
  ];

  if (notice.attachmentUrl) {
    descriptionsItems.push({
      key: 'attachmentUrl',
      label: '첨부파일',
      children: notice.attachmentUrl,
      span: 2,
    });
  }

  return (
    <>
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        공지사항 상세
      </Typography.Title>
      <Descriptions
        bordered
        column={2}
        size="middle"
        style={{ marginBottom: 24 }}
        items={descriptionsItems}
      ></Descriptions>
      <Card style={{ marginBottom: 24, padding: 24 }}>
        <Typography.Paragraph>{notice.content}</Typography.Paragraph>
      </Card>
      <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
        <Button
          type="default"
          onClick={() => {
            const basePath = user.role === 'ADMIN' ? '/hq' : '/branch';
            navigate(`${basePath}/notices`);
          }}
        >
          목록
        </Button>
        {user.role === 'ADMIN' && (
          <Button type="primary" onClick={() => navigate(`/hq/notices/${id}/edit`)}>
            수정
          </Button>
        )}
      </Space>
    </>
  );
}

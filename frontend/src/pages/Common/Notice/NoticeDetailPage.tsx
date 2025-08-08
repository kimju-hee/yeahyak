import type { DescriptionsProps } from 'antd';
import {
  Button,
  Card,
  Descriptions,
  Flex,
  message,
  Space,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { USER_ROLE } from '../../../types/profile.type';
import type { Announcement } from '../../../types/announcement.type';
import { instance } from '../../../api/api';

export default function NoticeDetailPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [notice, setNotice] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  // 공지사항 단건 조회
  const fetchNotice = async () => {
    setLoading(true);
    try {
      const res = await instance.get(`/announcements/${id}`);
      if (res.data.success && res.data.data) {
        setNotice(res.data.data);
      } else {
        messageApi.error('공지사항 데이터를 불러올 수 없습니다.');
        setNotice(null);
      }
    } catch (e: any) {
      console.error('공지사항 로딩 실패:', e);
      messageApi.error(e.response?.data?.message || '공지사항 로딩 중 오류가 발생했습니다.');
      setNotice(null);
    } finally {
      setLoading(false);
    }
  };

  // 삭제 처리
  const handleDelete = async () => {
    try {
      if (window.confirm('정말 삭제하시겠습니까?')) {
        await instance.delete(`/announcements/${id}`);
        messageApi.success('공지사항이 삭제되었습니다.');
        navigate('/hq/notices');
      }
    } catch (e: any) {
      console.error('공지사항 삭제 실패:', e);
      messageApi.error(e.response?.data?.message || '공지사항 삭제 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchNotice();
  }, [id]);

  if (loading) return <Typography.Text>로딩 중...</Typography.Text>;
  if (!notice) return <Typography.Text>해당 공지사항을 찾을 수 없습니다.</Typography.Text>;

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
      children: (
        <a href={notice.attachmentUrl} target="_blank" rel="noopener noreferrer">
          {notice.attachmentUrl}
        </a>
      ),
      span: 2,
    });
  }

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        공지사항 상세
      </Typography.Title>

      <Descriptions
        bordered
        column={2}
        size="middle"
        style={{ marginBottom: 24 }}
        items={descriptionsItems}
      />

      <Card style={{ marginBottom: 24, padding: 24 }}>
        <Typography.Paragraph>
          <div dangerouslySetInnerHTML={{ __html: notice.content }} />
        </Typography.Paragraph>
      </Card>

      <Flex wrap style={{ justifyContent: 'space-between' }}>
        <Button
          type="default"
          onClick={() => {
            const basePath = user?.role === USER_ROLE.BRANCH ? '/branch' : '/hq';
            navigate(`${basePath}/notices`);
          }}
        >
          목록
        </Button>

        {user?.role === USER_ROLE.ADMIN && (
          <Space wrap>
            <Button type="text" danger onClick={handleDelete}>
              삭제
            </Button>
            <Button type="primary" onClick={() => navigate(`/hq/notices/${id}/edit`)}>
              수정
            </Button>
          </Space>
        )}
      </Flex>
    </>
  );
}

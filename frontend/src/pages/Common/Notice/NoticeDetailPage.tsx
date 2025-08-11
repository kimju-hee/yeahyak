import type { DescriptionsProps } from 'antd';
import { Button, Card, Descriptions, Flex, message, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { instance } from '../../../api/api';
import { useAuthStore } from '../../../stores/authStore';
import type { Announcement } from '../../../types/announcement.type';
import { USER_ROLE, type User } from '../../../types/profile.type';

export default function NoticeDetailPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const { id } = useParams();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user) as User;
  const basePath = user.role === USER_ROLE.BRANCH ? '/branch' : '/hq';

  const [notice, setNotice] = useState<Announcement>();
  const [loading, setLoading] = useState(false);

  const fetchNotice = async () => {
    setLoading(true);
    try {
      const res = await instance.get(`/announcements/${id}`);
      // LOG: 테스트용 로그
      console.log('✨ 공지사항 상세 로딩:', res.data);
      if (res.data.success) {
        setNotice(res.data.data[0]);
      }
    } catch (e: any) {
      console.error('공지사항 상세 로딩 실패:', e);
      messageApi.error(e.message || '공지사항 로딩 중 오류가 발생했습니다.');
      setNotice(undefined);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotice();
  }, [id]);

  if (!notice) return <Typography.Text>해당 공지사항을 찾을 수 없습니다.</Typography.Text>;

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        const res = await instance.delete(`/announcements/${id}`);
        // LOG: 테스트용 로그
        console.log('✨ 공지사항 삭제:', res.data);
        if (res.data.success) {
          messageApi.success('공지사항이 삭제되었습니다.');
          navigate(`${basePath}/notices`);
        }
      } catch (e: any) {
        console.error('공지사항 삭제 실패:', e);
        messageApi.error(e.message || '공지사항 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const descriptionsItems: DescriptionsProps['items'] = [
    {
      key: 'title',
      label: '제목',
      children: notice.title,
    },
    {
      key: 'type',
      label: '구분',
      children: notice.type,
    },
    {
      key: 'createdAt',
      label: '작성일',
      children: dayjs(notice.createdAt).format('YYYY. MM. DD. HH:mm'),
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
        column={3}
        size="middle"
        style={{ marginBottom: '24px' }}
        items={descriptionsItems}
      />

      <Card style={{ marginBottom: '24px', padding: '24px' }}>
        <Typography>
          <div dangerouslySetInnerHTML={{ __html: notice.content }} />
        </Typography>
      </Card>

      <Flex wrap style={{ justifyContent: 'space-between' }}>
        <Button type="default" onClick={() => navigate(`${basePath}/notices`)}>
          목록
        </Button>

        {user.role === USER_ROLE.ADMIN && (
          <Space wrap>
            <Button type="text" danger onClick={handleDelete}>
              삭제
            </Button>
            <Button type="primary" onClick={() => navigate(`${basePath}/notices/${id}/edit`)}>
              수정
            </Button>
          </Space>
        )}
      </Flex>
    </>
  );
}

import {
  Button,
  Card,
  Descriptions,
  Flex,
  message,
  Space,
  Typography,
  type DescriptionsProps,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { announcementAPI } from '../../../api';
import { API_BASE_URL } from '../../../api/client';
import { AnnouncementDetailSkeleton } from '../../../components/skeletons';
import { ANNOUNCEMENT_TYPE_TEXT, DATE_FORMAT } from '../../../constants';
import { useAuthStore } from '../../../stores/authStore';
import { USER_ROLE, type Announcement, type User } from '../../../types';

export default function AnnouncementDetailPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((state) => state.user) as User;
  const basePath = user.role === USER_ROLE.BRANCH ? '/branch' : '/hq';
  const returnTo = location.state?.returnTo;

  const [announcement, setAnnouncement] = useState<Announcement>();
  const [loading, setLoading] = useState(false);

  const fetchAnnouncement = async () => {
    setLoading(true);
    try {
      const res = await announcementAPI.getAnnouncement(Number(id));

      if (res.success) {
        setAnnouncement(res.data[0]);
      }
    } catch (e: any) {
      console.error('공지사항 상세 로딩 실패:', e);
      messageApi.error(e.response?.data?.message || '공지사항 로딩 중 오류가 발생했습니다.');
      setAnnouncement(undefined);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncement();
  }, [id]);

  if (loading) return <AnnouncementDetailSkeleton userRole={user.role} />;
  if (!announcement) return <Typography.Text>해당 공지사항을 찾을 수 없습니다.</Typography.Text>;

  const toAbsUrl = (url: string) => (url.startsWith('http') ? url : `${API_BASE_URL}${url}`);

  const getFilenameFromCD = (cd: string | null | undefined) => {
    if (!cd) return null;
    const star = cd.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
    if (star) return decodeURIComponent(star[1]);
    const plain = cd.match(/filename\s*=\s*"?([^"]+)"?/i);
    return plain ? plain[1] : null;
  };

  const handleDownload = async (url: string, fallbackName?: string) => {
    try {
      const absUrl = toAbsUrl(url);
      const res = await fetch(absUrl, { credentials: 'include' });
      if (!res.ok) throw new Error('파일 다운로드 실패');
      const blob = await res.blob();
      const cd = res.headers.get('content-disposition');
      const fromHeader = getFilenameFromCD(cd);
      const fileName = fromHeader || fallbackName || url.split('/').pop() || 'download';
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(href);
    } catch (e: any) {
      console.error('파일 다운로드 실패:', e);
      messageApi.error(e.response?.data?.message || '파일 다운로드 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        const res = await announcementAPI.deleteAnnouncement(Number(id));

        if (res.success) {
          messageApi.success('공지사항이 삭제되었습니다.');
          if (returnTo) {
            const params = new URLSearchParams();
            params.set('type', returnTo.type);
            if (returnTo.page > 1) params.set('page', returnTo.page.toString());
            if (returnTo.keyword) params.set('keyword', returnTo.keyword);
            navigate(`${basePath}/announcements?${params.toString()}`);
          } else {
            navigate(`${basePath}/announcements`);
          }
        }
      } catch (e: any) {
        console.error('공지사항 삭제 실패:', e);
        messageApi.error(e.response?.data?.message || '공지사항 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const descriptionsItems: DescriptionsProps['items'] = [
    { key: 'title', label: '제목', children: announcement.title },
    { key: 'type', label: '카테고리', children: ANNOUNCEMENT_TYPE_TEXT[announcement.type] },
    {
      key: 'createdAt',
      label: '작성일시',
      children: dayjs(announcement.createdAt).format(DATE_FORMAT.DEFAULT),
    },
  ];

  if (announcement.attachmentUrl) {
    const fileName = announcement.attachmentUrl.split('/').pop() || '첨부파일';
    descriptionsItems.push({
      key: 'attachmentUrl',
      label: '첨부파일',
      children: (
        <Typography.Link
          onClick={() => handleDownload(announcement.attachmentUrl!, fileName)}
          style={{ cursor: 'pointer' }}
        >
          {fileName}
        </Typography.Link>
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
          <div dangerouslySetInnerHTML={{ __html: announcement.content }} />
        </Typography>
      </Card>

      <Flex wrap style={{ justifyContent: 'space-between' }}>
        <Button
          type="default"
          onClick={() => {
            if (returnTo) {
              const params = new URLSearchParams();
              params.set('type', returnTo.type);
              if (returnTo.page > 1) params.set('page', returnTo.page.toString());
              if (returnTo.keyword) params.set('keyword', returnTo.keyword);
              navigate(`${basePath}/announcements?${params.toString()}`);
            } else {
              navigate(`${basePath}/announcements`);
            }
          }}
        >
          목록
        </Button>

        {user.role === USER_ROLE.ADMIN && (
          <Space wrap>
            <Button type="text" danger onClick={handleDelete}>
              삭제
            </Button>
            <Button type="primary" onClick={() => navigate(`${basePath}/announcements/${id}/edit`)}>
              수정
            </Button>
          </Space>
        )}
      </Flex>
    </>
  );
}

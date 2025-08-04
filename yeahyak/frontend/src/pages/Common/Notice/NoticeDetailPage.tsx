import type { DescriptionsProps } from 'antd';
import { Button, Card, Descriptions, Flex, message, Space, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { mockNotices } from '../../../mocks/notice.mock';
import { useAuthStore } from '../../../stores/authStore';

export default function NoticeDetailPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // TODO: 공지사항 로드 API 호출 로직 추가 + mockNotices 제거
  // const fetchNotice = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await instance.get(`/notices/${id}`);
  //     const notice = res.data as Notice;
  //   } catch (e: any) {
  //     console.error('공지사항 로딩 실패:', e);
  //     messageApi.error(e.message || '공지사항 로딩 중 오류가 발생했습니다.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  //
  // useEffect(() => {
  //   fetchNotice();
  // }, []);

  const notice = mockNotices.find((n) => n.id === Number(id));

  if (!notice) {
    return <Typography.Text>해당 공지사항을 찾을 수 없습니다.</Typography.Text>;
  }

  const handleDelete = async () => {
    try {
      if (window.confirm('정말 삭제하시겠습니까?')) {
        // TODO: 공지사항 삭제 API 호출 로직 추가하기
        navigate('/hq/notices');
      }
    } catch (e: any) {
      console.error('공지사항 삭제 실패:', e);
      messageApi.error(e.message || '공지사항 삭제 중 오류가 발생했습니다.');
    }
  };

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
        <Typography.Paragraph>{notice.content}</Typography.Paragraph>
      </Card>

      <Flex wrap style={{ justifyContent: 'space-between' }}>
        <Button
          type="default"
          onClick={() => {
            const basePath = user?.role === 'HQ' ? '/hq' : '/branch';
            navigate(`${basePath}/notices`);
          }}
        >
          목록
        </Button>
        {/* TODO: 로그인 API 연동 후 주석 해제 {user.role === 'HQ' && ( */}
        <Space wrap>
          <Button type="text" danger onClick={handleDelete}>
            삭제
          </Button>
          <Button type="primary" onClick={() => navigate(`/hq/notices/${id}/edit`)}>
            수정
          </Button>
        </Space>
      </Flex>
    </>
  );
}

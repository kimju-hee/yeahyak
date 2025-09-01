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
import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AttachmentLink, NoticeDetailSkeleton } from '../../../components';
import { DATE_FORMAT, NOTICE_TYPE_TEXT } from '../../../constants';
import { useDeleteNotice, useNotice } from '../../../hooks';
import { useAuthStore } from '../../../stores/authStore';
import { USER_ROLE, type User } from '../../../types';

export default function NoticeDetailPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((state) => state.user) as User;
  const basePath = user.role === USER_ROLE.ADMIN ? '/hq' : '/branch';
  const returnTo = location.state?.returnTo;

  const noticeId = useMemo(() => Number(id), [id]);

  const { data: notice, isLoading: loading, error } = useNotice(noticeId);

  const deleteNoticeMutation = useDeleteNotice();

  // 잘못된 ID 체크 및 에러 처리
  if (!id || Number.isNaN(noticeId)) {
    messageApi.error('잘못된 접근입니다.');
    navigate(`${basePath}/notices`);
    return null;
  }

  if (error) {
    console.error('공지사항 상세 로딩 실패:', error);
    messageApi.error('공지사항 로딩 중 오류가 발생했습니다.');
  }

  const buildReturnUrl = () => {
    if (!returnTo) return `${basePath}/notices`;

    const params = new URLSearchParams();
    params.set('type', returnTo.type);
    if (returnTo.page > 1) params.set('page', returnTo.page.toString());
    if (returnTo.keyword) params.set('keyword', returnTo.keyword);
    if (returnTo.scope) params.set('scope', returnTo.scope);

    return `${basePath}/notices?${params.toString()}`;
  };

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteNoticeMutation.mutateAsync(noticeId);
        messageApi.success('공지사항이 삭제되었습니다.');
        navigate(buildReturnUrl());
      } catch (error: any) {
        messageApi.error(error.response?.data?.message || '공지사항 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const descriptionsItems: DescriptionsProps['items'] = [
    { key: 'title', label: '제목', children: notice?.title, span: 1 },
    {
      key: 'type',
      label: '카테고리',
      children: notice ? NOTICE_TYPE_TEXT[notice.type] : null,
      span: 1,
    },
    {
      key: 'createdAt',
      label: '작성 일시',
      children: notice ? dayjs(notice.createdAt).format(DATE_FORMAT.KR_DEFAULT) : null,
      span: 1,
    },
    {
      key: 'viewCount',
      label: '조회수',
      children: notice ? notice.viewCount : null,
      span: 1,
    },
  ];

  if (notice?.fileName) {
    descriptionsItems.push({
      key: 'filename',
      label: '첨부파일',
      children: (
        <AttachmentLink
          noticeId={notice.noticeId}
          fileName={notice.fileName}
          messageApi={messageApi}
        />
      ),
      span: 4,
    });
  }

  return (
    <>
      {contextHolder}
      {loading ? (
        <NoticeDetailSkeleton userRole={user.role} />
      ) : !notice ? (
        <Typography.Text>해당 공지사항을 찾을 수 없습니다.</Typography.Text>
      ) : (
        <>
          <Typography.Title level={3} style={{ marginBottom: 24 }}>
            공지사항
          </Typography.Title>
          <Descriptions
            bordered
            column={4}
            items={descriptionsItems}
            size="middle"
            style={{ marginBottom: 24 }}
            styles={{ label: { textAlign: 'center' } }}
          />

          <Card style={{ marginBottom: 24, padding: 24 }}>
            <Typography>
              <div dangerouslySetInnerHTML={{ __html: notice.content }} />
            </Typography>
          </Card>

          <Flex wrap style={{ justifyContent: 'space-between' }}>
            <Button type="default" onClick={() => navigate(buildReturnUrl())}>
              목록
            </Button>

            {user.role === USER_ROLE.ADMIN && (
              <Space wrap>
                <Button type="primary" onClick={() => navigate(`${basePath}/notices/${id}/edit`)}>
                  수정
                </Button>
                <Button type="text" danger onClick={handleDelete}>
                  삭제
                </Button>
              </Space>
            )}
          </Flex>
        </>
      )}
    </>
  );
}

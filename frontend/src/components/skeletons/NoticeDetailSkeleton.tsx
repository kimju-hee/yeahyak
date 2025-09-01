import { Card, Flex, Skeleton, Space, Typography } from 'antd';
import { USER_ROLE } from '../../types';

interface NoticeDetailSkeletonProps {
  userRole: string;
}

export function NoticeDetailSkeleton({ userRole }: NoticeDetailSkeletonProps) {
  return (
    <>
      <Typography.Title level={3} style={{ marginBottom: 24 }}>
        공지사항
      </Typography.Title>

      <Skeleton.Input style={{ marginBottom: 24 }} active block />

      <Card style={{ marginBottom: 24, padding: 24 }}>
        <Skeleton paragraph={{ rows: 6 }} active />
      </Card>

      <Flex wrap style={{ justifyContent: 'space-between' }}>
        <Skeleton.Button active />
        {userRole === USER_ROLE.ADMIN && (
          <Space wrap>
            <Skeleton.Button active />
            <Skeleton.Button active />
          </Space>
        )}
      </Flex>
    </>
  );
}

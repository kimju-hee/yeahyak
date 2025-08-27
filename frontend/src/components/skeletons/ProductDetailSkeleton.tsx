import { Card, Divider, Flex, Skeleton, Space, Typography } from 'antd';
import { USER_ROLE } from '../../types';

interface ProductDetailSkeletonProps {
  userRole: string;
}

export function ProductDetailSkeleton({ userRole }: ProductDetailSkeletonProps) {
  return (
    <>
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        제품 상세
      </Typography.Title>

      <Card style={{ width: '80%', borderRadius: '12px', padding: '24px', margin: '0 auto' }}>
        <Flex wrap justify="space-between" gap={36}>
          <div style={{ flex: 1 }}>
            <Skeleton.Image active />
          </div>

          <Flex vertical flex={1}>
            <Space direction="vertical">
              <Skeleton paragraph={{ rows: 5 }} />

              <Flex justify="flex-end">
                {userRole === USER_ROLE.ADMIN ? (
                  <Space wrap>
                    <Skeleton.Button active />
                    <Skeleton.Button active />
                  </Space>
                ) : (
                  <Skeleton.Button active />
                )}
              </Flex>
            </Space>
          </Flex>
        </Flex>

        <Divider />

        <Typography.Title level={4}>제품 상세 정보</Typography.Title>
        <Skeleton paragraph={{ rows: 6 }} />
      </Card>
    </>
  );
}

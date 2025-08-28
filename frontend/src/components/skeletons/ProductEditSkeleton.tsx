import { Card, Divider, Flex, Skeleton, Space, Typography } from 'antd';

export function ProductEditSkeleton() {
  return (
    <>
      <Card style={{ width: '80%', borderRadius: '12px', padding: '24px', margin: '0 auto' }}>
        <Flex wrap justify="space-between" gap={24} style={{ marginBottom: 16 }}>
          <Skeleton.Input active />
          <Skeleton.Input active />
        </Flex>

        <Divider />

        <Flex wrap justify="space-between" gap={36}>
          <div style={{ flex: 1 }}>
            <Skeleton.Image active />
          </div>

          <Space direction="vertical" style={{ flex: 1 }}>
            <Skeleton.Input active block />
            <Skeleton.Input active block />
            <Skeleton.Input active block />
          </Space>
        </Flex>

        <Divider />

        <Flex wrap justify="space-between" gap={36}>
          <Space direction="vertical" style={{ flex: 1 }}>
            <Skeleton.Input active block />
            <Skeleton.Input active block />
          </Space>
          <Space direction="vertical" style={{ flex: 1 }}>
            <Skeleton.Input active block />
            <Skeleton.Input active block />
            <Skeleton.Input active block />
          </Space>
        </Flex>

        <Divider />

        <Typography.Title level={4}>제품 상세 정보</Typography.Title>
        <Skeleton paragraph={{ rows: 6 }} />
        <Flex justify="center">
          <Skeleton.Button active />
        </Flex>
      </Card>
    </>
  );
}

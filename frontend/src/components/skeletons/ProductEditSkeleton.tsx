import { Card, Divider, Flex, Skeleton, Space, Typography } from 'antd';

export function ProductEditSkeleton() {
  return (
    <>
      <Card style={{ width: '80%', padding: 16, margin: '0 auto', borderRadius: 24 }}>
        <Flex wrap justify="space-between" gap={36} style={{ marginBottom: 16 }}>
          <Skeleton.Input active />
          <Skeleton.Input active />
        </Flex>

        <Divider />

        <Flex wrap justify="space-between" gap={36}>
          <Flex vertical flex={1} justify="center" align="center">
            <Skeleton.Image active />
          </Flex>

          <Space direction="vertical" style={{ flex: 1 }}>
            <Skeleton.Input active block />
            <Skeleton.Input active block />
          </Space>

          <Space direction="vertical" style={{ flex: 1 }}>
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
          </Space>
        </Flex>

        <Divider />

        <Flex wrap justify="space-between" gap={36}>
          <Typography.Title level={4}>제품 상세 정보</Typography.Title>
          <Space wrap>
            <Skeleton.Input active block />
            <Skeleton.Input active block />
          </Space>
        </Flex>
        <Skeleton paragraph={{ rows: 16 }} />

        <Flex justify="center">
          <Skeleton.Button active />
        </Flex>
      </Card>
    </>
  );
}

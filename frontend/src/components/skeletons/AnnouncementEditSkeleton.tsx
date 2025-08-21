import { Card, Flex, Skeleton } from 'antd';

export function AnnouncementEditSkeleton() {
  return (
    <>
      <Skeleton.Input style={{ marginBottom: '16px' }} active block />
      <Skeleton.Input style={{ marginBottom: '16px' }} active block />

      <Card style={{ marginBottom: '24px', padding: '24px' }}>
        <Skeleton paragraph={{ rows: 6 }} active />
      </Card>

      <Flex justify="flex-end">
        <Skeleton.Button active />
      </Flex>
    </>
  );
}

import { Card, Flex, Skeleton } from 'antd';

export function NoticeEditSkeleton() {
  return (
    <>
      <Skeleton.Input style={{ marginBottom: 16 }} active block />
      <Skeleton.Input style={{ marginBottom: 16 }} active block />

      <Card style={{ marginBottom: 24, padding: 24 }}>
        <Skeleton paragraph={{ rows: 6 }} active />
      </Card>

      <Flex justify="flex-end">
        <Skeleton.Button active />
      </Flex>
    </>
  );
}

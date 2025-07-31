import {
  Button,
  Input,
  Select,
  Space,
  Table,
  Tabs,
  Typography,
  type TableProps,
  type TabsProps,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { mockNotices } from '../../../mocks/notice.mock';
import type { Notice, User } from '../../../mocks/types';
import { useAuthStore } from '../../../stores/authStore';

export default function NoticeListPage() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user) as User;

  const tableColumns: TableProps<Notice>['columns'] = [
    {
      title: '번호',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '작성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      width: 240,
    },
  ];

  const renderTable = (category: string) => {
    return (
      <Table
        bordered
        columns={tableColumns}
        dataSource={mockNotices.filter((notice) => notice.category === category)}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => {
            const basePath = user.role === 'ADMIN' ? '/hq' : '/branch';
            navigate(`${basePath}/notices/${record.id}`);
          },
          style: { cursor: 'pointer' },
        })}
        pagination={{ position: ['bottomCenter'] }}
      />
    );
  };

  const tabsItems: TabsProps['items'] = [
    {
      key: 'notice',
      label: '공지사항',
      children: renderTable('NOTICE'),
    },
    {
      key: 'epidemic',
      label: '감염병',
      children: renderTable('EPIDEMIC'),
    },
    {
      key: 'law',
      label: '법령',
      children: renderTable('LAW'),
    },
    {
      key: 'newDrug',
      label: '신약',
      children: renderTable('NEW_DRUG'),
    },
  ];

  return (
    <>
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        공지사항 목록
      </Typography.Title>
      <Tabs defaultActiveKey="notice" centered items={tabsItems}></Tabs>
      <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
        <Space wrap>
          <Select
            defaultValue="title"
            style={{ width: 80 }}
            options={[{ value: 'title', label: '제목' }]}
          ></Select>
          <Input style={{ width: 240 }} placeholder="검색어 입력" />
          <Button type="primary">검색</Button>
        </Space>
        {user.role === 'ADMIN' && (
          <Button type="primary" onClick={() => navigate('/hq/notices/new')}>
            작성
          </Button>
        )}
      </Space>
    </>
  );
}

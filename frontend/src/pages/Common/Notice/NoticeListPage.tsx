import {
  Button,
  Flex,
  Input,
  message,
  Select,
  Space,
  Table,
  Tabs,
  Typography,
  type TableProps,
  type TabsProps,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { instance } from '../../../api/api';
import { useAuthStore } from '../../../stores/authStore';
import { type Announcement, type AnnouncementType } from '../../../types/announcement.type';
import { USER_ROLE, type User } from '../../../types/profile.type';

const PAGE_SIZE = 10;

export default function NoticeListPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user) as User;
  const basePath = user.role === USER_ROLE.BRANCH ? '/branch' : '/hq';

  const [notices, setNotices] = useState<Announcement[]>([]);
  const [activeTab, setActiveTab] = useState<AnnouncementType>('NOTICE');

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await instance.get('/announcements', {
        params: {
          type: activeTab,
          page: currentPage - 1,
          size: PAGE_SIZE,
        },
      });

      // LOG: 테스트용 로그
      console.log('✨ 공지사항 목록 로딩:', res.data);

      if (res.data.success) {
        const { data, totalElements } = res.data;
        setNotices(data);
        setTotal(totalElements);
      }
    } catch (e: any) {
      console.error('공지사항 목록 로딩 실패:', e);
      messageApi.error(e.message || '공지사항 목록 로딩 중 오류가 발생했습니다.');
      setNotices([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [activeTab, currentPage]);

  const handleTabChange = (key: string) => {
    setActiveTab(key as AnnouncementType);
    setCurrentPage(1);
  };

  // TODO: 검색 기능 구현
  const handleSearch = () => {};

  const tableColumns: TableProps<Announcement>['columns'] = [
    {
      title: '번호',
      dataIndex: 'announcementId',
      key: 'announcementId',
      width: '80px',
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '작성 일시',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY. MM. DD. HH:mm'),
      width: '240px',
    },
  ];

  const renderTable = () => {
    return (
      <Table
        bordered
        columns={tableColumns}
        dataSource={notices}
        loading={loading}
        rowKey="announcementId"
        onRow={(record) => ({
          onClick: () => {
            navigate(`${basePath}/notices/${record.announcementId}`);
          },
          style: { cursor: 'pointer' },
        })}
        pagination={{
          position: ['bottomCenter'],
          pageSize: PAGE_SIZE,
          total: total,
          current: currentPage,
          onChange: (page) => setCurrentPage(page),
        }}
      />
    );
  };

  const tabsItems: TabsProps['items'] = [
    {
      key: 'NOTICE',
      label: '안내',
      children: renderTable(),
    },
    {
      key: 'EPIDEMIC',
      label: '감염병',
      children: renderTable(),
    },
    {
      key: 'LAW',
      label: '법령',
      children: renderTable(),
    },
    {
      key: 'NEW_PRODUCT',
      label: '신제품',
      children: renderTable(),
    },
  ];

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        공지사항 목록
      </Typography.Title>

      <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabsItems} centered />

      <Flex wrap style={{ justifyContent: 'space-between' }}>
        {/* TODO: 검색 기능 구현 */}
        <Space.Compact>
          <Select
            value={'제목 및 내용'}
            onChange={() => {}}
            options={[{ value: '제목 및 내용', label: '제목 및 내용' }]}
          />
          <Input.Search
            allowClear
            placeholder="검색어 입력"
            onChange={() => {}}
            onSearch={handleSearch}
          />
        </Space.Compact>

        {user.role === USER_ROLE.ADMIN && (
          <Button type="primary" onClick={() => navigate(`${basePath}/notices/new`)}>
            작성
          </Button>
        )}
      </Flex>
    </>
  );
}

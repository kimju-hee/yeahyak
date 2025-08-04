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
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockNotices } from '../../../mocks/notice.mock';
import { useAuthStore } from '../../../stores/authStore';
import type { Category, Notice } from '../../../types/notice';

const PAGE_SIZE = 10;

export default function NoticeListPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<Category>('NOTICE');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [search, setSearch] = useState({
    field: 'title' as 'title' | 'content',
    keyword: '',
    appliedField: 'title' as 'title' | 'content',
    appliedKeyword: '',
  });

  const [notices, setNotices] = useState<Notice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      // TODO: 공지사항 목록 로드 API 호출 로직 추가 + mockNotices 제거
      // const params: {
      //   category: Category;
      //   page: number;
      //   pageSize: number;
      //   searchField?: string;
      //   searchKeyword?: string;
      // } = {
      //   category: activeTab,
      //   page: currentPage,
      //   pageSize: PAGE_SIZE,
      // };
      //
      // const res = await instance.get('/announcements', { params });
      //
      // if (res.data.success) {
      //   setNotices(res.data.data);
      //   setTotal(res.data.total);
      // }

      let filtered = mockNotices.filter((n) => n.category === activeTab);

      if (search.field === 'title') {
        filtered = filtered.filter((n) => n.title.includes(search.keyword));
      } else {
        filtered = filtered.filter((n) => n.content.includes(search.keyword));
      }

      const startIndex = (currentPage - 1) * PAGE_SIZE;
      const paginated = filtered.slice(startIndex, startIndex + PAGE_SIZE);

      setNotices(paginated);
      setTotal(filtered.length);
    } catch (e: any) {
      console.error('공지사항 목록 로딩 실패:', e);
      messageApi.error(e.message || '공지사항 목록 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [activeTab, currentPage, search.appliedField, search.appliedKeyword]);

  const handleTabChange = (key: string) => {
    setActiveTab(key as Category);
    setCurrentPage(1);
    setSearch({
      field: 'title',
      keyword: '',
      appliedField: 'title',
      appliedKeyword: '',
    });
  };

  const handleSearch = () => {
    setSearch((prev) => ({
      ...prev,
      appliedField: prev.field,
      appliedKeyword: prev.keyword,
    }));
    setCurrentPage(1);
  };

  const tableColumns: TableProps<Notice>['columns'] = [
    {
      title: '번호',
      dataIndex: 'id',
      key: 'id',
      width: '80px',
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
        rowKey="id"
        onRow={(record) => ({
          onClick: () => {
            const basePath = user?.role === 'BRANCH' ? '/branch' : '/hq';
            navigate(`${basePath}/notices/${record.id}`);
          },
          style: { cursor: 'pointer' },
        })}
        pagination={{
          position: ['bottomCenter'],
          current: currentPage,
          total: total,
          pageSize: PAGE_SIZE,
          onChange: (page) => setCurrentPage(page),
        }}
      />
    );
  };

  const tabsItems: TabsProps['items'] = [
    {
      key: 'NOTICE',
      label: '공지사항',
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
      key: 'NEW_DRUG',
      label: '신약',
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
        <Space.Compact>
          <Select
            value={search.field}
            onChange={(value) =>
              setSearch((prev) => ({ ...prev, field: value as 'title' | 'content' }))
            }
            options={[
              { value: 'title', label: '제목' },
              { value: 'content', label: '내용' },
            ]}
          />
          <Input.Search
            allowClear
            value={search.keyword}
            placeholder="검색어 입력"
            onChange={(e) => setSearch((prev) => ({ ...prev, keyword: e.target.value }))}
            onSearch={handleSearch}
          />
        </Space.Compact>

        {/* TODO: 로그인 API 연동 후 주석 해제 {user.role === 'HQ' && ( */}
        <Button type="primary" onClick={() => navigate('/hq/notices/new')}>
          작성
        </Button>
      </Flex>
    </>
  );
}

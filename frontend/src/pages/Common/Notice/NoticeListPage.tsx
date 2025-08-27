import {
  Button,
  Flex,
  message,
  Table,
  Tabs,
  Typography,
  type TableProps,
  type TabsProps,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { noticeAPI } from '../../../api';
import { SearchBox } from '../../../components/SearchBox';
import { DATE_FORMAT, PAGE_SIZE } from '../../../constants';
import { useAuthStore } from '../../../stores/authStore';
import { USER_ROLE, type NoticeList, type NoticeType, type User } from '../../../types';

export default function NoticeListPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const user = useAuthStore((state) => state.user) as User;
  const basePath = user.role === USER_ROLE.ADMIN ? '/hq' : '/branch';

  const [notices, setNotices] = useState<NoticeList[]>([]);
  const [activeTab, setActiveTab] = useState<NoticeType>(
    (searchParams.get('type') as NoticeType) || 'NOTICE',
  );
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [appliedKeyword, setAppliedKeyword] = useState(searchParams.get('keyword') || '');

  const [currentPage, setCurrentPage] = useState<number>(Number(searchParams.get('page')) || 1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await noticeAPI.getNotices({
        type: activeTab,
        page: currentPage - 1,
        size: PAGE_SIZE,
        keyword: appliedKeyword ? appliedKeyword : undefined,
      });

      if (res.success) {
        const { data, page } = res;
        setNotices(data);
        setTotal(page.totalElements);
      } else {
        setNotices([]);
        setTotal(0);
      }
    } catch (e: any) {
      console.error('공지사항 목록 로딩 실패:', e);
      messageApi.error(e.response?.data?.message || '공지사항 목록 로딩 중 오류가 발생했습니다.');
      setNotices([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [activeTab, currentPage, appliedKeyword]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('type', activeTab);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (appliedKeyword) params.set('keyword', appliedKeyword);
    setSearchParams(params);
  }, [activeTab, currentPage, appliedKeyword]);

  const handleTabChange = (key: string) => {
    setActiveTab(key as NoticeType);
    setKeyword('');
    setAppliedKeyword('');
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setKeyword(value.trim());
    setAppliedKeyword(value.trim());
    setCurrentPage(1);
  };

  const tableColumns: TableProps<NoticeList>['columns'] = [
    { title: '번호', dataIndex: 'noticeId', key: 'noticeId', width: '80px' },
    { title: '제목', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: '작성 일시',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format(DATE_FORMAT.DEFAULT),
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
        rowKey="noticeId"
        onRow={(record) => ({
          onClick: () => {
            navigate(`${basePath}/notices/${record.noticeId}`, {
              state: { returnTo: { type: activeTab, page: currentPage, keyword: appliedKeyword } },
            });
          },
          style: { cursor: 'pointer' },
        })}
        pagination={{
          position: ['bottomCenter'],
          pageSize: PAGE_SIZE,
          total: total,
          current: currentPage,
          onChange: (page) => setCurrentPage(page),
          showSizeChanger: false,
        }}
      />
    );
  };

  const tabsItems: TabsProps['items'] = [
    { key: 'GENERAL', label: '안내', children: renderTable() },
    { key: 'EPIDEMIC', label: '감염병', children: renderTable() },
    { key: 'LAW', label: '법령', children: renderTable() },
    { key: 'NEW_PRODUCT', label: '신제품', children: renderTable() },
  ];

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        공지사항 목록
      </Typography.Title>

      <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabsItems} centered />

      <Flex wrap style={{ justifyContent: 'space-between' }}>
        <SearchBox
          searchField="제목 및 내용"
          searchOptions={[{ value: '제목 및 내용', label: '제목 및 내용' }]}
          searchKeyword={keyword}
          onSearchFieldChange={() => {}}
          onSearchKeywordChange={setKeyword}
          onSearch={handleSearch}
        />

        {user.role === USER_ROLE.ADMIN && (
          <Button type="primary" onClick={() => navigate(`${basePath}/notices/new`)}>
            작성
          </Button>
        )}
      </Flex>
    </>
  );
}

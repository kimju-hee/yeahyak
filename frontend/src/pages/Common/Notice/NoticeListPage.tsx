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
import { SearchBox } from '../../../components';
import { DATE_FORMAT, PAGE_SIZE } from '../../../constants';
import { useNotices } from '../../../hooks';
import { useAuthStore } from '../../../stores/authStore';
import { USER_ROLE, type NoticeList, type NoticeType, type User } from '../../../types';

export default function NoticeListPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const user = useAuthStore((state) => state.user) as User;
  const basePath = user.role === USER_ROLE.ADMIN ? '/hq' : '/branch';

  const [activeTab, setActiveTab] = useState<NoticeType>(
    (searchParams.get('type') as NoticeType) || 'GENERAL',
  );
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [appliedKeyword, setAppliedKeyword] = useState(searchParams.get('keyword') || '');
  const [scope, setScope] = useState<'TITLE' | 'CONTENT'>(
    (searchParams.get('scope') as 'TITLE' | 'CONTENT') || 'TITLE',
  );
  const [appliedScope, setAppliedScope] = useState<'TITLE' | 'CONTENT'>(
    (searchParams.get('scope') as 'TITLE' | 'CONTENT') || 'TITLE',
  );

  const [currentPage, setCurrentPage] = useState<number>(Number(searchParams.get('page')) || 1);

  const {
    data: noticesResponse,
    isLoading: loading,
    error,
  } = useNotices({
    type: activeTab,
    keyword: appliedKeyword || undefined,
    scope: appliedScope,
    page: currentPage - 1,
    size: PAGE_SIZE,
  });

  const notices = noticesResponse?.data || [];
  const total = noticesResponse?.page?.totalElements || 0;

  // 에러 처리
  useEffect(() => {
    if (error) {
      console.error('공지사항 목록 로딩 실패:', error);
      messageApi.error('공지사항 목록 로딩 중 오류가 발생했습니다.');
    }
  }, [error, messageApi]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('type', activeTab);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (appliedKeyword) {
      params.set('keyword', appliedKeyword);
      params.set('scope', appliedScope); // 검색어가 있을 때만 scope 추가
    }
    setSearchParams(params);
  }, [activeTab, currentPage, appliedKeyword, appliedScope]);

  const handleTabChange = (key: string) => {
    setActiveTab(key as NoticeType);
    setKeyword('');
    setAppliedKeyword('');
    setScope('TITLE');
    setAppliedScope('TITLE');
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setAppliedKeyword(value.trim());
    setAppliedScope(scope);
    setCurrentPage(1);
  };

  const handleScopeChange = (value: string) => {
    setScope(value as 'TITLE' | 'CONTENT');
    setCurrentPage(1);
  };

  const tableColumns: TableProps<NoticeList>['columns'] = [
    { title: '번호', dataIndex: 'noticeId', key: 'noticeId', align: 'center', width: 80 },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      align: 'left',
      width: '60%',
      minWidth: 240,
    },
    {
      title: '작성 일시',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format(DATE_FORMAT.DEFAULT),
      width: '25%',
      minWidth: 160,
      align: 'left',
    },
    { title: '조회수', dataIndex: 'viewCount', key: 'viewCount', align: 'center', width: 100 },
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
              state: {
                returnTo: {
                  type: activeTab,
                  page: currentPage,
                  keyword: appliedKeyword,
                  scope: appliedScope,
                },
              },
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
      <Typography.Title level={3} style={{ marginBottom: 24 }}>
        공지사항
      </Typography.Title>

      <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabsItems} centered />

      <Flex wrap style={{ justifyContent: 'space-between', marginTop: 24 }}>
        <SearchBox
          searchField={scope}
          searchOptions={[
            { value: 'TITLE', label: '제목' },
            { value: 'CONTENT', label: '내용' },
          ]}
          searchKeyword={keyword}
          onSearchFieldChange={handleScopeChange}
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

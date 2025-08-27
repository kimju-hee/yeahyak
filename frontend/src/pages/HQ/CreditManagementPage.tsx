import { Button, Table, Tag, Typography, message, type TableProps } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { managementAPI } from '../../api';
import { SearchBox } from '../../components/SearchBox';
import {
  DATE_FORMAT,
  PAGE_SIZE,
  USER_CREDIT_STATUS_COLORS,
  USER_CREDIT_STATUS_TEXT,
} from '../../constants';
import type { PendingCredit, UserCreditStatus } from '../../types';

const getStatusTag = (status: UserCreditStatus) => {
  const color = USER_CREDIT_STATUS_COLORS[status];
  const text = USER_CREDIT_STATUS_TEXT[status];
  return (
    <Tag bordered={true} color={color}>
      {text}
    </Tag>
  );
};

export default function CreditManagementPage() {
  const [messageApi, contextHolder] = message.useMessage();

  const [pendings, setPendings] = useState<PendingCredit[]>([]);
  const [search, setSearch] = useState({
    field: 'pharmacyId' as 'pharmacyId' | 'pharmacyName',
    keyword: undefined as string | undefined,
    appliedField: 'pharmacyId' as 'pharmacyId' | 'pharmacyName',
    appliedKeyword: undefined as string | undefined,
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPendings = async () => {
    setLoading(true);
    try {
      const res = await managementAPI.getPendingCredits({
        page: currentPage - 1,
        size: PAGE_SIZE,
        // field: search.appliedField,
        // keyword: search.appliedKeyword,
      });

      if (res.success) {
        const { data, totalElements } = res;
        setPendings(data);
        setTotal(totalElements);
      }
    } catch (e: any) {
      console.error('정산 대기 목록 로딩 실패:', e);
      messageApi.error(e.response?.data?.message || '정산 대기 목록 로딩 중 오류가 발생했습니다.');
      setPendings([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendings();
  }, [currentPage, search.appliedKeyword, search.appliedField]);

  const handleSettle = async (userId: number) => {
    try {
      const res = await managementAPI.processSettlement(userId);

      if (res.success) {
        messageApi.success('정산 처리가 완료되었습니다.');
        fetchPendings();
      }
    } catch (e: any) {
      console.error('정산 처리 실패:', e);
      messageApi.error(e.response?.data?.message || '정산 처리 중 오류가 발생했습니다.');
    }
  };

  const tableColumns: TableProps<PendingCredit>['columns'] = [
    { title: '유저코드', dataIndex: 'userId', key: 'userId' },
    { title: '계정', dataIndex: 'email', key: 'email' },
    { title: '지점코드', dataIndex: 'pharmacyId', key: 'pharmacyId' },
    { title: '지점명', dataIndex: 'pharmacyName', key: 'pharmacyName' },
    {
      title: '미수잔액',
      dataIndex: 'point',
      key: 'point',
      render: (value) => value.toLocaleString() + '원',
    },
    {
      title: '최근정산일',
      dataIndex: 'recentSettledDate',
      key: 'recentSettledDate',
      render: (value) => (value ? dayjs(value).format(DATE_FORMAT.KR_DATE) : '-'),
    },
    {
      title: '최근정산액',
      dataIndex: 'recentSettledAmount',
      key: 'recentSettledAmount',
      render: (value) => (value != null ? value.toLocaleString() + '원' : '-'),
    },
    {
      title: '누적정산금액',
      dataIndex: 'totalSettledAmount',
      key: 'totalSettledAmount',
      render: (value) => (value != null ? value.toLocaleString() + '원' : '-'),
    },
    {
      title: '상태',
      dataIndex: 'creditStatus',
      key: 'creditStatus',
      render: (_, record) => getStatusTag(record.creditStatus),
    },
    {
      title: '정산',
      key: 'settle',
      render: (_, record) => <Button onClick={() => handleSettle(record.userId)}>정산</Button>,
    },
  ];

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        정산 관리
      </Typography.Title>

      <SearchBox
        searchField={search.field}
        searchOptions={[
          { value: 'pharmacyId', label: '지점코드' },
          { value: 'pharmacyName', label: '지점명' },
        ]}
        searchKeyword={search.keyword || ''}
        onSearchFieldChange={(value) =>
          setSearch((prev) => ({ ...prev, field: value as 'pharmacyId' | 'pharmacyName' }))
        }
        onSearchKeywordChange={(value) => setSearch((prev) => ({ ...prev, keyword: value }))}
        onSearch={() => {
          setSearch((prev) => ({
            ...prev,
            appliedField: prev.field,
            appliedKeyword: prev.keyword,
          }));
          setCurrentPage(1);
        }}
      />

      <Table
        columns={tableColumns}
        dataSource={pendings}
        loading={loading}
        rowKey={(record) => record.userId}
        pagination={{
          position: ['bottomCenter'],
          pageSize: PAGE_SIZE,
          total: total,
          current: currentPage,
          onChange: (page) => setCurrentPage(page),
          showSizeChanger: false,
        }}
        style={{ marginTop: '24px' }}
      />
    </>
  );
}

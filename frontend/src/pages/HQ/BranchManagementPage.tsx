import {
  Button,
  Descriptions,
  Flex,
  Space,
  Table,
  Tag,
  Typography,
  message,
  type TableProps,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { managementAPI } from '../../api';
import { SearchBox } from '../../components/SearchBox';
import {
  BRANCH_REQUEST_STATUS_COLORS,
  BRANCH_REQUEST_STATUS_TEXT,
  DATE_FORMAT,
  PAGE_SIZE,
} from '../../constants';
import type { BranchRequest, BranchRequestStatus } from '../../types';

const getStatusTag = (status: BranchRequestStatus) => {
  const color = BRANCH_REQUEST_STATUS_COLORS[status];
  const text = BRANCH_REQUEST_STATUS_TEXT[status];
  return (
    <Tag bordered={true} color={color}>
      {text}
    </Tag>
  );
};

export default function BranchManagementPage() {
  const [messageApi, contextHolder] = message.useMessage();

  const [requests, setRequests] = useState<BranchRequest[]>([]);
  const [search, setSearch] = useState({
    field: 'pharmacyId' as 'pharmacyId' | 'pharmacyName',
    keyword: undefined as string | undefined,
    appliedField: 'pharmacyId' as 'pharmacyId' | 'pharmacyName',
    appliedKeyword: undefined as string | undefined,
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await managementAPI.getBranchRequests({
        page: currentPage - 1,
        size: PAGE_SIZE,
        // field: search.appliedField,
        // keyword: search.appliedKeyword,
      });

      if (res.success) {
        const { data, totalElements } = res;
        setRequests(data);
        setTotal(totalElements);
      }
    } catch (e: any) {
      console.error('약국 등록 요청 목록 로딩 실패:', e);
      messageApi.error(
        e.response?.data?.message || '약국 등록 요청 목록 로딩 중 오류가 발생했습니다.',
      );
      setRequests([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentPage, search.appliedKeyword, search.appliedField]);

  const handleApprove = async (pharmacyId: number) => {
    try {
      const res = await managementAPI.approveBranch(pharmacyId);

      if (res.success) {
        messageApi.success('요청이 승인 처리되었습니다.');
        fetchRequests();
      }
    } catch (e: any) {
      console.error('요청 승인 처리 실패:', e);
      messageApi.error(e.response?.data?.message || '요청 승인 처리 중 오류가 발생했습니다.');
    }
  };

  const handleReject = async (pharmacyId: number) => {
    try {
      const res = await managementAPI.rejectBranch(pharmacyId);

      if (res.success) {
        messageApi.success('요청이 거절 처리되었습니다.');
        fetchRequests();
      }
    } catch (e: any) {
      console.error('요청 거절 처리 실패:', e);
      messageApi.error(e.response?.data?.message || '요청 거절 처리 중 오류가 발생했습니다.');
    }
  };

  const tableColumns: TableProps<BranchRequest>['columns'] = [
    {
      title: '지점코드',
      dataIndex: ['pharmacy', 'pharmacyId'],
      key: 'pharmacy.pharmacyId',
    },
    {
      title: '지점명',
      dataIndex: ['pharmacy', 'pharmacyName'],
      key: 'pharmacy.pharmacyName',
    },
    {
      title: '대표자명',
      dataIndex: ['pharmacy', 'representativeName'],
      key: 'pharmacy.representativeName',
    },
    { title: '연락처', dataIndex: ['pharmacy', 'contact'], key: 'pharmacy.contact' },
    {
      title: '상태',
      dataIndex: ['request', 'status'],
      key: 'request.status',
      render: (_, record) => getStatusTag(record.request.status),
    },
  ];

  const expandedRowRender = (record: BranchRequest) => {
    return (
      <>
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="대표자명">
            {record.pharmacy.representativeName}
          </Descriptions.Item>
          <Descriptions.Item label="사업자등록번호">{record.pharmacy.bizRegNo}</Descriptions.Item>
          <Descriptions.Item label="주소">{`${record.pharmacy.address} ${record.pharmacy.detailAddress}`}</Descriptions.Item>
          <Descriptions.Item label="요청일시">
            {dayjs(record.request.requestedAt).format(DATE_FORMAT.KR_DEFAULT)}
          </Descriptions.Item>
          <Descriptions.Item label="연락처">{record.pharmacy.contact}</Descriptions.Item>
          <Descriptions.Item label="검토일시">
            {record.request.reviewedAt
              ? dayjs(record.request.reviewedAt).format(DATE_FORMAT.KR_DEFAULT)
              : '미검토'}
          </Descriptions.Item>
          <Descriptions.Item label="상태">
            <Flex wrap justify="space-between" align="center">
              {getStatusTag(record.request.status)}
              {record && record.request.status === 'PENDING' && (
                <Space>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleApprove(record.pharmacy.pharmacyId)}
                  >
                    승인
                  </Button>
                  <Button
                    danger
                    size="small"
                    onClick={() => handleReject(record.pharmacy.pharmacyId)}
                  >
                    거절
                  </Button>
                </Space>
              )}
            </Flex>
          </Descriptions.Item>
        </Descriptions>
      </>
    );
  };

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        가맹점 관리
      </Typography.Title>
      {/* TODO: 검색 기능 구현 */}
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
        dataSource={requests}
        loading={loading}
        rowKey={(record) => record.request.id}
        pagination={{
          position: ['bottomCenter'],
          pageSize: PAGE_SIZE,
          total: total,
          current: currentPage,
          onChange: (page) => setCurrentPage(page),
          showSizeChanger: false,
        }}
        expandable={{
          expandedRowRender,
          expandRowByClick: true,
          expandIcon: () => null,
        }}
        style={{ marginTop: '24px' }}
      />
    </>
  );
}

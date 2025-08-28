import {
  Button,
  Descriptions,
  Flex,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
  type TableProps,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { pharmacyRequestAPI } from '../../api';
import { SearchBox } from '../../components/SearchBox';
import {
  DATE_FORMAT,
  PAGE_SIZE,
  PHARMACY_REQUEST_STATUS_COLORS,
  PHARMACY_REQUEST_STATUS_TEXT,
} from '../../constants';
import type {
  PharmacyRequestDetail,
  PharmacyRequestList,
  PharmacyRequestStatus,
} from '../../types';

const getStatusTag = (status: PharmacyRequestStatus) => {
  const color = PHARMACY_REQUEST_STATUS_COLORS[status];
  const text = PHARMACY_REQUEST_STATUS_TEXT[status];
  return (
    <Tag bordered={true} color={color} style={{ cursor: 'default' }}>
      {text}
    </Tag>
  );
};

export default function BranchManagementPage() {
  const [messageApi, contextHolder] = message.useMessage();

  const [requests, setRequests] = useState<PharmacyRequestList[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const [expandedRowData, setExpandedRowData] = useState<Record<number, PharmacyRequestDetail>>({});
  const [expandedRowLoading, setExpandedRowLoading] = useState<Record<number, boolean>>({});
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);

  const [search, setSearch] = useState({
    field: 'pharmacyName',
    keyword: undefined as string | undefined,
    appliedField: 'pharmacyName',
    appliedKeyword: undefined as string | undefined,
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await pharmacyRequestAPI.getPharmacyRequests({
        //  status: status,
        //  region: region,
        keyword: search.appliedKeyword,
        page: currentPage - 1,
        size: PAGE_SIZE,
      });

      if (res.success) {
        const { data, page } = res;
        setRequests(data);
        setTotal(page.totalElements);
      }
    } catch (e: any) {
      console.error('약국 등록 요청 목록 로딩 실패:', e);
      messageApi.error(
        e.response?.data?.message || '약국 등록 요청 목록 로딩 중 오류가 발생했습니다.',
      );
    } finally {
      setRequests([]);
      setTotal(0);
      setLoading(false);
    }
  };

  const fetchRequestDetail = async (pharmacyRequestId: number) => {
    setExpandedRowLoading((prev) => ({ ...prev, [pharmacyRequestId]: true }));
    try {
      const res = await pharmacyRequestAPI.getPharmacyRequest(pharmacyRequestId);

      if (res.success) {
        setExpandedRowData((prev) => ({ ...prev, [pharmacyRequestId]: res.data }));
      }
    } catch (e: any) {
      console.error('약국 등록 요청 상세 로딩 실패:', e);
      messageApi.error(
        e.response?.data?.message || '약국 등록 요청 상세 로딩 중 오류가 발생했습니다.',
      );
    } finally {
      setExpandedRowLoading((prev) => ({ ...prev, [pharmacyRequestId]: false }));
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentPage, search.appliedKeyword, search.appliedField]);

  const handleApprove = async (pharmacyId: number) => {
    try {
      await pharmacyRequestAPI.approve(pharmacyId);
      messageApi.success('요청이 승인 처리되었습니다.');
      fetchRequests();
    } catch (e: any) {
      console.error('요청 승인 처리 실패:', e);
      messageApi.error(e.response?.data?.message || '요청 승인 처리 중 오류가 발생했습니다.');
    }
  };

  const handleReject = async (pharmacyId: number) => {
    try {
      await pharmacyRequestAPI.reject(pharmacyId);
      messageApi.success('요청이 거절 처리되었습니다.');
      fetchRequests();
    } catch (e: any) {
      console.error('요청 거절 처리 실패:', e);
      messageApi.error(e.response?.data?.message || '요청 거절 처리 중 오류가 발생했습니다.');
    }
  };

  const handleExpand = (expanded: boolean, record: PharmacyRequestList) => {
    const pharmacyRequestId = record.pharmacyRequestId;
    if (expanded) fetchRequestDetail(pharmacyRequestId);
    setExpandedRowKeys(
      expanded
        ? [...expandedRowKeys, pharmacyRequestId]
        : expandedRowKeys.filter((key) => key !== pharmacyRequestId),
    );
  };

  const tableColumns: TableProps<PharmacyRequestList>['columns'] = [
    {
      title: '번호',
      dataIndex: 'pharmacyRequestId',
      key: 'pharmacyRequestId',
      align: 'center',
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
      align: 'center',
    },
    {
      title: '약국명',
      dataIndex: 'pharmacyName',
      key: 'pharmacyName',
      align: 'center',
    },
    {
      title: '사업자등록번호',
      dataIndex: 'bizRegNo',
      key: 'bizRegNo',
      align: 'center',
    },
    { title: '연락처', dataIndex: 'contact', key: 'contact', align: 'center' },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => getStatusTag(record.status),
      align: 'center',
    },
  ];

  const expandedRowRender = (record: PharmacyRequestList) => {
    const detail = expandedRowData[record.pharmacyRequestId];
    const isLoading = expandedRowLoading[record.pharmacyRequestId];
    if (isLoading) return <Spin />;
    if (!detail) return null;
    return (
      <>
        <Descriptions bordered column={2} size="middle" styles={{ label: { textAlign: 'center' } }}>
          <Descriptions.Item label="대표자명">{detail.representativeName}</Descriptions.Item>
          <Descriptions.Item label="주소">
            {`${detail.address} ${detail.detailAddress}`}
          </Descriptions.Item>
          <Descriptions.Item label="요청 일시">
            {dayjs(detail.requestedAt).format(DATE_FORMAT.KR_DEFAULT)}
          </Descriptions.Item>
          <Descriptions.Item label="연락처"> {detail.contact}</Descriptions.Item>
          <Descriptions.Item label="검토 일시">
            {detail.processedAt
              ? dayjs(detail.processedAt).format(DATE_FORMAT.KR_DEFAULT)
              : '미검토'}
          </Descriptions.Item>
          <Descriptions.Item label="상태">
            <Flex wrap justify="space-between" align="center">
              {getStatusTag(record.status)}
              {record.status === 'PENDING' && (
                <Space>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleApprove(record.pharmacyRequestId)}
                  >
                    승인
                  </Button>
                  <Button
                    danger
                    size="small"
                    onClick={() => handleReject(record.pharmacyRequestId)}
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

      <SearchBox
        searchField={search.field}
        searchOptions={[{ value: 'pharmacyName', label: '약국명' }]}
        searchKeyword={search.keyword || ''}
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
        rowKey={(record) => record.pharmacyRequestId}
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
          onExpand: handleExpand,
          expandedRowKeys,
          expandRowByClick: true,
          expandIcon: () => null,
        }}
        style={{ marginTop: '24px' }}
      />
    </>
  );
}

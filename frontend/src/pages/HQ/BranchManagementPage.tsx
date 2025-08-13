import {
  Button,
  Descriptions,
  Flex,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
  type TableProps,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { instance } from '../../api/api';
import type { RegRequestResponse } from '../../types/permission.type';
import { PHARMACY_STATUS, type PharmacyStatus } from '../../types/profile.type';

// TODO: 약국코드나 약국이름으로 검색 기능 추가? 고민중

const getStatusTag = (status: PharmacyStatus) => {
  const statusColorMap: Record<PharmacyStatus, { color: string; text: string }> = {
    [PHARMACY_STATUS.ACTIVE]: { color: 'success', text: '활성' },
    [PHARMACY_STATUS.PENDING]: { color: 'warning', text: '대기' },
    [PHARMACY_STATUS.REJECTED]: { color: 'default', text: '거절' },
  };
  const { color, text } = statusColorMap[status];
  return <Tag color={color}>{text}</Tag>;
};

const PAGE_SIZE = 10;

export default function BranchManagementPage() {
  const [messageApi, contextHolder] = message.useMessage();

  const [requests, setRequests] = useState<RegRequestResponse[]>([]);
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
      const res = await instance.get('/admin/pharmacies/requests', {
        params: {
          page: currentPage - 1,
          size: PAGE_SIZE,
          field: search.appliedField,
          keyword: search.appliedKeyword,
        },
      });
      // LOG: 테스트용 로그
      console.log('✨ 약국 등록 요청 목록 로딩 응답:', res.data);

      if (res.data.success) {
        const { data, totalElements } = res.data;
        setRequests(data);
        setTotal(totalElements);
      }
    } catch (e: any) {
      console.error('약국 등록 요청 목록 로딩 실패:', e);
      messageApi.error(e.message || '약국 등록 요청 목록 로딩 중 오류가 발생했습니다.');
      setRequests([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentPage, search.appliedKeyword, search.appliedField]);

  const handleApprove = async (record: RegRequestResponse) => {
    try {
      const res = await instance.post(`/admin/pharmacies/${record.request.pharmacyId}/approve`);
      // LOG: 테스트용 로그
      console.log('✨ 요청 승인 처리 응답:', res.data);

      if (res.data.success) {
        fetchRequests();
        messageApi.success('요청이 승인 처리되었습니다.');
      }
    } catch (e: any) {
      console.error('요청 승인 처리 실패:', e);
      messageApi.error(e.message || '요청 승인 처리 중 오류가 발생했습니다.');
    }
  };

  const handleReject = async (record: RegRequestResponse) => {
    try {
      const res = await instance.post(`/admin/pharmacies/${record.request.pharmacyId}/reject`);
      // LOG: 테스트용 로그
      console.log('✨ 요청 거절 처리 응답:', res.data);

      if (res.data.success) {
        fetchRequests();
        messageApi.success('요청이 거절 처리되었습니다.');
      }
    } catch (e: any) {
      console.error('요청 거절 처리 실패:', e);
      messageApi.error(e.message || '요청 거절 처리 중 오류가 발생했습니다.');
    }
  };

  const tableColumns: TableProps<RegRequestResponse>['columns'] = [
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

  const expandedRowRender = (record: RegRequestResponse) => {
    return (
      <>
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="대표자명">
            {record.pharmacy.representativeName}
          </Descriptions.Item>
          <Descriptions.Item label="사업자등록번호">{record.pharmacy.bizRegNo}</Descriptions.Item>
          <Descriptions.Item label="주소">{`${record.pharmacy.address} ${record.pharmacy.detailAddress}`}</Descriptions.Item>
          <Descriptions.Item label="요청일시">
            {dayjs(record.request.requestedAt).format('YYYY년 MM월 DD일 HH시 mm분')}
          </Descriptions.Item>
          <Descriptions.Item label="연락처">{record.pharmacy.contact}</Descriptions.Item>
          <Descriptions.Item label="검토일시">
            {record.request.reviewedAt
              ? dayjs(record.request.reviewedAt).format('YYYY년 MM월 DD일 HH시 mm분')
              : '미검토'}
          </Descriptions.Item>
          <Descriptions.Item label="상태">
            <Flex wrap justify="space-between" align="center">
              {getStatusTag(record.request.status)}
              {record && record.request.status === 'PENDING' && (
                <Space>
                  <Button type="primary" size="small" onClick={() => handleApprove(record)}>
                    승인
                  </Button>
                  <Button danger size="small" onClick={() => handleReject(record)}>
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

      <Space.Compact style={{ marginBottom: '24px' }}>
        <Select
          value={search.field}
          onChange={(value) =>
            setSearch((prev) => ({ ...prev, field: value as 'pharmacyId' | 'pharmacyName' }))
          }
          options={[
            { value: 'pharmacyId', label: '지점코드' },
            { value: 'pharmacyName', label: '지점명' },
          ]}
        />
        <Input.Search
          allowClear
          value={search.keyword}
          placeholder="검색어 입력"
          onChange={(e) => setSearch((prev) => ({ ...prev, keyword: e.target.value }))}
          onSearch={() => {
            setSearch((prev) => ({
              ...prev,
              appliedField: prev.field,
              appliedKeyword: prev.keyword,
            }));
            setCurrentPage(1);
          }}
        />
      </Space.Compact>

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
        }}
        expandable={{
          expandedRowRender,
          expandRowByClick: true,
          expandIcon: () => null,
        }}
      />
    </>
  );
}

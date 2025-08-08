import {
  Button,
  Descriptions,
  Drawer,
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
import { useNavigate } from 'react-router-dom';
import { instance } from '../../api/api';
import type { RegRequestResponse } from '../../types/permission.type';
import { PHARMACY_STATUS } from '../../types/profile.type';

const PAGE_SIZE = 10;

export default function BranchManagementPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<RegRequestResponse[]>([]);
  const [search, setSearch] = useState({
    field: 'pharmacyId' as 'pharmacyId' | 'pharmacyName',
    keyword: '',
    appliedField: 'pharmacyId' as 'pharmacyId' | 'pharmacyName',
    appliedKeyword: '',
  });
  const [selectedBranch, setSelectedBranch] = useState<RegRequestResponse>();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await instance.get('/admin/pharmacies/requests', {
        params: {
          page: currentPage - 1,
          size: PAGE_SIZE,
        },
      });

      // LOG: 테스트용 로그
      console.log('✨ 약국 등록 요청 목록 로딩:', res.data);

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

  const getStatusTag = (status: string) => {
    const color =
      status === PHARMACY_STATUS.ACTIVE
        ? 'success'
        : status === PHARMACY_STATUS.PENDING
          ? 'processing'
          : 'default';
    return <Tag color={color}>{status}</Tag>;
  };

  const handleApprove = async (record: RegRequestResponse) => {
    try {
      const res = await instance.post(`/admin/pharmacies/${record.request.pharmacyId}/approve`);

      // LOG: 테스트용 로그
      console.log('✨ 요청 승인 처리 응답:', res.data);

      if (res.data.success) {
        fetchRequests();
        messageApi.success('요청이 승인 처리되었습니다.');
        setDrawerOpen(false);
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
        setDrawerOpen(false);
      }
    } catch (e: any) {
      console.error('요청 거절 처리 실패:', e);
      messageApi.error(e.message || '요청 거절 처리 중 오류가 발생했습니다.');
    }
  };

  const tableColumns: TableProps<RegRequestResponse>['columns'] = [
    {
      title: '약국코드',
      dataIndex: ['pharmacy', 'pharmacyId'],
      key: 'pharmacy.pharmacyId',
    },
    {
      title: '약국명',
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
      render: (_: any, record: RegRequestResponse) => getStatusTag(record.request.status),
    },
  ];

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        가맹점 관리
      </Typography.Title>
      {/* TODO: 검색 기능 구현 */}
      <Space.Compact style={{ marginBottom: '16px' }}>
        <Select
          value={search.field}
          onChange={(value) =>
            setSearch((prev) => ({ ...prev, field: value as 'pharmacyId' | 'pharmacyName' }))
          }
          options={[
            { value: 'pharmacyId', label: '약국코드' },
            { value: 'pharmacyName', label: '약국명' },
          ]}
        />
        <Input.Search
          allowClear
          value={search.keyword}
          placeholder="검색어 입력"
          onChange={(e) => setSearch((prev) => ({ ...prev, keyword: e.target.value }))}
          onSearch={() => fetchRequests()}
        />
      </Space.Compact>
      <Table
        columns={tableColumns}
        dataSource={requests}
        loading={loading}
        rowKey={(record) => record.request.id}
        onRow={(record) => ({
          onClick: () => {
            setSelectedBranch(record);
            setDrawerOpen(true);
          },
        })}
        pagination={{
          position: ['bottomCenter'],
          pageSize: PAGE_SIZE,
          total: total,
          current: currentPage,
          onChange: (page) => setCurrentPage(page),
        }}
      />
      <Drawer
        title={`${selectedBranch?.pharmacy.pharmacyName} 상세 정보`}
        placement="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={'550px'}
      >
        {selectedBranch && (
          <>
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="대표자명">
                {selectedBranch.pharmacy.representativeName}
              </Descriptions.Item>
              <Descriptions.Item label="사업자등록번호">
                {selectedBranch.pharmacy.bizRegNo}
              </Descriptions.Item>
              <Descriptions.Item label="주소">{`${selectedBranch.pharmacy.address} ${selectedBranch.pharmacy.detailAddress}`}</Descriptions.Item>
              <Descriptions.Item label="연락처">
                {selectedBranch.pharmacy.contact}
              </Descriptions.Item>
              <Descriptions.Item label="요청 일시">
                {dayjs(selectedBranch.request.requestedAt).format('YYYY년 MM월 DD일 HH시 mm분')}
              </Descriptions.Item>
              <Descriptions.Item label="검토 일시">
                {selectedBranch.request.reviewedAt
                  ? dayjs(selectedBranch.request.reviewedAt).format('YYYY년 MM월 DD일 HH시 mm분')
                  : '미검토'}
              </Descriptions.Item>
              <Descriptions.Item label="상태">
                <Flex wrap justify="space-between" align="center">
                  {getStatusTag(selectedBranch.request.status)}
                  {selectedBranch && selectedBranch.request.status === 'PENDING' && (
                    <Space>
                      <Button type="primary" onClick={() => handleApprove(selectedBranch)}>
                        승인
                      </Button>
                      <Button danger onClick={() => handleReject(selectedBranch)}>
                        거절
                      </Button>
                    </Space>
                  )}
                </Flex>
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Drawer>
    </>
  );
}

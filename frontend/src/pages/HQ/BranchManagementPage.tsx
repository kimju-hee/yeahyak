import React, { useState } from "react";
import {
  Table,
  Button,
  Input,
  Modal,
  Space,
  Tag,
  Typography,
  Descriptions,
  Card,
  Row,
  Col,
  Statistic,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";

const { Title } = Typography;

const dummyData = [
  {
    key: "1",
    branchCode: "BR001",
    branchName: "유성점",
    pharmacist: "김약사",
    contact: "010-1111-2222",
    balance: 150000,
    cumulativeAmount: 3000000,
    address: "대전 유성구 대학로 99",
    openedAt: "2023-01-15",
    lastCharged: "2025-07-20",
    status: "운영 중",
    manager: "박대리",
    businessHours: "09:00 ~ 18:00",
    bank: "농협 123-4567-8901",
    note: "거래 안정적",
  },
  {
    key: "2",
    branchCode: "BR002",
    branchName: "Kt점",
    pharmacist: "최진호",
    contact: "010-2222-3333",
    balance: 200000,
    cumulativeAmount: 5200000,
    address: "서울 강남구 테헤란로 123",
    openedAt: "2022-09-10",
    lastCharged: "2025-07-10",
    status: "휴점",
    manager: "이대리",
    businessHours: "10:00 ~ 17:00",
    bank: "신한 110-5555-1234",
    note: "리뉴얼 예정",
  },
];

export default function BranchManagementPage() {
  const [searchText, setSearchText] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 검색 필터링
  const filteredData = dummyData.filter(
    (item) =>
      item.branchName.includes(searchText) ||
      item.pharmacist.includes(searchText) ||
      item.branchCode.includes(searchText)
  );

  // 통계 계산
  const totalCount = dummyData.length;
  const activeCount = dummyData.filter((b) => b.status === "운영 중").length;
  const pausedCount = dummyData.filter((b) => b.status === "휴점").length;
  const closedCount = dummyData.filter((b) => b.status === "계약 해지").length;

  // 테이블 컬럼 정의
  const columns = [
    {
      title: "지점코드",
      dataIndex: "branchCode",
      key: "branchCode",
    },
    {
      title: "지점명",
      dataIndex: "branchName",
      key: "branchName",
      render: (text: string, record: any) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => openDetailModal(record)}>
          {text}
        </Button>
      ),
    },
    { title: "약사명", dataIndex: "pharmacist", key: "pharmacist" },
    { title: "연락처", dataIndex: "contact", key: "contact" },
    {
      title: "보유금액",
      dataIndex: "balance",
      key: "balance",
      render: (val: number) => val.toLocaleString() + "원",
      sorter: (a: any, b: any) => a.balance - b.balance,
    },
    {
      title: "누적 거래금액",
      dataIndex: "cumulativeAmount",
      key: "cumulativeAmount",
      render: (val: number) => val.toLocaleString() + "원",
      sorter: (a: any, b: any) => a.cumulativeAmount - b.cumulativeAmount,
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "운영 중", value: "운영 중" },
        { text: "휴점", value: "휴점" },
        { text: "계약 해지", value: "계약 해지" },
      ],
      onFilter: (value: any, record: any) => record.status === value,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "최근 충전일",
      dataIndex: "lastCharged",
      key: "lastCharged",
      sorter: (a: any, b: any) =>
        new Date(a.lastCharged).getTime() - new Date(b.lastCharged).getTime(),
    },
    {
      title: "충전",
      key: "charge",
      render: () => <Button type="primary">충전</Button>,
    },
  ];

  // 상태 표시용 태그 렌더링
  const getStatusTag = (status: string) => {
    switch (status) {
      case "운영 중":
        return <Tag color="green">{status}</Tag>;
      case "휴점":
        return <Tag color="orange">{status}</Tag>;
      case "계약 해지":
        return <Tag color="red">{status}</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const openDetailModal = (record: any) => {
    setSelectedBranch(record);
    setModalVisible(true);
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>가맹점 관리</Title>

      {/* ✅ 요약 카드 4종 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card><Statistic title="총 가맹점 수" value={totalCount} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="운영 중" value={activeCount} valueStyle={{ color: "green" }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="휴점" value={pausedCount} valueStyle={{ color: "orange" }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="계약 해지" value={closedCount} valueStyle={{ color: "red" }} /></Card>
        </Col>
      </Row>

      {/* 검색 */}
      <Input.Search
        placeholder="지점명, 약사명, 지점코드로 검색"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 350, marginBottom: 16 }}
        allowClear
      />

      {/* 테이블 */}
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 5 }}
        rowKey="branchCode"
      />

      {/* 상세 모달 */}
      <Modal
        title={`${selectedBranch?.branchName} 상세 정보`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {selectedBranch && (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="약사명">{selectedBranch.pharmacist}</Descriptions.Item>
            <Descriptions.Item label="연락처">{selectedBranch.contact}</Descriptions.Item>
            <Descriptions.Item label="주소">{selectedBranch.address}</Descriptions.Item>
            <Descriptions.Item label="개설일">{selectedBranch.openedAt}</Descriptions.Item>
            <Descriptions.Item label="운영시간">{selectedBranch.businessHours}</Descriptions.Item>
            <Descriptions.Item label="계좌정보">{selectedBranch.bank}</Descriptions.Item>
            <Descriptions.Item label="보유금액">{selectedBranch.balance.toLocaleString()}원</Descriptions.Item>
            <Descriptions.Item label="누적 거래금액">{selectedBranch.cumulativeAmount.toLocaleString()}원</Descriptions.Item>
            <Descriptions.Item label="최근 충전일">{selectedBranch.lastCharged}</Descriptions.Item>
            <Descriptions.Item label="상태">{getStatusTag(selectedBranch.status)}</Descriptions.Item>
            <Descriptions.Item label="비고">{selectedBranch.note}</Descriptions.Item>
            <Descriptions.Item label="본사 담당자">{selectedBranch.manager}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}

// 필요한 React Hooks 및 antd 컴포넌트들을 가져옵니다.
import React, { useState, useMemo } from 'react';
import {
  Button,
  DatePicker,
  Row,
  Col,
  Table,
  Layout,
  Typography,
  Space,
  Form,
  Modal,
  Descriptions,
  Cascader,
  Tag,
} from 'antd';
// antd에서 필요한 타입들을 가져옵니다.
import type { TableColumnsType, TableProps, CascaderProps, GetProp } from 'antd';

// 목(mock) 데이터를 가져옵니다.
import { mockOrders, mockOrderItems } from '../../mocks/order.mock';
import { mockPharmacies } from '../../mocks/auth.mock';
import { mockProducts } from '../../mocks/product.mock';

// 데이터 타입을 정의한 파일에서 타입들을 가져옵니다.
import type { Order, OrderItem, Pharmacy, Product } from '../../mocks/types';

const { Content } = Layout; // Layout에서 Content 컴포넌트를 사용합니다.
const { Text } = Typography; // Typography에서 Text 컴포넌트를 사용합니다.

// Ant Design Table의 onChange 이벤트 핸들러 타입을 정의합니다.
type OnChange<T> = NonNullable<TableProps<T>['onChange']>;

// 배열 타입에서 단일 요소의 타입을 추출합니다.
type GetSingle<T> = T extends (infer U)[] ? U : never;

// 정렬 정보를 담는 타입을 정의합니다.
type Sorts = GetSingle<Parameters<OnChange<OrderTableDataType>>[2]>;

// Cascader의 옵션 타입을 가져옵니다.
type DefaultOptionType = GetProp<CascaderProps, 'options'>[number];

// 주문 테이블에 표시될 데이터의 타입을 정의합니다.
interface OrderTableDataType extends Order {
  key: React.Key; // 테이블 행의 고유 키
  pharmacyName: string; // 약국 이름
  productSummary: string; // 주문 상품 요약
}

// 지역 선택 Cascader에서 사용할 옵션의 타입을 정의합니다.
interface Option {
  value: string; // 옵션의 값
  label: string; // 옵션의 레이블
  children?: Option[]; // 하위 옵션
}

// 지역 선택 옵션 데이터입니다.
const options: Option[] = [
  {
    value: '충남충북',
    label: '충남충북',
    children: [
      { value: '천안', label: '천안' },
      { value: '대전', label: '대전' },
      { value: '청주', label: '청주' },
    ],
  },
];

// Cascader에서 검색 기능을 사용할 때 적용될 필터 함수입니다.
const filter = (inputValue: string, path: DefaultOptionType[]) =>
  path.some(
    (option) => (option.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1,
  );

// 주문 상태에 따라 다른 색상의 태그를 반환하는 함수입니다.
const getStatusTag = (status: Order['status']) => {
  switch (status) {
    case 'REQUESTED':
      return <Tag color="blue">승인 대기</Tag>;
    case 'APPROVED':
      return <Tag color="green">승인 완료</Tag>;
    case 'PROCESSING':
      return <Tag color="purple">처리 중</Tag>;
    case 'SHIPPING':
      return <Tag color="orange">배송 중</Tag>;
    case 'COMPLETED':
      return <Tag color="gold">완료</Tag>;
    case 'CANCELED':
      return <Tag color="red">취소</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

// 본사의 발주 관리 페이지 컴포넌트입니다.
export default function OrderManagementPage() {
  const [loadings, setLoadings] = useState<boolean[]>([]); // 버튼 로딩 상태를 관리합니다.
  const [sortedInfo, setSortedInfo] = useState<Sorts>({}); // 테이블 정렬 상태를 관리합니다.
  // 주문 데이터를 목 데이터로부터 생성하여 상태로 관리합니다.
  const [orders, setOrders] = useState<OrderTableDataType[]>(() => {
    const pharmacyMap = new Map<number, Pharmacy>(mockPharmacies.map((p) => [p.id, p]));
    const productMap = new Map<number, Product>(mockProducts.map((p) => [p.id, p]));

    return mockOrders.map((order) => {
      const pharmacy = pharmacyMap.get(order.pharmacyId); // auth.mock의 pharmacy에서 order의 pharmacyId와 같은 데이터 불러와서 저장
      const items = mockOrderItems.filter((item) => item.orderId === order.id); // order의 id를 가지고 있는 주문정보를 골라서 저장
      const productSummary =
        items.length > 0
          ? `${productMap.get(items[0].productId)?.productName ?? '알 수 없는 제품'} ${
              // productId와 일치하는 약품 이름 불러오기
              items.length > 1 ? `외 ${items.length - 1}건` : ''
            }`
          : '주문 항목 없음'; // 배열을 요약해서 문자열로 표시 "~~ 약 외 2건"

      return {
        ...order,
        key: order.id,
        pharmacyName: pharmacy?.pharmacyName ?? '알 수 없는 약국',
        productSummary, // 약국 이름과 약품 요약 문자열 추가해서 반환
      };
    });
  });

  const [filteredOrders, setFilteredOrders] = useState<OrderTableDataType[]>(orders); // 필터링된 주문 데이터를 관리합니다.
  const [selectedOrder, setSelectedOrder] = useState<OrderTableDataType | null>(null); // 사용자가 선택한 주문의 상세 정보를 관리합니다.
  const [modalVisible, setModalVisible] = useState(false); // 상세 정보 모달의 표시 여부를 관리합니다.
  const [form] = Form.useForm(); // Ant Design의 Form 인스턴스를 생성합니다.

  // 테이블의 정렬 기능이 변경될 때 호출되는 핸들러입니다.
  const handleSort: OnChange<OrderTableDataType> = (pagination, filters, sorter) => {
    setSortedInfo(sorter as Sorts);
  };

  // 테이블의 특정 행이 클릭될 때 호출되는 핸들러입니다.
  const handleRowClick = (record: OrderTableDataType) => {
    setSelectedOrder(record); // 선택된 주문 정보를 상태에 저장합니다.
    setModalVisible(true); // 모달을 표시합니다.
  };

  // 주문 상태를 업데이트하는 핸들러입니다. (예: 승인 처리)
  const handleStatusUpdate = (orderId: number, newStatus: Order['status']) => {
    const updateOrder = (order: OrderTableDataType) =>
      order.id === orderId
        ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
        : order;

    const newOrders = orders.map(updateOrder);
    const newFilteredOrders = filteredOrders.map(updateOrder);   

    setOrders(newOrders); // 전체 주문 목록을 업데이트합니다.
    setFilteredOrders(newFilteredOrders); // 필터링된 주문 목록도 업데이트합니다.

    // 현재 모달에 표시된 주문의 상태도 업데이트합니다.
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // '발주 조회' 버튼 클릭 시 호출되는 필터링 핸들러입니다.
  const handleFilterSearch = () => {
    const { branch, date } = form.getFieldsValue(); // 폼에서 현재 값들을 가져옵니다. ( 지점명, 기간 )
    const selectedBranch =
      Array.isArray(branch) && branch.length > 0 ? branch[branch.length - 1] : null;
    const [startDate, endDate] = date ?? [null, null];

    const filtered = orders.filter((order) => {
      const pharmacy = mockPharmacies.find((p) => p.id === order.pharmacyId);
      const matchBranch = !selectedBranch || pharmacy?.address.includes(selectedBranch);
      const orderDate = new Date(order.createdAt);
      const matchDate =
        !startDate ||
        !endDate ||
        (orderDate >= startDate.toDate() && orderDate <= endDate.toDate());
      return matchBranch && matchDate;
    });

    setFilteredOrders(filtered); // 필터링된 결과를 상태에 적용합니다.
  };

  // 버튼 클릭 시 로딩 효과를 주는 핸들러입니다.
  const enterLoading = (index: number) => {
    setLoadings((prev) => {
      const newLoadings = [...prev];
      newLoadings[index] = true;
      return newLoadings;
    });

    // 1.5초 후 로딩 상태를 해제합니다.
    setTimeout(() => {
      setLoadings((prev) => {
        const newLoadings = [...prev];
        newLoadings[index] = false;
        return newLoadings;
      });
    }, 1500);
  };

  // 주문 목록을 표시할 테이블의 컬럼 정의입니다.
  const columns: TableColumnsType<OrderTableDataType> = [
    { title: '주문번호', dataIndex: 'id', key: 'id', width: 100, ellipsis: true },
    {
      title: '지점',
      dataIndex: 'pharmacyName',
      key: 'pharmacyName',
      width: 120,
      sorter: (a, b) => a.pharmacyName.localeCompare(b.pharmacyName), // 이름순 정렬
      sortOrder: sortedInfo.columnKey === 'pharmacyName' ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: '요청일자',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (text) => new Date(text).toLocaleDateString(), // 날짜 형식으로 표시
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(), // 날짜순 정렬
      sortOrder: sortedInfo.columnKey === 'createdAt' ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: '의약품',
      dataIndex: 'productSummary',
      key: 'productSummary',
      width: 200,
      ellipsis: true,
    },
    {
      title: '주문 금액',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      render: (value) => `${value.toLocaleString()}원`, // 통화 형식으로 표시
      sorter: (a, b) => a.totalPrice - b.totalPrice, // 금액순 정렬
      sortOrder: sortedInfo.columnKey === 'totalPrice' ? sortedInfo.order : null,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      // 상태가 'REQUESTED'일 경우 승인 버튼을, 아닐 경우 상태 태그를 표시합니다.
      render: (status: Order['status'], record) =>
        status === 'REQUESTED' ? (
          <Button
            type="primary"
            size="small"
            onClick={(e) => {
              e.stopPropagation(); // 행 클릭 이벤트 전파 방지
              handleStatusUpdate(record.id, 'APPROVED');
            }}
          >
            승인
          </Button>
        ) : (
          getStatusTag(status)  // 상태를 태그로 표시
        ),
    },
  ];

  // 선택된 주문의 상세 품목 정보를 계산합니다. (useMemo로 성능 최적화)
  const selectedOrderItems = useMemo(() => {
    
    if (!selectedOrder) return [];
    const productMap = new Map<number, Product>(mockProducts.map((p) => [p.id, p]));  // 제품 ID를 키로 하는 Map 생성
    return mockOrderItems
      .filter((item) => item.orderId === selectedOrder.id)    // 현재 선택된 주문의 id에 속한 주문 항목만 필터링
      .map((item) => ({
        ...item,
        productName: productMap.get(item.productId)?.productName ?? '알 수 없는 제품',
      }));
  }, [selectedOrder]);  // 필터링된 주문 항목에 주문 id에 맞는 제품 이름을 추가해서 반환

  return (
    <Content style={{ margin: '24px', padding: '24px' }}>
      {/* 페이지 제목 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '30px' }}>
        <Col>
          <Text strong style={{ fontSize: '30px' }}>
            발주 조회/승인
          </Text>
        </Col>
      </Row>

      {/* 필터링 옵션 폼 */}
      <Form layout="vertical" form={form}>
        <Row justify="space-between" style={{ padding: '5px 50px' }}>
          <Space>
            <Col>
              <Form.Item label="지점명" name="branch">
                <Cascader options={options} placeholder="지역 선택" showSearch={{ filter }} />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label="기간" name="date">
                <DatePicker.RangePicker placeholder={['시작일', '종료일']} style={{ width: 400 }} />
              </Form.Item>
            </Col>
          </Space>
          <Col>
            <Form.Item label=" ">
              <Button
                onClick={() => {
                  form.resetFields(); // 폼 필드 초기화
                  setFilteredOrders(orders); // 필터링된 목록을 전체 목록으로 복원
                }}
              >
                옵션 초기화
              </Button>
              <Button
                type="primary"
                loading={loadings[0]}
                onClick={() => {
                  enterLoading(0);
                  handleFilterSearch();
                }}
                style={{ marginLeft: 8 }}
              >
                발주 조회
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {/* 주문 목록 테이블 */}
      <Row justify="center" style={{ marginTop: 20 }}>
        <Col span={22}>
          <Table<OrderTableDataType>
            columns={columns}
            dataSource={filteredOrders}
            onChange={handleSort}
            pagination={{ position: ['bottomCenter'], pageSize: 6 }} // 페이지네이션 설정
            onRow={(record) => ({ onClick: () => handleRowClick(record) })} // 행 클릭 이벤트
            rowKey="id"
          />
        </Col>
      </Row>

      {/* 주문 상세 정보 모달 */}
      <Modal
        title="발주 상세 정보"
        open={modalVisible}
        closable={false}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            닫기
          </Button>,
          // 상태가 'REQUESTED'일 때만 승인 버튼을 표시합니다.
          selectedOrder?.status === 'REQUESTED' && (
            <Button
              key="approve"
              type="primary"
              onClick={() => {
                if (selectedOrder) {
                  handleStatusUpdate(selectedOrder.id, 'APPROVED');
                  setModalVisible(false);
                }
              }}
            >
              승인
            </Button>
          ),
        ]}
        width={800}
      >
        {selectedOrder && (
          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="주문번호" span={1}>
              {selectedOrder.id}
            </Descriptions.Item>
            <Descriptions.Item label="지점명" span={1}>
              {selectedOrder.pharmacyName}
            </Descriptions.Item>
            <Descriptions.Item label="요청일자" span={1}>
              {new Date(selectedOrder.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="최종 수정일" span={1}>
              {selectedOrder.updatedAt ? new Date(selectedOrder.updatedAt).toLocaleString() : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="상태" span={2}>
              {getStatusTag(selectedOrder.status)}
            </Descriptions.Item>
            <Descriptions.Item label="주문 항목" span={2}>
              {/* 주문 상세 품목 테이블 */}
              <Table
                dataSource={selectedOrderItems}   // 선택된 행에 대한 제품 정보만
                columns={[
                  { title: '제품명', dataIndex: 'productName', key: 'productName' },
                  { title: '수량', dataIndex: 'quantity', key: 'quantity' },
                  {
                    title: '단가',
                    dataIndex: 'unitPrice',
                    key: 'unitPrice',
                    render: (v) => `${v.toLocaleString()}원`,
                  },
                  {
                    title: '소계',
                    dataIndex: 'subtotalPrice',
                    key: 'subtotalPrice',
                    render: (v) => `${v.toLocaleString()}원`,
                  },
                ]}
                pagination={false}
                rowKey="id"
                size="small"
              />
            </Descriptions.Item>
            <Descriptions.Item label="총 주문 금액" span={2}>
              <Text
                strong
                style={{ fontSize: 16 }}
              >{`${selectedOrder.totalPrice.toLocaleString()}원`}</Text>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Content>
  );
}

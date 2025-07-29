import React, { useState } from 'react';

import {
  Button,
  DatePicker, // 날짜 선택
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
} from 'antd';

import type { MenuProps, TableColumnsType, TableProps, CascaderProps, GetProp } from 'antd'; // 타입 정의

// 드랍다운과 버튼
import { UserOutlined } from '@ant-design/icons'; //드랍다운 하단 메뉴 아웃라인

const { Content } = Layout;
const { Text } = Typography;

type OnChange = NonNullable<TableProps<DataType>['onChange']>;
type GetSingle<T> = T extends (infer U)[] ? U : never;
type Sorts = GetSingle<Parameters<OnChange>[2]>;

type DefaultOptionType = GetProp<CascaderProps, 'options'>[number];

const items: MenuProps['items'] = [
  //드롭다운 메뉴 시작 ( 더미데이터 사용 중 )
  {
    label: '1st',
    key: '1',
    icon: <UserOutlined />,
  },

  {
    label: '2nd',
    key: '2',
    icon: <UserOutlined />,
  },
]; //드롭다운 메뉴 끝

// 발주현황 확인 표의 컬럼들
interface DataType {
  key: React.Key;
  order: string;
  branch: string;
  date: string;
  product: string;
  price: number;
  status: string;
}

interface Option {
  value: string;
  label: string;
  children?: Option[];
}

const options: Option[] = [
  {
    value: '충남충북',
    label: '충남충북',
    children: [
      {
        value: '천안',
        label: '천안',
      },
      {
        value: '대전',
        label: '대전',
      },
      {
        value: '청주',
        label: '청주',
      },
    ],
  },
  {
    value: '경기',
    label: '경기',
    children: [
      {
        value: '강남',
        label: '강남',
      },
      {
        value: '강북',
        label: '강북',
      },
      {
        value: '강동',
        label: '강동',
      },
      {
        value: '강서',
        label: '강서',
      },
    ],
  },
];

const filter = (
  inputValue: string,
  path: DefaultOptionType[], // 지역 선택
) =>
  path.some(
    (option) => (option.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1,
  );

const dataSource: DataType[] = [
  // 발주 현황 메뉴판 더미 데이터
  {
    key: 1,
    order: 'p1',
    branch: '대전유성',
    date: '2021-01-21',
    product: '타이레놀',
    price: 2000,
    status: '승인',
  },
  {
    key: 2,
    order: 'p2',
    branch: '천안곡',
    date: '2021-01-22',
    product: '타이레놀',
    price: 3000,
    status: '승인',
  },
  {
    key: 3,
    order: 'p3',
    branch: '대전유성',
    date: '2021-01-19',
    product: '펜타닐',
    price: 5000,
    status: '승인',
  },
  {
    key: 4,
    order: 'p4',
    branch: '대전유성',
    date: '2021-02-01',
    product: '메스암페타민',
    price: 3000,
    status: '승인',
  },
  {
    key: 5,
    order: 'p5',
    branch: '천안청수',
    date: '2021-02-28',
    product: 'LSD',
    price: 10000,
    status: '승인',
  },
  {
    key: 6,
    order: 'p6',
    branch: '천안쌍용',
    date: '2021-03-14',
    product: '필로폰',
    price: 20000,
    status: '승인',
  },
  {
    key: 7,
    order: 'p7',
    branch: '대전용문',
    date: '2021-06-10',
    product: '코카인',
    price: 10000,
    status: '승인',
  },
  {
    key: 8,
    order: 'p8',
    branch: '천안봉명',
    date: '2021-08-09',
    product: '아편',
    price: 50000,
    status: '승인',
  },
  {
    key: 9,
    order: 'p9',
    branch: '대전탄방',
    date: '2021-08-09',
    product: '아편',
    price: 50000,
    status: '승인',
  },
  {
    key: 10,
    order: 'p10',
    branch: '대전시청',
    date: '2021-08-09',
    product: 'ㅇㅇ',
    price: 50000,
    status: '승인',
  },
  {
    key: 11,
    order: 'p11',
    branch: '천안시청',
    date: '2021-08-09',
    product: '옥시토신',
    price: 40000,
    status: '승인',
  },
];

const MenuProps = {
  items,
};

export default function OrderManagementPage() {
  // 버튼 클릭 시 로딩 표현
  const [loadings, setLoadings] = useState<boolean[]>([]); // 로딩 표시를 위한 상태 저장
  const [sortedInfo, setSortedInfo] = useState<Sorts>({}); // 정렬를 위한 상태 저장

  const [originalData, setOriginalData] = useState<DataType[]>(dataSource); // 🔒 원본 데이터 (수정 안함)
  const [data, setData] = useState<DataType[]>(dataSource); // 화면에 표시할 데이터

  const [Selected, setSelected] = useState<DataType | null>(null); // 모달 창에 표시할 행 하나의 데이터
  const [modalVisible, setModalVisible] = useState(false); // 모달 창의 표시 여부 상태 저장, 디폴트는 false

  const [filterDateRange, setFilterDateRange] = useState<[string, string] | null>(null);
  const [filterBranch, setFilterBranch] = useState<string | null>(null);

  const [form] = Form.useForm();

  const handleChange: OnChange = (Pagination, filters, sorter) => {
    // OnChange 함수를 통해 Table에서 조작 발생했을때의 콜백 함수
    console.log('Various parameters', Pagination, sorter);
    setSortedInfo(sorter as Sorts);
  };

  const handleRowclick = (record: DataType) => {
    //테이블에서 행 클릭 시 호출
    setSelected(record);
    setModalVisible(true); //클릭한 행 데이터를 저장하고 모달 표시
  };

  const handleApprove = (key: React.Key) => {
    // 테이블 버튼 관리
    const newData = data.map((item) =>
      item.key === key ? { ...item, status: '승인 완료' } : item,
    ); //클릭된 행의 상태를 승인 완료로 바꿈
    setData(newData); // 보여지는 테이블도 갱신
    setOriginalData(newData); // ✅ 원본도 갱신
    if (Selected?.key === key) {
      setSelected({ ...Selected, status: '승인 완료' });
    } // 테이블과 모달 동기화
  };

  const handleFilterSearch = () => {
    // 둘 다 비어있으면 전체 출력
    if (!filterBranch && !filterDateRange) {
      setData(originalData);
      return;
    }

    const filtered = originalData.filter((item) => {
      const matchBranch = !filterBranch || item.branch.includes(filterBranch);

      const matchDate =
        !filterDateRange ||
        (new Date(item.date) >= new Date(filterDateRange[0]) &&
          new Date(item.date) <= new Date(filterDateRange[1]));

      return matchBranch && matchDate;
    });

    setData(filtered);
  };

  const enterLoading = (index: number) => {
    console.log('조회 중입니다', index);

    // 로딩 돌아가기 시작
    setLoadings((prevLoadings) => {
      const newLoadings = [...prevLoadings];
      newLoadings[index] = true;
      return newLoadings;
    });

    // 3초 후에 로딩이 종료되도록 하드코딩 , 후에 axios 연동으로 변경
    setTimeout(() => {
      setLoadings((prevLoadings) => {
        const newLoadings = [...prevLoadings];
        newLoadings[index] = false;
        return newLoadings;
      });
    }, 3000); // 3초 설정
  };
  // 로딩 표현 종료

  const columns: TableColumnsType<DataType> = [
    // 표 레이아웃 설정
    {
      title: '주문번호',
      dataIndex: 'order',
      key: 'order',
      width: 100,
      ellipsis: true,
    },
    {
      title: '지점',
      dataIndex: 'branch',
      key: 'branch',
      width: 100,
      sorter: (a, b) => a.branch.localeCompare(b.branch), // 사전 순 정렬
      sortOrder: sortedInfo.columnKey === 'branch' ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: '요청일자',
      dataIndex: 'date',
      key: 'date',
      width: 150,
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(), // 날짜 별 정렬
      sortOrder: sortedInfo.columnKey === 'date' ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: '의약품',
      dataIndex: 'product',
      key: 'product',
      width: 150,
      sorter: (a, b) => a.product.localeCompare(b.product), // 사전 순 정렬
      sortOrder: sortedInfo.columnKey === 'product' ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: '주문 금액',
      dataIndex: 'price',
      key: 'price',
      width: 70,
      sorter: (a, b) => a.price - b.price, // 숫자 크기 별 정렬
      sortOrder: sortedInfo.columnKey === 'price' ? sortedInfo.order : null,
      render: (value: number) => `${value.toLocaleString()}원`,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 70,
      render: (_: string, record: DataType) =>
        record.status === '승인 완료' ? (
          <Text strong style={{ color: 'green' }}>
            승인 완료
          </Text>
        ) : (
          <Button
            type="primary"
            onClick={(e) => {
              e.stopPropagation();
              handleApprove(record.key);
            }}
          >
            승인
          </Button> // 승인 및 승인완료 처리를 위해 테이블에 버튼 삽입
        ),
    },
  ];

  return (
    <Content style={{ margin: '24px', padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '30px' }}>
        <Col>
          <Text strong style={{ fontSize: '30px' }}>
            발주 조회/승인
          </Text>
        </Col>
      </Row>

      <Form layout="vertical" form={form}>
        <Row justify="space-between" style={{ padding: '5px 50px' }}>
          <Space>
            <Col>
              <Form.Item
                label="지점명"
                name="requestDate"
                rules={[{ required: true, message: '지점을 선택해주세요' }]}
              >
                <Space>
                  <Cascader
                    options={options}
                    placeholder="지역 선택"
                    showSearch={{ filter }}
                    onSearch={(value) => console.log(value)}
                    onChange={(value) => {
                      if (value && value.length > 0) {
                        setFilterBranch(value[value.length - 1]);
                      } else {
                        setFilterBranch(null);
                      }
                    }}
                  />
                </Space>
              </Form.Item>
            </Col>

            <Col>
              <Form.Item
                label="기간"
                name="requestDate"
                rules={[{ required: true, message: '기간을 선택해주세요' }]}
              >
                <DatePicker.RangePicker
                  placeholder={['Start Date', 'Till Now']}
                  style={{ width: 400 }}
                  allowEmpty={[false, true]}
                  onChange={(dates, dateStrings) => {
                    if (dates && dateStrings[0] && dateStrings[1]) {
                      setFilterDateRange([dateStrings[0], dateStrings[1]]);
                    } else {
                      setFilterDateRange(null);
                    }
                  }}
                />
              </Form.Item>
            </Col>
          </Space>

          <Col>
            <Form.Item label=" ">
              <Button
                style={{ marginRight: '14px' }}
                onClick={() => {
                  form.resetFields(); // ✅ UI 필드 초기화
                  setFilterBranch(null); // 지역 초기화
                  setFilterDateRange(null); // 날짜 초기화
                  handleFilterSearch();
                }}
              >
                옵션 초기화
              </Button>
              <Button
                type="primary"
                loading={loadings[0]}
                onClick={() => {
                  enterLoading(0);
                  handleFilterSearch(); // ✅ 필터 연동
                }}
              >
                발주 조회
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Row justify="space-between" style={{ padding: '5px 50px' }}>
        <Col>
          <Table<DataType>
            columns={columns}
            dataSource={data}
            onChange={handleChange}
            locale={{
              cancelSort: '정렬 취소',
              triggerAsc: '오름차순 정렬',
              triggerDesc: '내림차순 정렬',
            }} // 정렬 시, 표시되는 글자 커스텀
            pagination={{
              position: ['bottomCenter'], // 페이지 넘버 가운데 정렬
              pageSize: 6, // 기본 페이지당 항목 수
            }}
            onRow={(record) => ({
              onClick: () => handleRowclick(record),
            })}
          />

          <Modal
            title="발주 상세 정보"
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={[
              <Button key="close" onClick={() => setModalVisible(false)}>
                닫기
              </Button>, // 모달 창에 닫기 버튼 표시, 버튼 누를 경우 모달창 사라짐
              Selected?.status !== '승인 완료' && ( // 승인 완료 상태가 아닐 경우
                <Button key="approve" type="primary" onClick={() => handleApprove(Selected!.key)}>
                  승인
                </Button> // 모달 창에 승인 버튼표시, 버튼 누를 경우 모달 창에서도 승인 완료 처리
              ),
            ]}
          >
            {Selected && (
              <Descriptions bordered column={1} size="middle">
                <Descriptions.Item label="주문번호">{Selected.order}</Descriptions.Item>
                <Descriptions.Item label="지점명">{Selected.branch}</Descriptions.Item>
                <Descriptions.Item label="주문 품목 / 수량">{Selected.product}</Descriptions.Item>
                <Descriptions.Item label="주문 금액">{Selected.price}</Descriptions.Item>
                <Descriptions.Item label="상태">
                  {Selected.status === '승인' ? '승인 대기' : Selected.status}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Modal>
        </Col>
      </Row>
    </Content>
  );
}

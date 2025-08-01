import React, { useEffect, useState } from 'react';

import {
  Row,
  Col,
  Typography,
  Card,
  DatePicker,
  Select,
  Cascader,
  Table,
  Tag,
  Form,
  Modal,
  Descriptions,
  Button,
  Statistic,
} from 'antd';

import { Pie, Column } from '@ant-design/plots';

import type { CascaderProps, GetProp, TableProps } from 'antd'; // 타입 정의

const { RangePicker } = DatePicker;
const { Option } = Select;

type DefaultOptionType = GetProp<CascaderProps, 'options'>[number];

type StatusType = ['부족'] | ['과다'] | ['정상'];

interface Option {
  // cascader 옵션
  value: string;
  label: string;
  children?: Option[];
}

interface TableData {
  key: string;
  date: string;
  branch: string;
  order: number;
  stock: { [key: string]: number };
  predict: { [key: string]: number };
  recommend: { [key: string]: number };
  status: StatusType;
}
const pastelColors = [
  '#A2C8EC', // 파스텔 블루
  '#B5EAD7', // 파스텔 민트
  '#FFDAC1', // 파스텔 살구
  '#E2F0CB', // 파스텔 연두
  '#FFB7B2', // 파스텔 핑크
  '#D5AAFF', // 파스텔 보라
  '#FBE7C6', // 파스텔 크림
  '#C7CEEA', // 파스텔 라벤더
  '#FFF5BA', // 파스텔 노랑
];

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
];
const dummy: TableData[] = [
  {
    key: '1',
    date: '2025-01',
    branch: '대전서구점',
    order: 368,
    stock: {
      타이레놀: 27,
      펜잘큐: 98,
      어린이부루펜: 83,
      케토톱: 98,
      부루펜: 42,
      지르텍: 97,
      인사돌: 62,
      겔포스: 81,
      활명수: 86,
      모드나폴: 93,
    },
    predict: {
      타이레놀: 70,
      펜잘큐: 35,
      어린이부루펜: 72,
      케토톱: 57,
      부루펜: 116,
      지르텍: 91,
      인사돌: 93,
      겔포스: 66,
      활명수: 72,
      모드나폴: 74,
    },
    status: ['정상', '정상'],
    recommend: {
      타이레놀: 43,
      펜잘큐: 0,
      어린이부루펜: 0,
      케토톱: 0,
      부루펜: 74,
      지르텍: 0,
      인사돌: 31,
      겔포스: 0,
      활명수: 0,
      모드나폴: 0,
    },
  },
  {
    key: '2',
    date: '2025-01',
    branch: '천안불당점',
    order: 290,
    stock: {
      타이레놀: 26,
      펜잘큐: 53,
      어린이부루펜: 9,
      케토톱: 57,
      부루펜: 60,
      지르텍: 9,
      인사돌: 68,
      겔포스: 97,
      활명수: 85,
      모드나폴: 29,
    },
    predict: {
      타이레놀: 44,
      펜잘큐: 41,
      어린이부루펜: 95,
      케토톱: 66,
      부루펜: 45,
      지르텍: 63,
      인사돌: 74,
      겔포스: 91,
      활명수: 35,
      모드나폴: 79,
    },
    status: ['정상', '부족'],
    recommend: {
      타이레놀: 18,
      펜잘큐: 0,
      어린이부루펜: 86,
      케토톱: 9,
      부루펜: 0,
      지르텍: 54,
      인사돌: 6,
      겔포스: 0,
      활명수: 0,
      모드나폴: 50,
    },
  },
  {
    key: '3',
    date: '2025-01',
    branch: '청주오창점',
    order: 169,
    stock: {
      타이레놀: 94,
      펜잘큐: 15,
      어린이부루펜: 21,
      케토톱: 56,
      부루펜: 90,
      지르텍: 41,
      인사돌: 47,
      겔포스: 46,
      활명수: 29,
      모드나폴: 90,
    },

    predict: {
      타이레놀: 69,
      펜잘큐: 92,
      어린이부루펜: 73,
      케토톱: 42,
      부루펜: 71,
      지르텍: 53,
      인사돌: 99,
      겔포스: 74,
      활명수: 102,
      모드나폴: 32,
    },
    status: ['정상', '부족'],
    recommend: {
      타이레놀: 0,
      펜잘큐: 77,
      어린이부루펜: 52,
      케토톱: 0,
      부루펜: 0,
      지르텍: 12,
      인사돌: 52,
      겔포스: 28,
      활명수: 73,
      모드나폴: 0,
    },
  },
  {
    key: '4',
    date: '2025-01',
    branch: '대전탄방점',
    order: 295,
    stock: {
      타이레놀: 60,
      펜잘큐: 97,
      어린이부루펜: 36,
      케토톱: 32,
      부루펜: 85,
      지르텍: 58,
      인사돌: 12,
      겔포스: 77,
      활명수: 10,
      모드나폴: 59,
    },

    predict: {
      타이레놀: 107,
      펜잘큐: 93,
      어린이부루펜: 91,
      케토톱: 110,
      부루펜: 97,
      지르텍: 63,
      인사돌: 119,
      겔포스: 91,
      활명수: 120,
      모드나폴: 101,
    },
    status: ['정상', '과다'],
    recommend: {
      타이레놀: 47,
      펜잘큐: 0,
      어린이부루펜: 55,
      케토톱: 78,
      부루펜: 12,
      지르텍: 5,
      인사돌: 107,
      겔포스: 14,
      활명수: 110,
      모드나폴: 42,
    },
  },
  {
    key: '5',
    date: '2025-02',
    branch: '청주흥덕점',
    order: 291,
    stock: {
      타이레놀: 32,
      펜잘큐: 83,
      어린이부루펜: 15,
      케토톱: 52,
      부루펜: 31,
      지르텍: 31,
      인사돌: 31,
      겔포스: 97,
      활명수: 94,
      모드나폴: 5,
    },

    predict: {
      타이레놀: 45,
      펜잘큐: 100,
      어린이부루펜: 75,
      케토톱: 81,
      부루펜: 107,
      지르텍: 52,
      인사돌: 71,
      겔포스: 88,
      활명수: 104,
      모드나폴: 106,
    },
    status: ['부족', '과다'],
    recommend: {
      타이레놀: 13,
      펜잘큐: 17,
      어린이부루펜: 60,
      케토톱: 29,
      부루펜: 76,
      지르텍: 21,
      인사돌: 40,
      겔포스: 0,
      활명수: 10,
      모드나폴: 101,
    },
  },
  {
    key: '6',
    date: '2025-02',
    branch: '대전둔산점',
    order: 361,
    stock: {
      타이레놀: 87,
      펜잘큐: 8,
      어린이부루펜: 5,
      케토톱: 9,
      부루펜: 43,
      지르텍: 59,
      인사돌: 1,
      겔포스: 62,
      활명수: 11,
      모드나폴: 15,
    },

    predict: {
      타이레놀: 118,
      펜잘큐: 35,
      어린이부루펜: 32,
      케토톱: 42,
      부루펜: 46,
      지르텍: 95,
      인사돌: 49,
      겔포스: 65,
      활명수: 31,
      모드나폴: 84,
    },
    status: ['부족', '부족'],
    recommend: {
      타이레놀: 31,
      펜잘큐: 27,
      어린이부루펜: 27,
      케토톱: 33,
      부루펜: 3,
      지르텍: 36,
      인사돌: 48,
      겔포스: 3,
      활명수: 20,
      모드나폴: 69,
    },
  },
  {
    key: '7',
    date: '2025-01',
    branch: '천안쌍용점',
    order: 263,
    stock: {
      타이레놀: 45,
      펜잘큐: 42,
      어린이부루펜: 70,
      케토톱: 60,
      부루펜: 48,
      지르텍: 96,
      인사돌: 98,
      겔포스: 9,
      활명수: 60,
      모드나폴: 90,
    },
    predict: {
      타이레놀: 71,
      펜잘큐: 120,
      어린이부루펜: 109,
      케토톱: 70,
      부루펜: 76,
      지르텍: 97,
      인사돌: 65,
      겔포스: 65,
      활명수: 80,
      모드나폴: 101,
    },
    status: ['정상', '정상'],
    recommend: {
      타이레놀: 26,
      펜잘큐: 78,
      어린이부루펜: 39,
      케토톱: 10,
      부루펜: 28,
      지르텍: 1,
      인사돌: 0,
      겔포스: 56,
      활명수: 20,
      모드나폴: 11,
    },
  },
];

const evaluateStatus = (          // 전체 재고 수를 바탕으로 정상 / 부족 / 과다 판정
  stock: Record<string, number>,
  predict: Record<string, number>,
): StatusType => {
  const totalStock = Object.values(stock).reduce((sum, n) => sum + n, 0);
  const totalPredict = Object.values(predict).reduce((sum, n) => sum + n, 0);

  if (totalStock < totalPredict * 0.8) return ['부족'];
  if (totalStock > totalPredict * 1.2) return ['과다'];
  return ['정상'];
};

// ✅ dummy를 변환해서 status 추가 => Dummy에 저장
const Dummy: TableData[] = dummy.map((item) => ({
  ...item,
  status: evaluateStatus(item.stock, item.predict),
}));

const columns: TableProps<TableData>['columns'] = [   // 테이블에 들어가는 컬럼 지정
  { title: '기준월', dataIndex: 'date', key: 'date' },
  { title: '지점명', dataIndex: 'branch', key: 'branch' },
  { title: '주문 건수', dataIndex: 'order', key: 'order' },
  {
    title: '예측 대비',
    dataIndex: 'status',
    key: 'status',
    render: (_, record) => renderStatusTags(record.status),  
  },
];

const filter = (    // 지역 선택에서 검색으로 찾을 수 있도록 설정
  inputValue: string,
  path: DefaultOptionType[], // 지역 선택
) =>
  path.some(
    (option) => (option.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1,
  );

const renderStatusTags = (status: string[] = []) => {  // status에 저장되있는 값에 tag 속성 부여
  return (
    <>
      {status.map((tag) => {
        let color: string;

        switch (tag) {
          case '부족':
            color = 'red';
            break;
          case '과다':
            color = 'geekblue';
            break;
          case '정상':
            color = 'green';
            break;
          default:
            color = 'default';
        }

        return (
          <Tag color={color} key={tag}>
            {tag.toUpperCase()}
          </Tag>
        );
      })}
    </>
  );
};

const Modal_MedicineTable = (branch: TableData) => {        // 모달 내부에 테이블 작성
  const medicines = Object.keys(branch.stock);

  const rows = medicines.map((name) => ({
    key: name,
    name,
    stock: branch.stock[name],
    predict: branch.predict[name],
    recommend: branch.recommend[name],
  }));

  const columns = [
    { title: '💊 약품명', dataIndex: 'name', key: 'name' },
    { title: '📦 현재 재고', dataIndex: 'stock', key: 'stock' },
    { title: '📊 예측 수요', dataIndex: 'predict', key: 'predict' },
    { title: '✅ 추천 발주량', dataIndex: 'recommend', key: 'recommend' },
    {
      title: '📦 비교',
      key: 'status',
      render: (_: any, record: any) => {
        const { stock, predict } = record;

        if (stock < predict * 0.8) return <Tag color="red">부족</Tag>;
        if (stock > predict * 1.2) return <Tag color="geekblue">과다</Tag>;
        return <Tag color="green">정상</Tag>;
      },
    },
  ];

  return <Table columns={columns} dataSource={rows} pagination={false} size="small" />;
};

export default function BranchMonitoringPage() {   // 페이지 작성 시작
  const [form] = Form.useForm();        // 필터 검색을 위한 form 설정
  const [filteredData, setFilteredData] = useState<TableData[]>(Dummy); // 초기 데이터는 전체, 필터 검색을 위한 데이터 처리

  const [selectedBranch, setSelectedBranch] = useState<TableData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handle_RowClick = (record: TableData) => {
    setSelectedBranch(record);
    setIsModalOpen(true);
  };

  const handle_ModalClose = () => {
    setIsModalOpen(false);
    setSelectedBranch(null);
  };

  const handle_Search = () => {
    // 조건 검색
    const values = form.getFieldsValue();
    const { date, country, status } = values;

    const [region, city] = country || [];

    const result = Dummy.filter((item) => {
      const matchesDate =
        !date || (item.date >= date[0].format('YYYY-MM') && item.date <= date[1].format('YYYY-MM'));

      const matchesRegion = !country || item.branch.includes(city);

      const itemStatus = evaluateStatus(item.stock, item.predict)[0];
      const matchesStatus = !status || itemStatus === status;

      return matchesDate && matchesRegion && matchesStatus;
    });

    setFilteredData(result);
  };

  const getTotal = (predict: Record<string, number>) => {      // 우측 하단에 들어가는 총 합 카드에 사용, 입력받은 인자의 총합을 구해서 리턴
    return Object.values(predict).reduce((a, b) => a + b, 0);
  };

  const StatusCounts = (data: TableData[]) => {         // 테이블 내에서 
    const counts = { 부족: 0, 정상: 0, 과다: 0 };

    data.forEach((branch) => {
      Object.keys(branch.predict).forEach((key) => {
        const stock = branch.stock[key];
        const predict = branch.predict[key];

        if (stock < predict * 0.8) counts.부족 += 1;
        else if (stock > predict * 1.2) counts.과다 += 1;
        else counts.정상 += 1;
      });
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const medicine_bar = (data: TableData[]) => {
    const medicineSet = new Set<string>();

    data.forEach((item) => {
      Object.keys(item.stock).forEach((name) => medicineSet.add(name));
    });

    const medicineArray = Array.from(medicineSet);
    const result: { name: string; type: string; value: number }[] = [];

    medicineArray.forEach((name) => {
      let stock = 0;
      let predict = 0;
      let recommend = 0;

      data.forEach((item) => {
        stock += item.stock[name] || 0;
        predict += item.predict[name] || 0;
        recommend += item.recommend[name] || 0;
      });

      result.push({ name, type: '현재 재고', value: stock });
      result.push({ name, type: '예측 수요', value: predict });
      result.push({ name, type: '추천 발주량', value: recommend });
    });

    return result;
  };

  const stock_config = {
    // 주문건수 차트
    data: filteredData,
    xField: 'branch',
    yField: 'order',
    colorField: 'branch',
    color: pastelColors,
    columnWidthRatio: 0.6,
    height: 220,
    xAxis: {
      label: {
        rotate: 0, // 텍스트 회전 방지  작동안함
        autoRotate: false,
        style: {
          fontSize: 12,
          textAlign: 'center',
          lineHeight: 1.2,
        },
        formatter: (text: string) => {
          return text.length > 2 ? `${text.slice(0, 2)}\n${text.slice(2)}` : text;
        },
      },
    },
    yAxis: {
      label: {
        style: {
          fontSize: 12,
        },
      },
    },
    tooltip: {},
    legend: false,
  };

  const circle_config = {
    // 파이차트
    height: 260,
    data: StatusCounts(filteredData),
    angleField: 'value',
    colorField: 'name',
    radius: 1,
    innerRadius: 0.6, // 도넛 차트 형태
    label: {
      text: 'value',
      style: {
        fontWeight: 'bold',
      },
    },
    tooltip: {
      title: 'name',
      items: [{ field: 'value' }],
    },
    legend: {
      color: {
        title: false,
        position: 'right',
        rowPadding: 5,
      },
    },

    annotations: [
      {
        type: 'text',
        style: {
          x: '50%',
          y: '50%',
          text: '건',
          textAlign: 'center',
          fontSize: 20,
          fontStyle: 'bold',
        },
      },
    ],
  };

  const bar_config = {
    isGroup: true,
    height: 260,
    data: medicine_bar(filteredData),
    xField: 'name', // 가로축: 수치
    yField: 'value', // 세로축: 약품 이름
    colorField: 'type',
    group: {
      padding: 0,
    },
    legend: {
      position: 'top',
    },
    xAxis: {
      label: { style: { fontSize: 12 } },
    },
    yAxis: {
      label: { style: { fontSize: 12 } },
    },
  };

  return (
    <div style={{ padding: 16 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Typography.Title level={3} style={{ margin: 0 }}>
            지점별 현황 모니터링 페이지
          </Typography.Title>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline" onFinish={handle_Search} size="small">
          <Form.Item label="기준월" name="date">
            <RangePicker picker="month" size="small" />
          </Form.Item>
          <Form.Item label="지역명" name="country">
            <Cascader
              options={options}
              placeholder="지역 선택"
              showSearch={{ filter }}
              size="small"
            />
          </Form.Item>
          <Form.Item label="상태" name="status">
            <Select placeholder="상태 선택" style={{ width: 120 }} allowClear size="small">
              <Option value="부족">부족</Option>
              <Option value="정상">정상</Option>
              <Option value="과다">과다</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }} size="small">
              조회
            </Button>
            <Button
              onClick={() => {
                form.resetFields();
                setFilteredData(Dummy);
              }}
              size="small"
            >
              초기화
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={16} xl={7}>
          <Card
            title="지점 목록"
            style={{ height: ' 280px', marginBottom: 16 }}
            styles={{
              header: {
                fontSize: '14px',
                padding: '10px 16px', // 타이틀 여백
              },
              body: {
                padding: '8px 16px 12px', // ↑ top 줄이기!
              },
            }}
          >
            <Table<TableData>
              pagination={{ pageSize: 3, size: 'small' }}
              columns={columns}
              dataSource={filteredData}
              onRow={(record) => ({
                onClick: () => handle_RowClick(record),
              })}
              rowKey="key"
              scroll={{ x: 'max-content' }}
              size="small"
            />
          </Card>
          <Card
            title="가맹점 별 주문건수"
            style={{ height: '270px' }}
            styles={{
              header: {
                fontSize: '14px',
                padding: '10px 16px', // 타이틀 여백
              },
              body: {
                padding: '8px 16px 12px', // ↑ top 줄이기!
              },
            }}
          >
            {filteredData.length === 0 ? (
              <div
                style={{
                  height: 220,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center', // 테이블 데이터가 비어버리면 그래프 버그 발생하여 예외처리
                }}
              >
                <p>표시할 데이터가 없습니다.</p>
              </div>
            ) : (
              <Column {...stock_config} />
            )}
          </Card>
        </Col>
        <Col xs={14} xl={17}>
          <Row gutter={[16, 16]}>
            <Col xs={14} xl={7}>
              <Card
                title="📊 예측 대비 재고상태 분포"
                styles={{
                  header: {
                    fontSize: '14px',
                    padding: '10px 16px', // 타이틀 여백
                  },
                  body: {
                    padding: '8px 16px 12px', // ↑ top 줄이기!
                  },
                }}
              >
                <Pie {...circle_config} style={{ height: 50 }} />
              </Card>
            </Col>
            <Col xs={14} xl={17}>
              <Card
                title="💊 약품별 재고/예측/발주량 비교"
                styles={{
                  header: {
                    fontSize: '14px',
                    padding: '10px 16px', // 타이틀 여백
                  },
                  body: {
                    padding: '8px 16px 12px', // ↑ top 줄이기!
                  },
                }}
              >
                {filteredData.length === 0 ? (
                  <div
                    style={{
                      height: 220,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center', // 테이블 데이터가 비어버리면 그래프 버그 발생하여 예외처리
                    }}
                  >
                    <p>표시할 데이터가 없습니다.</p>
                  </div>
                ) : (
                  <Column {...bar_config} />
                )}
              </Card>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col xl={24}>
              <Card title="✅ 통계" style={{ height: '214px', marginTop: 16 }}>
                <Row justify="space-evenly" gutter={[16, 16]}>
                  <Col xl={4}>
                    <Card variant="borderless">
                      <Statistic
                        title="지점수"
                        value={new Set(filteredData.map((item) => item.branch)).size}
                        suffix="개"
                        precision={0}
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Card>
                  </Col>
                  <Col xl={4}>
                    <Card variant="borderless">
                      <Statistic
                        title="총 주문건수"
                        value={filteredData.reduce((sum, item) => sum + item.order, 0)}
                        suffix="건"
                        precision={0}
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Card>
                  </Col>
                  <Col xl={4}>
                    <Card variant="borderless">
                      <Statistic
                        title="예측 수요 총합"
                        value={filteredData.reduce((sum, item) => sum + getTotal(item.predict), 0)}
                        suffix="개"
                        precision={0}
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Card>
                  </Col>
                  <Col xl={4.5}>
                    <Card variant="borderless">
                      <Statistic
                        title="추천 발주량 총합"
                        value={filteredData.reduce(
                          (sum, item) => sum + getTotal(item.recommend),
                          0,
                        )}
                        suffix="개"
                        precision={0}
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Card>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
      <Modal
        title="지점 상세 정보"
        open={isModalOpen}
        onCancel={handle_ModalClose}
        footer={null}
        width={800}
      >
        {selectedBranch && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="📅 기준월">{selectedBranch.date}</Descriptions.Item>
            <Descriptions.Item label="🏪 지점명">{selectedBranch.branch}</Descriptions.Item>
            <Descriptions.Item label="🧾 주문 건수">{selectedBranch.order}건</Descriptions.Item>
            <Descriptions.Item label="🧾 보유 포인트">{selectedBranch.order}건</Descriptions.Item>
            <Descriptions.Item label="전체 재고 현황" span={2}>
              {Modal_MedicineTable(selectedBranch)}
            </Descriptions.Item>
            <Descriptions.Item label="📦 총 재고 상태" span={2}>
              {renderStatusTags(selectedBranch.status)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}

import { Line } from '@ant-design/plots';
import { Card, Col, DatePicker, Input, Row, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { useState } from 'react';

const { RangePicker } = DatePicker;
const { Title } = Typography;

type ChartType = '예상 수요' | '현재 재고' | '발주 추천';

interface DataType {
  key: string;
  product: string;
  expected: number;
  stock: number;
  suggested: number;
  status: '부족' | '정상' | '과다';
}

interface ChartDatum {
  month: string;
  value: number;
  type: ChartType;
}

// 월별 mock 데이터(그래프)
const monthlyMock: Record<string, ChartDatum[]> = {
  타이레놀: [
    { month: '2025-01', value: 110, type: '예상 수요' },
    { month: '2025-02', value: 90, type: '예상 수요' },
    { month: '2025-03', value: 100, type: '예상 수요' },
    { month: '2025-04', value: 120, type: '예상 수요' },
    { month: '2025-05', value: 160, type: '예상 수요' },
    { month: '2025-06', value: 170, type: '예상 수요' },
    { month: '2025-07', value: 125, type: '예상 수요' },

    { month: '2025-01', value: 40, type: '현재 재고' },
    { month: '2025-02', value: 50, type: '현재 재고' },
    { month: '2025-03', value: 40, type: '현재 재고' },
    { month: '2025-04', value: 60, type: '현재 재고' },
    { month: '2025-05', value: 90, type: '현재 재고' },
    { month: '2025-06', value: 80, type: '현재 재고' },
    { month: '2025-07', value: 30, type: '현재 재고' },

    { month: '2025-01', value: 70, type: '발주 추천' },
    { month: '2025-02', value: 80, type: '발주 추천' },
    { month: '2025-03', value: 60, type: '발주 추천' },
    { month: '2025-04', value: 60, type: '발주 추천' },
    { month: '2025-05', value: 70, type: '발주 추천' },
    { month: '2025-06', value: 90, type: '발주 추천' },
    { month: '2025-07', value: 95, type: '발주 추천' },
  ],
  판피린: [
    { month: '2025-01', value: 220, type: '예상 수요' },
    { month: '2025-02', value: 280, type: '예상 수요' },
    { month: '2025-03', value: 260, type: '예상 수요' },
    { month: '2025-04', value: 270, type: '예상 수요' },
    { month: '2025-05', value: 280, type: '예상 수요' },
    { month: '2025-06', value: 300, type: '예상 수요' },
    { month: '2025-07', value: 250, type: '예상 수요' },

    { month: '2025-01', value: 250, type: '현재 재고' },
    { month: '2025-02', value: 300, type: '현재 재고' },
    { month: '2025-03', value: 270, type: '현재 재고' },
    { month: '2025-04', value: 275, type: '현재 재고' },
    { month: '2025-05', value: 285, type: '현재 재고' },
    { month: '2025-06', value: 280, type: '현재 재고' },
    { month: '2025-07', value: 290, type: '현재 재고' },

    { month: '2025-01', value: 25, type: '발주 추천' },
    { month: '2025-02', value: 35, type: '발주 추천' },
    { month: '2025-03', value: 10, type: '발주 추천' },
    { month: '2025-04', value: 5, type: '발주 추천' },
    { month: '2025-05', value: 0, type: '발주 추천' },
    { month: '2025-06', value: 20, type: '발주 추천' },
    { month: '2025-07', value: 10, type: '발주 추천' },
  ],
  지르텍: [
    { month: '2025-01', value: 110, type: '예상 수요' },
    { month: '2025-02', value: 130, type: '예상 수요' },
    { month: '2025-03', value: 160, type: '예상 수요' },
    { month: '2025-04', value: 170, type: '예상 수요' },
    { month: '2025-05', value: 180, type: '예상 수요' },
    { month: '2025-06', value: 200, type: '예상 수요' },
    { month: '2025-07', value: 140, type: '예상 수요' },

    { month: '2025-01', value: 600, type: '현재 재고' },
    { month: '2025-02', value: 550, type: '현재 재고' },
    { month: '2025-03', value: 500, type: '현재 재고' },
    { month: '2025-04', value: 490, type: '현재 재고' },
    { month: '2025-05', value: 510, type: '현재 재고' },
    { month: '2025-06', value: 520, type: '현재 재고' },
    { month: '2025-07', value: 500, type: '현재 재고' },

    { month: '2025-01', value: 0, type: '발주 추천' },
    { month: '2025-02', value: 0, type: '발주 추천' },
    { month: '2025-03', value: 0, type: '발주 추천' },
    { month: '2025-04', value: 0, type: '발주 추천' },
    { month: '2025-05', value: 0, type: '발주 추천' },
    { month: '2025-06', value: 0, type: '발주 추천' },
    { month: '2025-07', value: 0, type: '발주 추천' },
  ],
};

const columns = (onRowClick: (product: string) => void): ColumnsType<DataType> => [
  {
    title: '품목명',
    dataIndex: 'product',
    key: 'product',
    filters: [
      { text: '타이레놀', value: '타이레놀' },
      { text: '판피린', value: '판피린' },
      { text: '지르텍', value: '지르텍' },
    ],
    onFilter: (value, record) => record.product.includes(value as string),
    render: (text) => <a onClick={() => onRowClick(text)}>{text}</a>,
  },
  {
    title: '예상 수요',
    dataIndex: 'expected',
    key: 'expected',
    sorter: (a, b) => a.expected - b.expected,
    render: (value) => `${value}개`,
  },
  {
    title: '현재 재고',
    dataIndex: 'stock',
    key: 'stock',
    sorter: (a, b) => a.stock - b.stock,
    render: (value) => `${value}개`,
  },
  {
    title: '제안 발주 수량',
    dataIndex: 'suggested',
    key: 'suggested',
    sorter: (a, b) => a.suggested - b.suggested,
    render: (value) => <strong>{value}개</strong>,
  },
  {
    title: '상태',
    dataIndex: 'status',
    key: 'status',
    filters: [
      { text: '부족', value: '부족' },
      { text: '정상', value: '정상' },
      { text: '과다', value: '과다' },
    ],
    onFilter: (value, record) => record.status === value,
    render: (status) => {
      const color = status === '부족' ? 'volcano' : status === '정상' ? 'green' : 'geekblue';
      return <Tag color={color}>{status}</Tag>;
    },
  },
];

//테이블 데이터
const data: DataType[] = [
  {
    key: '1',
    product: '타이레놀',
    expected: 120,
    stock: 30,
    suggested: 90,
    status: '부족',
  },
  {
    key: '2',
    product: '판피린',
    expected: 300,
    stock: 280,
    suggested: 20,
    status: '정상',
  },
  {
    key: '3',
    product: '지르텍',
    expected: 200,
    stock: 500,
    suggested: 0,
    status: '과다',
  },
];

export default function DemandForecastPage() {
  const [selectedProduct, setSelectedProduct] = useState<string>('타이레놀');
  const [searchText, setSearchText] = useState<string>('');
  const [selectedRange, setSelectedRange] = useState<[string, string] | null>(null);

  const handleDateChange = (
    dates: [Dayjs | null, Dayjs | null] | null,
    dateStrings: [string, string],
  ) => {
    if (dates && dates[0] && dates[1]) {
      const start = dates[0].format('YYYY-MM');
      const end = dates[1].format('YYYY-MM');
      setSelectedRange([start, end]);
    } else {
      setSelectedRange(null);
    }
  };

  const filteredData = data.filter((item) =>
    item.product.toLowerCase().includes(searchText.toLowerCase()),
  );

  const fullChartData = monthlyMock[selectedProduct] || [];

  const filteredChartData =
    selectedRange !== null
      ? fullChartData.filter((item) => {
          return item.month >= selectedRange[0] && item.month <= selectedRange[1];
        })
      : fullChartData;

  const chartConfig = {
    data: filteredChartData,
    xField: 'month',
    yField: 'value',
    height: 250,
    seriesField: 'type',
    colorField: 'type',
    color: {
      '예상 수요': '#3DBF78',
      '현재 재고': '#F4664A',
      '발주 추천': '#FAAD14',
    },
    point: {
      shapeField: 'square',
      sizeField: 4,
    },
    style: {
      lineWidth: 2,
    },
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>전국 수요 예측 및 발주 수량 추천 페이지</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col>
          <RangePicker picker="month" onChange={handleDateChange} />
        </Col>
        <Col>
          <Input
            placeholder="제품명 검색"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Col>
      </Row>

      <Card style={{ marginBottom: 48 }}>
        {selectedProduct}
        <Line {...chartConfig} />
      </Card>

      <Table<DataType>
        columns={columns(setSelectedProduct)}
        dataSource={filteredData}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
}

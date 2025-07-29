import React from 'react';
import {
  Tabs,
  Typography,
  Select,
  Space,
  Input,
  Button,
  Table,
} from 'antd';
import type { TableProps } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

interface DataType {
  key: string;
  number: number;
  title: string;
  author: string;
  date: string;
}

const NoticeListPage: React.FC = () => {
  const navigate = useNavigate(); 

  const columns: TableProps<DataType>['columns'] = [
    {
      title: '번호',
      dataIndex: 'number',
      key: 'number',
      width: 80,
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a onClick={() => navigate(`/hq/notices/${record.key}`)}>{text}</a>
      ),
    },
    {
      title: '작성자',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: '작성일',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
  };

  // 더미 데이터
  const noticeData: DataType[] = [
    {
      key: '1',
      number: 1,
      title: '7월 초 공지사항',
      author: '매니저 A',
      date: '2025.07.10',
    },
    {
      key: '2',
      number: 2,
      title: '6월 말 공지사항',
      author: '매니저 A',
      date: '2025.06.20',
    },
    {
      key: '3',
      number: 3,
      title: '6월 초 공지사항',
      author: '매니저 A',
      date: '2025.06.10',
    },
  ];

  const diseaseData: DataType[] = [
    {
      key: '1',
      number: 1,
      title: '신종 감염병 발생 주의',
      author: '질병청',
      date: '2025.07.08',
    },
    {
      key: '2',
      number: 2,
      title: '여름철 독감 유행 예보',
      author: '질병청',
      date: '2025.06.28',
    },
  ];

  const lawData: DataType[] = [
    {
      key: '1',
      number: 1,
      title: '7월 초 관련 법안 요약',
      author: '매니저 A',
      date: '2025.07.10',
    },
    {
      key: '2',
      number: 2,
      title: '6월 말 관련 법안 요약',
      author: '매니저 A',
      date: '2025.06.20',
    },
    {
      key: '3',
      number: 3,
      title: '6월 초 관련 법안 요약',
      author: '매니저 A',
      date: '2025.06.10',
    },
  ];

  return (
    <div>
      <Title>Notice</Title>

      <Tabs
        defaultActiveKey="1"
        centered
        items={[
          {
            label: '공지사항',
            key: '1',
            children: (
              <Table<DataType>
                columns={columns}
                dataSource={noticeData}
                pagination={{ pageSize: 5 }}
              />
            ),
          },
          {
            label: '유행병',
            key: '2',
            children: (
              <Table<DataType>
                columns={columns}
                dataSource={diseaseData}
                pagination={{ pageSize: 5 }}
              />
            ),
          },
          {
            label: '법안',
            key: '3',
            children: (
              <Table<DataType>
                columns={columns}
                dataSource={lawData}
                pagination={{ pageSize: 5 }}
              />
            ),
          },
        ]}
      />

      <div>
        <Space wrap>
          <Select
            defaultValue=""
            style={{ width: 160 }}
            onChange={handleChange}
            placeholder="검색 조건"
            options={[
              { value: '제목', label: '제목' },
              { value: '작성자', label: '작성자' },
              { value: '작성일', label: '작성일' },
            ]}
          />
          <Input style={{ width: 200 }} placeholder="검색어 입력" />
          <Button type="primary">검색</Button>
          <Button type="primary" onClick={() => navigate('/hq/notices/new')}>
            작성
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default NoticeListPage;

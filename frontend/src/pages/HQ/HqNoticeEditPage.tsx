import React, { useState } from 'react';
import {
  Typography,
  Input,
  Button,
  Form,
  Row,
  Col,
  Upload,
  message,
  Select,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Title } = Typography;
const { TextArea } = Input;

const uploadProps: UploadProps = {
  name: 'file',
  action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
  headers: {
    authorization: 'authorization-text',
  },
  onChange(info) {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 파일 업로드 성공`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 파일 업로드 실패`);
    }
  },
};

const categoryOptions = [
  { value: '공지사항', label: '공지사항' },
  { value: '유행병', label: '유행병' },
  { value: '법안', label: '법안' },
];

export default function HqDashboardPage() {
  const [form] = Form.useForm();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );

  const handleSubmit = (values: any) => {
    console.log('제출된 데이터:', values);
  };

  const handleSelectChange = (value: string) => {
    console.log(`selected ${value}`);
    setSelectedCategory(value);
  };

  return (
    <div>
      <Title>Notice</Title>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={8}>
          <Col span={20}>
            <Form.Item
              name="title"
              label="제목"
              rules={[{ required: true, message: '제목을 입력해주세요.' }]}
            >
              <Input placeholder="공지 제목을 입력하세요" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="분류" name="category">
              <Select
                placeholder="선택"
                options={categoryOptions}
                onChange={handleSelectChange}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="content"
          label="내용"
          rules={[{ required: true, message: '내용을 입력해주세요.' }]}
        >
          <TextArea rows={6} placeholder="공지 내용을 입력하세요" />
        </Form.Item>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>첨부파일</Button>
            </Upload>
          </Col>
          <Col>
            <Button disabled={selectedCategory === '공지사항'}>
              요약
            </Button>
          </Col>
          <Col>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                수정
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

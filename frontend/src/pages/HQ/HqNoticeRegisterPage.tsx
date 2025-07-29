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
import { useNavigate } from 'react-router-dom';

import TiptapEditor from '../../components/TiptapEditor';

const { Title } = Typography;

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
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [editorContent, setEditorContent] = useState<string>('');

  const handleSubmit = (values: any) => {
    const finalData = {
      ...values,
      content: editorContent,
    };
    console.log('제출된 데이터:', finalData);

    navigate('/hq/notices');
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
            <Form.Item
              label="분류"
              name="category"
              rules={[{ required: true, message: '분류를 선택해주세요.' }]}
            >
              <Select
                placeholder="선택"
                options={categoryOptions}
                onChange={handleSelectChange}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="내용"
          required
          validateStatus={!editorContent ? 'error' : ''}
          help={!editorContent ? '내용을 입력해주세요.' : ''}
        >
          <TiptapEditor content={editorContent} onChange={setEditorContent} />
        </Form.Item>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>첨부파일</Button>
            </Upload>
          </Col>
          <Col>
            <Button 
            type="primary"
            disabled={selectedCategory === '공지사항'}>
              요약
              </Button>
          </Col>
          <Col>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                등록
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

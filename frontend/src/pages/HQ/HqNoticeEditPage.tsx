import React, { useEffect, useState } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom';
import TiptapEditor from '../../components/TiptapEditor';
const { Title } = Typography;

const uploadProps: UploadProps = {
  name: 'file',
  action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
  headers: {
    authorization: 'authorization-text',
  },
  onChange(info) {
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

export default function EditNoticePage() {
  const [form] = Form.useForm();
  const [editorContent, setEditorContent] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const { id } = useParams(); // 예: /hq/notices/edit/:id

  // 기존 공지사항 데이터 로딩 (API 대체 필요)
  useEffect(() => {
    // 실제 API 호출로 대체
    fetch(`/api/notices/${id}`)
      .then((res) => res.json())
      .then((data) => {
        form.setFieldsValue({
          title: data.title,
          category: data.category,
        });
        setSelectedCategory(data.category);
        setEditorContent(data.content);
      });
  }, [id, form]);

  const handleSubmit = async (values: any) => {
    const payload = {
      ...values,
      content: editorContent,
    };

    // 실제 수정 API 호출로 대체
    await fetch(`/api/notices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    navigate('/hq/notices');
  };

  const handleSelectChange = (value: string) => {
    setSelectedCategory(value);
  };

  return (
    <div>
      <Title>공지사항 수정</Title>

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
              name="category"
              label="분류"
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
                수정
              </Button>
            </Form.Item>
          </Col>
          <Col>
            <Form.Item>
              <Button
              danger
              onClick={async () => {
                await fetch(`/api/notices/${id}`, {
                  method: 'DELETE',
                });
                navigate('/hq/notices');
              }}
            >
                삭제
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

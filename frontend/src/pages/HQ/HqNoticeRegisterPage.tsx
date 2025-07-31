import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, Col, Form, Input, message, Row, Select, Space, Typography, Upload } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TiptapEditor from '../../components/TiptapEditor';

const uploadProps: UploadProps = {
  name: 'file',
  action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
  headers: {
    authorization: 'authorization-text',
  },
};

export default function HqNoticeRegisterPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [fileList, setFileList] = useState<any[]>([]);

  const watchedCategory = Form.useWatch('category', form);
  const watchedContent = Form.useWatch('content', form);

  const handleSubmit = (values: any) => {
    // TODO: 공지사항 등록 API 호출 로직 추가하기
    navigate('/hq/notices');
  };

  return (
    <>
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        공지사항 작성
      </Typography.Title>
      <Form
        form={form}
        name="notice-register"
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Row gutter={8}>
          <Col span={4}>
            <Form.Item
              name="category"
              label="카테고리"
              rules={[{ required: true, message: '카테고리를 선택해주세요.' }]}
            >
              <Select
                placeholder="카테고리 선택"
                options={[
                  { value: 'NOTICE', label: '공지' },
                  { value: 'EPIDEMIC', label: '감염병' },
                  { value: 'LAW', label: '법령' },
                  { value: 'NEW_DRUG', label: '신약' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item
              name="title"
              label="제목"
              rules={[{ required: true, message: '제목을 입력해주세요.' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="content"
          label="내용"
          rules={[{ required: true, message: '내용을 입력해주세요.' }]}
        >
          <TiptapEditor
            value={watchedContent}
            onChange={(val: string) => form.setFieldValue('content', val)}
          />
        </Form.Item>
        <Space wrap align="baseline" style={{ justifyContent: 'space-between', width: '100%' }}>
          <Space wrap align="baseline">
            <Form.Item name="attachmentUrl">
              <Upload
                {...uploadProps}
                fileList={fileList}
                onChange={(info) => {
                  if (info.file.status === 'done') {
                    const fileName = info.file.name;
                    form.setFieldValue('attachmentUrl', fileName);
                    setFileList(info.fileList);
                    message.success('파일이 업로드되었습니다.');
                  } else if (info.file.status === 'error') {
                    message.error('파일 업로드에 실패했습니다.');
                  } else {
                    setFileList(info.fileList);
                  }
                }}
                accept=".pdf, .txt, .jpg, .jpeg, .png"
                maxCount={1}
              >
                <Button type="default" icon={<UploadOutlined />}>
                  첨부파일
                </Button>
              </Upload>
            </Form.Item>
            <Button type="primary" disabled={watchedCategory === 'NOTICE'}>
              요약
            </Button>
          </Space>
          <Space wrap align="baseline">
            <Button type="primary" htmlType="submit">
              등록
            </Button>
          </Space>
        </Space>
      </Form>
    </>
  );
}

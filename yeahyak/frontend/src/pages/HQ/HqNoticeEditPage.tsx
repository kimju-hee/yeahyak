import { LeftOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { Button, Flex, Form, Input, message, Select, Space, Typography, Upload } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TiptapEditor from '../../components/TiptapEditor';
import { mockNotices } from '../../mocks/notice.mock';

export default function HqNoticeEditPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(true);

  const watchedCategory = Form.useWatch('category', form);
  const watchedContent = Form.useWatch('content', form);

  // TODO: 공지사항 로드 API 호출 로직 추가 + mockNotices 제거
  // const fetchNotice = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await instance.get(`/notices/${id}`);
  //     const notice = res.data as Notice;
  //     if (res.data.success) {
  //       form.setFieldsValue({
  //         category: notice.category,
  //         title: notice.title,
  //         content: notice.content,
  //       });
  //     }
  //   } catch (e: any) {
  //     console.error('공지사항 로딩 실패:', e);
  //     messageApi.error(e.message || '공지사항 로딩 중 오류가 발생했습니다.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  //
  // useEffect(() => {
  //   fetchNotice();
  // }, []);

  const notice = mockNotices.find((notice) => notice.id === Number(id));

  useEffect(() => {
    if (!notice) return;

    form.setFieldsValue({
      category: notice.category,
      title: notice.title,
      content: notice.content,
    });

    if (notice.attachmentUrl) {
      setFileList([{ uid: '-1', name: 'file.pdf', status: 'done', url: notice.attachmentUrl }]);
    } else {
      setFileList([]);
    }
  }, [notice]);

  if (!notice) {
    return <Typography.Text>해당 공지사항을 찾을 수 없습니다.</Typography.Text>;
  }

  const handleChange: UploadProps['onChange'] = async ({ fileList }) => {
    setFileList(fileList);
  };

  const handleAiSummarize = () => {
    if (fileList.length === 0) {
      messageApi.warning('첨부 파일이 없습니다.');
      return;
    }
    try {
      // TODO: AI 요약 API 호출 로직 추가
      form.setFieldsValue({ content: '이곳에 문서 내용을 기반으로 요약이 채워집니다.' });
      messageApi.success('AI가 문서를 요약했습니다.');
    } catch (e: any) {
      console.error('문서 요약 실패:', e);
      messageApi.error(e.message || '문서 요약 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async () => {
    try {
      // TODO: 공지사항 수정 API 호출 로직 추가
      navigate(`/hq/notices/${id}`);
    } catch (e: any) {
      console.error('공지사항 수정 실패:', e);
      messageApi.error(e.message || '공지사항 수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      {contextHolder}
      {/* TODO: 뒤로가기 버튼을 눌렀을 때 편집 여부에 따른 window.confirm 추가 */}
      <Space size="large" align="baseline">
        <Button
          type="link"
          size="large"
          shape="circle"
          icon={<LeftOutlined />}
          onClick={() => navigate(-1)}
        />
        <Typography.Title level={3} style={{ marginBottom: '24px' }}>
          공지사항 수정
        </Typography.Title>
      </Space>

      <Form
        form={form}
        name="notice-edit"
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Flex gap={8}>
          <Form.Item
            name="category"
            label="카테고리"
            rules={[{ required: true, message: '카테고리를 선택해주세요.' }]}
            style={{ flex: 1 }}
          >
            <Select
              options={[
                { value: 'NOTICE', label: '공지' },
                { value: 'EPIDEMIC', label: '감염병' },
                { value: 'LAW', label: '법령' },
                { value: 'NEW_DRUG', label: '신약' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="title"
            label="제목"
            rules={[{ required: true, message: '제목을 입력해주세요.' }]}
            style={{ flex: 5 }}
          >
            <Input />
          </Form.Item>
        </Flex>

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

        <Flex wrap justify="space-between" gap={8}>
          <Space wrap align="baseline">
            <Form.Item name="attachmentUrl" noStyle>
              <Input type="hidden" />
            </Form.Item>
            {/* TODO: 인증된 사용자만 파일 업로드 가능하도록 제한 + 파일 용량 제한 + 파일 형식 제한 */}
            <Upload
              accept=".pdf, .txt"
              listType="text"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={handleChange}
              maxCount={1}
            >
              {fileList.length >= 1 ? null : (
                <Button type="default" icon={<UploadOutlined />}>
                  첨부파일
                </Button>
              )}
            </Upload>

            <Button type="primary" disabled={watchedCategory === 'NOTICE'}>
              AI 요약
            </Button>
          </Space>

          <Button type="primary" htmlType="submit">
            저장
          </Button>
        </Flex>
      </Form>
    </>
  );
}

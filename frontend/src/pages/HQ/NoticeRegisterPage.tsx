import { UploadOutlined } from '@ant-design/icons';
import {
  Button,
  Flex,
  Form,
  Input,
  message,
  Select,
  Tooltip,
  Typography,
  Upload,
  type UploadFile,
  type UploadProps,
} from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiAPI, noticeAPI } from '../../api';
import TiptapEditor from '../../components/TiptapEditor';
import { NOTICE_TYPE_OPTIONS } from '../../constants';
import { NOTICE_TYPE } from '../../types';
import { validateAttachmentFile } from '../../utils';

export default function NoticeRegisterPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const watchedType = Form.useWatch('type', form);
  const watchedContent = Form.useWatch('content', form);

  const handleBeforeUpload = (file: File) => {
    const error = validateAttachmentFile(file, watchedType);
    if (error) {
      messageApi.error(error);
      return false;
    }
    return false; // 자동 업로드 방지
  };

  const handleChange: UploadProps['onChange'] = ({ fileList }) => {
    setFileList(fileList);
    form.setFieldsValue({ attachmentUrl: fileList[0].name || '' });
  };

  const handleRemove = () => {
    setFileList([]);
    form.setFieldsValue({ attachmentUrl: '' });
  };

  const handleAiSummarize = async () => {
    if (fileList.length === 0 || !fileList[0].originFileObj) {
      messageApi.warning('첨부파일이 없습니다.');
      return;
    }

    setAiLoading(true);
    try {
      const file = fileList[0].originFileObj as File;

      // 파일 재검증 (카테고리가 변경된 경우 대비)
      const error = validateAttachmentFile(file, watchedType);
      if (error) {
        messageApi.error(error);
        return;
      }

      let res;
      switch (watchedType) {
        case NOTICE_TYPE.LAW:
          res = await aiAPI.summarizeLaw({ file });
          break;
        case NOTICE_TYPE.EPIDEMIC:
          res = await aiAPI.summarizeEpidemic({ file });
          break;
        case NOTICE_TYPE.NEW_PRODUCT:
          res = await aiAPI.summarizeNewProduct({ file });
          break;
        default:
          messageApi.warning('지원되지 않는 카테고리입니다.');
          return;
      }

      if (res.success) {
        const raw = watchedType === NOTICE_TYPE.EPIDEMIC ? res.data.notice : res.data.summary;
        form.setFieldsValue({ content: raw });
        messageApi.success('AI가 문서를 요약했습니다!');
      }
    } catch (e: any) {
      console.error('AI 문서 요약 실패:', e);
      messageApi.error(e.response?.data?.message || 'AI 문서 요약 중 오류가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        notice: {
          type: values.type,
          title: (values.title || '').trim(),
          content: values.content,
        },
        file: fileList[0]?.originFileObj || undefined,
      };

      console.log('📢 공지사항 등록 요청:', payload);
      const res = await noticeAPI.createNotice(payload);

      if (res.success) {
        const id = res.data.noticeId;
        if (id) {
          messageApi.success('공지사항이 등록되었습니다.');
          navigate(`/hq/notices/${id}`);
        }
      }
    } catch (e: any) {
      console.error('공지사항 등록 실패:', e);
      messageApi.error(e.response?.data?.message || '공지사항 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      {contextHolder}
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
        <Flex gap={8} wrap>
          <Form.Item
            name="type"
            label="카테고리"
            rules={[{ required: true, message: '카테고리를 선택해주세요.' }]}
            style={{ flex: 1 }}
          >
            <Select placeholder="카테고리 선택" options={[...NOTICE_TYPE_OPTIONS]} />
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

        <Flex gap={8} wrap align="start" style={{ marginBottom: '16px' }}>
          <Form.Item name="attachmentUrl" noStyle>
            <Input type="hidden" />
          </Form.Item>

          <Upload
            accept=".pdf,.txt"
            showUploadList={false}
            fileList={fileList}
            beforeUpload={handleBeforeUpload}
            onChange={handleChange}
            maxCount={1}
          >
            <Button type="default" icon={<UploadOutlined />}>
              첨부파일
            </Button>
          </Upload>
          <Upload showUploadList={true} fileList={fileList} onRemove={handleRemove} />

          <Tooltip
            title={
              !watchedType
                ? '카테고리를 먼저 선택해주세요'
                : watchedType === NOTICE_TYPE.GENERAL
                  ? '안내 카테고리는 AI 요약을 지원하지 않습니다'
                  : fileList.length === 0
                    ? '첨부파일을 업로드해주세요'
                    : ''
            }
            placement="right"
          >
            <Button
              type="primary"
              disabled={
                !watchedType || watchedType === NOTICE_TYPE.GENERAL || fileList.length === 0
              }
              onClick={handleAiSummarize}
              loading={aiLoading}
            >
              AI 요약
            </Button>
          </Tooltip>
        </Flex>

        <Form.Item name="content" rules={[{ required: true, message: '내용을 입력해주세요.' }]}>
          <TiptapEditor
            value={watchedContent}
            onChange={(value: string) => form.setFieldsValue({ content: value })}
          />
        </Form.Item>

        <Flex justify="flex-end">
          <Button type="primary" htmlType="submit">
            등록
          </Button>
        </Flex>
      </Form>
    </>
  );
}

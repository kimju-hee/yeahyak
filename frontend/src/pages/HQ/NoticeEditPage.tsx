import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { Button, Flex, Form, Input, message, Select, Tooltip, Typography, Upload } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NoticeEditSkeleton, TiptapEditor } from '../../components';
import { NOTICE_TYPE_OPTIONS } from '../../constants';
import { useAiSummarize, useNotice, useUpdateNotice } from '../../hooks';
import { NOTICE_TYPE, type NoticeUpdateRequestWithFile } from '../../types';
import { validateAttachmentFile } from '../../utils';

export default function NoticeEditPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const watchedType = Form.useWatch('type', form);
  const watchedContent = Form.useWatch('content', form);

  const noticeId = Number(id);

  const { data: notice, isLoading: loading, error } = useNotice(noticeId);

  const updateNoticeMutation = useUpdateNotice(noticeId);
  const aiSummarizeMutation = useAiSummarize();

  // 공지사항 데이터가 로드되면 폼에 설정
  useEffect(() => {
    if (notice) {
      form.setFieldsValue({
        type: notice.type,
        title: notice.title,
        content: notice.content,
        fileName: notice.fileName || '',
      });

      if (notice.fileName) {
        setFileList([
          {
            uid: '-1',
            name: notice.fileName || '첨부파일',
            status: 'done',
            url: notice.fileName,
          } as UploadFile,
        ]);
      } else {
        setFileList([]);
      }
    }
  }, [notice, form]);

  // 에러 처리
  useEffect(() => {
    if (error) {
      console.error('공지사항 상세 로딩 실패:', error);
      messageApi.error('공지사항 로딩 중 오류가 발생했습니다.');
    }
  }, [error, messageApi]);

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
    form.setFieldsValue({ fileName: fileList[0].name || '' });
  };

  const handleRemove = () => {
    setFileList([]);
    form.setFieldsValue({ fileName: '' });
  };

  const handleAiSummarize = async () => {
    if (fileList.length === 0 || !fileList[0].originFileObj) {
      messageApi.warning('첨부 파일이 없습니다.');
      return;
    }

    try {
      const file = fileList[0].originFileObj as File;

      // 파일 재검증 (카테고리가 변경된 경우 대비)
      const error = validateAttachmentFile(file, watchedType);
      if (error) {
        messageApi.error(error);
        return;
      }

      const res = await aiSummarizeMutation.mutateAsync({ file, type: watchedType });
      if (res.success) {
        const raw = watchedType === NOTICE_TYPE.EPIDEMIC ? res.data.notice : res.data.summary;
        form.setFieldsValue({ content: raw });
        messageApi.success('AI가 문서를 요약했습니다!');
      }
    } catch (error: any) {
      messageApi.error(error.response?.data?.message || 'AI 문서 요약 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload: NoticeUpdateRequestWithFile = {
        notice: {
          title: (values.title || '').trim(),
          content: values.content,
          removeFile: !fileList[0]?.originFileObj,
        },
        file: fileList[0]?.originFileObj || undefined,
      };
      await updateNoticeMutation.mutateAsync(payload);
      messageApi.success('공지사항이 수정되었습니다.');
      navigate(`/hq/notices/${id}`);
    } catch (error: any) {
      messageApi.error(error.response?.data?.message || '공지사항 수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      {contextHolder}
      <Typography.Title level={3} style={{ marginBottom: 24 }}>
        공지사항 수정
      </Typography.Title>

      {loading ? (
        <NoticeEditSkeleton />
      ) : (
        <Form
          form={form}
          name="notice-edit"
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Flex gap={8} wrap>
            <Form.Item name="type" label="카테고리" style={{ flex: 1 }}>
              <Select options={[...NOTICE_TYPE_OPTIONS]} disabled />
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

          <Flex gap={8} wrap align="start" style={{ marginBottom: 16 }}>
            <Form.Item name="fileName" noStyle>
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
                loading={aiSummarizeMutation.isPending}
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
              저장
            </Button>
          </Flex>
        </Form>
      )}
    </>
  );
}

import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import {
  Button,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Select,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { aiAPI, noticeAPI } from '../../api';
import { NoticeEditSkeleton } from '../../components/skeletons';
import TiptapEditor from '../../components/TiptapEditor';
import { NOTICE_TYPE_OPTIONS } from '../../constants';
import { NOTICE_TYPE, type NoticeDetail } from '../../types';
import { validateAttachmentFile } from '../../utils';

export default function NoticeEditPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [isEdited, setIsEdited] = useState(false);

  const watchedType = Form.useWatch('type', form);
  const watchedContent = Form.useWatch('content', form);

  const fetchAnnouncement = async () => {
    setLoading(true);
    try {
      const res = await noticeAPI.getNotice(Number(id));

      if (res.success) {
        const notice: NoticeDetail = res.data[0];
        form.setFieldsValue({
          type: notice.type,
          title: notice.title,
          content: notice.content,
          attachmentUrl: notice.attachmentUrl || '',
        });

        if (notice.attachmentUrl) {
          setFileList([
            {
              uid: '-1',
              name: notice.attachmentUrl.split('/').pop() || '첨부파일',
              status: 'done',
              url: notice.attachmentUrl,
            } as UploadFile,
          ]);
        } else {
          setFileList([]);
        }
      }
    } catch (e: any) {
      console.error('공지사항 상세 로딩 실패:', e);
      messageApi.error(e.response?.data?.message || '공지사항 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncement();
  }, [id]);

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

  // TODO: AI가 문서를 요약하는 동안 로딩 상태 표시!
  const handleAiSummarize = async () => {
    if (fileList.length === 0 || !fileList[0].originFileObj) {
      messageApi.warning('첨부 파일이 없습니다.');
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
      form.setFieldsValue({ content: '' });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        announcement: {
          type: values.type,
          title: (values.title || '').trim(),
          content: values.content,
        },
        file: fileList[0]?.originFileObj || undefined,
      };
      await noticeAPI.updateNotice(Number(id), payload);
      messageApi.success('공지사항이 수정되었습니다.');
      navigate(`/hq/announcements/${id}`);
    } catch (e: any) {
      console.error('공지사항 수정 실패:', e);
      messageApi.error(e.response?.data?.message || '공지사항 수정 중 오류가 발생했습니다.');
    }
  };

  const handleFormValuesChange = () => setIsEdited(true);

  // BUG: 뒤로가기 씹히는 문제
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEdited) e.preventDefault();
    };

    const handlePopState = () => {
      if (isEdited) {
        window.history.pushState(null, '', window.location.href);

        modal.confirm({
          title: '페이지를 나가시겠습니까?',
          content: '수정 중인 내용이 사라집니다.',
          okText: '나가기',
          cancelText: '취소',
          onOk: () => {
            setIsEdited(false);
            navigate(`/hq/announcements/${id}`);
          },
          onCancel: () => {},
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isEdited, modal, navigate]);

  return (
    <>
      {contextHolder}
      {modalContextHolder}
      <Typography.Title level={3} style={{ marginBottom: '24px' }}>
        공지사항 수정
      </Typography.Title>

      {loading ? (
        <NoticeEditSkeleton />
      ) : (
        <Form
          form={form}
          name="notice-edit"
          layout="vertical"
          onValuesChange={handleFormValuesChange}
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Flex gap={8}>
            <Form.Item
              name="type"
              label="카테고리"
              rules={[{ required: true, message: '카테고리를 선택해주세요.' }]}
              style={{ flex: 1 }}
            >
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
              저장
            </Button>
          </Flex>
        </Form>
      )}
    </>
  );
}

import {
  CloseOutlined,
  MedicineBoxOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { Bubble, Sender } from '@ant-design/x';
import { Button, Card, Flex, FloatButton, type GetProp } from 'antd';
import DOMPurify from 'dompurify';
import MarkdownIt from 'markdown-it';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { Rnd } from 'react-rnd';
import { instance } from '../api/api';
import { useAuthStore } from '../stores/authStore';
import {
  CHAT_ROLE,
  CHAT_TYPE,
  type ChatbotRequest,
  type ChatMessage,
  type ChatType,
} from '../types/chatbot.type';
import type { User } from '../types/profile.type';

interface ChatbotProps {
  boundsRef: RefObject<HTMLDivElement | null>;
}

const md = new MarkdownIt({ html: false, breaks: true, linkify: true });

const renderMarkdown: GetProp<typeof Bubble, 'messageRender'> = (raw) => {
  const html = md.render(String(raw));
  const safe = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: safe }} />;
};

const roles: GetProp<typeof Bubble.List, 'roles'> = {
  USER: {
    placement: 'end',
    shape: 'corner',
  },
  AI: {
    placement: 'start',
    shape: 'corner',
    avatar: { icon: <RobotOutlined />, style: { color: '#fa8c16', backgroundColor: '#fff7e6' } },
    messageRender: renderMarkdown,
  },
};

export default function Chatbot({ boundsRef }: ChatbotProps) {
  const user = useAuthStore((state) => state.user) as User;

  const [chatType, setChatType] = useState<ChatType>();
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [requesting, setRequesting] = useState(false);

  const abortController = useRef<AbortController | null>(null);
  const keySeed = useRef(0);

  const makeKey = useCallback(() => `k${++keySeed.current}`, []);

  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [resizeKey, setResizeKey] = useState(0);

  const calculatePosition = useCallback(() => {
    if (boundsRef.current) {
      const parentWidth = boundsRef.current.clientWidth;
      const parentHeight = boundsRef.current.clientHeight;

      setInitialPosition({
        x: parentWidth - 360 - 48,
        y: parentHeight - 480,
      });
    }
  }, [boundsRef]);

  useEffect(() => {
    calculatePosition();
    const handleResize = () => {
      calculatePosition();
      setResizeKey((prevKey) => prevKey + 1);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [boundsRef]);

  useEffect(() => () => abortController.current?.abort?.(), []);

  const handleSelect = useCallback(
    (type: ChatType) => {
      abortController.current?.abort?.();
      setChatType(type);
      setContent('');
      const initialMessage: ChatMessage = {
        role: CHAT_ROLE.AI,
        content:
          type === CHAT_TYPE.FAQ
            ? '안녕하세요 저는 FAQ 챗봇입니다. 무엇을 도와드릴까요?'
            : '안녕하세요 저는 Q&A 챗봇입니다. 무엇을 도와드릴까요?',
        key: makeKey(),
      };
      setMessages([initialMessage]);
    },
    [makeKey],
  );

  const handleClose = useCallback(() => {
    abortController.current?.abort?.();
    setChatType(undefined);
    setMessages([]);
    setContent('');
  }, []);

  const handleSend = useCallback(
    async (raw: string) => {
      if (!raw.trim() || !chatType || requesting) return;

      const userMessage: ChatMessage = {
        role: CHAT_ROLE.USER,
        content: raw.trim(),
        key: makeKey(),
      };
      const loadingMessage: ChatMessage = {
        role: CHAT_ROLE.AI,
        content: '',
        key: makeKey(),
        loading: true,
      };
      setMessages((prev) => [...prev, userMessage, loadingMessage]);
      setContent('');

      const payload: ChatbotRequest = {
        userId: user.userId,
        chatType: chatType,
        query: raw.trim(),
        history: [...messages, userMessage].map((message) => ({
          role: message.role,
          content: message.content,
        })),
      };
      // LOG: 테스트용 로그
      console.log('🤖 챗봇 요청:', payload);

      const endpoint = chatType === CHAT_TYPE.FAQ ? '/chat/faq' : '/chat/qna';

      setRequesting(true);
      const controller = new AbortController();
      abortController.current = controller;

      try {
        const res = await instance.post(endpoint, payload, { signal: controller.signal });
        // LOG: 테스트용 로그
        console.log('🤖 챗봇 응답:', res.data);
        if (res.data.success) {
          const aiMessage: ChatMessage = {
            role: CHAT_ROLE.AI,
            content: res.data.data.reply || '응답이 없습니다.',
            key: makeKey(),
          };
          setMessages((prev) => prev.slice(0, -1).concat(aiMessage));
        }
      } catch (e: any) {
        if (e.name === 'AbortError' || e.name === 'CanceledError') {
          const cancelMessage = {
            role: CHAT_ROLE.AI,
            content: '답변 요청 취소됨',
            key: makeKey(),
          };
          setMessages((prev) => prev.slice(0, -1).concat(cancelMessage));
        } else {
          const errorMessage = {
            role: CHAT_ROLE.AI,
            content: '알 수 없는 오류가 발생했습니다.',
            key: makeKey(),
          };
          setMessages((prev) => prev.slice(0, -1).concat(errorMessage));
        }
      } finally {
        setRequesting(false);
        abortController.current = null;
      }
    },
    [chatType, requesting, makeKey],
  );

  return (
    <>
      <FloatButton.Group
        trigger="click"
        type="primary"
        style={{ insetInlineEnd: '24px' }}
        icon={<MessageOutlined />}
      >
        <FloatButton
          icon={<QuestionCircleOutlined />}
          onClick={() => handleSelect(CHAT_TYPE.FAQ)}
          tooltip={{ title: '운영에 대해 궁금한 점을 물어보세요!', placement: 'left' }}
        />
        <FloatButton
          icon={<MedicineBoxOutlined />}
          onClick={() => handleSelect(CHAT_TYPE.QNA)}
          tooltip={{ title: '의약품에 대해 궁금한 점을 물어보세요!', placement: 'left' }}
        />
      </FloatButton.Group>

      {/* 챗봇 */}
      {chatType && (
        <Rnd
          key={resizeKey}
          default={{ x: initialPosition.x, y: initialPosition.y, width: 360, height: 480 }}
          minWidth={360}
          minHeight={480}
          bounds={boundsRef?.current ?? undefined}
        >
          <Card
            title={chatType === CHAT_TYPE.FAQ ? 'FAQ 챗봇' : 'Q&A 챗봇'}
            extra={
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={handleClose}
                style={{ margin: 0 }}
              />
            }
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0px 9px 28px 0px rgba(0, 0, 0, 0.05)',
            }}
            styles={{
              body: {
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                padding: '8px',
                overflow: 'hidden',
              },
            }}
          >
            <Flex vertical justify="space-between" style={{ flex: 1, minHeight: 0 }}>
              <Bubble.List
                autoScroll
                roles={roles}
                items={messages.map((m) => ({
                  role: m.role,
                  content: m.content,
                  loading: m.loading,
                  key: m.key,
                }))}
                style={{ flex: 'auto', paddingInline: '8px' }}
              />

              <Sender
                placeholder={
                  chatType === CHAT_TYPE.FAQ
                    ? '운영에 대해 궁금한 점을 물어보세요!'
                    : '의약품에 대해 궁금한 점을 물어보세요!'
                }
                loading={requesting}
                value={content}
                onChange={setContent}
                onCancel={() => {
                  abortController?.current?.abort?.();
                  setContent('');
                }}
                onSubmit={handleSend}
                submitType="enter"
                autoSize={{ maxRows: 4 }}
                style={{ flex: 'none', marginTop: '8px' }}
              />
            </Flex>
          </Card>
        </Rnd>
      )}
    </>
  );
}

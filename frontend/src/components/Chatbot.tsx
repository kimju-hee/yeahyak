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
import { aiAPI } from '../api';
import { useAuthStore } from '../stores/authStore';
import type { User } from '../types';
import {
  CHAT_ROLE,
  CHAT_TYPE,
  type ChatbotReq,
  type ChatMessage,
  type ChatType,
} from '../types/chatbot.type';

interface ChatbotProps {
  boundsRef: RefObject<HTMLDivElement | null>;
}

const md = new MarkdownIt({ html: false, breaks: true, linkify: true });

const renderMarkdown: GetProp<typeof Bubble, 'messageRender'> = (raw) => {
  const html = md.render(String(raw));
  const safe = DOMPurify.sanitize(html);
  return <div className="chat-bubble-markdown" dangerouslySetInnerHTML={{ __html: safe }} />;
};

const roles: GetProp<typeof Bubble.List, 'roles'> = {
  USER: {
    placement: 'end',
    shape: 'corner',
  },
  AI: {
    placement: 'start',
    shape: 'corner',
    avatar: { icon: <RobotOutlined />, style: { color: '#1677ff', backgroundColor: '#e6f4ff' } },
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
            ? '안녕하세요 저는 운영 도우미입니다! 무엇을 도와드릴까요?'
            : '안녕하세요 저는 의약품 AI 어시스턴트입니다! 무엇을 도와드릴까요?',
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

  // handleSend수정
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

      // ✅ 공통(FAQ/QNA 모두): 직전 메시지 + 방금 보낸 메시지
      const merged = [...messages, userMessage];

      setRequesting(true);
      const controller = new AbortController();
      abortController.current = controller;

      try {
        let response;

        if (chatType === CHAT_TYPE.FAQ) {
          // ✅ FAQ는 기존처럼 role 그대로 보냄
          const payload: ChatbotReq = {
            userId: user.userId,
            type: CHAT_TYPE.FAQ,
            question: raw.trim(),
            history: merged.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          };
          response = await aiAPI.chatFAQ(payload);
        } else {
          // ✅ QNA는 history를 type: 'human' | 'ai'로 변환, chatType도 강제 'QNA'
          const payloadQna = {
            userId: user.userId,
            chatType: 'QNA', // ← 'ONA'로 찍혀도 여기서 강제 교정
            query: raw.trim(),
            history: merged.map((m) => ({
              type: m.role === CHAT_ROLE.AI ? 'ai' : 'human',
              content: m.content,
            })),
          };
          // 타입이 role 기반이면 캐스팅만
          response = await aiAPI.chatQNA(payloadQna as unknown as ChatbotReq);
        }

        if (response.success) {
          const aiMessage: ChatMessage = {
            role: CHAT_ROLE.AI,
            content: response.data.answer || '응답이 없습니다.',
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
    [chatType, requesting, makeKey, messages, user.userId],
  );

  return (
    <>
      <FloatButton.Group
        trigger="click"
        type="primary"
        style={{ insetInlineEnd: '24px' }}
        icon={<MessageOutlined />}
        tooltip={{ title: '도움이 필요하신가요?', placement: 'left' }}
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
          minWidth={320}
          minHeight={400}
          bounds={boundsRef?.current ?? undefined}
        >
          <Card
            title={chatType === CHAT_TYPE.FAQ ? '운영 도우미' : '의약품 AI 어시스턴트'}
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

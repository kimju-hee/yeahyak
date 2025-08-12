import { useState, useEffect, useRef } from 'react';
import { Button, Dropdown, Input, Space, Typography, Card } from 'antd';
import type { MenuProps } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { Bubble } from '@ant-design/x';
import { Rnd } from 'react-rnd';
import type { TextAreaRef } from 'antd/es/input/TextArea';
import type { DraggableEventHandler } from 'react-draggable';          // ✅ 추가
import type { RndResizeCallback } from 'react-rnd';                     // ✅ 추가

import { instance } from '../api/api';

const { TextArea } = Input;
const { Title } = Typography;

type ChatRole = 'user' | 'bot';
interface ChatMessage { role: ChatRole; content: string; }

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'FAQ' | 'Q&A' | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messageEndRef = useRef<HTMLDivElement>(null);
  const chatbotRef = useRef<HTMLElement>(null);
  const inputRef = useRef<TextAreaRef>(null);

  // 비율 기반 초기값
  const vw = typeof window !== 'undefined'
    ? Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    : 1280;
  const vh = typeof window !== 'undefined'
    ? Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    : 800;

  // ✅ 반환값을 void로 (setTimeout 반환값을 리턴하지 않음)
  const focusComposer = (): void => {
    window.setTimeout(() => inputRef.current?.focus?.({ cursor: 'end' }), 0);
  };

  // ✅ 타입 시그니처에 맞는 래퍼 핸들러
  const handleDragStop: DraggableEventHandler = (_e, _data) => {
    focusComposer();
  };
  const handleResizeStop: RndResizeCallback = (_e, _dir, _ref, _delta, _pos) => {
    focusComposer();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mode && chatbotRef.current && !chatbotRef.current.contains(e.target as Node)) {
        setMode(null);
        setMessages([]);
      }
    };
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mode) {
        setMode(null);
        setMessages([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [mode]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => { if (mode) focusComposer(); }, [mode]);
  useEffect(() => { if (mode && !isSending) focusComposer(); }, [isSending, mode]);

  const handleSend = async () => {
    if (!input.trim() || !mode || isSending) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const historyToSend = [...messages, userMessage];
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    const endpoint = mode === 'FAQ' ? '/chat/faq' : '/chat/qna';

    try {
      const { data } = await instance.post(endpoint, {
        userId: 1,
        question: userMessage.content,
        chatType: mode === 'FAQ' ? 'FAQ' : 'QNA',
        history: historyToSend.map((m) => ({
          type: m.role === 'user' ? 'HUMAN' : 'AI',
          content: m.content,
        })),
      });
      const reply = data?.data?.reply ?? '응답이 없습니다.';
      setMessages((prev) => [...prev, { role: 'bot', content: reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'bot', content: '서버 오류가 발생했습니다.' }]);
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSelect = (key: 'faq' | 'qna') => {
    const selectedMode = key === 'faq' ? 'FAQ' : 'Q&A';
    setMode(selectedMode);
    setInput('');
    setMessages([{
      role: 'bot',
      content: selectedMode === 'FAQ'
        ? '안녕하세요. 자주 묻는 질문을 도와드리겠습니다.'
        : '안녕하세요. 무엇을 도와드릴까요?',
    }]);
    setOpen(false);
  };

  const dropdownItems: MenuProps['items'] = [
    { key: 'faq', label: 'FAQ', onClick: () => handleSelect('faq') },
    { key: 'qna', label: 'Q&A', onClick: () => handleSelect('qna') },
  ];

  return (
    <div id="chatbot-wrapper" style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      zIndex: 1000, pointerEvents: 'none',
    }}>
      <aside style={{ position: 'absolute', top: 24, right: 24, pointerEvents: 'auto' }}>
        <Dropdown menu={{ items: dropdownItems }} open={open} onOpenChange={setOpen}
                  placement="bottomRight" arrow>
          <Button type="primary" shape="circle" size="large" icon={<MessageOutlined />} />
        </Dropdown>
      </aside>

      {mode && (
        <Rnd
          default={{
            x: Math.round(vw * 0.66),
            y: Math.round(vh * 0.10),
            width: Math.round(vw * 0.26),
            height: Math.round(vh * 0.60),
          }}
          minWidth={320}
          minHeight={360}
          bounds="#chatbot-wrapper"
          enableResizing={{
            top: true, right: true, bottom: true, left: true,
            topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
          }}
          dragHandleClassName="chatbot-drag-handle"
          cancel=".chatbot-body, .chat-input-area, textarea, .ant-input"
          style={{ position: 'absolute', pointerEvents: 'auto' }}
          onDragStop={handleDragStop}            // ✅ 변경
          onResizeStop={handleResizeStop}        // ✅ 변경
        >
          <section ref={chatbotRef} style={{ height: '100%' }}>
            <Card
              title={
                <header className="chatbot-drag-handle"
                        style={{ cursor: 'move', display: 'flex', alignItems: 'center' }}>
                  <Title level={5} style={{ margin: 0 }}>
                    {mode === 'FAQ' ? 'FAQ 챗봇' : 'Q&A 챗봇'}
                  </Title>
                </header>
              }
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              styles={{
                body: { display: 'flex', flexDirection: 'column', flex: 1, padding: 0, overflow: 'hidden' },
              }}
            >
              <main className="chatbot-body" style={{
                flex: 1, minHeight: 0, overflowY: 'auto', padding: 12,
                display: 'flex', flexDirection: 'column', gap: 8,
                userSelect: 'text', WebkitUserSelect: 'text',
              }}>
                {messages.map((msg, idx) => (
                  <article key={idx} style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }} aria-label={msg.role === 'user' ? '사용자 메시지' : '봇 메시지'}>
                    <Bubble
                      content={msg.content}
                      shape="corner"
                      placement={msg.role === 'user' ? 'end' : 'start'}
                      styles={{
                        content: {
                          maxWidth: 240,
                          backgroundColor: msg.role === 'user' ? '#1677ff' : '#f0f0f0',
                          color: msg.role === 'user' ? '#fff' : '#000',
                        },
                      }}
                    />
                  </article>
                ))}
                <span ref={messageEndRef} />
              </main>

              <footer className="chat-input-area" style={{ padding: 12, borderTop: '1px solid #eee' }}>
                <Space.Compact style={{ width: '100%' }}>
                  <TextArea
                    ref={inputRef}
                    autoSize={{ minRows: 1, maxRows: 2 }}
                    value={input}
                    disabled={isSending}
                    onChange={(e) => setInput(e.target.value)}
                    onPressEnter={(e) => {
                      if (isSending) { e.preventDefault(); return; }
                      e.preventDefault();
                      handleSend();
                    }}
                    placeholder="메시지를 입력하세요..."
                  />
                  <Button type="primary" onClick={handleSend}
                          loading={isSending} disabled={isSending || !input.trim()}>
                    전송
                  </Button>
                </Space.Compact>
              </footer>
            </Card>
          </section>
        </Rnd>
      )}
    </div>
  );
}

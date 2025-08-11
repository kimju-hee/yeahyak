import { useState, useEffect, useRef } from 'react';
import { Button, Dropdown, Input, Space, Typography, Card } from 'antd';
import type { MenuProps } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { Bubble } from '@ant-design/x';
import { Rnd } from 'react-rnd';

// Markdown 렌더링
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeSanitize from 'rehype-sanitize';

const { TextArea } = Input;
const { Title } = Typography;

type ChatRole = 'user' | 'bot';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'FAQ' | 'Q&A' | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);  // 중복 전송 방지
  const [composing, setComposing] = useState(false);  // IME(한글) 조합 상태
  const [ready, setReady] = useState(false);          // window 접근 안전화(SSR 대비)

  const messageEndRef = useRef<HTMLSpanElement | null>(null);  // 실제로 span 사용
  const chatbotRef = useRef<HTMLDivElement | null>(null);

  // 클라이언트 렌더 보장
  useEffect(() => setReady(true), []);

  // 바깥 클릭/ESC로 닫기 (현재 UX 유지)
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

  // 자동 스크롤
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !mode || isSending) return;

    const trimmed = input.trim();
    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMessage]; // 최신 메시지 포함
    setMessages(nextMessages);
    setInput('');
    setIsSending(true);

    // 🔒 API 라인: 원본 유지
    const endpoint =
      mode === 'FAQ'
        ? 'http://localhost:8080/api/chat/faq'
        : 'http://localhost:8080/api/chat/qna';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          question: trimmed,
          history: nextMessages.map((msg) => ({
            type: msg.role === 'user' ? 'human' : 'ai',
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json().catch(() => ({} as any));
      const reply = result?.data?.reply || '응답이 없습니다.';

      setMessages((prev) => [...prev, { role: 'bot', content: reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'bot', content: '서버 오류가 발생했습니다.' }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSelect = (key: 'faq' | 'qna') => {
    const selectedMode = key === 'faq' ? 'FAQ' : 'Q&A';
    setMode(selectedMode);
    setInput('');
    const initialBotMessage: ChatMessage = {
      role: 'bot',
      content:
        selectedMode === 'FAQ'
          ? '안녕하세요. 자주 묻는 질문을 도와드리겠습니다.'
          : '안녕하세요. 무엇을 도와드릴까요?',
    };
    setMessages([initialBotMessage]);  // 이 초기 문구도 history에 포함됨
    setOpen(false);
  };

  const dropdownItems: MenuProps['items'] = [
    { key: 'faq', label: 'FAQ', onClick: () => handleSelect('faq') },
    { key: 'qna', label: 'Q&A', onClick: () => handleSelect('qna') },
  ];

  return (
    <div
      id="chatbot-wrapper"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      {/* 버튼 */}
      <aside style={{ position: 'absolute', top: 24, right: 24, pointerEvents: 'auto' }}>
        <Dropdown
          menu={{ items: dropdownItems }}
          open={open}
          onOpenChange={setOpen}
          placement="bottomRight"
          arrow
        >
          <Button type="primary" shape="circle" size="large" icon={<MessageOutlined />} />
        </Dropdown>
      </aside>

      {/* 챗봇 */}
      {mode && ready && (
        <Rnd
          default={{
            x: window.innerWidth - 400,
            y: window.innerHeight - 600,
            width: 360,
            height: 480,
          }}
          minWidth={300}
          minHeight={400}
          bounds="#chatbot-wrapper"
          // ⬇⬇ 헤더만 드래그 가능
          dragHandleClassName="chatbot-header"
          // ⬇⬇ 테두리/모서리에서만 리사이즈
          enableResizing={{
            top: true, right: true, bottom: true, left: true,
            topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
          }}
          resizeHandleStyles={{
            top: { height: '6px', cursor: 'ns-resize' },
            right: { width: '6px', cursor: 'ew-resize' },
            bottom: { height: '6px', cursor: 'ns-resize' },
            left: { width: '6px', cursor: 'ew-resize' },
            topRight: { width: '10px', height: '10px', cursor: 'ne-resize' },
            bottomRight: { width: '10px', height: '10px', cursor: 'se-resize' },
            bottomLeft: { width: '10px', height: '10px', cursor: 'sw-resize' },
            topLeft: { width: '10px', height: '10px', cursor: 'nw-resize' },
          }}
          style={{ position: 'absolute', pointerEvents: 'auto' }}
        >
          <div ref={chatbotRef} style={{ height: '100%' }}>
            <Card
              title={
                // ⬇⬇ 이 영역만 창 이동 가능
                <div className="chatbot-header" style={{ cursor: 'move', display: 'flex', alignItems: 'center' }}>
                  <Title level={5} style={{ margin: 0 }}>
                    {mode === 'FAQ' ? 'FAQ 챗봇' : 'Q&A 챗봇'}
                  </Title>
                </div>
              }
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
              styles={{
                body: {
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  padding: 0,
                  overflow: 'hidden',
                  border: '1px solid #e5e7eb', // 테두리 힌트(선택)
                },
              }}
            >
              {/* 메시지 영역 */}
              <main
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  userSelect: 'text',            // ⬅ 텍스트 선택 허용
                }}
              >
                {messages.map((msg, idx) => (
                  <article
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent:
                        msg.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Bubble
                      shape="corner"
                      placement={msg.role === 'user' ? 'end' : 'start'}
                      styles={{
                        content: {
                          maxWidth: 320,
                          backgroundColor:
                            msg.role === 'user' ? '#1677ff' : '#f0f0f0',
                          color: msg.role === 'user' ? '#fff' : '#000',
                          padding: 12,
                        },
                      }}
                      // 마크다운 렌더링
                      content={
                        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', userSelect: 'text' }}>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkBreaks]}
                            rehypePlugins={[rehypeSanitize]}
                            components={{
                              a: ({ node, ...props }) => (
                                <a {...props} target="_blank" rel="noopener noreferrer" />
                              ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      }
                    />
                  </article>
                ))}
                <span ref={messageEndRef} />
              </main>

              {/* 입력창 */}
              <footer style={{ padding: 12, borderTop: '1px solid #eee' }}>
                <Space.Compact style={{ width: '100%' }}>
                  <TextArea
                    autoSize={{ minRows: 1, maxRows: 2 }}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onCompositionStart={() => setComposing(true)}
                    onCompositionEnd={() => setComposing(false)}
                    onPressEnter={(e) => {
                      if (composing) return; // IME 조합 중엔 전송 금지
                      e.preventDefault();
                      handleSend();
                    }}
                    placeholder="메시지를 입력하세요..."
                    disabled={isSending}
                  />
                  <Button
                    type="primary"
                    onClick={handleSend}
                    disabled={!input.trim()}
                    loading={isSending}
                  >
                    전송
                  </Button>
                </Space.Compact>
              </footer>
            </Card>
          </div>
        </Rnd>
      )}
    </div>
  );
}

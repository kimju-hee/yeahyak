import { useState, useEffect, useRef } from 'react';
import { Button, Dropdown, Input, Space, Typography, Card } from 'antd';
import type { MenuProps } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { Bubble } from '@ant-design/x';
import { Rnd } from 'react-rnd';

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
  const messageEndRef = useRef<HTMLDivElement>(null);
  const chatbotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mode &&
        chatbotRef.current &&
        !chatbotRef.current.contains(e.target as Node)
      ) {
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
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !mode) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // ✅ mode에 따라 API 경로 결정
    const endpoint =
      mode === 'FAQ'
        ? 'http://localhost:8080/api/chat/faq'
        : 'http://localhost:8080/api/chat/qna';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1,
          question: input,
          history: messages.map((msg) => ({
            type: msg.role === 'user' ? 'human' : 'ai',
            content: msg.content,
          })),
        }),
      });

      const result = await response.json();
      const reply = result?.data?.reply || '응답이 없습니다.';

      const botMessage: ChatMessage = {
        role: 'bot',
        content: reply,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'bot',
        content: '서버 오류가 발생했습니다.',
      };
      setMessages((prev) => [...prev, errorMessage]);
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
    setMessages([initialBotMessage]);
    setOpen(false);
  };

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'faq',
      label: 'FAQ',
      onClick: () => handleSelect('faq'),
    },
    {
      key: 'qna',
      label: 'Q&A',
      onClick: () => handleSelect('qna'),
    },
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
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<MessageOutlined />}
          />
        </Dropdown>
      </aside>

      {/* 챗봇 */}
      {mode && (
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
          enableResizing={true}
          style={{ position: 'absolute', pointerEvents: 'auto' }}
        >
          <div ref={chatbotRef} style={{ height: '100%' }}>
            <Card
              title={
                <Title level={5} style={{ margin: 0 }}>
                  {mode === 'FAQ' ? 'FAQ 챗봇' : 'Q&A 챗봇'}
                </Title>
              }
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
              styles={{ // ✅ 변경된 부분
                body: {
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  padding: 0,
                  overflow: 'hidden',
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
                      content={msg.content}
                      shape="corner"
                      placement={msg.role === 'user' ? 'end' : 'start'}
                      styles={{
                        content: {
                          maxWidth: 240,
                          backgroundColor:
                            msg.role === 'user' ? '#1677ff' : '#f0f0f0',
                          color: msg.role === 'user' ? '#fff' : '#000',
                        },
                      }}
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
                    onPressEnter={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    placeholder="메시지를 입력하세요..."
                  />
                  <Button type="primary" onClick={handleSend}>
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

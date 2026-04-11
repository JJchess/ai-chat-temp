'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, MessageBlock, WidgetBlock } from '../types/chat';
import { ChatMessage } from '../components/ChatMessage';
import { ChatComposer } from '../components/ChatComposer';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

interface SessionSummary {
  session_id: string;
  message_count: number;
  updated_at: string;
  preview: string;
}

const createWelcomeMessage = (): Message => ({
  id: '1',
  role: 'assistant',
  content: '你好！这是一个用于开发新的 AI 回复功能的精简版聊天沙盒环境。请问有什么我可以帮你的吗？',
  created_at: new Date().toISOString(),
});

export default function ChatSandboxPage() {
  const [messages, setMessages] = useState<Message[]>([createWelcomeMessage()]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/chat/sessions`);
        if (!response.ok) return;
        const payload = await response.json();
        if (Array.isArray(payload.sessions)) {
          setSessions(payload.sessions);
        }
      } catch {
      }
    };
    void loadSessions();
  }, []);

  const parseSseEvents = (
    buffer: string,
    onEvent: (eventName: string, data: Record<string, unknown>) => void
  ): string => {
    let rest = buffer;
    let splitIndex = rest.indexOf('\n\n');
    while (splitIndex !== -1) {
      const rawEvent = rest.slice(0, splitIndex);
      rest = rest.slice(splitIndex + 2);

      const lines = rawEvent.split('\n');
      let eventName = 'message';
      let dataPayload = '';

      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventName = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          dataPayload += line.slice(5).trim();
        }
      }

      if (dataPayload) {
        try {
          const parsed = JSON.parse(dataPayload) as Record<string, unknown>;
          onEvent(eventName, parsed);
        } catch {
          onEvent(eventName, { raw: dataPayload });
        }
      }

      splitIndex = rest.indexOf('\n\n');
    }
    return rest;
  };

  const updateAssistantMessage = (
    messageId: string,
    updater: (msg: Message) => Message
  ) => {
    setMessages(prev => prev.map(msg => (msg.id === messageId ? updater(msg) : msg)));
  };

  const updateTextBlock = (blocks: MessageBlock[] | undefined, appendDelta: string): MessageBlock[] => {
    const current = blocks ?? [{ type: 'text', text: '' }];
    const textIndex = current.findIndex(block => block.type === 'text');
    if (textIndex === -1) {
      return [{ type: 'text', text: appendDelta }, ...current];
    }
    return current.map((block, index) =>
      index === textIndex && block.type === 'text'
        ? { ...block, text: block.text + appendDelta }
        : block
    );
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);

    const optimisticAssistantId = `${Date.now()}-assistant`;
    const assistantShell: Message = {
      id: optimisticAssistantId,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
      blocks: [{ type: 'text', text: '' }],
    };
    setMessages(prev => [...prev, assistantShell]);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: text,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`stream request failed: ${response.status}`);
      }

      const decoder = new TextDecoder();
      const reader = response.body.getReader();
      let buffer = '';
      let activeAssistantId = optimisticAssistantId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        buffer = parseSseEvents(buffer, (eventName, data) => {
          if (eventName === 'session' && typeof data.session_id === 'string') {
            const incomingSessionId = data.session_id;
            setSessionId(incomingSessionId);
            setSessions(prev => {
              if (prev.some(item => item.session_id === incomingSessionId)) return prev;
              return [
                {
                  session_id: incomingSessionId,
                  message_count: 0,
                  updated_at: new Date().toISOString(),
                  preview: '',
                },
                ...prev,
              ];
            });
            return;
          }

          if (eventName === 'message_start' && typeof data.message_id === 'string') {
            activeAssistantId = data.message_id;
            setMessages(prev =>
              prev.map(msg =>
                msg.id === optimisticAssistantId
                  ? { ...msg, id: activeAssistantId, created_at: new Date().toISOString() }
                  : msg
              )
            );
            return;
          }

          if (eventName === 'assistant_delta' && typeof data.delta === 'string') {
            const delta = data.delta;
            updateAssistantMessage(activeAssistantId, msg => ({
              ...msg,
              content: msg.content + delta,
              blocks: updateTextBlock(msg.blocks, delta),
            }));
            return;
          }

          if (
            eventName === 'toolcall_start' &&
            typeof data.tool_call_id === 'string' &&
            typeof data.title === 'string'
          ) {
            const loadingMessages =
              Array.isArray(data.loading_messages)
                ? data.loading_messages.filter((item): item is string => typeof item === 'string')
                : undefined;
            const widgetBlock: WidgetBlock = {
              type: 'widget',
              tool_call_id: data.tool_call_id,
              title: data.title,
              widget_code: '',
              loading_messages: loadingMessages,
              width: typeof data.width === 'number' ? data.width : undefined,
              height: typeof data.height === 'number' ? data.height : undefined,
              status: 'streaming',
            };
            updateAssistantMessage(activeAssistantId, msg => ({
              ...msg,
              blocks: [...(msg.blocks ?? [{ type: 'text', text: msg.content }]), widgetBlock],
            }));
            return;
          }

          if (
            eventName === 'toolcall_delta' &&
            typeof data.tool_call_id === 'string' &&
            typeof data.widget_code === 'string'
          ) {
            const toolCallId = data.tool_call_id;
            const widgetCode = data.widget_code;
            updateAssistantMessage(activeAssistantId, msg => ({
              ...msg,
              blocks: (msg.blocks ?? []).map(block =>
                block.type === 'widget' && block.tool_call_id === toolCallId
                  ? { ...block, widget_code: widgetCode, status: 'streaming' }
                  : block
              ),
            }));
            return;
          }

          if (
            eventName === 'toolcall_end' &&
            typeof data.tool_call_id === 'string' &&
            typeof data.widget_code === 'string'
          ) {
            const toolCallId = data.tool_call_id;
            const widgetCode = data.widget_code;
            updateAssistantMessage(activeAssistantId, msg => ({
              ...msg,
              blocks: (msg.blocks ?? []).map(block =>
                block.type === 'widget' && block.tool_call_id === toolCallId
                  ? { ...block, widget_code: widgetCode, status: 'completed' }
                  : block
              ),
            }));
            return;
          }

          if (eventName === 'message_end') {
            setIsGenerating(false);
            const activeSessionId = typeof data.session_id === 'string' ? data.session_id : sessionId;
            if (activeSessionId) {
              setSessions(prev => {
                const now = new Date().toISOString();
                const previewText = messages[messages.length - 1]?.content ?? text;
                const next = prev.filter(item => item.session_id !== activeSessionId);
                return [
                  {
                    session_id: activeSessionId,
                    message_count: (next.find(item => item.session_id === activeSessionId)?.message_count ?? 0) + 2,
                    updated_at: now,
                    preview: previewText.slice(0, 80),
                  },
                  ...next,
                ];
              });
            }
          }
        });
      }
    } catch {
      updateAssistantMessage(optimisticAssistantId, msg => ({
        ...msg,
        content: '连接后端流失败，请确认 backend 已启动在 http://localhost:8000。',
        blocks: [{ type: 'text', text: '连接后端流失败，请确认 backend 已启动在 http://localhost:8000。' }],
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenSession = async (targetSessionId: string) => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/chat/sessions/${targetSessionId}`);
      if (!response.ok) return;
      const payload = await response.json();
      if (!Array.isArray(payload.messages)) return;
      const loadedMessages: Message[] = payload.messages
        .filter((item: unknown): item is Record<string, unknown> => typeof item === 'object' && item !== null)
        .map((item: Record<string, unknown>) => ({
          id: String(item.id ?? Date.now()),
          role: (item.role === 'assistant' || item.role === 'system') ? item.role : 'user',
          content: String(item.content ?? ''),
          created_at: String(item.created_at ?? new Date().toISOString()),
        }));
      setMessages(loadedMessages);
      setSessionId(targetSessionId);
    } catch {
    }
  };

  const handleNewChat = () => {
    setSessionId(null);
    setMessages([createWelcomeMessage()]);
    setIsGenerating(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 font-sans overflow-hidden">
      {/* 左侧导航侧边栏 (Mock) */}
      <aside className="w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hidden md:flex flex-col">
        <div className="h-14 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold mr-2">AI</div>
          <span className="font-semibold text-gray-800 dark:text-gray-200">Sandbox App</span>
        </div>
        <div className="flex-1 p-3 space-y-1 overflow-y-auto">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            新对话
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            {sessionId ? `当前会话 ${sessionId.slice(0, 8)}` : '当前会话'}
          </button>
          {sessions.map(history => (
            <button
              key={history.session_id}
              onClick={() => { void handleOpenSession(history.session_id); }}
              className="w-full flex items-start gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span className="min-w-0">
                <span className="block truncate">{history.preview || history.session_id.slice(0, 12)}</span>
                <span className="block text-xs text-gray-400">{history.session_id.slice(0, 8)} · {history.message_count}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-500 to-purple-500" />
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Test User</div>
          </div>
        </div>
      </aside>

      {/* 主聊天区域 */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* 顶部导航 */}
        <header className="h-14 shrink-0 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-4">
          <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-200">AI Reply Sandbox</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors" title="右侧面板">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="15" x2="15" y1="3" y2="21"/></svg>
            </button>
          </div>
        </header>

        {/* 消息列表区域 */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 scroll-smooth"
        >
          <div className="max-w-4xl mx-auto w-full flex flex-col space-y-2 pb-4">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {/* 打字机/加载状态指示器 */}
            {isGenerating && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部输入框 */}
        <div className="shrink-0 p-4 bg-linear-to-t from-gray-50 via-gray-50 to-transparent dark:from-gray-950 dark:via-gray-950 pt-8">
          <ChatComposer 
            onSend={handleSendMessage} 
            disabled={isGenerating} 
          />
        </div>
      </main>
    </div>
  );
}

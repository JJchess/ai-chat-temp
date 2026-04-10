export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  // 后续开发新的 AI 回复功能时，可以在这里扩展更多字段（如 tool_calls, thinking 等）
}

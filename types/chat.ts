export interface TextBlock {
  type: 'text';
  text: string;
}

export interface WidgetBlock {
  type: 'widget';
  tool_call_id: string;
  title: string;
  widget_code: string;
  width?: number;
  height?: number;
  status: 'streaming' | 'completed';
}

export type MessageBlock = TextBlock | WidgetBlock;

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  blocks?: MessageBlock[];
}

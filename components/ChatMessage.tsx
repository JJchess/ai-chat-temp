import { Message, MessageBlock } from '../types/chat';
import { WidgetFrame } from './WidgetFrame';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const blocks = message.blocks ?? [];

  const renderBlock = (block: MessageBlock, index: number) => {
    if (block.type === 'text') {
      return (
        <div key={`${message.id}-text-${index}`} className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">
          {block.text}
        </div>
      );
    }

    return (
      <div key={`${message.id}-widget-${block.tool_call_id}`} className="mt-3">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {block.title.replaceAll('_', ' ')}
        </div>
        <WidgetFrame
          widgetCode={block.widget_code}
          status={block.status}
          height={block.height}
        />
      </div>
    );
  };
  
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        isUser 
          ? 'bg-blue-600 text-white rounded-br-sm' 
          : 'bg-gray-100 text-gray-900 rounded-bl-sm dark:bg-gray-800 dark:text-gray-100'
      }`}>
        {blocks.length > 0 ? blocks.map(renderBlock) : (
          <div className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">
            {message.content}
          </div>
        )}
      </div>
    </div>
  );
}

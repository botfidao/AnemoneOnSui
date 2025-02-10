import { Box, Container, Flex, ScrollArea, Text, TextField } from "@radix-ui/themes";
import { useState, useRef, useEffect } from "react";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useParams } from "react-router-dom";
import { apiClient } from './api/apiClient';
import { AgentSidebar } from './components/AgentSidebar';

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function Chat() {
  const { roleId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !roleId) return;

    const userMessage = input.trim();
    setInput("");
    
    // 添加用户消息
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const data = await apiClient.sendMessage(roleId, userMessage);
      // 处理数组响应，连接所有文本消息
      const responses = Array.isArray(data) ? data : [data];
      const allMessages = responses
        .map(response => response.text)
        .filter(Boolean)
        .join('\n');

      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: allMessages || "无回复内容"
      }]);
    } catch (error) {
      console.error("发送消息失败:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: error instanceof Error ? error.message : "抱歉，发送消息失败，请稍后重试。" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

return (
  <div className="h-screen flex flex-col">
    {/* 侧边栏 & 主内容 */}
    <div className="flex flex-1 overflow-hidden">
      {/* 侧边栏 - 固定宽度 */}
      <aside className="w-72 h-full bg-gray-800 border-r border-gray-600 flex-shrink-0">
        <AgentSidebar />
      </aside>

      {/* 主区域 */}
      <main className="flex flex-col flex-1 h-full">
        {/* 聊天内容区域，确保它可以滚动 */}
        <div className="flex-1 overflow-y-auto p-5 max-h-[95vh]">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 p-3 rounded-lg max-w-4/5 ${
                message.role === "user" ? "ml-auto bg-gray-700" : "bg-gray-600"
              }`}
            >
              <span>{message.content}</span>
            </div>
          ))}
        </div>

        {/* 固定输入框 */}
        <div className="w-full p-3 border-t border-gray-700 bg-gray-900">
          <div className="flex gap-3 items-end">
            {/* 可变高度的输入框 */}
            <textarea
              className="flex-1 p-2 bg-gray-800 text-white border border-gray-600 rounded resize-none overflow-y-auto max-h-40"
              placeholder="输入消息..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1} // 默认 1 行
            />
            <button
              className="bg-blue-600 p-2 rounded"
              onClick={handleSubmit}
            >
              发送
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
);

} 
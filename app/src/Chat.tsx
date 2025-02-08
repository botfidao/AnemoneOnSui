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
  const { agentId } = useParams();
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
    if (!input.trim() || isLoading || !agentId) return;

    const userMessage = input.trim();
    setInput("");
    
    // 添加用户消息
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const data = await apiClient.sendMessage(agentId, userMessage);
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
    <Container size="3" style={{ 
      height: "100vh", 
      position: "relative",
      padding: "0",
    }}>
      <Flex style={{ height: "100%" }}>
        {/* 侧边栏 */}
        <AgentSidebar />

        {/* 聊天主区域 */}
        <Flex direction="column" style={{ flex: 1, position: "relative" }}>
          <ScrollArea
            style={{
              flex: 1,
              padding: "20px",
              paddingBottom: "100px",
            }}
          >
            <div className="messages-container">
              {messages.map((message, index) => (
                <Box
                  key={index}
                  mb="4"
                  style={{
                    background: message.role === "user" ? "var(--gray-a3)" : "var(--gray-a4)",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    maxWidth: "80%",
                    marginLeft: message.role === "user" ? "auto" : "0",
                  }}
                >
                  <Text size="2">{message.content}</Text>
                </Box>
              ))}
              <div ref={messagesEndRef} />
              {isLoading && (
                <Box
                  mb="4"
                  style={{
                    background: "var(--gray-a4)",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    maxWidth: "80%",
                  }}
                >
                  <Text size="2">正在输入...</Text>
                </Box>
              )}
            </div>
          </ScrollArea>

          {/* 输入区域 - 固定在底部 */}
          <form onSubmit={handleSubmit} className="chat-input-form">
            <Flex gap="3" align="center">
              <div className="chat-input-container">
                <input
                  className="chat-input"
                  placeholder="输入消息..."
                  value={input}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="send-button"
                disabled={!input.trim() || isLoading}
              >
                <PaperPlaneIcon />
              </button>
            </Flex>
          </form>
        </Flex>
      </Flex>
    </Container>
  );
} 
import { useState, useRef, useEffect } from "react";
import { Layout, Input, Button, Spin } from "antd";
import { PaperPlaneOutlined } from "@ant-design/icons";
import { AgentSidebar } from "./components/AgentSidebar";
import { apiClient } from "./api/apiClient";

const { Sider, Content, Footer } = Layout;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function Chat() {
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
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // 注意：如果需要传 agentId，请自行补充参数
      const data = await apiClient.sendMessage(/* agentId, */ userMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.text || "无回复内容",
        },
      ]);
    } catch (error) {
      console.error("发送消息失败:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "抱歉，发送消息失败，请稍后重试。",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen">
      {/* 侧边栏：固定在页面左侧 */}
      <Sider
        width={300}
        className="bg-gray-800 p-4 overflow-y-auto"
        style={{ position: "fixed", left: 0, top: 0, bottom: 0 }}
      >
        <AgentSidebar />
      </Sider>

      {/* 主内容区域：右侧区域留出侧边栏宽度 */}
      <Layout style={{ marginLeft: 300 }}>
        <Content className="p-6 overflow-auto bg-gray-900" style={{ minHeight: "calc(100vh - 64px)" }}>
          <div className="flex flex-col space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg max-w-[80%] break-words ${
                  message.role === "user"
                    ? "bg-gray-700 self-end text-white"
                    : "bg-gray-600 self-start text-white"
                }`}
              >
                {message.content}
              </div>
            ))}

            {/* 正在输入状态 */}
            {isLoading && (
              <div className="p-4 rounded-lg max-w-[80%] bg-gray-600 self-start text-white flex items-center gap-2">
                <Spin size="small" />
                正在输入...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </Content>

        {/* 固定在底部的输入区域 */}
        <Footer className="bg-gray-900 p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              placeholder="输入消息..."
              className="flex-1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button type="primary" htmlType="submit" disabled={!input.trim() || isLoading}>
              <PaperPlaneOutlined />
            </Button>
          </form>
        </Footer>
      </Layout>
    </Layout>
  );
}

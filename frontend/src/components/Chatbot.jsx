import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import axios from "axios";

export default function Chatbot() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: t('chatbotWelcome')
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("/api/chatbot/chat", {
        message: input,
        history: messages.slice(-5) // 최근 5개 메시지만 전송
      });

      const assistantMessage = {
        role: "assistant",
        content: response.data.response || t('chatbotError')
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = {
        role: "assistant",
        content: t('chatbotError') + ": " + (err.response?.data?.error || err.message)
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    t('whatIsSharpeRatio'),
    t('whatIsPortfolioOptimization'),
    t('whatIsQuantumOptimization'),
    t('howToUseOptimizer')
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  return (
    <div className="page-content">
      <h2 className="text-2xl font-bold mb-6">{t('chatbot')}</h2>

      <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 빠른 질문 */}
        {messages.length === 1 && (
          <div className="px-4 py-2 border-t">
            <p className="text-sm text-gray-600 mb-2">{t('quickQuestions')}:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(q)}
                  className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 입력 영역 */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('typeMessage')}
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('send')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


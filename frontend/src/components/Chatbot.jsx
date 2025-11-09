import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import axios from "axios";

export default function Chatbot({ embedded = false }) {
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

  // 언어 자동 감지 함수
  const detectLanguage = (text) => {
    // 한글이 포함되어 있으면 한국어, 아니면 영어
    const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    return koreanRegex.test(text) ? 'ko' : 'en';
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // 언어 자동 감지
      const detectedLanguage = detectLanguage(input);
      
      const response = await axios.post("/api/chatbot/chat", {
        message: input,
        history: messages.slice(-5), // 최근 5개 메시지만 전송
        language: detectedLanguage // 감지된 언어 전달
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

  const containerClass = embedded ? 'chatbot-embedded' : 'page-content';
  const panelClass = embedded
    ? 'chatbot-panel'
    : 'bg-white rounded-lg shadow-lg h-[600px] flex flex-col';

  return (
    <div className={containerClass}>
      {!embedded && <h2 className="text-2xl font-bold mb-6">{t('chatbot')}</h2>}

      <div className={panelClass}>
        {/* 메시지 영역 */}
        <div className="chatbot-messages">
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
                  <div className="chatbot-typing-dot"></div>
                  <div className="chatbot-typing-dot" style={{ animationDelay: "0.2s" }}></div>
                  <div className="chatbot-typing-dot" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 빠른 질문 */}
        {!embedded && messages.length === 1 && (
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
        <div className="chatbot-input-bar">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('typeMessage')}
            className="chatbot-input-field"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="chatbot-send-btn"
          >
            {t('send')}
          </button>
        </div>
      </div>
    </div>
  );
}


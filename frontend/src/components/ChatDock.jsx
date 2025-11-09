import { useEffect, useState } from 'react';
import Chatbot from './Chatbot';
import { useLanguage } from '../contexts/LanguageContext';

export default function ChatDock() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpenChat = (event) => {
      if (event.detail && event.detail.openChat === true) {
        setIsOpen(true);
      }
    };

    window.addEventListener('openChatDock', handleOpenChat);
    return () => window.removeEventListener('openChatDock', handleOpenChat);
  }, []);

  return (
    <div className={`chat-dock ${isOpen ? 'chat-dock-open' : ''}`}>
      <div
        id="chat-dock-window"
        className={`chat-dock-window ${isOpen ? 'open' : ''}`}
        aria-hidden={isOpen ? 'false' : 'true'}
      >
        <header className="chat-dock-header">
          <div>
            <h3>{t('chatAssistant')}</h3>
            <p>{t('chatAssistantSubtitle')}</p>
          </div>
          <button
            type="button"
            className="chat-dock-close"
            onClick={() => setIsOpen(false)}
            aria-label={t('closeChat')}
          >
            ×
          </button>
        </header>
        <div className="chat-dock-body">
          <Chatbot embedded />
        </div>
      </div>

      <button
        type="button"
        className="chat-dock-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="chat-dock-window"
      >
        {isOpen ? t('closeChat') : t('openChat')}
      </button>
    </div>
  );
}


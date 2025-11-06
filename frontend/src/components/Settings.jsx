import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const [autoSave, setAutoSave] = useState(() => {
    return localStorage.getItem('autoSave') === 'true' || false;
  });
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('notifications') === 'true' || true;
  });

  useEffect(() => {
    // 테마 적용
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('autoSave', autoSave.toString());
  }, [autoSave]);

  useEffect(() => {
    localStorage.setItem('notifications', notifications.toString());
  }, [notifications]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const handleReset = () => {
    if (confirm(t('resetSettingsConfirm'))) {
      localStorage.removeItem('theme');
      localStorage.removeItem('autoSave');
      localStorage.removeItem('notifications');
      setTheme('light');
      setAutoSave(false);
      setNotifications(true);
      setLanguage('ko');
    }
  };

  return (
    <div className="page-content">
      <h2 className="text-2xl font-bold mb-6">{t('settings')}</h2>

      <div className="space-y-6">
        {/* 언어 설정 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">{t('languageSettings')}</h3>
          <div className="flex gap-4">
            <button
              onClick={() => handleLanguageChange('ko')}
              className={`px-4 py-2 rounded ${
                language === 'ko'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🇰🇷 한국어
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-4 py-2 rounded ${
                language === 'en'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🇺🇸 English
            </button>
          </div>
        </div>

        {/* 테마 설정 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">{t('themeSettings')}</h3>
          <div className="flex gap-4">
            <button
              onClick={() => handleThemeChange('light')}
              className={`px-4 py-2 rounded ${
                theme === 'light'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ☀️ {t('lightTheme')}
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`px-4 py-2 rounded ${
                theme === 'dark'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🌙 {t('darkTheme')}
            </button>
          </div>
        </div>

        {/* 자동 저장 설정 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">{t('autoSaveSettings')}</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              className="w-5 h-5"
            />
            <span>{t('enableAutoSave')}</span>
          </label>
          <p className="text-sm text-gray-600 mt-2">{t('autoSaveDescription')}</p>
        </div>

        {/* 알림 설정 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">{t('notificationSettings')}</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-5 h-5"
            />
            <span>{t('enableNotifications')}</span>
          </label>
          <p className="text-sm text-gray-600 mt-2">{t('notificationDescription')}</p>
        </div>

        {/* 초기화 버튼 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">{t('resetSettings')}</h3>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {t('resetToDefaults')}
          </button>
          <p className="text-sm text-gray-600 mt-2">{t('resetDescription')}</p>
        </div>
      </div>
    </div>
  );
}


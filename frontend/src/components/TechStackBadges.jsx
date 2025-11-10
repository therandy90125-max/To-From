import { useLanguage } from '../contexts/LanguageContext';

/**
 * 기술 스택 배지 컴포넌트
 * Tech Stack Badges Component
 * 
 * Displays technology stack with versions
 * 
 * @version 1.0.0
 * @since 2025-11-10
 */
const TechStackBadges = () => {
  const { language } = useLanguage();

  const techStack = [
    {
      name: 'React',
      version: '18.2.0',
      color: 'bg-blue-600',
      icon: '⚛️'
    },
    {
      name: 'Spring Boot',
      version: '3.2.3',
      color: 'bg-green-600',
      icon: '🍃'
    },
    {
      name: 'Flask',
      version: '3.0.0',
      color: 'bg-gray-700',
      icon: '🌶️'
    },
    {
      name: 'Qiskit',
      version: '0.45.0',
      color: 'bg-purple-600',
      icon: '⚛️'
    },
    {
      name: 'Alpha Vantage',
      version: 'API',
      color: 'bg-orange-600',
      icon: '📊'
    }
  ];

  return (
    <div className="tech-stack-badges">
      <p className="text-sm text-gray-400 mb-3 text-center">
        {language === 'ko' ? 'Powered by Quantum Computing & AI' : 'Powered by Quantum Computing & AI'}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {techStack.map((tech, index) => (
          <div
            key={index}
            className={`${tech.color} text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-shadow`}
            title={`${tech.name} ${tech.version}`}
          >
            <span>{tech.icon}</span>
            <span>{tech.name}</span>
            <span className="opacity-80 text-[10px]">v{tech.version}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechStackBadges;


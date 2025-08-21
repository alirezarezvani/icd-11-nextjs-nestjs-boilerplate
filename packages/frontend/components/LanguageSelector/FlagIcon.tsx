import React from 'react';
import { SupportedLanguage } from '@shared/types/icd11';

interface FlagIconProps {
  language: SupportedLanguage;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const flagMap: Record<SupportedLanguage, string> = {
  en: '🇺🇸',
  es: '🇪🇸', 
  fr: '🇫🇷',
  ar: '🇸🇦',
  zh: '🇨🇳',
  ru: '🇷🇺'
};

const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  ar: 'العربية',
  zh: '中文',
  ru: 'Русский'
};

export const FlagIcon: React.FC<FlagIconProps> = ({ 
  language, 
  size = 'medium', 
  className = '' 
}) => {
  const sizeMap = {
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl'
  };

  return (
    <span 
      className={`inline-block ${sizeMap[size]} ${className}`}
      role="img"
      aria-label={`${languageNames[language]} flag`}
      title={languageNames[language]}
      style={{
        fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif',
        lineHeight: 1
      }}
    >
      {flagMap[language]}
    </span>
  );
};

export default FlagIcon;
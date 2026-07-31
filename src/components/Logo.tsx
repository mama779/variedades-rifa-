import React from 'react';
import logoImg from '../assets/images/variedades_cs_logo_1785457966105.jpg';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  lightMode?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  lightMode = false,
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-11 w-11',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  const textClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="relative group shrink-0">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-rose-400 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
        <img
          src={logoImg}
          alt="Variedades CS Logo"
          className={`${sizeClasses[size]} relative rounded-full object-contain border border-pink-200/60 shadow-md bg-white p-0.5`}
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span
              className={`font-black tracking-tight ${textClasses[size]} ${
                lightMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              VARIEDADES <span className="text-pink-600 font-extrabold">CS</span>
            </span>
            <span className="text-pink-500 text-xs">💖</span>
          </div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-pink-500 -mt-1">
            Sorteos Transparentes & Gratuitos
          </span>
        </div>
      )}
    </div>
  );
};

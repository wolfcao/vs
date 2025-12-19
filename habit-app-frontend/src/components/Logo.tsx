import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

const Logo: React.FC<LogoProps> = ({ size = 'medium' }) => {
  const sizeMap = {
    small: 24,
    medium: 32,
    large: 48
  };
  const svgSize = sizeMap[size];
  
  return (
    <div className="flex items-center gap-2">
      <svg width={svgSize} height={svgSize} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* 外圈圆环 - 代表习惯的持续性 */}
        <circle cx="16" cy="16" r="15" stroke="var(--color-primary)" strokeWidth="2" fill="none" />
        
        {/* 内部对勾 - 代表完成习惯 */}
        <path 
          d="M10 16L14 20L22 12" 
          stroke="var(--color-primary)" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* 两个人物轮廓 - 代表团队协作 */}
        <g opacity="0.8">
          <circle cx="12" cy="10" r="3" fill="var(--color-primary)" />
          <rect x="10" y="13" width="4" height="6" rx="2" fill="var(--color-primary)" />
          <line x1="10" y1="16" x2="8" y2="19" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
          <line x1="14" y1="16" x2="16" y2="19" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
        </g>
        
        <g opacity="0.6">
          <circle cx="20" cy="10" r="3" fill="var(--color-primary)" />
          <rect x="18" y="13" width="4" height="6" rx="2" fill="var(--color-primary)" />
          <line x1="18" y1="16" x2="16" y2="19" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
          <line x1="22" y1="16" x2="24" y2="19" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};

export default Logo;
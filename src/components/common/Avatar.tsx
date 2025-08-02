import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  fallbackIcon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  fallbackIcon,
  className = '',
  onClick,
  status
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };

  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-lg'
  };

  const statusColors = {
    online: 'bg-green-400',
    offline: 'bg-gray-400',
    away: 'bg-yellow-400',
    busy: 'bg-red-400'
  };

  const statusSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-4 h-4'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const baseClasses = `
    inline-flex items-center justify-center font-medium text-gray-600 bg-gray-100 relative
    ${sizeClasses[size]}
    ${shapeClasses[shape]}
    ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
    ${className}
  `.trim();

  return (
    <div className={baseClasses} onClick={onClick}>
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className={`w-full h-full object-cover ${shapeClasses[shape]}`}
          onError={(e) => {
            // Hide image on error to show fallback
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : name ? (
        <span className="font-semibold">
          {getInitials(name)}
        </span>
      ) : fallbackIcon ? (
        fallbackIcon
      ) : (
        <User className="w-1/2 h-1/2" />
      )}

      {/* Status Indicator */}
      {status && (
        <span
          className={`
            absolute bottom-0 right-0 block rounded-full ring-2 ring-white
            ${statusSizes[size]}
            ${statusColors[status]}
          `}
        />
      )}
    </div>
  );
};

export default Avatar;

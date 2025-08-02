import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
  className?: string;
  animated?: boolean;
  lines?: number; // For text variant
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  animated = true,
  lines = 1
}) => {
  const baseClasses = 'bg-gray-200';
  const animationClasses = animated ? 'animate-pulse' : '';
  
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-none',
    circular: 'rounded-full',
    rounded: 'rounded-lg'
  };

  const getDefaultDimensions = () => {
    switch (variant) {
      case 'text':
        return { width: '100%', height: '1rem' };
      case 'circular':
        return { width: '2.5rem', height: '2.5rem' };
      default:
        return { width: '100%', height: '2rem' };
    }
  };

  const defaults = getDefaultDimensions();
  const finalWidth = width || defaults.width;
  const finalHeight = height || defaults.height;

  const skeletonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${animationClasses}
    ${className}
  `.trim();

  const style = {
    width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
    height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={skeletonClasses}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : style.width, // Last line is shorter
            }}
          />
        ))}
      </div>
    );
  }

  return <div className={skeletonClasses} style={style} />;
};

// Predefined skeleton components for common use cases
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" height="1rem" className="mb-2" />
        <Skeleton variant="text" width="40%" height="0.875rem" />
      </div>
    </div>
    <Skeleton variant="rectangular" height="8rem" className="mb-4" />
    <Skeleton variant="text" lines={3} />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => (
  <div className={`w-full ${className}`}>
    {/* Header */}
    <div className="flex space-x-4 mb-4 pb-2 border-b border-gray-200">
      {Array.from({ length: columns }, (_, index) => (
        <Skeleton key={index} variant="text" width="100%" height="1rem" />
      ))}
    </div>
    
    {/* Rows */}
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width="100%" height="1rem" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({ 
  items = 5, 
  className = '' 
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }, (_, index) => (
      <div key={index} className="flex items-center space-x-4">
        <Skeleton variant="circular" width={32} height={32} />
        <div className="flex-1">
          <Skeleton variant="text" width="70%" height="1rem" className="mb-2" />
          <Skeleton variant="text" width="50%" height="0.875rem" />
        </div>
        <Skeleton variant="rectangular" width={80} height={32} />
      </div>
    ))}
  </div>
);

export default Skeleton;

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  padding = 'md'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const cardClasses = `bg-white rounded-xl shadow-sm border border-gray-100 ${paddingClasses[padding]} ${className}`;

  const CardComponent = hover ? motion.div : 'div';
  const motionProps = hover ? {
    whileHover: { y: -2, shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' },
    transition: { duration: 0.2 }
  } : {};

  return (
    <CardComponent className={cardClasses} {...motionProps}>
      {children}
    </CardComponent>
  );
};

export default Card;
import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactElement<LucideIcon>;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    icon, 
    helperText, 
    variant = 'default', 
    size = 'md',
    className = '', 
    ...props 
  }, ref) => {
    const baseClasses = 'w-full rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent';
    
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3',
      lg: 'px-4 py-4 text-lg'
    };
    
    const variantClasses = {
      default: 'border border-gray-300 bg-white',
      filled: 'border-0 bg-gray-100',
      outlined: 'border-2 border-gray-300 bg-transparent'
    };
    
    const errorClasses = error 
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
      : '';
    
    const inputClasses = `
      ${baseClasses}
      ${sizeClasses[size]}
      ${variantClasses[variant]}
      ${errorClasses}
      ${icon ? 'pl-10' : ''}
      ${className}
    `.trim();

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">
                {icon}
              </span>
            </div>
          )}
          
          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

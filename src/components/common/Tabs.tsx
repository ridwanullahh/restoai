import React, { useState } from 'react';

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  items,
  defaultTab,
  onChange,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  const baseTabClasses = 'transition-colors duration-200 focus:outline-none';
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const getTabClasses = (tabId: string, disabled?: boolean) => {
    const isActive = activeTab === tabId;
    
    if (disabled) {
      return `${baseTabClasses} ${sizeClasses[size]} text-gray-400 cursor-not-allowed`;
    }

    switch (variant) {
      case 'pills':
        return `${baseTabClasses} ${sizeClasses[size]} rounded-lg font-medium ${
          isActive 
            ? 'bg-orange-100 text-orange-700' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`;
      
      case 'underline':
        return `${baseTabClasses} ${sizeClasses[size]} border-b-2 font-medium ${
          isActive 
            ? 'border-orange-500 text-orange-600' 
            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
        }`;
      
      default:
        return `${baseTabClasses} ${sizeClasses[size]} border-b-2 font-medium ${
          isActive 
            ? 'border-orange-500 text-orange-600 bg-white' 
            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
        }`;
    }
  };

  const activeTabContent = items.find(item => item.id === activeTab)?.content;

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Navigation */}
      <div className={`flex space-x-1 ${variant === 'underline' ? 'border-b border-gray-200' : ''}`}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => !item.disabled && handleTabChange(item.id)}
            className={getTabClasses(item.id, item.disabled)}
            disabled={item.disabled}
          >
            <span className="flex items-center space-x-2">
              <span>{item.label}</span>
              {item.badge && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-orange-100 bg-orange-600 rounded-full">
                  {item.badge}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTabContent}
      </div>
    </div>
  );
};

export default Tabs;

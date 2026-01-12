import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  error,
  icon,
  multiline = false,
  rows = 3,
  className = '',
  ...props 
}) => {
  const baseClasses = `
    w-full px-3 py-2 border border-gray-300 rounded-lg 
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
    transition-all duration-200
    ${error ? 'border-red-500 focus:ring-red-500' : ''}
    ${icon && !multiline ? 'pl-10' : ''}
    ${className}
  `;

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && !multiline && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        {multiline ? (
          <textarea
            rows={rows}
            className={baseClasses}
            {...props}
          />
        ) : (
          <input
            type={type}
            className={baseClasses}
            {...props}
          />
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
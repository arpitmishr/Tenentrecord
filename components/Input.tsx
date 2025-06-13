
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, error, containerClassName = '', className='', ...props }) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
      <input
        id={inputId}
        className={`w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-200 focus:ring-sky-500 focus:border-sky-500 placeholder-gray-500 ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, id, error, containerClassName = '', className='', ...props }) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
      <textarea
        id={inputId}
        className={`w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-200 focus:ring-sky-500 focus:border-sky-500 placeholder-gray-500 ${error ? 'border-red-500' : ''} ${className}`}
        rows={3}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ label, id, error, containerClassName = '', className='', children, ...props }) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
      <select
        id={inputId}
        className={`w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-gray-200 focus:ring-sky-500 focus:border-sky-500 ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

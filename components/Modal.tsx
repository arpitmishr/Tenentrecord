import React, { ReactNode, useState, useEffect } from 'react';
import { XMarkIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const [internalShow, setInternalShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Allow the modal to be added to the DOM with initial hidden state
      // Then trigger the transition to visible state
      const timer = setTimeout(() => {
        setInternalShow(true);
      }, 50); // Small delay for CSS transition to pick up changes
      return () => clearTimeout(timer);
    } else {
      // Modal is closing, transition out
      setInternalShow(false);
      // Note: If onClose unmounts the Modal immediately, the exit transition might not be fully visible.
      // For a full exit animation, onClose would need to be delayed until the transition ends.
      // However, the original component did not have an explicit exit animation defined in the style jsx.
    }
  }, [isOpen]);

  if (!isOpen && !internalShow) { // Only return null if fully closed and not animating out
     // To allow exit animation, we need to keep rendering while internalShow is true even if isOpen becomes false
     // A more robust solution for exit animations would involve managing isOpen and a separate rendering state.
     // For this fix, focusing on entry animation and direct visibility control:
     if(!isOpen) return null;
  }


  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[100] transition-opacity duration-300 ease-in-out">
      <div 
        className={`bg-slate-800 p-6 rounded-lg shadow-2xl w-full ${sizeClasses[size]} transform transition-all duration-300 ease-in-out ${internalShow ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-sky-400">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-sky-400 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

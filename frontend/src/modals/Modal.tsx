import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, icon, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-white/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-[#C4EA70] rounded-[20px] shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300 ease-out">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-black/10 rounded-full transition-colors z-10"
        >
          <X className="h-5 w-5 text-gray-800" />
        </button>
        
        {/* Header */}
        <div className="pt-8 pb-6 px-8 text-center">
          {icon && (
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                {icon}
              </div>
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        
        {/* Content */}
        <div className="px-8 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
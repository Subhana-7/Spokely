import React from 'react';

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
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-slate-800 border-2 border-yellow-500 rounded-2xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300 ease-out">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-700 rounded-full transition-colors z-10"
        >
          <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="pt-8 pb-6 px-8 text-center">
          {icon && (
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-full">
                {icon}
              </div>
            </div>
          )}
          <h2 className="text-2xl font-bold text-yellow-400">{title}</h2>
        </div>
        <div className="px-8 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
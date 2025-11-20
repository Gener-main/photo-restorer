
import React from 'react';

interface ErrorDisplayProps {
  message: string;
  onClear: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onClear }) => {
  if (!message) return null;

  return (
    <div className="w-full max-w-2xl bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded-lg relative mb-6 flex items-center justify-between shadow-lg">
      <span>{message}</span>
      <button onClick={onClear} className="p-1 rounded-full hover:bg-red-800 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

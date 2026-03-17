'use client';

import React from 'react';

type ToastProps = {
  message: string | null;
};

export const Toast: React.FC<ToastProps> = ({ message }) => {
  return (
    <div
      className={`fixed bottom-6 right-6 px-6 py-4 bg-[#1a1a2e] border border-[#00ff88]/30 rounded-lg shadow-2xl transform transition-all duration-300 flex items-center gap-3 ${
        message ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
    >
      <svg
        className="w-5 h-5 text-[#00ff88]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
      <span className="text-gray-100">{message}</span>
    </div>
  );
};

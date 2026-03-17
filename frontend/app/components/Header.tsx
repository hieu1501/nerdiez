'use client';

import React from 'react';
import { UserProfile } from '../types/blog';

type HeaderProps = {
  blogTitle: string;
  blogTagline: string;
  userProfile: UserProfile;
  onHomeClick: () => void;
  onProfileClick: () => void;
};

export const Header: React.FC<HeaderProps> = ({
  blogTitle,
  blogTagline,
  userProfile,
  onHomeClick,
  onProfileClick,
}) => {
  return (
    <header className="border-b border-[#00ff88]/20 bg-[#0a0a0f]/95 backdrop-blur-md flex-shrink-0">
      <div className="max-w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00ff88] to-[#00d4ff] flex items-center justify-center">
            <svg
              className="w-6 h-6 text-[#0a0a0f]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">{blogTitle}</h1>
            <p className="text-xs text-gray-500 mono">{blogTagline}</p>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <button
            className="px-4 py-2 text-sm text-[#00ff88] hover:bg-[#00ff88]/10 rounded-lg transition-all"
            onClick={onHomeClick}
          >
            Home
          </button>
          <button
            className="px-4 py-2 text-sm border border-[#2a2a4e] text-gray-400 hover:border-[#00ff88]/30 hover:text-[#00ff88] rounded-lg transition-all flex items-center gap-2"
            onClick={onProfileClick}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{userProfile.username}</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

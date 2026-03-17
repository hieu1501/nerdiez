'use client';

import React from 'react';
import { Category } from '../types/blog';

type Section = 'recent' | 'trending' | 'most-viewed';

type SidebarProps = {
  currentFilter: 'all' | Category;
  currentTag: string | null;
  currentSection: Section;
  onFilterChange: (filter: 'all' | Category) => void;
  onTagToggle: (tagId: string) => void;
  onSectionChange: (section: Section) => void;
  onClearFilters: () => void;
};

const tagsList = [
  { id: 'data-structures', label: '📦 Data Structures' },
  { id: 'databases', label: '🗄️ Databases' },
  { id: 'oop', label: '🏗️ Object-Oriented' },
  { id: 'algorithms', label: '🔄 Algorithms' },
  { id: 'machine-learning', label: '🧠 Machine Learning' },
  { id: 'blockchain', label: '⛓️ Blockchain' },
  { id: 'market-analysis', label: '📊 Market Analysis' },
  { id: 'fintech', label: '💳 FinTech' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentFilter,
  currentTag,
  currentSection,
  onFilterChange,
  onTagToggle,
  onSectionChange,
  onClearFilters,
}) => {
  return (
    <aside className="w-64 border-r border-[#2a2a4e] bg-[#0f0f14] overflow-y-auto sidebar-scroll flex-shrink-0">
      <div className="p-6 space-y-8">
        {/* Categories */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 mono">
            Categories
          </h3>
          <div className="space-y-2">
            <button
              className={`w-full text-left px-4 py-2 rounded-lg text-sm border transition-all ${
                currentFilter === 'all'
                  ? 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30'
                  : 'text-gray-400 hover:text-[#00ff88] hover:bg-[#1a1a2e] border-gray-700'
              }`}
              onClick={() => onFilterChange('all')}
            >
              All Articles
            </button>
            <button
              className={`w-full text-left px-4 py-2 rounded-lg text-sm border transition-all ${
                currentFilter === 'economics'
                  ? 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30'
                  : 'text-gray-400 hover:text-[#00ff88] hover:bg-[#1a1a2e] border-gray-700'
              }`}
              onClick={() => onFilterChange('economics')}
            >
              💰 Economics
            </button>
            <button
              className={`w-full text-left px-4 py-2 rounded-lg text-sm border transition-all ${
                currentFilter === 'computer-science'
                  ? 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30'
                  : 'text-gray-400 hover:text-[#00ff88] hover:bg-[#1a1a2e] border-gray-700'
              }`}
              onClick={() => onFilterChange('computer-science')}
            >
              💻 Computer Science
            </button>
            <button
              className={`w-full text-left px-4 py-2 rounded-lg text-sm border transition-all ${
                currentFilter === 'intersection'
                  ? 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30'
                  : 'text-gray-400 hover:text-[#00ff88] hover:bg-[#1a1a2e] border-gray-700'
              }`}
              onClick={() => onFilterChange('intersection')}
            >
              🔗 Intersection
            </button>
          </div>
        </div>

        {/* Topics */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 mono">
            Topics
          </h3>
          <div className="space-y-2">
            {tagsList.map((tag) => (
              <button
                key={tag.id}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                  currentTag === tag.id
                    ? 'text-[#00ff88] bg-[#1a1a2e]'
                    : 'text-gray-400 hover:text-[#00ff88] hover:bg-[#1a1a2e]'
                }`}
                onClick={() => onTagToggle(tag.id)}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 mono">
            Sections
          </h3>
          <div className="space-y-2">
            <button
              className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
                currentSection === 'recent'
                  ? 'text-[#00ff88] bg-[#1a1a2e]'
                  : 'text-gray-400 hover:text-[#00ff88] hover:bg-[#1a1a2e]'
              }`}
              onClick={() => onSectionChange('recent')}
            >
              🕒 Recent Articles
            </button>
            <button
              className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
                currentSection === 'trending'
                  ? 'text-[#00ff88] bg-[#1a1a2e]'
                  : 'text-gray-400 hover:text-[#00ff88] hover:bg-[#1a1a2e]'
              }`}
              onClick={() => onSectionChange('trending')}
            >
              🔥 Trending
            </button>
            <button
              className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
                currentSection === 'most-viewed'
                  ? 'text-[#00ff88] bg-[#1a1a2e]'
                  : 'text-gray-400 hover:text-[#00ff88] hover:bg-[#1a1a2e]'
              }`}
              onClick={() => onSectionChange('most-viewed')}
            >
              👁️ Most Viewed
            </button>
          </div>
        </div>

        {/* Clear Filters */}
        <button
          className="w-full px-4 py-2 text-xs text-gray-500 border border-gray-700 rounded-lg hover:border-red-500/30 hover:text-red-400 transition-all"
          onClick={onClearFilters}
        >
          Clear All Filters
        </button>
      </div>
    </aside>
  );
};

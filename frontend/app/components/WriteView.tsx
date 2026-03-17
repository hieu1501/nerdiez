'use client';

import React from 'react';
import { Category } from '../types/blog';

type WriteViewProps = {
  title: string;
  category: Category | '';
  content: string;
  tags: string[];
  isPublishing: boolean;
  onBack: () => void;
  onChangeTitle: (v: string) => void;
  onChangeCategory: (c: Category) => void;
  onToggleTag: (tagId: string) => void;
  onChangeContent: (v: string) => void;
  onPublish: () => void;
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

export const WriteView: React.FC<WriteViewProps> = ({
  title,
  category,
  content,
  tags,
  isPublishing,
  onBack,
  onChangeTitle,
  onChangeCategory,
  onToggleTag,
  onChangeContent,
  onPublish,
}) => {
  return (
    <section>
      <button
        className="flex items-center gap-2 text-[#00ff88] hover:text-[#00d4ff] mb-6 transition-all"
        onClick={onBack}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to profile
      </button>

      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold mb-8 gradient-text">Write an Article</h2>
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            onPublish();
          }}
        >
          <div>
            <label className="block text-sm text-gray-400 mb-2 mono">title:</label>
            <input
              type="text"
              placeholder="Enter your article title"
              className="w-full px-4 py-3 bg-[#1a1a2e] border border-[#2a2a4e] rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50 transition-all text-lg"
              value={title}
              onChange={(e) => onChangeTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2 mono">
              category:
            </label>
            <div className="flex gap-3 flex-wrap">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  className="sr-only peer"
                  checked={category === 'economics'}
                  onChange={() => onChangeCategory('economics')}
                  required
                />
                <span className="px-4 py-2 rounded-full border border-gray-700 text-gray-400 peer-checked:border-[#00ff88] peer-checked:bg-[#00ff88]/10 peer-checked:text-[#00ff88] transition-all inline-block">
                  💰 Economics
                </span>
              </label>
              <label className="cursor-pointer">
                <input
                  type="radio"
                  className="sr-only peer"
                  checked={category === 'computer-science'}
                  onChange={() => onChangeCategory('computer-science')}
                />
                <span className="px-4 py-2 rounded-full border border-gray-700 text-gray-400 peer-checked:border-[#00ff88] peer-checked:bg-[#00ff88]/10 peer-checked:text-[#00ff88] transition-all inline-block">
                  💻 Computer Science
                </span>
              </label>
              <label className="cursor-pointer">
                <input
                  type="radio"
                  className="sr-only peer"
                  checked={category === 'intersection'}
                  onChange={() => onChangeCategory('intersection')}
                />
                <span className="px-4 py-2 rounded-full border border-gray-700 text-gray-400 peer-checked:border-[#00ff88] peer-checked:bg-[#00ff88]/10 peer-checked:text-[#00ff88] transition-all inline-block">
                  🔗 Intersection
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2 mono">tags:</label>
            <div className="flex gap-2 flex-wrap mb-3">
              {tagsList.map((tag) => (
                <label key={tag.id} className="cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={tags.includes(tag.id)}
                    onChange={() => onToggleTag(tag.id)}
                  />
                  <span className="px-3 py-1 rounded-full border border-gray-700 text-xs text-gray-400 peer-checked:border-[#00ff88] peer-checked:bg-[#00ff88]/10 peer-checked:text-[#00ff88] transition-all inline-block">
                    {tag.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2 mono">
              content:
            </label>
            <textarea
              placeholder="Write your article content here..."
              rows={15}
              className="w-full px-4 py-3 bg-[#1a1a2e] border border-[#2a2a4e] rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50 transition-all resize-none mono text-sm"
              value={content}
              onChange={(e) => onChangeContent(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 py-4 bg-[#00ff88] text-[#0a0a0f] font-bold rounded-lg hover:bg-[#00d4ff] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isPublishing}
            >
              {isPublishing ? 'Publishing...' : 'Publish Article'}
            </button>
            <button
              type="button"
              className="px-8 py-4 border border-gray-700 text-gray-400 rounded-lg hover:border-[#00ff88]/30 hover:text-[#00ff88] transition-all"
              onClick={onBack}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

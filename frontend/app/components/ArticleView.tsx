'use client';

import React from 'react';
import { Article, Comment, VoteDirection } from '../types/blog';

type ArticleViewProps = {
  article: Article;
  comments: Comment[];
  userVote?: VoteDirection;
  onBack: () => void;
  onVote: (direction: VoteDirection) => void;
  onDelete: () => void;
  onSubmitComment: (author: string, text: string) => void;
  isPostingComment: boolean;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const categoryEmojis = {
  economics: '💰',
  'computer-science': '💻',
  intersection: '🔗',
} as const;

const categoryLabels = {
  economics: 'Economics',
  'computer-science': 'Computer Science',
  intersection: 'Intersection',
} as const;

export const ArticleView: React.FC<ArticleViewProps> = ({
  article,
  comments,
  userVote,
  onBack,
  onVote,
  onDelete,
  onSubmitComment,
  isPostingComment,
}) => {
  const [author, setAuthor] = React.useState('');
  const [text, setText] = React.useState('');

  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
        Back to articles
      </button>

      <article className="float-in">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300">
            {categoryEmojis[article.category]} {categoryLabels[article.category]}
          </span>
          {article.tags
            ?.split(',')
            .map((t) => t.trim())
            .filter(Boolean)
            .map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs rounded-full bg-[#2a2a4e] text-gray-400"
              >
                {tag}
              </span>
            ))}
          <span className="text-sm text-gray-500 mono ml-auto">
            {formatDate(article.createdAt)}
          </span>
        </div>

        <h1 className="text-4xl font-bold text-gray-100 mb-6 leading-tight">
          {article.title}
        </h1>

        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[#2a2a4e]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00ff88] to-[#00d4ff] flex items-center justify-center text-[#0a0a0f] font-bold text-lg">
              {article.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-100">{article.author}</p>
              <p className="text-sm text-gray-500">Author</p>
            </div>
          </div>
          <div className="flex items-center gap-6 ml-auto">
            <div className="flex items-center gap-2">
              <button
                className={`p-2 rounded-lg hover:bg-[#00ff88]/10 transition-all ${
                  userVote === 'up' ? 'text-[#00ff88]' : 'text-gray-500'
                }`}
                onClick={() => onVote('up')}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
              <span
                className={`text-xl font-bold ${
                  article.votes > 0
                    ? 'text-[#00ff88]'
                    : article.votes < 0
                    ? 'text-red-400'
                    : 'text-gray-500'
                }`}
              >
                {article.votes || 0}
              </span>
              <button
                className={`p-2 rounded-lg hover:bg-red-500/10 transition-all ${
                  userVote === 'down' ? 'text-red-400' : 'text-gray-500'
                }`}
                onClick={() => onVote('down')}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
            <button
              className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              onClick={onDelete}
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
            {article.content}
          </div>
        </div>
      </article>

      {/* Comments */}
      <div className="mt-12 border-t border-[#1a1a2e] pt-8">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Comments <span className="text-gray-500 font-normal">({comments.length})</span>
        </h3>

        <form
          className="mb-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (!author.trim() || !text.trim()) return;
            onSubmitComment(author.trim(), text.trim());
            setAuthor('');
            setText('');
          }}
        >
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Your name"
              className="flex-shrink-0 w-32 px-4 py-3 bg-[#1a1a2e] border border-[#2a2a4e] rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50 transition-all"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
            <input
              type="text"
              placeholder="Write a comment..."
              className="flex-1 px-4 py-3 bg-[#1a1a2e] border border-[#2a2a4e] rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#00ff88]/50 transition-all"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#00ff88] text-[#0a0a0f] font-semibold rounded-lg hover:bg-[#00d4ff] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isPostingComment}
            >
              {isPostingComment ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {sortedComments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No comments yet. Be the first!
            </div>
          ) : (
            sortedComments.map((comment) => (
              <div
                key={comment.id}
                className="bg-[#0a0a0f] border border-[#2a2a4e] rounded-xl p-4 float-in"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#2a2a4e] flex items-center justify-center text-gray-400 font-medium text-sm">
                    {comment.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-200">{comment.author}</p>
                    <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                  </div>
                </div>
                <p className="text-gray-300 pl-11">{comment.commentText}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

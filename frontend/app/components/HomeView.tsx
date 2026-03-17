'use client';

import React from 'react';
import { Article, Comment, VoteDirection } from '../types/blog';

type HomeViewProps = {
  articles: Article[];
  comments: Comment[];
  userVotes: Record<string, VoteDirection | undefined>;
  onOpenArticle: (id: string) => void;
  onVote: (id: string, direction: VoteDirection) => void;
  sectionTitle: string;
  sectionDesc: string;
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

export const HomeView: React.FC<HomeViewProps> = ({
  articles,
  comments,
  userVotes,
  onOpenArticle,
  onVote,
  sectionTitle,
  sectionDesc,
}) => {
  return (
    <section>
      <div className="mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-2">{sectionTitle}</h2>
        <p className="text-gray-400">{sectionDesc}</p>
      </div>

      <div className="space-y-6">
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#1a1a2e] flex items-center justify-center">
              <svg
                className="w-10 h-10 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No articles found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or visit your profile to write one!
            </p>
          </div>
        ) : (
          articles.map((article, index) => {
            const tagList = article.tags
              ? article.tags.split(',').map((t) => t.trim())
              : [];
            const readingTime = Math.ceil(article.content.split(' ').length / 200);
            const commentCount = comments.filter(
              (c) => c.articleId === article.id
            ).length;
            const voteState = userVotes[article.id];

            return (
              <article
                key={article.id}
                className="float-in card-glow bg-gradient-to-br from-[#1a1a2e] to-[#0f0f14] border border-[#2a2a4e] rounded-2xl overflow-hidden hover:border-[#00ff88]/50 transition-all cursor-pointer group shadow-xl hover:shadow-2xl hover:shadow-[#00ff88]/10"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => onOpenArticle(article.id)}
              >
                <div className="h-1 bg-gradient-to-r from-[#00ff88] via-[#00d4ff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-blue-500/20 to-blue-400/20 text-blue-300 border border-blue-500/30 backdrop-blur-sm">
                        {categoryEmojis[article.category]} {categoryLabels[article.category]}
                      </span>
                      {tagList.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs rounded-full bg-[#2a2a4e]/50 text-gray-300 border border-[#00ff88]/10 backdrop-blur-sm hover:border-[#00ff88]/30 transition-all"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 mono font-medium">
                      {formatDate(article.createdAt)}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-100 group-hover:text-[#00ff88] transition-all duration-300 line-clamp-2 leading-snug">
                    {article.title}
                  </h2>

                  <div className="space-y-3">
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 text-justify">
                      {article.content.substring(0, 150)}...
                    </p>
                    <div className="flex items-center gap-2 py-2 px-3 bg-[#0a0a0f]/50 rounded-lg border border-[#2a2a4e]/30 backdrop-blur-sm">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {readingTime} min read
                      </span>
                      <span className="text-xs text-gray-600">•</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        {article.views || 0}
                      </span>
                      <span className="text-xs text-gray-600">•</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
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
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        {commentCount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#2a2a4e]/30">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00ff88] to-[#00d4ff] flex items-center justify-center text-[#0a0a0f] font-bold text-xs shadow-lg">
                        {article.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-200">
                          {article.author}
                        </p>
                        <p className="text-xs text-gray-500">Author</p>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-1 bg-[#0a0a0f]/50 rounded-lg p-1 backdrop-blur-sm border border-[#2a2a4e]/30"
                      onClick={(ev) => ev.stopPropagation()}
                    >
                      <button
                        className={`p-2 rounded-md hover:bg-[#00ff88]/20 transition-all ${
                          voteState === 'up'
                            ? 'text-[#00ff88] bg-[#00ff88]/10'
                            : 'text-gray-500 hover:text-[#00ff88]'
                        }`}
                        onClick={() => onVote(article.id, 'up')}
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
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </button>
                      <span
                        className={`text-xs font-bold px-2 py-1 min-w-[2rem] text-center ${
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
                        className={`p-2 rounded-md hover:bg-red-500/20 transition-all ${
                          voteState === 'down'
                            ? 'text-red-400 bg-red-500/10'
                            : 'text-gray-500 hover:text-red-400'
                        }`}
                        onClick={() => onVote(article.id, 'down')}
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
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};

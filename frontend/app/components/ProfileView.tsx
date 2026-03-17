'use client';

import React from 'react';
import { Article, Comment, UserProfile } from '../types/blog';

type ProfileViewProps = {
  userProfile: UserProfile;
  articles: Article[];
  comments: Comment[];
  onEditProfile: () => void;
  onWriteArticle: () => void;
  onOpenArticle: (id: string) => void;
  onDeleteArticle: (id: string) => void;
};

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  articles,
  comments,
  onEditProfile,
  onWriteArticle,
  onOpenArticle,
  onDeleteArticle,
}) => {
  const userArticles = articles.filter((a) => a.author === userProfile.username);
  const userComments = comments.filter((c) => c.author === userProfile.username);
  const totalVotes = userArticles.reduce((sum, a) => sum + (a.votes || 0), 0);

  return (
    <section>
      <div className="max-w-2xl">
        <div className="bg-[#1a1a2e] border border-[#2a2a4e] rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00d4ff] flex items-center justify-center text-[#0a0a0f] font-bold text-4xl flex-shrink-0">
              {userProfile.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-100 mb-2">
                {userProfile.username}
              </h2>
              <p className="text-gray-400 mb-4">{userProfile.bio}</p>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-xl font-bold text-[#00ff88]">
                    {userArticles.length}
                  </p>
                  <p className="text-gray-500">Articles</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-[#00ff88]">
                    {userComments.length}
                  </p>
                  <p className="text-gray-500">Comments</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-[#00ff88]">{totalVotes}</p>
                  <p className="text-gray-500">Votes</p>
                </div>
              </div>
            </div>
            <button
              className="px-6 py-2 border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/10 rounded-lg transition-all text-sm"
              onClick={onEditProfile}
            >
              Edit Profile
            </button>
          </div>
        </div>

        <button
          className="w-full py-4 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-[#0a0a0f] font-bold rounded-lg hover:shadow-lg hover:shadow-[#00ff88]/20 transition-all mb-8 flex items-center justify-center gap-2"
          onClick={onWriteArticle}
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Write New Article
        </button>

        <div>
          <h3 className="text-xl font-bold text-gray-100 mb-6 flex items-center gap-2">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            My Articles
          </h3>
          <div className="space-y-3">
            {userArticles.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No articles yet. Start writing to share your knowledge!
              </p>
            ) : (
              userArticles.map((article) => (
                <div
                  key={article.id}
                  className="bg-[#1a1a2e] border border-[#2a2a4e] rounded-lg p-4 cursor-pointer hover:border-[#00ff88]/30 transition-all"
                  onClick={() => onOpenArticle(article.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-100 mb-2 hover:text-[#00ff88]">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>👁️ {article.views || 0}</span>
                        <span>👍 {article.votes || 0}</span>
                        <span>
                          💬{' '}
                          {
                            comments.filter(
                              (c) => c.articleId === article.id
                            ).length
                          }
                        </span>
                      </div>
                    </div>
                    <button
                      className="p-2 text-gray-500 hover:text-red-400 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteArticle(article.id);
                      }}
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

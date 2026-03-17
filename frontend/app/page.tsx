'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Article,
  Category,
  Comment,
  UserProfile,
  View,
  VoteDirection,
} from './types/blog';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { ArticleView } from './components/ArticleView';
import { ProfileView } from './components/ProfileView';
import { WriteView } from './components/WriteView';
import { EditProfileModal } from './components/EditProfileModal';
import { DeleteModal } from './components/DeleteModal';
import { Toast } from './components/Toast';

const defaultConfig = {
  blog_title: 'TechEcon',
  blog_tagline: '// economics meets code',
};

const initialSampleArticles: Article[] = [
  {
    id: '1',
    type: 'article',
    title: 'Understanding Binary Search Trees in Modern Applications',
    content:
      'Binary Search Trees are fundamental data structures that form the basis of many real-world systems. From database indexing to search engines, BSTs provide efficient O(log n) lookup times when balanced properly. This article explores their practical applications, balancing techniques, and how to implement them effectively.\n\nKey topics covered:\n• Tree traversal algorithms\n• Self-balancing variants (AVL, Red-Black)\n• Performance optimization strategies\n• Real-world use cases in production systems',
    author: 'DataWizard',
    category: 'computer-science',
    tags: 'data-structures,algorithms',
    votes: 24,
    views: 156,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'article',
    title: 'The Impact of Quantum Computing on Cryptography',
    content:
      'Quantum computers threaten the current cryptographic landscape. As quantum capabilities advance, we need post-quantum cryptography standards. This article examines the implications and emerging solutions.\n\nDiscovered aspects:\n• Quantum threat timeline\n• Current cryptographic weaknesses\n• Post-quantum alternatives\n• Migration strategies for enterprises',
    author: 'QuantumLeap',
    category: 'computer-science',
    tags: 'algorithms,blockchain',
    votes: 42,
    views: 312,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'article',
    title: 'Inflation Dynamics and Machine Learning Models',
    content:
      'Combining economic theory with machine learning provides powerful insights into inflation patterns. This article demonstrates how neural networks can predict inflation trends with higher accuracy than traditional econometric models.\n\nMethodology includes:\n• Feature engineering from economic indicators\n• LSTM and Transformer architectures\n• Backtesting strategies\n• Market validation',
    author: 'EconMeta',
    category: 'intersection',
    tags: 'machine-learning,market-analysis',
    votes: 18,
    views: 201,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    type: 'article',
    title: 'Blockchain Scalability: Solutions and Trade-offs',
    content:
      'Scalability remains the critical challenge for blockchain adoption. Layer 2 solutions, sharding, and sidechains offer different approaches with unique trade-offs. This comprehensive guide breaks down each solution.\n\nComparing:\n• Layer 2 solutions (Arbitrum, Optimism)\n• Sharding implementations\n• Sidechain architectures\n• Performance metrics and security implications',
    author: 'BlockchainDev',
    category: 'computer-science',
    tags: 'blockchain,databases',
    votes: 35,
    views: 287,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    type: 'article',
    title: 'Database Normalization vs Denormalization Trade-offs',
    content:
      'Database design involves fundamental trade-offs between normalization and denormalization. Normalized schemas reduce redundancy but increase complexity. Denormalized schemas improve performance but risk data inconsistency. The right choice depends on your use case.\n\nKey considerations:\n• ACID compliance\n• Query performance optimization\n• Storage efficiency\n• Maintenance overhead',
    author: 'DBExpert',
    category: 'computer-science',
    tags: 'databases,oop',
    votes: 31,
    views: 198,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    type: 'article',
    title: 'FinTech Revolution: How Code Disrupted Finance',
    content:
      'The financial technology sector has fundamentally transformed how we manage money. From mobile banking to algorithmic trading, software engineers have created new asset classes and payment mechanisms.\n\nExploring:\n• Decentralized finance (DeFi) protocols\n• Algorithmic trading systems\n• Payment processing innovations\n• Regulatory challenges and compliance',
    author: 'FinTechGuru',
    category: 'intersection',
    tags: 'fintech,blockchain',
    votes: 56,
    views: 423,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function formatSectionHeader(section: 'recent' | 'trending' | 'most-viewed') {
  if (section === 'recent') {
    return {
      title: '🕒 Recent Articles',
      desc: 'Latest insights from the community',
    };
  }
  if (section === 'trending') {
    return {
      title: '🔥 Trending',
      desc: 'Hot topics right now',
    };
  }
  return {
    title: '👁️ Most Viewed',
    desc: 'Fan favorites this month',
  };
}

export default function Page() {
  const [blogTitle] = useState(defaultConfig.blog_title);
  const [blogTagline] = useState(defaultConfig.blog_tagline);

  const [view, setView] = useState<View>('home');
  const [articles, setArticles] = useState<Article[]>(initialSampleArticles);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: 'TechWriter',
    bio: 'Passionate about technology and economics',
  });

  const [currentArticleId, setCurrentArticleId] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<'all' | Category>('all');
  const [currentTag, setCurrentTag] = useState<string | null>(null);
  const [currentSection, setCurrentSection] =
    useState<'recent' | 'trending' | 'most-viewed'>('recent');

  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [userVotes, setUserVotes] = useState<Record<string, VoteDirection | undefined>>(
    {}
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // write form
  const [writeTitle, setWriteTitle] = useState('');
  const [writeCategory, setWriteCategory] = useState<Category | ''>('');
  const [writeContent, setWriteContent] = useState('');
  const [writeTags, setWriteTags] = useState<string[]>([]);

  // edit profile
  const [editOpen, setEditOpen] = useState(false);
  const [editUsername, setEditUsername] = useState(userProfile.username);
  const [editBio, setEditBio] = useState(userProfile.bio);

  const [isPublishing, setIsPublishing] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const filteredArticles = useMemo(() => {
    let result = [...articles];
    if (currentFilter !== 'all') {
      result = result.filter((a) => a.category === currentFilter);
    }
    if (currentTag) {
      result = result.filter((a) => a.tags && a.tags.includes(currentTag));
    }

    if (currentSection === 'recent') {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (currentSection === 'trending') {
      result.sort((a, b) => (b.votes || 0) - (a.votes || 0));
    } else {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    return result;
  }, [articles, currentFilter, currentTag, currentSection]);

  const currentArticle = useMemo(
    () => (currentArticleId ? articles.find((a) => a.id === currentArticleId) ?? null : null),
    [articles, currentArticleId]
  );

  const currentArticleComments = useMemo(
    () =>
      currentArticleId
        ? comments.filter((c) => c.articleId === currentArticleId)
        : [],
    [comments, currentArticleId]
  );

  function showToast(msg: string) {
    setToastMessage(msg);
  }

  function resetSidebarFilters() {
    setCurrentFilter('all');
    setCurrentTag(null);
    setCurrentSection('recent');
  }

  function handleOpenArticle(id: string) {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, views: (a.views || 0) + 1 } : a))
    );
    setCurrentArticleId(id);
    setView('article');
  }

  function handleVote(articleId: string, direction: VoteDirection) {
    const current = userVotes[articleId];
    let delta = 0;

    if (current === direction) {
      delta = direction === 'up' ? -1 : 1;
      setUserVotes((p) => ({ ...p, [articleId]: undefined }));
    } else if (current) {
      delta = direction === 'up' ? 2 : -2;
      setUserVotes((p) => ({ ...p, [articleId]: direction }));
    } else {
      delta = direction === 'up' ? 1 : -1;
      setUserVotes((p) => ({ ...p, [articleId]: direction }));
    }

    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, votes: (a.votes || 0) + delta } : a))
    );
  }

  async function handlePublish() {
    if (!writeTitle.trim() || !writeCategory || !writeContent.trim()) return;

    setIsPublishing(true);
    try {
      const id = crypto.randomUUID();
      const article: Article = {
        id,
        type: 'article',
        title: writeTitle.trim(),
        author: userProfile.username,
        category: writeCategory,
        tags: writeTags.join(','),
        content: writeContent.trim(),
        votes: 0,
        views: 0,
        createdAt: new Date().toISOString(),
      };
      setArticles((prev) => [article, ...prev]);

      setWriteTitle('');
      setWriteCategory('');
      setWriteContent('');
      setWriteTags([]);

      setView('profile');
      showToast('Article published!');
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleSubmitComment(author: string, text: string) {
    if (!currentArticleId) return;
    setIsPostingComment(true);
    try {
      const id = crypto.randomUUID();
      const comment: Comment = {
        id,
        type: 'comment',
        articleId: currentArticleId,
        author,
        commentText: text,
        createdAt: new Date().toISOString(),
      };
      setComments((prev) => [comment, ...prev]);
      showToast('Comment posted!');
    } finally {
      setIsPostingComment(false);
    }
  }

  function handleDeleteArticleConfirm() {
    if (!articleToDelete) return;
    setArticles((prev) => prev.filter((a) => a.id !== articleToDelete));
    setComments((prev) => prev.filter((c) => c.articleId !== articleToDelete));
    setIsDeleteOpen(false);
    if (currentArticleId === articleToDelete) {
      setCurrentArticleId(null);
      setView('profile');
    }
    setArticleToDelete(null);
    showToast('Article deleted');
  }

  // tag toggle for write
  function toggleWriteTag(tagId: string) {
    setWriteTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  }

  const sectionHeader = formatSectionHeader(currentSection);

  return (
    <div className="h-full w-full grid-bg overflow-hidden flex flex-col">
      <Header
        blogTitle={blogTitle}
        blogTagline={blogTagline}
        userProfile={userProfile}
        onHomeClick={() => {
          setView('home');
          setCurrentArticleId(null);
          resetSidebarFilters();
        }}
        onProfileClick={() => setView('profile')}
      />

      <div className="flex-1 overflow-hidden flex">
        <Sidebar
          currentFilter={currentFilter}
          currentTag={currentTag}
          currentSection={currentSection}
          onFilterChange={(f) => {
            setCurrentFilter(f);
            setCurrentTag(null);
          }}
          onTagToggle={(tagId) =>
            setCurrentTag((prev) => (prev === tagId ? null : tagId))
          }
          onSectionChange={(s) => setCurrentSection(s)}
          onClearFilters={resetSidebarFilters}
        />

        <main className="flex-1 overflow-auto scrollbar-dark">
          <div className="max-w-5xl mx-auto px-8 py-8">
            {view === 'home' && (
              <HomeView
                articles={filteredArticles}
                comments={comments}
                userVotes={userVotes}
                onOpenArticle={handleOpenArticle}
                onVote={handleVote}
                sectionTitle={sectionHeader.title}
                sectionDesc={sectionHeader.desc}
              />
            )}

            {view === 'article' && currentArticle && (
              <ArticleView
                article={currentArticle}
                comments={currentArticleComments}
                userVote={userVotes[currentArticle.id]}
                onBack={() => setView('home')}
                onVote={(dir) => handleVote(currentArticle.id, dir)}
                onDelete={() => {
                  setArticleToDelete(currentArticle.id);
                  setIsDeleteOpen(true);
                }}
                onSubmitComment={handleSubmitComment}
                isPostingComment={isPostingComment}
              />
            )}

            {view === 'profile' && (
              <ProfileView
                userProfile={userProfile}
                articles={articles}
                comments={comments}
                onEditProfile={() => {
                  setEditUsername(userProfile.username);
                  setEditBio(userProfile.bio);
                  setEditOpen(true);
                }}
                onWriteArticle={() => setView('write')}
                onOpenArticle={handleOpenArticle}
                onDeleteArticle={(id) => {
                  setArticleToDelete(id);
                  setIsDeleteOpen(true);
                }}
              />
            )}

            {view === 'write' && (
              <WriteView
                title={writeTitle}
                category={writeCategory}
                content={writeContent}
                tags={writeTags}
                isPublishing={isPublishing}
                onBack={() => setView('profile')}
                onChangeTitle={setWriteTitle}
                onChangeCategory={setWriteCategory}
                onToggleTag={toggleWriteTag}
                onChangeContent={setWriteContent}
                onPublish={handlePublish}
              />
            )}
          </div>
        </main>
      </div>

      <EditProfileModal
        open={editOpen}
        username={editUsername}
        bio={editBio}
        onChangeUsername={setEditUsername}
        onChangeBio={setEditBio}
        onClose={() => setEditOpen(false)}
        onSave={() => {
          setUserProfile({ username: editUsername.trim(), bio: editBio.trim() });
          setEditOpen(false);
          showToast('Profile updated!');
        }}
      />

      <DeleteModal
        open={isDeleteOpen}
        onConfirm={handleDeleteArticleConfirm}
        onCancel={() => {
          setIsDeleteOpen(false);
          setArticleToDelete(null);
        }}
      />

      <Toast message={toastMessage} />
    </div>
  );
}

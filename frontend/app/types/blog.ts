export type Category = 'economics' | 'computer-science' | 'intersection';

export type Article = {
  id: string;
  type: 'article';
  title: string;
  content: string;
  author: string;
  category: Category;
  tags: string; // comma-separated
  votes: number;
  views: number;
  createdAt: string;
};

export type Comment = {
  id: string;
  type: 'comment';
  articleId: string;
  author: string;
  commentText: string;
  createdAt: string;
};

export type View = 'home' | 'article' | 'profile' | 'write';

export type UserProfile = {
  username: string;
  bio: string;
};

export type VoteDirection = 'up' | 'down';

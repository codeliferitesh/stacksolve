// src/types/index.ts

export interface User {
  uid: string;
  username: string;
  email: string;
  bio: string;
  profileImage: string | null;
  createdAt: Date;
  postCount: number;
  isEmailVerified: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  authorUsername: string;
  title: string;
  body: string;
  tags: string[];
  likes: string[]; // array of UIDs who liked
  likeCount: number;
  commentCount: number;
  isSolved: boolean;
  bookmarks: string[]; // array of UIDs who bookmarked
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  body: string;
  likes: string[];
  likeCount: number;
  parentId: string | null; // null = top-level, string = reply
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'post' | 'comment' | 'user';
  targetId: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'reply' | 'follow' | 'solution';
  fromUsername: string;
  postId?: string;
  commentId?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export type PostCategory =
  | 'Study Help'
  | 'Tech & Code'
  | 'Assignments'
  | 'Mental Health'
  | 'Exams'
  | 'Internships'
  | 'Career'
  | 'General';

export interface AuthFormState {
  email: string;
  password: string;
  username: string;
  bio: string;
  confirmPassword: string;
}

// src/lib/postService.ts
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  DocumentSnapshot,
  onSnapshot,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import { Post } from '@/types';

const PAGE_SIZE = 10;

// Create post
export const createPost = async (
  authorId: string,
  authorUsername: string,
  title: string,
  body: string,
  tags: string[]
): Promise<string> => {
  // Sanitize inputs
  const sanitizedTitle = title.trim().slice(0, 200);
  const sanitizedBody = body.trim().slice(0, 2000);
  const sanitizedTags = tags.map((t) => t.trim().toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean).slice(0, 5);

  const ref = await addDoc(collection(db, 'posts'), {
    authorId,
    authorUsername,
    title: sanitizedTitle,
    body: sanitizedBody,
    tags: sanitizedTags,
    likes: [],
    likeCount: 0,
    commentCount: 0,
    isSolved: false,
    bookmarks: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Increment user post count
  await updateDoc(doc(db, 'users', authorId), { postCount: increment(1) });

  return ref.id;
};

// Get paginated feed
export const getPosts = async (
  filter: 'latest' | 'trending' = 'latest',
  lastDoc?: DocumentSnapshot
): Promise<{ posts: Post[]; lastDoc: DocumentSnapshot | null }> => {
  const constraints: QueryConstraint[] = [
    orderBy(filter === 'trending' ? 'likeCount' : 'createdAt', 'desc'),
    limit(PAGE_SIZE),
  ];
  if (lastDoc) constraints.push(startAfter(lastDoc));

  const q = query(collection(db, 'posts'), ...constraints);
  const snap = await getDocs(q);
  const posts = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate() || new Date(),
    updatedAt: d.data().updatedAt?.toDate() || new Date(),
  })) as Post[];

  return {
    posts,
    lastDoc: snap.docs[snap.docs.length - 1] || null,
  };
};

// Get posts by tag
export const getPostsByTag = async (tag: string): Promise<Post[]> => {
  const q = query(
    collection(db, 'posts'),
    where('tags', 'array-contains', tag.toLowerCase()),
    orderBy('createdAt', 'desc'),
    limit(PAGE_SIZE)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate() || new Date(),
    updatedAt: d.data().updatedAt?.toDate() || new Date(),
  })) as Post[];
};

// Get user's posts
export const getUserPosts = async (authorId: string): Promise<Post[]> => {
  const q = query(
    collection(db, 'posts'),
    where('authorId', '==', authorId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate() || new Date(),
    updatedAt: d.data().updatedAt?.toDate() || new Date(),
  })) as Post[];
};

// Get single post
export const getPost = async (postId: string): Promise<Post | null> => {
  const snap = await getDoc(doc(db, 'posts', postId));
  if (!snap.exists()) return null;
  return {
    id: snap.id,
    ...snap.data(),
    createdAt: snap.data().createdAt?.toDate() || new Date(),
    updatedAt: snap.data().updatedAt?.toDate() || new Date(),
  } as Post;
};

// Real-time post listener
export const subscribeToPost = (postId: string, callback: (post: Post | null) => void) => {
  return onSnapshot(doc(db, 'posts', postId), (snap) => {
    if (!snap.exists()) { callback(null); return; }
    callback({
      id: snap.id,
      ...snap.data(),
      createdAt: snap.data().createdAt?.toDate() || new Date(),
      updatedAt: snap.data().updatedAt?.toDate() || new Date(),
    } as Post);
  });
};

// Toggle like
export const toggleLike = async (postId: string, userId: string, isLiked: boolean): Promise<void> => {
  await updateDoc(doc(db, 'posts', postId), {
    likes: isLiked ? arrayRemove(userId) : arrayUnion(userId),
    likeCount: increment(isLiked ? -1 : 1),
  });
};

// Toggle bookmark
export const toggleBookmark = async (postId: string, userId: string, isBookmarked: boolean): Promise<void> => {
  await updateDoc(doc(db, 'posts', postId), {
    bookmarks: isBookmarked ? arrayRemove(userId) : arrayUnion(userId),
  });
};

// Edit post (author only)
export const editPost = async (
  postId: string,
  authorId: string,
  updates: { title?: string; body?: string; tags?: string[] }
): Promise<void> => {
  const post = await getPost(postId);
  if (!post || post.authorId !== authorId) throw new Error('Unauthorized');
  await updateDoc(doc(db, 'posts', postId), { ...updates, updatedAt: serverTimestamp() });
};

// Delete post (author only)
export const deletePost = async (postId: string, authorId: string): Promise<void> => {
  const post = await getPost(postId);
  if (!post || post.authorId !== authorId) throw new Error('Unauthorized');
  await deleteDoc(doc(db, 'posts', postId));
  await updateDoc(doc(db, 'users', authorId), { postCount: increment(-1) });
};

// Mark as solved
export const markSolved = async (postId: string, authorId: string): Promise<void> => {
  const post = await getPost(postId);
  if (!post || post.authorId !== authorId) throw new Error('Unauthorized');
  await updateDoc(doc(db, 'posts', postId), { isSolved: !post.isSolved });
};

// Search posts (basic - for full-text search use Algolia)
export const searchPosts = async (searchTerm: string): Promise<Post[]> => {
  const term = searchTerm.trim().toLowerCase();
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
  const snap = await getDocs(q);
  const all = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate() || new Date(),
    updatedAt: d.data().updatedAt?.toDate() || new Date(),
  })) as Post[];
  return all.filter(
    (p) =>
      p.title.toLowerCase().includes(term) ||
      p.body.toLowerCase().includes(term) ||
      p.tags.some((t) => t.includes(term))
  );
};

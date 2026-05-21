// src/lib/commentService.ts
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { Comment } from '@/types';

// Add comment or reply
export const addComment = async (
  postId: string,
  authorId: string,
  authorUsername: string,
  body: string,
  parentId: string | null = null
): Promise<string> => {
  const sanitizedBody = body.trim().slice(0, 1000);
  if (!sanitizedBody) throw new Error('Comment cannot be empty');

  const ref = await addDoc(collection(db, 'comments'), {
    postId,
    authorId,
    authorUsername,
    body: sanitizedBody,
    likes: [],
    likeCount: 0,
    parentId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, 'posts', postId), { commentCount: increment(1) });
  return ref.id;
};

// Real-time comments listener
export const subscribeToComments = (
  postId: string,
  callback: (comments: Comment[]) => void
) => {
  const q = query(
    collection(db, 'comments'),
    where('postId', '==', postId),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    const comments = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate() || new Date(),
      updatedAt: d.data().updatedAt?.toDate() || new Date(),
    })) as Comment[];
    callback(comments);
  });
};

// Edit comment (author only)
export const editComment = async (
  commentId: string,
  authorId: string,
  body: string
): Promise<void> => {
  const sanitized = body.trim().slice(0, 1000);
  // Security check done via Firestore rules too
  await updateDoc(doc(db, 'comments', commentId), {
    body: sanitized,
    updatedAt: serverTimestamp(),
  });
};

// Delete comment (author only)
export const deleteComment = async (
  commentId: string,
  postId: string,
  authorId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'comments', commentId));
  await updateDoc(doc(db, 'posts', postId), { commentCount: increment(-1) });
};

// Toggle like on comment
export const toggleCommentLike = async (
  commentId: string,
  userId: string,
  isLiked: boolean
): Promise<void> => {
  await updateDoc(doc(db, 'comments', commentId), {
    likes: isLiked ? arrayRemove(userId) : arrayUnion(userId),
    likeCount: increment(isLiked ? -1 : 1),
  });
};

// src/lib/reportService.ts
import { addDoc, collection, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { Report, Notification } from '@/types';

// Submit report
export const submitReport = async (
  reporterId: string,
  targetType: 'post' | 'comment' | 'user',
  targetId: string,
  reason: string,
  description: string
): Promise<void> => {
  // Check for duplicate report
  const existing = query(
    collection(db, 'reports'),
    where('reporterId', '==', reporterId),
    where('targetId', '==', targetId)
  );
  const snap = await getDocs(existing);
  if (!snap.empty) throw new Error('You have already reported this content');

  await addDoc(collection(db, 'reports'), {
    reporterId,
    targetType,
    targetId,
    reason,
    description: description.trim().slice(0, 500),
    status: 'pending',
    createdAt: serverTimestamp(),
  });
};

// Create notification
export const createNotification = async (
  userId: string,
  type: Notification['type'],
  fromUsername: string,
  message: string,
  postId?: string,
  commentId?: string
): Promise<void> => {
  await addDoc(collection(db, 'notifications'), {
    userId,
    type,
    fromUsername,
    message,
    postId: postId || null,
    commentId: commentId || null,
    isRead: false,
    createdAt: serverTimestamp(),
  });
};

// Get user notifications (real-time)
import { onSnapshot, orderBy, limit } from 'firebase/firestore';

export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snap) => {
    const notifs = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate() || new Date(),
    })) as Notification[];
    callback(notifs);
  });
};

// Mark notification as read
export const markNotificationRead = async (notificationId: string): Promise<void> => {
  await updateDoc(doc(db, 'notifications', notificationId), { isRead: true });
};

// Mark all notifications as read
export const markAllNotificationsRead = async (userId: string): Promise<void> => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('isRead', '==', false)
  );
  const snap = await getDocs(q);
  const updates = snap.docs.map((d) => updateDoc(d.ref, { isRead: true }));
  await Promise.all(updates);
};

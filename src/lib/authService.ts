// src/lib/authService.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  updateEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  collection,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '@/types';

// Username validation
export const validateUsername = (username: string): string | null => {
  if (username.length < 3 || username.length > 20) return 'Username must be 3–20 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Only letters, numbers, and underscores allowed';
  return null;
};

// Check username availability
export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  const q = query(collection(db, 'usernames'), where('username', '==', username.toLowerCase()));
  const snap = await getDocs(q);
  return snap.empty;
};

// Sign Up
export const signUp = async (
  email: string,
  password: string,
  username: string
): Promise<{ user: User; error?: string }> => {
  const trimmedUsername = username.trim();
  const validationError = validateUsername(trimmedUsername);
  if (validationError) throw new Error(validationError);

  const available = await isUsernameAvailable(trimmedUsername);
  if (!available) throw new Error('Username is already taken');

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(cred.user);

  const userData: Omit<User, 'uid'> = {
    username: trimmedUsername,
    email,
    bio: '',
    profileImage: null,
    createdAt: new Date(),
    postCount: 0,
    isEmailVerified: false,
  };

  const batch = writeBatch(db);
  batch.set(doc(db, 'users', cred.user.uid), {
    ...userData,
    createdAt: serverTimestamp(),
  });
  batch.set(doc(db, 'usernames', trimmedUsername.toLowerCase()), {
    uid: cred.user.uid,
    username: trimmedUsername.toLowerCase(),
  });
  await batch.commit();

  return { user: { ...userData, uid: cred.user.uid } };
};

// Login
export const login = async (email: string, password: string): Promise<User> => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
  if (!userDoc.exists()) throw new Error('User data not found');
  return { uid: cred.user.uid, ...userDoc.data() } as User;
};

// Logout
export const logout = async (): Promise<void> => {
  await signOut(auth);
};

// Forgot password
export const forgotPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

// Get user data by UID
export const getUserById = async (uid: string): Promise<User | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() } as User;
};

// Get user by username
export const getUserByUsername = async (username: string): Promise<User | null> => {
  const q = query(collection(db, 'users'), where('username', '==', username));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { uid: d.id, ...d.data() } as User;
};

// Update profile
export const updateProfile = async (
  uid: string,
  data: Partial<Pick<User, 'bio' | 'profileImage'>>
): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), data);
};

// Update password (requires reauthentication)
export const updateUserPassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('Not authenticated');
  const cred = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, cred);
  await updatePassword(user, newPassword);
};

// Update email (requires reauthentication)
export const updateUserEmail = async (
  currentPassword: string,
  newEmail: string
): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('Not authenticated');
  const cred = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, cred);
  await updateEmail(user, newEmail);
  await sendEmailVerification(user);
  await updateDoc(doc(db, 'users', user.uid), { email: newEmail });
};

// Delete account permanently
export const deleteAccount = async (currentPassword: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('Not authenticated');
  const cred = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, cred);

  // Get username to delete from usernames collection
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const username = userDoc.data()?.username as string;

  const batch = writeBatch(db);
  batch.delete(doc(db, 'users', user.uid));
  if (username) batch.delete(doc(db, 'usernames', username.toLowerCase()));
  await batch.commit();

  await deleteUser(user);
};

// Auth state observer
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

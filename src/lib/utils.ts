// src/lib/utils.ts

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: any): string {
  if (!date) return 'Unknown time';

  try {
    const validDate =
      date instanceof Date
        ? date
        : typeof date?.toDate === 'function'
        ? date.toDate()
        : new Date(date);

    if (isNaN(validDate.getTime())) {
      return 'Invalid date';
    }

    return formatDistanceToNow(validDate, { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
}

export function sanitizeInput(input: string, maxLength = 500): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // basic XSS prevention
}

export function getAvatarColor(username: string): string {
  const colors = [
    'bg-violet-500',
    'bg-emerald-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-blue-500',
    'bg-teal-500',
  ];

  const index = username.charCodeAt(0) % colors.length;
  return colors[index];
}

export function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

export function validatePassword(
  password: string
): { valid: boolean; strength: number; message: string } {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (password.length < 6) {
    return {
      valid: false,
      strength: 0,
      message: 'Password too short',
    };
  }

  if (strength < 2) {
    return {
      valid: true,
      strength,
      message: 'Weak password',
    };
  }

  if (strength < 3) {
    return {
      valid: true,
      strength,
      message: 'Moderate password',
    };
  }

  return {
    valid: true,
    strength,
    message: 'Strong password',
  };
}

export const CATEGORIES = [
  { label: 'Study Help', emoji: '📚', color: 'violet' },
  { label: 'Tech & Code', emoji: '💻', color: 'emerald' },
  { label: 'Assignments', emoji: '📝', color: 'orange' },
  { label: 'Mental Health', emoji: '❤️', color: 'pink' },
  { label: 'Exams', emoji: '📋', color: 'blue' },
  { label: 'Internships', emoji: '🤝', color: 'teal' },
  { label: 'Career', emoji: '🎯', color: 'violet' },
  { label: 'General', emoji: '💬', color: 'gray' },
] as const;

export const REPORT_REASONS = [
  'Harassment or bullying',
  'Hate speech',
  'Spam or misleading',
  'Inappropriate content',
  'Privacy violation',
  'Other',
] as const;
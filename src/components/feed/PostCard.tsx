'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, CheckCircle, Trash2, Edit, Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { toggleLike, toggleBookmark, deletePost } from '@/lib/postService';
import { submitReport } from '@/lib/reportService';
import { cn, getAvatarColor, getInitials, timeAgo } from '@/lib/utils';
import type { Post } from '@/types';

interface Props {
  post: Post;
  currentUserId?: string;
  onDeleted?: () => void;
  onEdit?: (post: Post) => void;
}

export default function PostCard({ post, currentUserId, onDeleted, onEdit }: Props) {
  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;
  const isBookmarked = currentUserId ? post.bookmarks.includes(currentUserId) : false;
  const isOwner = currentUserId === post.authorId;
  const [showMenu, setShowMenu] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [liked, setLiked] = useState(isLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  const handleLike = async () => {
    if (!currentUserId) { toast.error('Sign in to like posts'); return; }
    setLiked(!liked);
    setLikeCount((c) => liked ? c - 1 : c + 1);
    await toggleLike(post.id, currentUserId, liked).catch(() => {
      setLiked(liked);
      setLikeCount((c) => liked ? c + 1 : c - 1);
    });
  };

  const handleBookmark = async () => {
    if (!currentUserId) { toast.error('Sign in to bookmark'); return; }
    setBookmarked(!bookmarked);
    await toggleBookmark(post.id, currentUserId, bookmarked).catch(() => setBookmarked(bookmarked));
    toast.success(bookmarked ? 'Removed from bookmarks' : 'Bookmarked!');
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    await navigator.clipboard.writeText(url).catch(() => {});
    toast.success('Link copied!');
  };

  const handleDelete = async () => {
    if (!currentUserId || !isOwner) return;
    if (!confirm('Delete this post? This cannot be undone.')) return;
    await deletePost(post.id, currentUserId);
    toast.success('Post deleted');
    onDeleted?.();
  };

  const handleReport = async () => {
    if (!currentUserId) { toast.error('Sign in to report'); return; }
    await submitReport(currentUserId, 'post', post.id, 'Inappropriate content', '').catch(() => {});
    toast.success('Report submitted. We\'ll review it.');
    setShowMenu(false);
  };

  const tagColors = ['tag-purple', 'tag-green', 'tag-orange'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-hover p-5 relative group"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold text-white flex-shrink-0', getAvatarColor(post.authorUsername))}>
          {getInitials(post.authorUsername)}
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/${post.authorUsername}`} className="text-[13px] font-medium hover:text-brand-400 transition-colors">
            @{post.authorUsername}
          </Link>
          <div className="text-[11px] text-[#5a5680]">{timeAgo(post.createdAt)}</div>
        </div>
        {post.isSolved && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
            <CheckCircle size={11} /> Solved
          </span>
        )}
        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-surface-3 transition-all text-[#5a5680] hover:text-white"
          >
            <MoreHorizontal size={15} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 w-44 card border-[var(--border-2)] shadow-xl z-20 py-1 rounded-xl overflow-hidden">
              {isOwner && (
                <>
                  <button onClick={() => { onEdit?.(post); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#a09cc0] hover:bg-surface-2 hover:text-white transition-colors">
                    <Edit size={13} /> Edit Post
                  </button>
                  <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-400 hover:bg-surface-2 transition-colors">
                    <Trash2 size={13} /> Delete Post
                  </button>
                </>
              )}
              {!isOwner && (
                <button onClick={handleReport} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#a09cc0] hover:bg-surface-2 hover:text-white transition-colors">
                  <Flag size={13} /> Report Post
                </button>
              )}
              <button onClick={handleShare} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#a09cc0] hover:bg-surface-2 hover:text-white transition-colors">
                <Share2 size={13} /> Copy Link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <Link href={`/post/${post.id}`} className="block group/link">
        <h2 className="font-display font-semibold text-[15.5px] leading-snug mb-2 group-hover/link:text-brand-400 transition-colors">
          {post.title}
        </h2>
        <p className="text-[13.5px] text-[#a09cc0] leading-relaxed line-clamp-3 mb-3">{post.body}</p>
      </Link>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.map((tag, i) => (
            <Link key={tag} href={`/explore?tag=${tag}`} className={tagColors[i % 3]}>
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1" onClick={() => setShowMenu(false)}>
        <button onClick={handleLike} className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12.5px] transition-all hover:bg-surface-2', liked ? 'text-brand-400' : 'text-[#5a5680] hover:text-white')}>
          <Heart size={14} className={liked ? 'fill-current' : ''} />
          {likeCount}
        </button>
        <Link href={`/post/${post.id}`} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12.5px] text-[#5a5680] hover:text-white hover:bg-surface-2 transition-all">
          <MessageSquare size={14} />
          {post.commentCount}
        </Link>
        <button onClick={handleShare} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12.5px] text-[#5a5680] hover:text-white hover:bg-surface-2 transition-all">
          <Share2 size={14} />
        </button>
        <button onClick={handleBookmark} className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12.5px] transition-all hover:bg-surface-2', bookmarked ? 'text-brand-400' : 'text-[#5a5680] hover:text-white')}>
          <Bookmark size={14} className={bookmarked ? 'fill-current' : ''} />
        </button>
      </div>
    </motion.div>
  );
}

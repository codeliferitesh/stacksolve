'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Share2, Bookmark, CheckCircle, MoreHorizontal, Flag, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscribeToPost, toggleLike, toggleBookmark, deletePost, markSolved } from '@/lib/postService';
import { useAuthStore } from '@/store/authStore';
import { cn, getAvatarColor, getInitials, timeAgo } from '@/lib/utils';
import CommentSection from '@/components/feed/CommentSection';
import type { Post } from '@/types';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const unsub = subscribeToPost(id, (p) => { setPost(p); setLoading(false); });
    return () => unsub();
  }, [id]);

  if (loading) return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-4">
      <div className="skeleton h-8 w-2/3 rounded-xl" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-1/2 rounded" />
    </div>
  );

  if (!post) return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <h2 className="font-display font-bold text-xl mb-2">Post not found</h2>
      <button onClick={() => router.back()} className="btn-primary mt-4">Go Back</button>
    </div>
  );

  const isLiked = user ? post.likes.includes(user.uid) : false;
  const isBookmarked = user ? post.bookmarks.includes(user.uid) : false;
  const isOwner = user?.uid === post.authorId;

  const handleLike = async () => {
    if (!user) { toast.error('Sign in to like'); return; }
    await toggleLike(post.id, user.uid, isLiked);
  };
  const handleBookmark = async () => {
    if (!user) { toast.error('Sign in to bookmark'); return; }
    await toggleBookmark(post.id, user.uid, isBookmarked);
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Bookmarked!');
  };
  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href).catch(() => {});
    toast.success('Link copied!');
  };
  const handleDelete = async () => {
    if (!user || !isOwner) return;
    if (!confirm('Delete this post?')) return;
    await deletePost(post.id, user.uid);
    toast.success('Post deleted');
    router.push('/feed');
  };
  const handleMarkSolved = async () => {
    if (!user || !isOwner) return;
    await markSolved(post.id, user.uid);
    toast.success(post.isSolved ? 'Marked as unsolved' : 'Marked as solved!');
  };

  return (
    <div>
      <div className="sticky top-0 z-10 bg-surface-0/85 backdrop-blur-xl border-b border-[var(--border)] px-6 py-3.5 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-surface-2 text-[#a09cc0] hover:text-white transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="font-display font-bold text-base truncate">{post.title}</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="card p-6 mb-4">
          {/* Author */}
          <div className="flex items-center gap-3 mb-4">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold text-white', getAvatarColor(post.authorUsername))}>
              {getInitials(post.authorUsername)}
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-medium">@{post.authorUsername}</div>
              <div className="text-[11px] text-[#5a5680]">{timeAgo(post.createdAt)}{post.updatedAt > post.createdAt && ' · edited'}</div>
            </div>
            {post.isSolved && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
                <CheckCircle size={11} /> Solved
              </span>
            )}
            {/* Menu */}
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-xl hover:bg-surface-2 text-[#5a5680] hover:text-white transition-colors">
                <MoreHorizontal size={15} />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-9 w-44 card border-[var(--border-2)] shadow-xl z-20 py-1 rounded-xl">
                  {isOwner && <>
                    <button onClick={handleMarkSolved} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-emerald-400 hover:bg-surface-2 transition-colors">
                      <CheckCircle size={13} /> {post.isSolved ? 'Unmark Solved' : 'Mark Solved'}
                    </button>
                    <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-400 hover:bg-surface-2 transition-colors">
                      <Trash2 size={13} /> Delete
                    </button>
                  </>}
                  {!isOwner && user && (
                    <button onClick={() => { toast.success('Report submitted'); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#a09cc0] hover:bg-surface-2 hover:text-white transition-colors">
                      <Flag size={13} /> Report
                    </button>
                  )}
                  <button onClick={handleShare} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#a09cc0] hover:bg-surface-2 hover:text-white transition-colors">
                    <Share2 size={13} /> Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>

          <h2 className="font-display font-bold text-xl leading-snug mb-3">{post.title}</h2>
          <p className="text-[14.5px] text-[#c4c0e0] leading-relaxed mb-4 whitespace-pre-wrap">{post.body}</p>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {post.tags.map((tag, i) => (
                <span key={tag} className={['tag-purple', 'tag-green', 'tag-orange'][i % 3]}>#{tag}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 border-t border-[var(--border)] pt-4">
            <button onClick={handleLike} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all hover:bg-surface-2', isLiked ? 'text-brand-400' : 'text-[#5a5680] hover:text-white')}>
              <Heart size={15} className={isLiked ? 'fill-current' : ''} /> {post.likeCount}
            </button>
            <button onClick={handleBookmark} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all hover:bg-surface-2', isBookmarked ? 'text-brand-400' : 'text-[#5a5680] hover:text-white')}>
              <Bookmark size={15} className={isBookmarked ? 'fill-current' : ''} />
            </button>
            <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-[#5a5680] hover:text-white hover:bg-surface-2 transition-all">
              <Share2 size={15} />
            </button>
          </div>
        </div>

        {/* Comments */}
        <div className="card p-6">
          <CommentSection postId={post.id} currentUserId={user?.uid} currentUsername={user?.username} />
        </div>
      </div>
    </div>
  );
}

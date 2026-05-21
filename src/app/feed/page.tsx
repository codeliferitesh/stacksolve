// src/app/feed/page.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { getPosts } from '@/lib/postService';
import { useAuthStore } from '@/store/authStore';
import PostCard from '@/components/feed/PostCard';
import PostCardSkeleton from '@/components/feed/PostCardSkeleton';
import CreatePostModal from '@/components/modals/CreatePostModal';
import type { Post } from '@/types';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'latest', label: 'Latest', icon: Clock },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
] as const;

export default function FeedPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'latest' | 'trending'>('latest');
  const [showCreate, setShowCreate] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(async (filter: 'latest' | 'trending', reset = true) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const result = await getPosts(filter, reset ? undefined : lastDoc);
      if (reset) {
        setPosts(result.posts);
      } else {
        setPosts((prev) => [...prev, ...result.posts]);
      }
      setLastDoc(result.lastDoc);
      setHasMore(result.posts.length === 10);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastDoc]);

  useEffect(() => {
    loadPosts(activeTab, true);
  }, [activeTab]);

  const handlePostCreated = () => {
    setShowCreate(false);
    loadPosts(activeTab, true);
  };

  return (
    <div>
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-surface-0/85 backdrop-blur-xl border-b border-[var(--border)] px-6 py-3.5 flex items-center justify-between">
        <h1 className="font-display font-bold text-base">Home Feed</h1>
        <div className="flex items-center gap-3">
          {/* Tabs */}
          <div className="flex gap-1 bg-surface-2 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-all',
                  activeTab === tab.id ? 'bg-brand-600 text-white' : 'text-[#a09cc0] hover:text-white'
                )}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary text-sm flex items-center gap-1.5 hidden lg:flex"
          >
            <Plus size={14} /> New Post
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-5">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="font-display font-semibold text-lg mb-2">No posts yet</h3>
            <p className="text-sm text-[#a09cc0] mb-6">Be the first to start a discussion!</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary">Create First Post</button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} currentUserId={user?.uid} />
              ))}
            </div>
            {hasMore && (
              <button
                onClick={() => loadPosts(activeTab, false)}
                disabled={loadingMore}
                className="btn-outline w-full mt-4 py-3 text-sm"
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            )}
          </>
        )}
      </div>

      {showCreate && user && (
        <CreatePostModal
          authorId={user.uid}
          authorUsername={user.username}
          onClose={() => setShowCreate(false)}
          onSuccess={handlePostCreated}
        />
      )}
    </div>
  );
}

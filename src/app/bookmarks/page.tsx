'use client';
import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import PostCard from '@/components/feed/PostCard';
import PostCardSkeleton from '@/components/feed/PostCardSkeleton';
import type { Post } from '@/types';

export default function BookmarksPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const q = query(collection(db, 'posts'), where('bookmarks', 'array-contains', user.uid), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate() || new Date(), updatedAt: d.data().updatedAt?.toDate() || new Date() })) as Post[]);
      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <div>
      <div className="sticky top-0 z-10 bg-surface-0/85 backdrop-blur-xl border-b border-[var(--border)] px-6 py-3.5">
        <h1 className="font-display font-bold text-base">Bookmarks</h1>
      </div>
      <div className="max-w-2xl mx-auto px-6 py-5">
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)}</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <Bookmark size={32} className="text-[#5a5680] mx-auto mb-4" />
            <h3 className="font-display font-semibold text-lg mb-2">No bookmarks yet</h3>
            <p className="text-sm text-[#5a5680]">Save posts you want to read later by clicking the bookmark icon.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => <PostCard key={p.id} post={p} currentUserId={user?.uid} onDeleted={() => setPosts((prev) => prev.filter((x) => x.id !== p.id))} />)}
          </div>
        )}
      </div>
    </div>
  );
}

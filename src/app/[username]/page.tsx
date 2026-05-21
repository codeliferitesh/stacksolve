'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { getUserByUsername } from '@/lib/authService';
import { getUserPosts } from '@/lib/postService';
import { useAuthStore } from '@/store/authStore';
import PostCard from '@/components/feed/PostCard';
import PostCardSkeleton from '@/components/feed/PostCardSkeleton';
import { cn, getAvatarColor, getInitials, timeAgo } from '@/lib/utils';
import type { User, Post } from '@/types';

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const u = await getUserByUsername(username);
      if (!u) { setLoading(false); return; }
      setProfileUser(u);
      const p = await getUserPosts(u.uid);
      setPosts(p);
      setLoading(false);
    };
    fetch();
  }, [username]);

  if (loading) return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-4">
      <div className="skeleton h-24 w-full rounded-2xl" />
      <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <PostCardSkeleton key={i} />)}</div>
    </div>
  );

  if (!profileUser) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">👤</div>
      <h2 className="font-display font-bold text-xl mb-2">User not found</h2>
      <button onClick={() => router.back()} className="btn-primary mt-4">Go Back</button>
    </div>
  );

  const isOwnProfile = currentUser?.uid === profileUser.uid;

  return (
    <div>
      <div className="sticky top-0 z-10 bg-surface-0/85 backdrop-blur-xl border-b border-[var(--border)] px-6 py-3.5 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-surface-2 text-[#a09cc0] hover:text-white transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="font-display font-bold text-base">@{profileUser.username}</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="card p-6 mb-6">
          <div className="flex items-start gap-4">
            {profileUser.profileImage ? (
              <img src={profileUser.profileImage} alt="avatar" className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
            ) : (
              <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0', getAvatarColor(profileUser.username))}>
                {getInitials(profileUser.username)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display font-bold text-xl">@{profileUser.username}</h2>
                {profileUser.isEmailVerified && <CheckCircle size={14} className="text-emerald-400" />}
              </div>
              <div className="text-[12px] text-[#5a5680] mb-2">Joined {timeAgo(profileUser.createdAt)}</div>
              {profileUser.bio && <p className="text-[13.5px] text-[#a09cc0] leading-relaxed">{profileUser.bio}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[var(--border)]">
            {[
              { label: 'Posts', value: profileUser.postCount },
              { label: 'Upvotes', value: posts.reduce((a, p) => a + p.likeCount, 0) },
              { label: 'Comments', value: posts.reduce((a, p) => a + p.commentCount, 0) },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display font-bold text-xl">{s.value}</div>
                <div className="text-[11px] text-[#5a5680] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <h3 className="font-display font-semibold text-sm text-[#a09cc0] mb-4">Posts by @{profileUser.username}</h3>
        {posts.length === 0 ? (
          <div className="text-center py-12 card">
            <p className="text-sm text-[#5a5680]">No posts yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => <PostCard key={p.id} post={p} currentUserId={currentUser?.uid} />)}
          </div>
        )}
      </div>
    </div>
  );
}

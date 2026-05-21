'use client';
import { useEffect, useState, useRef } from 'react';
import { Camera, Edit2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { updateProfile } from '@/lib/authService';
import { getUserPosts } from '@/lib/postService';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PostCard from '@/components/feed/PostCard';
import PostCardSkeleton from '@/components/feed/PostCardSkeleton';
import { cn, getAvatarColor, getInitials, timeAgo } from '@/lib/utils';
import type { Post } from '@/types';
import { storage } from '@/lib/firebase';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    getUserPosts(user.uid).then((p) => { setPosts(p); setLoading(false); });
  }, [user]);

  const handleSaveBio = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.uid, { bio });
      setUser({ ...user, bio });
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateProfile(user.uid, { profileImage: url });
      setUser({ ...user, profileImage: url });
      toast.success('Profile picture updated!');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <div className="sticky top-0 z-10 bg-surface-0/85 backdrop-blur-xl border-b border-[var(--border)] px-6 py-3.5">
        <h1 className="font-display font-bold text-base">My Profile</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {user.profileImage ? (
                <img src={user.profileImage} alt="avatar" className="w-16 h-16 rounded-2xl object-cover" />
              ) : (
                <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white', getAvatarColor(user.username))}>
                  {getInitials(user.username)}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center shadow-lg hover:bg-brand-700 transition-colors"
              >
                {uploading ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Camera size={13} className="text-white" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display font-bold text-xl">@{user.username}</h2>
                {user.isEmailVerified && <CheckCircle size={15} className="text-emerald-400" />}
              </div>
              <div className="text-[12px] text-[#5a5680] mb-3">Joined {timeAgo(user.createdAt)}</div>

              {editing ? (
                <div className="space-y-2">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write something about yourself..."
                    className="input resize-none h-20 text-sm w-full"
                    maxLength={200}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveBio} disabled={saving} className="btn-primary text-xs px-3 py-1.5">
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => { setEditing(false); setBio(user.bio); }} className="btn-outline text-xs px-3 py-1.5">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <p className="text-[13.5px] text-[#a09cc0] leading-relaxed flex-1">
                    {user.bio || <span className="text-[#5a5680] italic">No bio yet. Tell the community about yourself!</span>}
                  </p>
                  <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-surface-2 text-[#5a5680] hover:text-white transition-colors flex-shrink-0">
                    <Edit2 size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-[var(--border)]">
            {[
              { label: 'Posts', value: user.postCount },
              { label: 'Total Upvotes', value: posts.reduce((acc, p) => acc + p.likeCount, 0) },
              { label: 'Comments', value: posts.reduce((acc, p) => acc + p.commentCount, 0) },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display font-bold text-xl">{s.value}</div>
                <div className="text-[11px] text-[#5a5680] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Posts */}
        <h2 className="font-display font-semibold text-sm text-[#a09cc0] mb-4">My Posts</h2>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <PostCardSkeleton key={i} />)}</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 card">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-sm text-[#5a5680]">No posts yet. Share something with the community!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => <PostCard key={p.id} post={p} currentUserId={user.uid} onDeleted={() => setPosts((prev) => prev.filter((x) => x.id !== p.id))} />)}
          </div>
        )}
      </div>
    </div>
  );
}

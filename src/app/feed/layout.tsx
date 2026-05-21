// src/app/feed/layout.tsx
// This layout wraps the main app pages (feed, explore, profile, settings, help)
// We use a sidebar + main layout pattern

'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Bell, User, Settings, HelpCircle, LogOut, Plus, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/authService';
import { useAuthStore } from '@/store/authStore';
import { cn, getAvatarColor, getInitials } from '@/lib/utils';
import CreatePostModal from '@/components/modals/CreatePostModal';
import { useState } from 'react';

const navItems = [
  { href: '/feed', label: 'Home Feed', icon: Home },
  { href: '/explore', label: 'Explore', icon: Search },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help & Support', icon: HelpCircle },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { logout: storeLogout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  const handleLogout = async () => {
    await logout();
    storeLogout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-surface-0 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] min-w-[220px] bg-surface-1 border-r border-[var(--border)] flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-[var(--border)]">
          <Link href="/feed" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center font-display font-bold text-sm text-white">S²</div>
            <div>
              <div className="font-display font-bold text-sm leading-none">StackSolve</div>
              <div className="text-[10px] text-[#5a5680] mt-0.5">Community Platform</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13.5px] transition-all duration-150',
                  active
                    ? 'bg-brand-600/12 text-brand-400 border border-brand-600/20'
                    : 'text-[#a09cc0] hover:bg-surface-2 hover:text-white border border-transparent'
                )}
              >
                <item.icon size={15} className={active ? 'text-brand-400' : 'opacity-70'} />
                {item.label}
                {item.label === 'Notifications' && (
                  <span className="ml-auto bg-brand-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">3</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-2">
            <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-white flex-shrink-0', getAvatarColor(user.username))}>
              {getInitials(user.username)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-medium truncate">@{user.username}</div>
              <div className="text-[10px] text-[#5a5680]">Anonymous</div>
            </div>
            <button onClick={handleLogout} className="text-[#5a5680] hover:text-red-400 transition-colors p-1">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Mobile create post FAB */}
      <button
        onClick={() => setShowCreatePost(true)}
        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-brand-600 rounded-full flex items-center justify-center shadow-lg shadow-brand-600/30 hover:bg-brand-700 transition-colors z-40"
      >
        <Plus size={22} className="text-white" />
      </button>

      {showCreatePost && (
        <CreatePostModal
          authorId={user.uid}
          authorUsername={user.username}
          onClose={() => setShowCreatePost(false)}
        />
      )}
    </div>
  );
}

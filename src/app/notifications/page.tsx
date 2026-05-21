'use client';
import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { subscribeToNotifications, markAllNotificationsRead, markNotificationRead } from '@/lib/reportService';
import { useAuthStore } from '@/store/authStore';
import { timeAgo, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Notification } from '@/types';

const typeIcon: Record<Notification['type'], string> = {
  like: '💜', comment: '💬', reply: '↩️', follow: '👤', solution: '⭐',
};

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToNotifications(user.uid, (notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleMarkAll = async () => {
    if (!user) return;
    await markAllNotificationsRead(user.uid);
    toast.success('All notifications marked as read');
  };

  const handleRead = async (notif: Notification) => {
    if (!notif.isRead) await markNotificationRead(notif.id);
  };

  return (
    <div>
      <div className="sticky top-0 z-10 bg-surface-0/85 backdrop-blur-xl border-b border-[var(--border)] px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-display font-bold text-base">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-brand-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAll} className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors">
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-6 py-5">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card p-4 flex gap-3">
                <div className="skeleton w-8 h-8 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-3/4 rounded" />
                  <div className="skeleton h-2.5 w-1/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={32} className="text-[#5a5680] mx-auto mb-4" />
            <h3 className="font-display font-semibold text-lg mb-2">No notifications yet</h3>
            <p className="text-sm text-[#5a5680]">When someone likes or comments on your posts, you'll see it here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleRead(notif)}
                className={cn('card p-4 flex items-start gap-3 cursor-pointer transition-colors hover:border-[var(--border-2)]', !notif.isRead && 'border-brand-600/25 bg-brand-600/4')}
              >
                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0', !notif.isRead ? 'bg-brand-600/15' : 'bg-surface-2')}>
                  {typeIcon[notif.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#c4c0e0] leading-relaxed">{notif.message}</p>
                  <p className="text-[11px] text-[#5a5680] mt-0.5">{timeAgo(notif.createdAt)}</p>
                </div>
                {!notif.isRead && <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

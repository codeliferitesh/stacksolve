'use client';
import { useState, useEffect } from 'react';
import { Heart, MoreHorizontal, Reply, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { addComment, subscribeToComments, editComment, deleteComment, toggleCommentLike } from '@/lib/commentService';
import { cn, getAvatarColor, getInitials, timeAgo } from '@/lib/utils';
import type { Comment } from '@/types';

interface Props {
  postId: string;
  currentUserId?: string;
  currentUsername?: string;
}

function CommentItem({ comment, currentUserId, postId, onReply, depth = 0 }: {
  comment: Comment & { replies?: Comment[] };
  currentUserId?: string;
  postId: string;
  onReply: (parentId: string, username: string) => void;
  depth?: number;
}) {
  const isOwner = currentUserId === comment.authorId;
  const isLiked = currentUserId ? comment.likes.includes(currentUserId) : false;
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.body);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = async () => {
    if (!currentUserId) { toast.error('Sign in to like'); return; }
    setLiked(!liked);
    setLikeCount((c) => liked ? c - 1 : c + 1);
    await toggleCommentLike(comment.id, currentUserId, liked);
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    await editComment(comment.id, currentUserId!, editText);
    setEditing(false);
    toast.success('Comment updated');
  };

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return;
    await deleteComment(comment.id, postId, currentUserId!);
    toast.success('Comment deleted');
  };

  return (
    <div className={cn('group', depth > 0 && 'ml-8 pl-4 border-l border-[var(--border)]')}>
      <div className="py-3">
        <div className="flex items-start gap-2.5">
          <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 mt-0.5', getAvatarColor(comment.authorUsername))}>
            {getInitials(comment.authorUsername)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[13px] font-medium">@{comment.authorUsername}</span>
              <span className="text-[11px] text-[#5a5680]">{timeAgo(comment.createdAt)}</span>
              {comment.updatedAt > comment.createdAt && <span className="text-[10px] text-[#5a5680]">(edited)</span>}
            </div>
            {editing ? (
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="input resize-none text-sm h-20 w-full"
                />
                <div className="flex gap-2">
                  <button onClick={handleEdit} className="btn-primary text-xs px-3 py-1.5">Save</button>
                  <button onClick={() => setEditing(false)} className="btn-outline text-xs px-3 py-1.5">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-[13.5px] text-[#c4c0e0] leading-relaxed">{comment.body}</p>
            )}
            <div className="flex items-center gap-1 mt-2">
              <button onClick={handleLike} className={cn('flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] transition-all hover:bg-surface-2', liked ? 'text-brand-400' : 'text-[#5a5680]')}>
                <Heart size={12} className={liked ? 'fill-current' : ''} /> {likeCount}
              </button>
              {currentUserId && depth === 0 && (
                <button onClick={() => onReply(comment.id, comment.authorUsername)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] text-[#5a5680] hover:text-white hover:bg-surface-2 transition-all">
                  <Reply size={12} /> Reply
                </button>
              )}
              {isOwner && (
                <div className="relative ml-1">
                  <button onClick={() => setShowMenu(!showMenu)} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-[#5a5680] hover:text-white hover:bg-surface-2 transition-all">
                    <MoreHorizontal size={13} />
                  </button>
                  {showMenu && (
                    <div className="absolute left-0 top-7 w-36 card border-[var(--border-2)] shadow-xl z-10 py-1 rounded-xl">
                      <button onClick={() => { setEditing(true); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-[#a09cc0] hover:bg-surface-2 hover:text-white transition-colors">
                        <Edit size={11} /> Edit
                      </button>
                      <button onClick={() => { handleDelete(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-red-400 hover:bg-surface-2 transition-colors">
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {comment.replies?.map((reply) => (
          <CommentItem key={reply.id} comment={reply} currentUserId={currentUserId} postId={postId} onReply={onReply} depth={depth + 1} />
        ))}
      </div>
    </div>
  );
}

export default function CommentSection({ postId, currentUserId, currentUsername }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeToComments(postId, setComments);
    return () => unsub();
  }, [postId]);

  const threadedComments = comments
    .filter((c) => !c.parentId)
    .map((c) => ({ ...c, replies: comments.filter((r) => r.parentId === c.id) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !currentUsername) { toast.error('Sign in to comment'); return; }
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      await addComment(postId, currentUserId, currentUsername, newComment, replyTo?.id || null);
      setNewComment('');
      setReplyTo(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="font-display font-semibold text-sm mb-4 text-[#a09cc0]">
        {comments.length} Comment{comments.length !== 1 ? 's' : ''}
      </h3>

      {/* Input */}
      {currentUserId && (
        <form onSubmit={handleSubmit} className="mb-5">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-[12px] text-brand-400">
              <Reply size={12} /> Replying to @{replyTo.username}
              <button type="button" onClick={() => setReplyTo(null)} className="text-[#5a5680] hover:text-white ml-1">✕</button>
            </div>
          )}
          <div className="flex gap-3">
            <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 mt-1', getAvatarColor(currentUsername || ''))}>
              {getInitials(currentUsername || 'u')}
            </div>
            <div className="flex-1 space-y-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a helpful comment..."
                className="input resize-none h-20 text-sm"
                maxLength={1000}
              />
              <div className="flex justify-end">
                <button type="submit" disabled={loading || !newComment.trim()} className="btn-primary text-sm px-4 py-2 disabled:opacity-50">
                  {loading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Comments */}
      <div className="divide-y divide-[var(--border)]">
        {threadedComments.length === 0 ? (
          <p className="text-center py-8 text-sm text-[#5a5680]">No comments yet. Be the first to help!</p>
        ) : (
          threadedComments.map((c) => (
            <CommentItem key={c.id} comment={c} currentUserId={currentUserId} postId={postId} onReply={(id, username) => setReplyTo({ id, username })} />
          ))
        )}
      </div>
    </div>
  );
}

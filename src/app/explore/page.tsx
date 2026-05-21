'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { searchPosts, getPostsByTag } from '@/lib/postService';
import PostCard from '@/components/feed/PostCard';
import PostCardSkeleton from '@/components/feed/PostCardSkeleton';
import { useAuthStore } from '@/store/authStore';
import { CATEGORIES, cn } from '@/lib/utils';
import type { Post } from '@/types';

export default function ExplorePage() {
  const { user } = useAuthStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    const posts = await searchPosts(query);
    setResults(posts);
    setLoading(false);
  };

  const handleTagClick = async (tag: string) => {
    setQuery(`#${tag}`);
    setLoading(true);
    setSearched(true);
    const posts = await getPostsByTag(tag.toLowerCase());
    setResults(posts);
    setLoading(false);
  };

  return (
    <div>
      <div className="sticky top-0 z-10 bg-surface-0/85 backdrop-blur-xl border-b border-[var(--border)] px-6 py-3.5">
        <h1 className="font-display font-bold text-base mb-3">Explore</h1>
        <form onSubmit={handleSearch} className="relative max-w-xl">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a5680]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts, topics, tags..."
            className="input pl-9 pr-24"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary text-xs px-3 py-1.5">Search</button>
        </form>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        {!searched ? (
          <>
            <h2 className="font-display font-semibold text-sm text-[#a09cc0] mb-4">Browse Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => handleTagClick(cat.label)}
                  className="card-hover p-4 text-left group"
                >
                  <div className="text-2xl mb-2">{cat.emoji}</div>
                  <div className="font-display font-semibold text-sm mb-0.5">{cat.label}</div>
                  <div className="text-[11px] text-[#5a5680]">Browse posts →</div>
                </button>
              ))}
            </div>
            <h2 className="font-display font-semibold text-sm text-[#a09cc0] mb-3">Trending Tags</h2>
            <div className="flex flex-wrap gap-2">
              {['DSA', 'WebDev', 'Python', 'Placement', 'CGPA', 'Resume', 'Internship', 'React', 'OS', 'DBMS', 'Hackathon', 'Project'].map((tag, i) => (
                <button key={tag} onClick={() => handleTagClick(tag)} className={['tag-purple', 'tag-green', 'tag-orange'][i % 3] + ' cursor-pointer hover:opacity-80 transition-opacity text-sm py-1.5 px-3'}>
                  #{tag}
                </button>
              ))}
            </div>
          </>
        ) : loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)}</div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="font-display font-semibold text-lg mb-2">No results found</h3>
            <p className="text-sm text-[#a09cc0] mb-4">Try different keywords or tags</p>
            <button onClick={() => { setSearched(false); setQuery(''); }} className="btn-outline text-sm">Browse Categories</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#a09cc0]">{results.length} result{results.length !== 1 ? 's' : ''} for <strong className="text-white">"{query}"</strong></p>
              <button onClick={() => { setSearched(false); setQuery(''); }} className="text-xs text-brand-400 hover:text-brand-300">Clear</button>
            </div>
            <div className="space-y-3">
              {results.map((p) => <PostCard key={p.id} post={p} currentUserId={user?.uid} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

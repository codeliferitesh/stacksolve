// src/app/page.tsx
'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Users, Star, MessageSquare, TrendingUp } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Fully Anonymous', desc: 'Never show your real name. Usernames only — your identity is always protected.' },
  { icon: Zap, title: 'Real-time Feed', desc: 'Posts, comments and likes update instantly powered by Firebase Firestore.' },
  { icon: Users, title: 'Student Community', desc: 'Built exclusively for college students to ask, help, and grow together.' },
  { icon: MessageSquare, title: 'Nested Discussions', desc: 'Threaded comments and replies keep conversations organized and useful.' },
  { icon: TrendingUp, title: 'Trending Topics', desc: 'Discover what classmates are discussing — filter by tags and categories.' },
  { icon: Star, title: 'Upvote System', desc: 'The best answers rise to the top. Mark posts as solved when you find help.' },
];

const floatingPosts = [
  { user: 'phantom_coder', text: 'Anyone explain memoization simply?', time: '2m ago', likes: 34 },
  { user: 'study_ghost', text: 'Best resources for OS preparation?', time: '5m ago', likes: 21 },
  { user: 'algo_wizard', text: 'Got rejected from 3 internships...', time: '8m ago', likes: 89 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-0 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-surface-0/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center font-display font-bold text-sm text-white">S²</div>
            <span className="font-display font-bold text-base">StackSolve</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-ghost text-sm">Sign in</Link>
            <Link href="/auth/signup" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-600/8 rounded-full blur-3xl" />
        </div>

        {/* Floating cards */}
        <div className="absolute right-8 top-32 hidden lg:flex flex-col gap-3 opacity-50">
          {floatingPosts.map((p, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, delay: i * 1, repeat: Infinity }}
              className="card p-3 text-left max-w-[220px]"
            >
              <div className="text-[11px] text-[#5a5680] mb-1">@{p.user} · {p.time}</div>
              <div className="text-[12px] text-[#a09cc0]">{p.text}</div>
              <div className="text-[11px] text-brand-400 mt-1">♥ {p.likes}</div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-600/30 bg-brand-600/8 text-brand-400 text-[12px] font-medium mb-6">
            🎓 Built for college students
          </div>

          <h1 className="font-display font-extrabold text-5xl md:text-6xl leading-tight mb-5 max-w-2xl mx-auto">
            Your <span className="gradient-text">anonymous</span> college community
          </h1>

          <p className="text-[#a09cc0] text-lg max-w-md mx-auto mb-8 leading-relaxed">
            Ask anything. Help everyone. Stay completely anonymous. A safe space for students to solve problems together.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/auth/signup" className="btn-primary text-base px-6 py-3 flex items-center gap-2">
              Get Started Free <ArrowRight size={16} />
            </Link>
            <Link href="/feed" className="btn-outline text-base px-6 py-3">
              Explore Posts
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-[#5a5680]">
            {['100% Anonymous', 'Real-time Updates', 'Firebase Secured', 'Student Safe'].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                {f}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-3xl mb-3">Everything you need</h2>
            <p className="text-[#a09cc0]">A full-featured community platform built with student privacy first.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                viewport={{ once: true }}
                className="card-hover p-6"
              >
                <div className="w-10 h-10 bg-brand-600/12 rounded-xl flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-brand-400" />
                </div>
                <h3 className="font-display font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-[#a09cc0] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center card p-12">
          <h2 className="font-display font-bold text-3xl mb-4">Ready to join?</h2>
          <p className="text-[#a09cc0] mb-8">Create your anonymous account in under 30 seconds. No real name required.</p>
          <Link href="/auth/signup" className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
            Create Anonymous Account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#5a5680]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-600 rounded-lg flex items-center justify-center font-display font-bold text-xs text-white">S²</div>
            <span>StackSolve © {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/help" className="hover:text-white transition-colors">Help</Link>
            <a href="mailto:stacksolveofficial@gmail.com" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center text-center p-6">
      <div>
        <div className="text-8xl font-display font-black text-[var(--border-2)] mb-6">404</div>
        <h1 className="font-display font-bold text-2xl mb-3">Page not found</h1>
        <p className="text-[#a09cc0] mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/feed" className="btn-primary px-6 py-2.5">Go to Feed</Link>
          <Link href="/" className="btn-outline px-6 py-2.5">Home</Link>
        </div>
      </div>
    </div>
  );
}

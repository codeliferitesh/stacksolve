import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface-0 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#a09cc0] hover:text-white mb-8 transition-colors">
          <ArrowLeft size={14} /> Back
        </Link>
        <h1 className="font-display font-bold text-3xl mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#5a5680] mb-8">Last updated: {new Date().getFullYear()}</p>
        <div className="space-y-6 text-[14px] text-[#a09cc0] leading-relaxed">
          {[
            ['Data We Collect', 'We collect: email address (for authentication only), chosen username, bio, profile image (optional), posts and comments you create.'],
            ['Data We Never Collect', 'We never ask for or store your real name. Your email is never shown to other users. We don\'t sell your data to advertisers.'],
            ['How We Use Your Data', 'Your data is used to operate your account, display your anonymous posts, and send account-related emails (verification, password reset).'],
            ['Firebase & Security', 'StackSolve uses Google Firebase for authentication and database. Your data is protected by Firebase\'s enterprise-grade security infrastructure.'],
            ['Data Deletion', 'You can permanently delete your account and all associated data from Settings → Danger Zone at any time.'],
            ['Cookies', 'We use minimal cookies only for session management. No tracking cookies or third-party analytics that expose your identity.'],
            ['Contact', 'Privacy questions? Email us at stacksolveofficial@gmail.com'],
          ].map(([title, body]) => (
            <div key={title as string}>
              <h2 className="font-display font-semibold text-base text-white mb-2">{title}</h2>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

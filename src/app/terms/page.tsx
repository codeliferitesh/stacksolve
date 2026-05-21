import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface-0 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#a09cc0] hover:text-white mb-8 transition-colors">
          <ArrowLeft size={14} /> Back
        </Link>
        <h1 className="font-display font-bold text-3xl mb-2">Terms of Service</h1>
        <p className="text-sm text-[#5a5680] mb-8">Last updated: {new Date().getFullYear()}</p>
        <div className="space-y-6 text-[14px] text-[#a09cc0] leading-relaxed">
          {[
            ['1. Acceptance of Terms', 'By creating an account on StackSolve, you agree to these Terms of Service. If you do not agree, do not use the platform.'],
            ['2. Anonymous Accounts', 'Users must create anonymous usernames. Do not use real names. StackSolve is not responsible for any information you voluntarily disclose.'],
            ['3. Acceptable Use', 'You agree not to: harass other users, post harmful or illegal content, impersonate others, spam the platform, or violate any applicable laws.'],
            ['4. Content Ownership', 'You retain ownership of content you post. By posting, you grant StackSolve a license to display your content on the platform.'],
            ['5. Account Deletion', 'You may delete your account at any time from Settings. All associated data will be permanently removed.'],
            ['6. Disclaimer', 'StackSolve is provided "as is". We are not responsible for the accuracy of user-generated content.'],
            ['7. Contact', 'For questions about these terms, contact us at stacksolveofficial@gmail.com'],
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

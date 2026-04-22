import type { Metadata } from 'next';
import './globals.css';
import TopNav from '@/components/nav/TopNav';
import { getCurrentProfile } from '@/lib/auth';

export const metadata: Metadata = {
  title: '3R Digital POD — AI Toolkit for Print on Demand',
  description:
    'AI-powered toolkit for Print on Demand creators — niche research, TM checker, BSR calculator, SEO listings, design analyzer, and more.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  return (
    <html lang="th">
      <body className="min-h-screen bg-ink-950 text-white antialiased">
        <TopNav
          userEmail={profile?.email ?? null}
          userRole={profile?.role ?? null}
        />
        <div className="h-[3px] bg-gradient-to-r from-brand-red via-brand-pink via-60% to-brand-blue-3" />
        <main>{children}</main>
        <footer className="border-t border-white/[0.07] py-8 text-center text-xs text-muted">
          <div className="font-display text-2xl tracking-widest">
            <span className="text-brand-red">3R</span>
            <span className="text-brand-blue-3">digital</span>
            <span className="text-brand-yellow">POD</span>
          </div>
          <div className="mt-2">AI Toolkit สำหรับ Print on Demand · v1.4.0</div>
          <div className="mt-1">© 2026 3R Digital Lab</div>
        </footer>
      </body>
    </html>
  );
}

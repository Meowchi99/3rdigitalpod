'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

interface TopNavProps {
  userEmail: string | null;
  userRole: UserRole | null;
}

const RESEARCH_ITEMS = [
  { href: '/trending', icon: '🔥', label: 'Trending' },
  { href: '/research', icon: '🔍', label: 'Research & Prompt' },
  { href: '/expand', icon: '🚀', label: 'Expand Prompt' },
  { href: '/seo-listing', icon: '📝', label: 'SEO Listing' },
];

const WORKFLOW_ITEMS = [
  { href: '/design-analyzer', icon: '🔬', label: 'Design Analyzer' },
  { href: '/image-listing', icon: '🖼️', label: 'Image → Listing' },
  { href: '/batch', icon: '⚡', label: 'Batch Generator' },
  { href: '/niche-finder', icon: '🎯', label: 'Niche Finder' },
];

const ANALYTICS_ITEMS = [
  { href: '/tm-checker', icon: '🛡️', label: 'TM Checker' },
  { href: '/bsr', icon: '📊', label: 'BSR → Sales' },
  { href: '/royalty', icon: '💰', label: 'Royalty' },
  { href: '/tier', icon: '📈', label: 'Tier Tracker' },
  { href: '/merch-hub', icon: '🗃️', label: 'Merch Hub' },
];

export default function TopNav({ userEmail, userRole }: TopNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = userRole === 'owner' || userRole === 'admin';

  return (
    <>
      <nav className="sticky top-0 z-50 flex h-[60px] items-center justify-between border-b border-white/[0.07] bg-ink-950/95 px-6 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-0.5 font-display text-2xl tracking-widest">
          <span className="text-brand-red">3R</span>
          <span className="text-brand-blue-3">digital</span>
          <span className="text-brand-yellow">POD</span>
        </Link>

        {/* Desktop menu */}
        <ul className="hidden items-center gap-1 lg:flex">
          <NavLink href="/" icon="🏠" label="Home" />
          <NavDropdown label="Research" icon="⚡" items={RESEARCH_ITEMS} />
          <NavDropdown label="Workflow" icon="🛠" items={WORKFLOW_ITEMS} />
          <NavDropdown label="Analytics" icon="📊" items={ANALYTICS_ITEMS} />
          <NavLink href="/owner" icon="👤" label="Owner" />
          <NavLink href="/pricing" icon="💎" label="Pricing" highlight />
          <NavLink href="/settings" icon="⚙️" label="Setting" />
          {isAdmin && (
            <NavLink href="/admin" icon="🔒" label="Admin" highlight />
          )}
        </ul>

        <div className="flex items-center gap-2">
          {userEmail ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-xs text-muted">
                {userEmail.split('@')[0]}
                {userRole && userRole !== 'user' && (
                  <span className="ml-1 rounded bg-brand-red/20 px-1.5 py-0.5 text-[10px] font-bold text-brand-red-3">
                    {userRole.toUpperCase()}
                  </span>
                )}
              </span>
              <form action="/auth/signout" method="post">
                <button className="rounded-md border border-white/[0.07] px-3 py-1.5 text-xs text-muted hover:text-white">
                  ออกจากระบบ
                </button>
              </form>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className="rounded-md border border-white/[0.07] px-4 py-1.5 text-xs font-medium text-muted hover:text-white"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-brand-yellow px-4 py-1.5 text-xs font-bold text-black hover:bg-brand-yellow-2"
              >
                สมัครฟรี
              </Link>
            </div>
          )}
          <button
            className="text-xl lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-b border-white/[0.07] bg-ink-900 px-6 py-4 lg:hidden">
          <MobileSection label="Home" href="/" />
          <MobileGroup label="🔬 Research" items={RESEARCH_ITEMS} />
          <MobileGroup label="🛠 Workflow" items={WORKFLOW_ITEMS} />
          <MobileGroup label="📊 Analytics" items={ANALYTICS_ITEMS} />
          <MobileSection label="👤 Owner" href="/owner" />
          <MobileSection label="💎 Pricing" href="/pricing" />
          <MobileSection label="⚙️ Setting" href="/settings" />
          {isAdmin && <MobileSection label="🔒 Admin" href="/admin" />}
          <div className="mt-4 border-t border-white/[0.07] pt-4">
            {userEmail ? (
              <form action="/auth/signout" method="post">
                <button className="w-full rounded-md border border-white/[0.07] py-2 text-sm">
                  ออกจากระบบ
                </button>
              </form>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 rounded-md border border-white/[0.07] py-2 text-center text-sm"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 rounded-md bg-brand-yellow py-2 text-center text-sm font-bold text-black"
                >
                  สมัครฟรี
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function NavLink({
  href,
  icon,
  label,
  highlight,
}: {
  href: string;
  icon?: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
          highlight
            ? 'bg-brand-red/15 text-brand-red-3 hover:bg-brand-red/25'
            : 'text-muted hover:bg-ink-800 hover:text-white'
        )}
      >
        {icon && <span>{icon}</span>}
        <span>{label}</span>
      </Link>
    </li>
  );
}

function NavDropdown({
  label,
  icon,
  items,
}: {
  label: string;
  icon: string;
  items: { href: string; icon: string; label: string }[];
}) {
  return (
    <li className="group relative">
      <button className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-ink-800 hover:text-white">
        <span>{icon}</span>
        <span>{label}</span>
        <span className="text-[9px] transition-transform group-hover:rotate-180">▾</span>
      </button>
      <div className="invisible absolute left-0 top-full z-50 mt-2 min-w-[220px] rounded-xl border border-white/[0.07] bg-ink-900 p-1.5 opacity-0 shadow-2xl shadow-black/50 transition-all group-hover:visible group-hover:opacity-100">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs text-muted transition-colors hover:bg-ink-800 hover:text-white"
          >
            <span className="w-5 text-center text-base">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </li>
  );
}

function MobileSection({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="block rounded-md px-3 py-2.5 text-sm font-medium text-white hover:bg-ink-800"
    >
      {label}
    </Link>
  );
}

function MobileGroup({
  label,
  items,
}: {
  label: string;
  items: { href: string; icon: string; label: string }[];
}) {
  return (
    <div className="my-2">
      <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted">
        {label}
      </div>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted hover:bg-ink-800 hover:text-white"
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );
}

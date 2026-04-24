import Link from 'next/link';
import { requireRole } from '@/lib/auth';

const ADMIN_LINKS = [
  { href: '/admin', icon: '📊', label: 'Overview' },
  { href: '/admin/winning-designs', icon: '🏆', label: 'Winning Designs' },
  { href: '/admin/sold-designs', icon: '💎', label: 'Sold Designs', ownerOnly: true },
  { href: '/admin/trends', icon: '📡', label: 'Trends' },
  { href: '/admin/owner-profile', icon: '👤', label: 'Owner Profile', ownerOnly: true },
  { href: '/admin/api-settings', icon: '🔑', label: 'API Settings' },
  { href: '/admin/users', icon: '👥', label: 'Users & Roles' },
  { href: '/admin/usage', icon: '📊', label: 'Usage Dashboard' },
  { href: '/admin/logs', icon: '📋', label: 'Logs' },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(['owner', 'admin']);

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
      <aside className="sticky top-20 hidden h-fit w-56 shrink-0 rounded-2xl border border-white/[0.07] bg-ink-900 p-3 md:block">
        <div className="border-b border-white/[0.07] pb-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Admin Panel</div>
          <div className="mt-1 text-sm font-bold">
            {profile.display_name || profile.email}
          </div>
          <span className="mt-1 inline-block rounded bg-brand-red/20 px-1.5 py-0.5 text-[10px] font-bold text-brand-red-3">
            {profile.role.toUpperCase()}
          </span>
        </div>
        <nav className="mt-3 flex flex-col gap-0.5">
          {ADMIN_LINKS.filter((l) => !l.ownerOnly || profile.role === 'owner').map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-xs text-muted transition-colors hover:bg-ink-800 hover:text-white"
            >
              <span className="w-5 text-center">{l.icon}</span>
              <span>{l.label}</span>
              {l.ownerOnly && (
                <span className="ml-auto rounded bg-brand-yellow/15 px-1.5 py-0.5 text-[9px] font-bold text-brand-yellow">
                  OWNER
                </span>
              )}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

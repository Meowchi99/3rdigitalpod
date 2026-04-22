import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  const supabase = await createClient();
  const [
    { count: usersCount },
    { count: designsCount },
    { count: trendsCount },
    { count: analysisCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('winning_designs').select('*', { count: 'exact', head: true }),
    supabase.from('trends').select('*', { count: 'exact', head: true }),
    supabase.from('design_analysis_logs').select('*', { count: 'exact', head: true }),
  ]);

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl tracking-widest">📊 ADMIN OVERVIEW</h1>
      <p className="mb-8 text-sm text-muted">ภาพรวมระบบ · คลิก card เพื่อจัดการแต่ละส่วน</p>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Users" value={usersCount || 0} color="text-brand-red-3" />
        <StatCard label="Winning Designs" value={designsCount || 0} color="text-brand-blue-3" />
        <StatCard label="Trends" value={trendsCount || 0} color="text-brand-yellow" />
        <StatCard label="Analyses" value={analysisCount || 0} color="text-brand-pink" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <AdminQuickLink href="/admin/winning-designs" icon="🏆" title="จัดการ Winning Designs" desc="เพิ่ม/แก้/ลบงานขายดี, อัปโหลดรูป, ตั้ง badge" />
        <AdminQuickLink href="/admin/trends" icon="📡" title="จัดการ Trends" desc="เพิ่มเทรนด์รายวัน/รายเดือน ตั้งค่า featured" />
        <AdminQuickLink href="/admin/owner-profile" icon="👤" title="แก้ Owner Profile" desc="ชื่อ, รูป, story, social links" />
        <AdminQuickLink href="/admin/api-settings" icon="🔑" title="API Settings" desc="เปิด/ปิด provider, model config" />
        <AdminQuickLink href="/admin/users" icon="👥" title="Users & Roles" desc="เลื่อน user เป็น admin หรือตั้งค่า plan" />
        <AdminQuickLink href="/admin/logs" icon="📋" title="Logs & Usage" desc="ดู activity, usage logs, quota" />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-ink-900 p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted">{label}</div>
      <div className={`mt-1 font-display text-3xl ${color}`}>{value}</div>
    </div>
  );
}

function AdminQuickLink({ href, icon, title, desc }: { href: string; icon: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-ink-900 p-4 transition-all hover:-translate-y-0.5 hover:border-white/15"
    >
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="text-sm font-bold">{title}</div>
        <div className="mt-0.5 text-xs text-muted">{desc}</div>
      </div>
    </Link>
  );
}

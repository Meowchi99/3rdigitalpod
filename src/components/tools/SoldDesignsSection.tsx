import { Section } from '@/components/ui';
import type { SoldDesign } from '@/types';

interface Props {
  designs: SoldDesign[];
}

/**
 * Sold Designs — social-proof grid shown on the home page before Make Me Money.
 * Accepts pre-fetched data (server-side) so the page stays dynamic and fast.
 */
export default function SoldDesignsSection({ designs }: Props) {
  if (!designs || designs.length === 0) return null;
  const list = designs.slice(0, 5);

  return (
    <Section
      title="🏆 SOLD DESIGNS"
      subtitle="ผลงานจริงที่ขายได้ — proof of work จาก 3R Digital POD"
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {list.map((d, i) => (
          <SoldCard key={d.id} design={d} index={i} />
        ))}
      </div>
    </Section>
  );
}

function SoldCard({ design, index }: { design: SoldDesign; index: number }) {
  const gradients = [
    'from-[#1a0010] to-[#300020]',
    'from-[#00102a] to-[#001845]',
    'from-[#1a1200] to-[#2a1e00]',
    'from-[#001a1a] to-[#002a2a]',
    'from-[#1a0020] to-[#280030]',
  ];

  return (
    <div className="group overflow-hidden rounded-xl border border-white/[0.07] bg-ink-900 transition-all hover:-translate-y-1 hover:border-brand-yellow/40 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
      <div
        className={`relative flex aspect-square items-center justify-center bg-gradient-to-br ${gradients[index % gradients.length]}`}
      >
        {design.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={design.image_url}
            alt={design.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="px-3 text-center font-display text-lg leading-tight tracking-widest text-brand-yellow">
            {design.title.toUpperCase().split(' ').slice(0, 3).join(' ')}
          </div>
        )}

        {design.badge_text && (
          <span className="absolute right-2 top-2 rounded-full bg-brand-yellow px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide text-black">
            {design.badge_text.toUpperCase()}
          </span>
        )}
      </div>

      <div className="p-3">
        <div className="truncate text-sm font-bold">{design.title}</div>
        {design.niche && (
          <div className="mt-0.5 truncate text-xs text-muted">{design.niche}</div>
        )}
      </div>
    </div>
  );
}

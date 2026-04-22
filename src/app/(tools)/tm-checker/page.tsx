'use client';

import { useState } from 'react';
import { ActionButton, Field, InfoPanel, Section, showToast } from '@/components/ui';

const TM_URLS: Record<string, (kw: string) => string> = {
  uspto: (kw) => `https://tmsearch.uspto.gov/search/search-information?searchInput=${encodeURIComponent(kw)}`,
  euipo: (kw) => `https://euipo.europa.eu/eSearch/#basic/1+1+1+1/${encodeURIComponent(kw)}`,
  ukipo: (kw) => `https://trademarks.ipo.gov.uk/ipo-tmcase/page/Results/1/${encodeURIComponent(kw)}`,
  dpma: (kw) => `https://register.dpma.de/DPMAregister/marke/einsteiger?idf=${encodeURIComponent(kw)}`,
  inpi: (kw) => `https://data.inpi.fr/marques?query=${encodeURIComponent(kw)}`,
  jpo: (kw) => `https://www.j-platpat.inpit.go.jp/web#/trademarks/ja/list?query=${encodeURIComponent(kw)}`,
  cipo: (kw) => `https://opic.ic.gc.ca/cipo/trademark-registrar/trademarks_search.nsf/vwSearchIntellectualProperty?OpenForm&Query=${encodeURIComponent(kw)}`,
};

const COUNTRIES = [
  { id: 'uspto', flag: '🇺🇸', name: 'USPTO (USA)' },
  { id: 'euipo', flag: '🇪🇺', name: 'EUIPO (EU)' },
  { id: 'ukipo', flag: '🇬🇧', name: 'UKIPO (UK)' },
  { id: 'dpma', flag: '🇩🇪', name: 'DPMA (DE)' },
  { id: 'inpi', flag: '🇫🇷', name: 'INPI (FR)' },
  { id: 'jpo', flag: '🇯🇵', name: 'JPO (JP)' },
  { id: 'cipo', flag: '🇨🇦', name: 'CIPO (CA)' },
];

export default function TMCheckerPage() {
  const [kw, setKw] = useState('');

  function open(country: string) {
    if (!kw.trim()) { showToast('⚠️ กรุณากรอกคำก่อน'); return; }
    window.open(TM_URLS[country](kw), '_blank');
  }
  function openAll() {
    if (!kw.trim()) { showToast('⚠️ กรุณากรอกคำก่อน'); return; }
    COUNTRIES.forEach((c) => window.open(TM_URLS[c.id](kw), '_blank'));
  }

  return (
    <Section title="🛡️ TRADEMARK CHECKER" subtitle="ตรวจสอบ Trademark 7 ประเทศก่อนอัปดีไซน์">
      <InfoPanel title="🛡️ TM Checker" subtitle="กดธงเพื่อตรวจกับสำนักงาน TM ทางการของแต่ละประเทศ">
        <div className="mb-4 flex gap-2.5">
          <Field placeholder="พิมพ์คำ / วลีที่ใช้ในดีไซน์..." value={kw} onChange={(e) => setKw(e.target.value)} className="flex-1" />
          <ActionButton variant="primary" onClick={openAll}>🌐 เปิดทั้งหมด</ActionButton>
        </div>
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map((c) => (
            <button key={c.id} onClick={() => open(c.id)} className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-ink-800 px-3.5 py-2 text-sm text-muted transition-all hover:border-white/20 hover:text-white">
              <span>{c.flag}</span><span>{c.name}</span>
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-lg bg-ink-800 p-3.5 text-xs leading-relaxed text-muted">
          ⚠️ การตรวจ TM นี้เป็นการเปิดฐาน TM ทางการของแต่ละประเทศ ผลลัพธ์ขึ้นอยู่กับฐานข้อมูลนั้น
        </div>
      </InfoPanel>
    </Section>
  );
}

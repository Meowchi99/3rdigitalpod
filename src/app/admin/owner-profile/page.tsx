'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ActionButton, Field, InfoPanel, showToast, TextareaField } from '@/components/ui';
import type { OwnerProfile } from '@/types';

export default function AdminOwnerProfile() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Partial<OwnerProfile>>({});

  async function load() {
    const { data } = await supabase.from('owner_profile').select('*').eq('id', 1).single();
    if (data) setProfile(data as OwnerProfile);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    const { error } = await supabase
      .from('owner_profile')
      .update({
        display_name: profile.display_name,
        role_title: profile.role_title,
        intro: profile.intro,
        story: profile.story,
        avatar_url: profile.avatar_url,
        banner_url: profile.banner_url,
        social_links: profile.social_links ?? {},
      })
      .eq('id', 1);
    if (error) return showToast('❌ Failed: ' + error.message);
    showToast('✅ Saved');
  }

  function setSocial(key: string, value: string) {
    setProfile({
      ...profile,
      social_links: { ...(profile.social_links ?? {}), [key]: value },
    });
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl tracking-widest">👤 OWNER PROFILE</h1>

      <InfoPanel title="Edit Owner Profile">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Display Name" value={profile.display_name || ''} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} />
          <Field label="Role Title" value={profile.role_title || ''} onChange={(e) => setProfile({ ...profile, role_title: e.target.value })} />
          <Field label="Avatar URL" value={profile.avatar_url || ''} onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })} />
          <Field label="Banner URL" value={profile.banner_url || ''} onChange={(e) => setProfile({ ...profile, banner_url: e.target.value })} />
        </div>
        <div className="mt-4">
          <TextareaField label="Intro" rows={3} value={profile.intro || ''} onChange={(e) => setProfile({ ...profile, intro: e.target.value })} />
        </div>
        <div className="mt-4">
          <TextareaField label="Story" rows={5} value={profile.story || ''} onChange={(e) => setProfile({ ...profile, story: e.target.value })} />
        </div>

        <div className="mt-5 border-t border-white/[0.07] pt-4">
          <div className="mb-3 text-sm font-bold">🔗 Social Links</div>
          <div className="grid gap-3 md:grid-cols-2">
            {['website', 'facebook', 'twitter', 'instagram', 'youtube', 'tiktok'].map((key) => (
              <Field
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                value={(profile.social_links || {})[key] || ''}
                onChange={(e) => setSocial(key, e.target.value)}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <ActionButton variant="primary" onClick={save}>💾 บันทึก</ActionButton>
        </div>
      </InfoPanel>
    </div>
  );
}

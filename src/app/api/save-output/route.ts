import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { OutputType } from '@/types';

const VALID_TYPES: OutputType[] = ['prompt', 'listing', 'batch', 'analysis', 'niche'];

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'AUTH_REQUIRED', message: 'ต้องล็อกอินก่อนเซฟ' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { output_type, title, input_json, output_json } = body;

    if (!output_type || !VALID_TYPES.includes(output_type)) {
      return NextResponse.json({ error: 'Invalid output_type' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('saved_outputs')
      .insert({
        user_id: user.id,
        output_type,
        title: title || null,
        input_json: input_json || {},
        output_json: output_json || {},
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ items: [] });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));

    let query = supabase
      .from('saved_outputs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type && VALID_TYPES.includes(type as OutputType)) {
      query = query.eq('output_type', type as OutputType);
    }

    const { data } = await query;
    return NextResponse.json({ items: data || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

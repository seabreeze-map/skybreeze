import { saveAllData } from '@/lib/data';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = await saveAllData(supabase, body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

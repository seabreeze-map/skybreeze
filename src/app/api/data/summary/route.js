import { getAllDashboardData } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await getAllDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Summary error:', error);
    return NextResponse.json({ error: error.message, isEmpty: true }, { status: 500 });
  }
}

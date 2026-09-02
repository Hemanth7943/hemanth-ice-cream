import { NextResponse } from 'next/server';
import { FlavourModel } from '@/models/FlavourModel';

export async function GET() {
  try {
    const flavours = await FlavourModel.getAllActiveFlavours();
    return NextResponse.json({ success: true, data: flavours });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch catalog' },
      { status: 500 }
    );
  }
}

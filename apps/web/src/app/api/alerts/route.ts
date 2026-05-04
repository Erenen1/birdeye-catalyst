import { NextRequest, NextResponse } from 'next/server';
import { AlertModel } from '@chaintrigger/shared';
import dbConnect from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  try {
    await dbConnect();

    const query = userId === 'GLOBAL' ? {} : { userId };
    const alerts = await AlertModel.find(query)
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

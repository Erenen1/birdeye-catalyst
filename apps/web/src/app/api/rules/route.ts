import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { RuleModel } from '@chaintrigger/shared';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const rules = await RuleModel.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json(rules);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Validate basic requirements
    if (!body.name || !body.triggerType || !body.conditions || !body.action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newRule = await RuleModel.create({
      ...body,
      userId: body.userId,
      isActive: true,
    });

    return NextResponse.json(newRule, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

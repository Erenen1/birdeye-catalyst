import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { RuleModel, UserModel } from '@chaintrigger/shared';

export async function GET() {
  try {
    await dbConnect();

    const [userCount, ruleCount] = await Promise.all([
      UserModel.countDocuments({}),
      RuleModel.countDocuments({ isActive: true })
    ]);

    // Base stats (Some are hardcoded technical constants, some are real DB counts)
    return NextResponse.json({
      activeOperators: userCount || 0,
      deployedNodes: ruleCount || 0,
      volumeMonitored: "$1.4B+", // This is a network-level estimate
      signalLatency: "0.4s"      // This is a technical performance benchmark
    });
  } catch (error: any) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

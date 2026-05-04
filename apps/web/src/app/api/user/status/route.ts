import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { UserModel } from '@chaintrigger/shared';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI!);
    }

    let user = await UserModel.findOne({ walletAddress: address.toLowerCase() });
    
    if (!user) {
      // Create user if not exists
      user = await UserModel.create({
        walletAddress: address.toLowerCase(),
        tier: 'free',
        activeRuleCount: 0
      });
    }

    return NextResponse.json({
      isConnected: !!user.telegramChatId,
      telegramUsername: user.telegramUsername,
      telegramChatId: user.telegramChatId
    });
  } catch (error) {
    console.error('Error fetching user status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

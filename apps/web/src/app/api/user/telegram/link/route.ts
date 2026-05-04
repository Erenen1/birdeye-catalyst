import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { UserModel } from '@chaintrigger/shared';


export async function POST(request: Request) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI!);
    }

    // Generate a random 8-character token
    const token = `verify_${Math.random().toString(36).substring(2, 10)}`;

    const user = await UserModel.findOneAndUpdate(
      { walletAddress: address.toLowerCase() },
      { telegramVerificationToken: token },
      { upsert: true, new: true }
    );

    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'ChainTriggerBot';
    const link = `https://t.me/${botUsername}?start=${token}`;

    return NextResponse.json({ link, token });
  } catch (error) {
    console.error('Error linking telegram:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

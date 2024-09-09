import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb';
import Scores from '../../../../models/scores_el';
import User from '../../../../models/user';
import { signOut, useSession } from "next-auth/react";

export async function POST(req) {
  try {
   
    const { user_type, number_no } = await req.json();

    await connectMongoDB();
    await Scores.create({ user_type, number_no });

    return NextResponse.json({ message: 'Scores added successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error while adding score:', error);
    return NextResponse.json({ message: 'An error occurred while adding the score' }, { status: 500 });
  }
}

export async function GET() {
  await connectMongoDB();
  const posts = await User.find({});
  return NextResponse.json({ posts });
}

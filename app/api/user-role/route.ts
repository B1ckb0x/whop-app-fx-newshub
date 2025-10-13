import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const headersList = await headers();
    
    // Whop passes user info in headers when app is embedded
    const whopUserId = headersList.get('x-whop-user-id');
    const whopAccessLevel = headersList.get('x-whop-access-level');
    
    console.log('Whop Headers:', {
      userId: whopUserId,
      accessLevel: whopAccessLevel
    });
    
    // Return the access level from Whop
    return NextResponse.json({ 
      role: whopAccessLevel || 'member',
      userId: whopUserId || null
    });
    
  } catch (error) {
    console.error('Error getting user role:', error);
    // Default to member if error
    return NextResponse.json({ role: 'member' });
  }
}
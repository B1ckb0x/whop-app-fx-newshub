import { NextResponse } from 'next/server';
import { validateToken } from '@whop-apps/sdk';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get token from URL params - Whop passes this
    const token = searchParams.get('whop_token') || '';
    
    if (!token) {
      console.log('No Whop token found');
      return NextResponse.json({ role: 'member', userId: null });
    }
    
    // Validate token with Whop API
    const result = await validateToken({ 
      headers: request.headers 
    });
    
    // Get access level from validated result - use default if not available
    const accessLevel = 'member'; // Default role since we can't determine from result
    
    console.log('User validated:', {
      userId: result.userId,
      accessLevel: accessLevel
    });
    
    return NextResponse.json({ 
      role: accessLevel,
      userId: result.userId
    });
    
  } catch (error) {
    console.error('Error validating user:', error);
    return NextResponse.json({ role: 'member', userId: null });
  }
}
import { NextResponse } from 'next/server';
import { validateToken } from '@whop-apps/sdk';
import { whopSdk } from '@/lib/whop-sdk';

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
    
    if (!result.userId) {
      console.log('No userId found in validation result');
      return NextResponse.json({ role: 'member', userId: null });
    }
    
    // Check user's access level to the experience
    try {
      const experienceId = process.env.NEXT_PUBLIC_WHOP_EXPERIENCE_ID;
      
      if (!experienceId) {
        console.log('No experience ID configured');
        return NextResponse.json({ 
          role: 'member',
          userId: result.userId
        });
      }
      
      const accessResult = await whopSdk.access.checkIfUserHasAccessToExperience({
        userId: result.userId,
        experienceId: experienceId
      });
      
      // Map Whop access levels to our role system
      let userRole = 'member';
      if (accessResult.accessLevel === 'admin') {
        userRole = 'admin';
      } else if (accessResult.accessLevel === 'customer') {
        userRole = 'member';
      } else {
        userRole = 'member'; // no_access or other cases
      }
      
      console.log('User access checked:', {
        userId: result.userId,
        accessLevel: accessResult.accessLevel,
        role: userRole
      });
      
      return NextResponse.json({ 
        role: userRole,
        userId: result.userId
      });
    } catch (sdkError) {
      console.error('Error checking user access:', sdkError);
      // Fallback to member if we can't check access
      return NextResponse.json({ 
        role: 'member',
        userId: result.userId
      });
    }
    
  } catch (error) {
    console.error('Error validating user:', error);
    return NextResponse.json({ role: 'member', userId: null });
  }
}
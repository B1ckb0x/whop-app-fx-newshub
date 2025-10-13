import { NextResponse } from 'next/server';
import { validateToken } from '@whop-apps/sdk';
import { whopSdk } from '@/lib/whop-sdk';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get token from URL params - Whop passes this
    const token = searchParams.get('whop_token') || '';
    
    console.log('=== USER ROLE API DEBUG ===');
    console.log('Token found:', !!token);
    console.log('Experience ID:', process.env.NEXT_PUBLIC_WHOP_EXPERIENCE_ID);
    console.log('App ID:', process.env.NEXT_PUBLIC_WHOP_APP_ID);
    console.log('API Key set:', !!process.env.WHOP_API_KEY);
    
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
    
    // Check user's role in the company
    try {
      const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
      
      if (!companyId) {
        console.log('No company ID configured');
        return NextResponse.json({ 
          role: 'member',
          userId: result.userId
        });
      }
      
      // Get user details to check their role
      const user = await whopSdk.users.getUser({ userId: result.userId });
      
      console.log('User details:', {
        userId: result.userId,
        userName: user.name,
        companyId: companyId
      });
      
      // Use Whop's actual user_type_id system for proper role detection
      let userRole = 'member';
      
      // Check user_type_id from Whop's API
      // 100: Staff, 200: Approver, 210: Approver plus add, 220: Approver plus add edit cancel
      // 300: Super user, 310: Super user with staff hub
      const adminUserTypes = [200, 210, 220, 300, 310];
      
      // Get user_type_id from the user object
      const userTypeId = (user as any).user_type_id;
      
      if (userTypeId && adminUserTypes.includes(userTypeId)) {
        userRole = 'admin';
      }
      
      console.log('Whop role detection:', {
        userId: result.userId,
        userName: user.name,
        userTypeId: userTypeId,
        isAdmin: adminUserTypes.includes(userTypeId),
        finalRole: userRole
      });
      
      console.log('User role determined:', {
        userId: result.userId,
        role: userRole,
        userName: user.name
      });
      
      return NextResponse.json({ 
        role: userRole,
        userId: result.userId
      });
    } catch (sdkError) {
      console.error('Error checking user role:', sdkError);
      // Fallback to member if we can't check role
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
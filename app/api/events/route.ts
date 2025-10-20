// import { NextResponse } from 'next/server';
// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// const supabase = createClient(supabaseUrl, supabaseServiceKey);

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const date = searchParams.get('date'); // Optional: filter by specific date

//     let query = supabase
//       .from('forex_events')
//       .select('*')
//       .order('event_date', { ascending: true })
//       .order('event_time', { ascending: true });

//     // If date provided, filter by that date
//     if (date) {
//       query = query.eq('event_date', date);
//     } else {
//       // Otherwise get next 7 days
//       const today = new Date().toISOString().split('T')[0];
//       const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
//       query = query.gte('event_date', today).lte('event_date', nextWeek);
//     }

//     const { data, error } = await query;

//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json({ events: data || [] });
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Failed to fetch events' },
//       { status: 500 }
//     );
//   }
// }



import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const range = searchParams.get('range');

    let query = supabase
      .from('forex_events')
      .select('*')
      .order('event_date', { ascending: true })
      .order('event_time', { ascending: true });

    if (date) {
      // Filter by specific date
      query = query.eq('event_date', date);
    } else if (range === 'extended') {
      // Get past 30 days to future 7 days
      const today = new Date();
      const past30Days = new Date(today);
      past30Days.setDate(today.getDate() - 30);
      const future7Days = new Date(today);
      future7Days.setDate(today.getDate() + 7);
      
      query = query
        .gte('event_date', past30Days.toISOString().split('T')[0])
        .lte('event_date', future7Days.toISOString().split('T')[0]);
    } else {
      // Default: next 7 days only
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      query = query.gte('event_date', today).lte('event_date', nextWeek);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ events: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
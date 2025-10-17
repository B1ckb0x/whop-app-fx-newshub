// import { NextResponse } from 'next/server';
// import axios from 'axios';
// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// const supabase = createClient(supabaseUrl, supabaseServiceKey);

// const FCS_API_KEY = process.env.FCS_API_KEY;

// interface ForexEvent {
//   event_date: string;
//   event_time: string;
//   currency: string;
//   event_name: string;
//   impact: string;
//   forecast: string;
//   previous: string;
//   actual: string;
// }

// export async function GET() {
//   try {
//     if (!FCS_API_KEY) {
//       return NextResponse.json(
//         { error: 'FCS_API_KEY not configured' },
//         { status: 500 }
//       );
//     }

//     console.log('Fetching forex calendar from FCS API...');

//     // Calculate date range (next 7 days)
//     const today = new Date();
//     const endDate = new Date(today);
//     endDate.setDate(today.getDate() + 7);

//     const formatDate = (date: Date) => {
//       const year = date.getFullYear();
//       const month = (date.getMonth() + 1).toString().padStart(2, '0');
//       const day = date.getDate().toString().padStart(2, '0');
//       return `${year}-${month}-${day}`;
//     };

//     const fromDate = formatDate(today);
//     const toDate = formatDate(endDate);

//     console.log(`Fetching events from ${fromDate} to ${toDate}`);

//     // FCS API endpoint for economic calendar (note: it's economy_cal not economy_calendar)
//     const url = `https://fcsapi.com/api-v3/forex/economy_cal`;
    
//     const response = await axios.get(url, {
//       params: {
//         access_key: FCS_API_KEY,
//         from: fromDate,
//         to: toDate,
//       },
//       timeout: 15000,
//     });

//     if (response.data.status === false) {
//       throw new Error(response.data.msg || 'FCS API returned error');
//     }

//     console.log('FCS API Response:', JSON.stringify(response.data, null, 2));

//     const events: ForexEvent[] = [];

//     // Parse FCS API response
//     const seenEvents = new Map(); // Track unique events with data
    
//     if (response.data.response && Array.isArray(response.data.response)) {
//       for (const event of response.data.response) {
//         // Parse date and time from FCS format (YYYY-MM-DD HH:MM:SS)
//         if (!event.date) continue;
        
//         const dateTimeParts = event.date.split(' ');
//         const eventDate = dateTimeParts[0]; // YYYY-MM-DD
//         const eventTime = dateTimeParts[1] ? dateTimeParts[1].substring(0, 5) : '00:00'; // HH:MM

//         // Map impact level
//         let impact = 'low';
//         const importance = parseInt(event.importance || '0');
//         if (importance >= 2) impact = 'high';
//         else if (importance === 1) impact = 'medium';

//         // Extract currency from country
//         const currency = event.currency || mapCountryToCurrency(event.country || '');

//         if (eventDate && currency && event.title) {
//           // Create unique key to prevent duplicates
//           const uniqueKey = `${eventDate}|${eventTime}|${currency}|${event.title.trim()}`;
          
//           // Only add if not already seen
//           if (!seenEvents.has(uniqueKey)) {
//             seenEvents.set(uniqueKey, {
//               event_date: eventDate,
//               event_time: eventTime,
//               currency,
//               event_name: event.title.trim(),
//               impact,
//               forecast: event.forecast || '-',
//               previous: event.previous || '-',
//               actual: event.actual || null,
//             });
//           }
//         }
//       }
//     }

//     // Convert Map to Array
//     events.push(...seenEvents.values());

//     console.log(`Fetched ${events.length} events from FCS API`);

//     if (events.length === 0) {
//       return NextResponse.json({
//         success: true,
//         message: 'No events found for the date range',
//         events_count: 0,
//         date_range: `${fromDate} to ${toDate}`,
//       });
//     }

//     // Clear old events (older than 7 days)
//     const weekAgo = new Date(today);
//     weekAgo.setDate(today.getDate() - 7);
    
//     await supabase
//       .from('forex_events')
//       .delete()
//       .lt('event_date', formatDate(weekAgo));

//     // Insert new events into database
//     const { error } = await supabase
//       .from('forex_events')
//       .upsert(events, {
//         onConflict: 'event_date,event_time,currency,event_name',
//         ignoreDuplicates: false,
//       });

//     if (error) {
//       console.error('Database error:', error);
//       return NextResponse.json(
//         { error: 'Failed to save events to database', details: error },
//         { status: 500 }
//       );
//     }

//     console.log('Events saved to database successfully');

//     return NextResponse.json({
//       success: true,
//       source: 'FCS API',
//       message: `Successfully fetched and saved ${events.length} events`,
//       events_count: events.length,
//       date_range: `${fromDate} to ${toDate}`,
//       sample_events: events.slice(0, 5),
//     });

//   } catch (error) {
//     console.error('FCS API scraping failed:', error);
//     return NextResponse.json(
//       { 
//         error: 'Failed to fetch from FCS API',
//         details: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     );
//   }
// }

// // Helper function to map country names to currency codes
// function mapCountryToCurrency(country: string): string {
//   const countryMap: { [key: string]: string } = {
//     'United States': 'USD',
//     'USA': 'USD',
//     'US': 'USD',
//     'Eurozone': 'EUR',
//     'Euro Zone': 'EUR',
//     'Europe': 'EUR',
//     'EUR': 'EUR',
//     'United Kingdom': 'GBP',
//     'UK': 'GBP',
//     'Britain': 'GBP',
//     'Japan': 'JPY',
//     'Australia': 'AUD',
//     'Canada': 'CAD',
//     'Switzerland': 'CHF',
//     'New Zealand': 'NZD',
//     'China': 'CNY',
//     'Germany': 'EUR',
//     'France': 'EUR',
//     'Italy': 'EUR',
//     'Spain': 'EUR',
//   };

//   // Check if it's already a currency code
//   if (/^[A-Z]{3}$/.test(country)) {
//     return country;
//   }

//   // Try to find mapping
//   for (const [key, value] of Object.entries(countryMap)) {
//     if (country.toLowerCase().includes(key.toLowerCase())) {
//       return value;
//     }
//   }

//   // Default fallback
//   return country.substring(0, 3).toUpperCase();
// }



import { NextResponse } from 'next/server';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const FCS_API_KEY = process.env.FCS_API_KEY;

interface ForexEvent {
  event_date: string;
  event_time: string;
  currency: string;
  event_name: string;
  impact: string;
  forecast: string;
  previous: string;
  actual: string;
}

export async function GET(request: Request) {
  // Security: Only allow Vercel Cron or manual calls with secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // Check if it's from Vercel Cron or has correct secret
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!FCS_API_KEY) {
      return NextResponse.json(
        { error: 'FCS_API_KEY not configured' },
        { status: 500 }
      );
    }

    console.log('Fetching forex calendar from FCS API...');

    // Calculate date range (next 7 days)
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 7);

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const fromDate = formatDate(today);
    const toDate = formatDate(endDate);

    console.log(`Fetching events from ${fromDate} to ${toDate}`);

    // FCS API endpoint for economic calendar
    const url = `https://fcsapi.com/api-v3/forex/economy_cal`;
    
    const response = await axios.get(url, {
      params: {
        access_key: FCS_API_KEY,
        from: fromDate,
        to: toDate,
      },
      timeout: 15000,
    });

    if (response.data.status === false) {
      throw new Error(response.data.msg || 'FCS API returned error');
    }

    const events: ForexEvent[] = [];

    // Parse FCS API response
    const seenEvents = new Map();
    
    if (response.data.response && Array.isArray(response.data.response)) {
      for (const event of response.data.response) {
        if (!event.date) continue;
        
        const dateTimeParts = event.date.split(' ');
        const eventDate = dateTimeParts[0];
        const eventTime = dateTimeParts[1] ? dateTimeParts[1].substring(0, 5) : '00:00';

        // Map impact level
        let impact = 'low';
        const importance = parseInt(event.importance || '0');
        if (importance >= 2) impact = 'high';
        else if (importance === 1) impact = 'medium';

        const currency = event.currency || mapCountryToCurrency(event.country || '');

        if (eventDate && currency && event.title) {
          const uniqueKey = `${eventDate}|${eventTime}|${currency}|${event.title.trim()}`;
          
          if (!seenEvents.has(uniqueKey)) {
            seenEvents.set(uniqueKey, {
              event_date: eventDate,
              event_time: eventTime,
              currency,
              event_name: event.title.trim(),
              impact,
              forecast: event.forecast || '-',
              previous: event.previous || '-',
              actual: event.actual || null,
            });
          }
        }
      }
    }

    events.push(...seenEvents.values());

    console.log(`Fetched ${events.length} events from FCS API`);

    if (events.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No events found for the date range',
        events_count: 0,
        date_range: `${fromDate} to ${toDate}`,
      });
    }

    // Clear old events (older than 7 days)
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    
    await supabase
      .from('forex_events')
      .delete()
      .lt('event_date', formatDate(weekAgo));

    // Insert new events into database
    const { error } = await supabase
      .from('forex_events')
      .upsert(events, {
        onConflict: 'event_date,event_time,currency,event_name',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save events to database', details: error },
        { status: 500 }
      );
    }

    console.log('Events saved to database successfully');

    return NextResponse.json({
      success: true,
      source: 'FCS API',
      message: `Successfully fetched and saved ${events.length} events`,
      events_count: events.length,
      date_range: `${fromDate} to ${toDate}`,
      sample_events: events.slice(0, 5),
    });

  } catch (error) {
    console.error('FCS API scraping failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch from FCS API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function mapCountryToCurrency(country: string): string {
  const countryMap: { [key: string]: string } = {
    'United States': 'USD',
    'USA': 'USD',
    'US': 'USD',
    'Eurozone': 'EUR',
    'Euro Zone': 'EUR',
    'Europe': 'EUR',
    'EUR': 'EUR',
    'United Kingdom': 'GBP',
    'UK': 'GBP',
    'Britain': 'GBP',
    'Japan': 'JPY',
    'Australia': 'AUD',
    'Canada': 'CAD',
    'Switzerland': 'CHF',
    'New Zealand': 'NZD',
    'China': 'CNY',
    'Germany': 'EUR',
    'France': 'EUR',
    'Italy': 'EUR',
    'Spain': 'EUR',
  };

  if (/^[A-Z]{3}$/.test(country)) {
    return country;
  }

  for (const [key, value] of Object.entries(countryMap)) {
    if (country.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  return country.substring(0, 3).toUpperCase();
}
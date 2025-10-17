'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, Filter, ChevronLeft, ChevronRight, Globe, AlertCircle } from 'lucide-react';

interface ForexEvent {
  id: number;
  event_date: string;
  event_time: string;
  currency: string;
  event_name: string;
  impact: string;
  forecast: string;
  previous: string;
  actual: string | null;
}

// Popular timezones
const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
];

const getWeekDates = (weekOffset = 0) => {
  const today = new Date();
  today.setDate(today.getDate() + (weekOffset * 7));
  const currentDay = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDay + 1);
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  return dates;
};

const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

const getDateLabel = (date: Date) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
};

export default function ForexCalendar() {
  const [selectedDay, setSelectedDay] = useState(formatDate(new Date()));
  const [filterImpact, setFilterImpact] = useState('all');
  const [filterCurrency, setFilterCurrency] = useState('all');
  const [allEvents, setAllEvents] = useState<ForexEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [timezone, setTimezone] = useState('UTC');
  const [showAllEvents, setShowAllEvents] = useState(false);
  const weekDates = getWeekDates(weekOffset);

  const handlePreviousWeek = () => {
    setWeekOffset(prev => prev - 1);
  };

  const handleNextWeek = () => {
    setWeekOffset(prev => prev + 1);
  };

  const handleThisWeek = () => {
    setWeekOffset(0);
    setSelectedDay(formatDate(new Date()));
  };

  // Convert UTC time to selected timezone and get converted date/time
  const convertToTimezone = (dateStr: string, timeStr: string) => {
    try {
      const timeParts = timeStr.split(':');
      const hours = timeParts[0].padStart(2, '0');
      const minutes = timeParts[1]?.padStart(2, '0') || '00';
      const seconds = timeParts[2]?.padStart(2, '0') || '00';
      
      const utcDateTime = `${dateStr}T${hours}:${minutes}:${seconds}Z`;
      const date = new Date(utcDateTime);
      
      if (isNaN(date.getTime())) {
        return { time: timeStr, date: dateStr };
      }
      
      const timeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const dateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
      const convertedTime = timeFormatter.format(date);
      const dateParts = dateFormatter.format(date).split('/');
      const convertedDate = `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`;
      
      return { time: convertedTime, date: convertedDate };
    } catch (error) {
      console.error('Timezone conversion error:', error);
      return { time: timeStr, date: dateStr };
    }
  };

  // Get events with timezone-adjusted dates
  const getAdjustedEvents = () => {
    return allEvents.map(event => {
      const converted = convertToTimezone(event.event_date, event.event_time);
      return {
        ...event,
        adjusted_date: converted.date,
        adjusted_time: converted.time
      };
    });
  };

  const adjustedEvents = getAdjustedEvents();

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/events');
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setAllEvents(data.events || []);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const impactColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  const impactTextColors = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-green-600'
  };

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];

  // Major forex currencies for filtering
  const majorForexCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];

  const filteredEvents = adjustedEvents.filter(event => {
    const matchesDate = event.adjusted_date === selectedDay;
    const matchesImpact = filterImpact === 'all' || event.impact === filterImpact;
    const matchesCurrency = filterCurrency === 'all' || event.currency === filterCurrency;
    
    // Filter to show only forex-relevant currencies unless "Show All" is enabled
    const isForexRelevant = showAllEvents || majorForexCurrencies.includes(event.currency);
    
    // By default, only show medium and high impact events (yellow, orange, red)
    // Show low impact (green) only when "Show All Events" is enabled
    const isRelevantImpact = showAllEvents || event.impact === 'medium' || event.impact === 'high';
    
    return matchesDate && matchesImpact && matchesCurrency && isForexRelevant && isRelevantImpact;
  });

  const getEventsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return adjustedEvents.filter(event => {
      const isForexRelevant = showAllEvents || majorForexCurrencies.includes(event.currency);
      const isRelevantImpact = showAllEvents || event.impact === 'medium' || event.impact === 'high';
      return event.adjusted_date === dateStr && isForexRelevant && isRelevantImpact;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">FX NewsHub</h1>
                <p className="text-sm text-slate-400">Economic Calendar</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Timezone */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select 
                value={filterImpact}
                onChange={(e) => setFilterImpact(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Impact</option>
                <option value="high">High Impact</option>
                <option value="medium">Medium Impact</option>
                <option value="low">Low Impact</option>
              </select>
            </div>
            <select 
              value={filterCurrency}
              onChange={(e) => setFilterCurrency(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Currencies</option>
              {currencies.map(curr => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
            
            {/* Timezone Selector */}
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-slate-400" />
              <select 
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                {timezones.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>

            {/* Show All Events Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAllEvents}
                onChange={(e) => setShowAllEvents(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700"
              />
              <span className="text-sm text-slate-300">Show All Events</span>
            </label>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousWeek}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleThisWeek}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 text-sm font-medium"
            >
              This Week
            </button>
            <button
              onClick={handleNextWeek}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Week View */}
        <div className="grid grid-cols-7 gap-2 mb-8">
          {weekDates.map((date, index) => {
            const dateStr = formatDate(date);
            const isSelected = dateStr === selectedDay;
            const eventsCount = getEventsForDate(date).length;
            const isToday = formatDate(new Date()) === dateStr;
            
            return (
              <button
                key={index}
                onClick={() => setSelectedDay(dateStr)}
                className={`p-4 rounded-xl transition-all ${
                  isSelected 
                    ? 'bg-blue-600 shadow-lg shadow-blue-500/50' 
                    : 'bg-slate-800 hover:bg-slate-700'
                } ${isToday ? 'ring-2 ring-blue-400' : ''}`}
              >
                <div className="text-sm font-medium mb-1">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-2xl font-bold mb-2">{date.getDate()}</div>
                <div className="flex items-center justify-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span className="text-xs">{eventsCount}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Day Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            {getDateLabel(weekDates.find(d => formatDate(d) === selectedDay) || new Date())}
          </h2>
          <p className="text-slate-400">{filteredEvents.length} events scheduled</p>
        </div>

        {/* Events List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 bg-slate-800/50 rounded-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p className="text-slate-400">Loading events...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-red-900/20 border border-red-500/50 rounded-xl">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
              <p className="text-red-400 font-semibold mb-2">Failed to Load Events</p>
              <p className="text-slate-400 text-sm mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/50 rounded-xl">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-slate-400">No events scheduled for this day</p>
            </div>
          ) : (
            filteredEvents.map(event => (
              <div 
                key={event.id}
                className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-5 hover:bg-slate-800 transition-all border border-slate-700 hover:border-slate-600"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center min-w-[80px]">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="font-mono text-sm">
                        {event.adjusted_time}
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-slate-700 rounded-full text-sm font-semibold">
                      {event.currency}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-2 h-2 rounded-full ${impactColors[event.impact as keyof typeof impactColors]}`} />
                      <h3 className="font-semibold text-lg">{event.event_name}</h3>
                      <span className={`text-xs uppercase font-semibold ${impactTextColors[event.impact as keyof typeof impactTextColors]}`}>
                        {event.impact}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Forecast</div>
                        <div className="font-mono text-sm">{event.forecast}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Previous</div>
                        <div className="font-mono text-sm">{event.previous}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Actual</div>
                        <div className="font-mono text-sm">{event.actual || '-'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
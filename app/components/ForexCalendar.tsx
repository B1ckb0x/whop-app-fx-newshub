'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, Filter, Settings } from 'lucide-react';

// Mock data - we'll replace this with real API data
const mockEvents = [
  {
    id: 1,
    time: '08:30',
    currency: 'USD',
    event: 'Non-Farm Payrolls',
    impact: 'high',
    forecast: '180K',
    previous: '175K',
    actual: null,
    date: '2025-10-10'
  },
  {
    id: 2,
    time: '10:00',
    currency: 'EUR',
    event: 'GDP Growth Rate',
    impact: 'medium',
    forecast: '0.3%',
    previous: '0.2%',
    actual: null,
    date: '2025-10-10'
  },
  {
    id: 3,
    time: '14:00',
    currency: 'GBP',
    event: 'Bank of England Statement',
    impact: 'high',
    forecast: '-',
    previous: '-',
    actual: null,
    date: '2025-10-10'
  },
  {
    id: 4,
    time: '09:30',
    currency: 'USD',
    event: 'Unemployment Rate',
    impact: 'high',
    forecast: '4.1%',
    previous: '4.2%',
    actual: null,
    date: '2025-10-11'
  },
  {
    id: 5,
    time: '12:00',
    currency: 'EUR',
    event: 'ECB Press Conference',
    impact: 'high',
    forecast: '-',
    previous: '-',
    actual: null,
    date: '2025-10-11'
  },
  {
    id: 6,
    time: '13:30',
    currency: 'CAD',
    event: 'Employment Change',
    impact: 'medium',
    forecast: '25K',
    previous: '22K',
    actual: null,
    date: '2025-10-12'
  }
];

const getWeekDates = () => {
  const today = new Date();
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
  const [showSettings, setShowSettings] = useState(false);
  const [messageTime, setMessageTime] = useState('08:00');
  const weekDates = getWeekDates();

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

  const filteredEvents = mockEvents.filter(event => {
    const matchesDate = event.date === selectedDay;
    const matchesImpact = filterImpact === 'all' || event.impact === filterImpact;
    const matchesCurrency = filterCurrency === 'all' || event.currency === filterCurrency;
    return matchesDate && matchesImpact && matchesCurrency;
  });

  const getEventsForDate = (date: Date) => {
    return mockEvents.filter(event => event.date === formatDate(date));
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
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-slate-800/90 backdrop-blur-lg border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h3 className="text-lg font-semibold mb-3">Daily Message Settings</h3>
            <div className="flex items-center gap-4">
              <label className="text-sm text-slate-300">Send daily summary at:</label>
              <input 
                type="time" 
                value={messageTime}
                onChange={(e) => setMessageTime(e.target.value)}
                className="px-3 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
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
          {filteredEvents.length === 0 ? (
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
                      <span className="font-mono text-sm">{event.time}</span>
                    </div>
                    <span className="px-3 py-1 bg-slate-700 rounded-full text-sm font-semibold">
                      {event.currency}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-2 h-2 rounded-full ${impactColors[event.impact as keyof typeof impactColors]}`} />
                      <h3 className="font-semibold text-lg">{event.event}</h3>
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
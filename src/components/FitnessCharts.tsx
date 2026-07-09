'use client';

import { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Activity, TrendingUp, Calendar, Target } from 'lucide-react';

interface Run {
  id: string;
  date: string;
  distanceKm: number;
  durationSec: number;
  notes?: string;
  pace?: string;
}

interface Lift {
  id: string;
  date: string;
  movements: {
    name: string;
    sets: { weight: number; reps: number; }[];
  }[];
}

interface Props {
  runs: Run[];
  lifts: Lift[];
}

export default function FitnessCharts({ runs, lifts }: Props) {
  const [activeTab, setActiveTab] = useState<'runs' | 'lifts'>('runs');

  // Process running data
  const runningData = runs
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((run) => ({
      date: new Date(run.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      distance: run.distanceKm,
      pace: run.durationSec / 60 / run.distanceKm, // minutes per km
      duration: run.durationSec / 60, // minutes
    }));

  // Process lifting data - calculate volume by movement
  const liftingData = lifts
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((session) => {
      const totalVolume = session.movements.reduce((total, movement) => {
        const movementVolume = movement.sets.reduce((sum, set) => 
          sum + (set.weight * set.reps), 0);
        return total + movementVolume;
      }, 0);
      
      return {
        date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        volume: Math.round(totalVolume),
        movements: session.movements.length
      };
    });

  // Calculate stats
  const totalDistance = runs.reduce((sum, run) => sum + run.distanceKm, 0);
  const totalSessions = lifts.length;
  const avgPace = runningData.length > 0 
    ? runningData.reduce((sum, run) => sum + run.pace, 0) / runningData.length
    : 0;

  const formatPace = (paceMinPerKm: number) => {
    const minutes = Math.floor(paceMinPerKm);
    const seconds = Math.round((paceMinPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-soft border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-medium text-ink-mute">Total Distance</h3>
          </div>
          <p className="text-2xl font-bold text-ink">{totalDistance.toFixed(1)} km</p>
        </div>
        
        <div className="bg-bg-soft border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-medium text-ink-mute">Avg Pace</h3>
          </div>
          <p className="text-2xl font-bold text-ink">{formatPace(avgPace)}/km</p>
        </div>
        
        <div className="bg-bg-soft border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-medium text-ink-mute">Lift Sessions</h3>
          </div>
          <p className="text-2xl font-bold text-ink">{totalSessions}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-bg-soft border border-border rounded-lg p-1">
        <button
          onClick={() => setActiveTab('runs')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-apple ${
            activeTab === 'runs'
              ? 'bg-accent text-white'
              : 'text-ink-mute hover:text-ink hover:bg-border/50'
          }`}
        >
          <Activity className="w-4 h-4 inline mr-2" />
          Runs
        </button>
        <button
          onClick={() => setActiveTab('lifts')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-apple ${
            activeTab === 'lifts'
              ? 'bg-accent text-white'
              : 'text-ink-mute hover:text-ink hover:bg-border/50'
          }`}
        >
          <Target className="w-4 h-4 inline mr-2" />
          Lifts
        </button>
      </div>

      {/* Charts */}
      {activeTab === 'runs' && (
        <div className="space-y-8">
          {/* Distance Chart */}
          <div className="bg-bg-soft border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-ink mb-4">Distance Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={runningData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1b2335" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#aab2c0" 
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#aab2c0" 
                    fontSize={12}
                    label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#aab2c0' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f1526', 
                      border: '1px solid #1b2335',
                      borderRadius: '8px',
                      color: '#e6e9ef'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="distance" 
                    stroke="#5aa2ff" 
                    strokeWidth={2}
                    dot={{ fill: '#5aa2ff', strokeWidth: 0, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Runs Table */}
          <div className="bg-bg-soft border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-ink mb-4">Recent Runs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-ink-mute font-medium">Date</th>
                    <th className="text-left py-2 text-ink-mute font-medium">Distance</th>
                    <th className="text-left py-2 text-ink-mute font-medium">Duration</th>
                    <th className="text-left py-2 text-ink-mute font-medium">Pace</th>
                    <th className="text-left py-2 text-ink-mute font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.slice(0, 5).map((run) => (
                    <tr key={run.id} className="border-b border-border/50">
                      <td className="py-2 text-ink">
                        {new Date(run.date).toLocaleDateString()}
                      </td>
                      <td className="py-2 text-ink">{run.distanceKm} km</td>
                      <td className="py-2 text-ink">
                        {Math.floor(run.durationSec / 60)}:{(run.durationSec % 60).toString().padStart(2, '0')}
                      </td>
                      <td className="py-2 text-ink">
                        {run.pace || formatPace(run.durationSec / 60 / run.distanceKm)}
                      </td>
                      <td className="py-2 text-ink-mute">{run.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'lifts' && (
        <div className="space-y-8">
          {/* Volume Chart */}
          <div className="bg-bg-soft border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-ink mb-4">Training Volume</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={liftingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1b2335" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#aab2c0" 
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#aab2c0" 
                    fontSize={12}
                    label={{ value: 'Volume (lbs)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#aab2c0' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f1526', 
                      border: '1px solid #1b2335',
                      borderRadius: '8px',
                      color: '#e6e9ef'
                    }}
                  />
                  <Bar dataKey="volume" fill="#5aa2ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-bg-soft border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-ink mb-4">Recent Sessions</h3>
            <div className="space-y-4">
              {lifts.slice(0, 3).map((session) => (
                <div key={session.id} className="border border-border/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-accent" />
                    <span className="text-ink font-medium">
                      {new Date(session.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {session.movements.map((movement, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-ink font-medium">{movement.name}</span>
                        <div className="flex gap-2">
                          {movement.sets.map((set, setIdx) => (
                            <span key={setIdx} className="text-ink-mute">
                              {set.weight}×{set.reps}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
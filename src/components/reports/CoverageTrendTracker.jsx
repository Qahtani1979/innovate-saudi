import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function CoverageTrendTracker({ currentProgress }) {
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    // Load historical data
    const history = JSON.parse(localStorage.getItem('coverage_history') || '[]');
    
    // Add current data point
    const today = new Date().toISOString().split('T')[0];
    const newPoint = { date: today, coverage: currentProgress };
    
    // Check if today already recorded
    const existingIndex = history.findIndex(h => h.date === today);
    if (existingIndex >= 0) {
      history[existingIndex] = newPoint;
    } else {
      history.push(newPoint);
    }

    // Keep last 30 days
    const recent = history.slice(-30);
    localStorage.setItem('coverage_history', JSON.stringify(recent));
    setTrendData(recent);
  }, [currentProgress]);

  if (trendData.length < 2) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-600" />
          Coverage Trend (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="coverage" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
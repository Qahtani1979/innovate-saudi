import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, Clock } from 'lucide-react';

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memory: 0,
    fps: 60
  });

  useEffect(() => {
    // Performance metrics
    const perfObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          setMetrics(prev => ({
            ...prev,
            loadTime: entry.loadEventEnd - entry.fetchStart
          }));
        }
      }
    });

    perfObserver.observe({ entryTypes: ['navigation'] });

    // Memory usage (if available)
    if (performance.memory) {
      const updateMemory = () => {
        setMetrics(prev => ({
          ...prev,
          memory: Math.round(performance.memory.usedJSHeapSize / 1048576)
        }));
      };
      const interval = setInterval(updateMemory, 5000);
      return () => {
        clearInterval(interval);
        perfObserver.disconnect();
      };
    }

    return () => perfObserver.disconnect();
  }, []);

  return (
    <Card className="fixed bottom-4 right-4 w-64 z-40 bg-white/95 backdrop-blur shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-600" />
          Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Load Time
          </span>
          <Badge variant="outline">{(metrics.loadTime / 1000).toFixed(2)}s</Badge>
        </div>
        {metrics.memory > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-slate-600 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Memory
            </span>
            <Badge variant="outline">{metrics.memory}MB</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

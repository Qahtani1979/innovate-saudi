import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, AlertCircle, Code, Zap } from 'lucide-react';

export default function RedisDeploymentPanel() {
  const useCases = [
    { feature: 'Session Storage', impact: 'critical', latency: '< 5ms', status: 'pending' },
    { feature: 'API Response Cache', impact: 'high', latency: '< 10ms', status: 'pending' },
    { feature: 'Rate Limiting', impact: 'high', latency: '< 2ms', status: 'pending' },
    { feature: 'Real-time Pub/Sub', impact: 'medium', latency: '< 1ms', status: 'pending' },
    { feature: 'Job Queue (Bull)', impact: 'medium', latency: 'N/A', status: 'pending' }
  ];

  const deploymentCode = `
// Docker Compose
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes --requirepass \${REDIS_PASSWORD}

  app:
    environment:
      REDIS_URL: redis://:password@redis:6379

volumes:
  redis-data:

// Backend Integration (Node.js)
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

// Session Storage
const session = require('express-session');
const RedisStore = require('connect-redis').default;

app.use(session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, httpOnly: true, maxAge: 86400000 }
}));

// API Caching
const cacheMiddleware = async (req, res, next) => {
  const key = \`cache:\${req.originalUrl}\`;
  const cached = await redis.get(key);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  res.sendResponse = res.json;
  res.json = (data) => {
    redis.setex(key, 300, JSON.stringify(data)); // 5 min cache
    res.sendResponse(data);
  };
  next();
};

// Rate Limiting
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

const limiter = rateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
`;

  return (
    <Card className="border-2 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-orange-600" />
          Redis Cache Layer Deployment
          <Badge variant="outline" className="ml-auto">Infrastructure Required</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Performance Infrastructure Gap</p>
              <p>Redis deployment critical for session, caching, and rate limiting</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Use Cases & Impact:</p>
          {useCases.map((useCase, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <div className="flex-1">
                <p className="text-sm font-medium">{useCase.feature}</p>
                <p className="text-xs text-slate-600 mt-1">Target Latency: {useCase.latency}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={useCase.impact === 'critical' ? 'destructive' : useCase.impact === 'high' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {useCase.impact}
                </Badge>
                <Badge variant="outline" className="text-xs text-amber-600">
                  {useCase.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">50x</p>
            <p className="text-xs text-green-700">Faster Queries</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">&lt;10ms</p>
            <p className="text-xs text-blue-700">Cache Latency</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-600">99.9%</p>
            <p className="text-xs text-purple-700">Availability</p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
            <Code className="h-3 w-3" />
            Redis Deployment & Integration
          </p>
          <pre className="text-xs text-slate-600 overflow-x-auto max-h-96">{deploymentCode}</pre>
        </div>

        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-medium">Deployment Checklist:</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-amber-600" />
              <span>Deploy Redis cluster (AWS ElastiCache or self-hosted)</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-amber-600" />
              <span>Configure persistence (AOF + RDB)</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-amber-600" />
              <span>Set up replication for high availability</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-amber-600" />
              <span>Integrate session store middleware</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-amber-600" />
              <span>Implement cache invalidation strategy</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-amber-600" />
              <span>Monitor memory usage and eviction policies</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
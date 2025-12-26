import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertCircle, Code } from 'lucide-react';

export default function CentralizedLoggingPanel() {
  const logSources = [
    { source: 'Application Logs', volume: '~500MB/day', retention: '30 days' },
    { source: 'API Access Logs', volume: '~2GB/day', retention: '90 days' },
    { source: 'Security Events', volume: '~100MB/day', retention: '365 days' },
    { source: 'Database Logs', volume: '~300MB/day', retention: '30 days' },
    { source: 'Error Logs', volume: '~50MB/day', retention: '90 days' }
  ];

  const elasticsearchConfig = `
# Docker Compose - ELK Stack
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - es-data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

# Application Integration (Winston + Elasticsearch)
const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: { node: process.env.ELASTICSEARCH_URL },
      index: 'saudi-innovates-logs'
    })
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
});

// Usage
logger.info('Challenge created', { 
  challengeId: challenge.id,
  userId: user.email,
  municipality: challenge.municipality_id 
});

logger.error('Pilot creation failed', { 
  error: err.message,
  stack: err.stack,
  userId: user.email 
});
`;

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Centralized Logging (ELK/Datadog)
          <Badge variant="outline" className="ml-auto">Infrastructure Required</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Monitoring Gap</p>
              <p>Centralized logging infrastructure missing - debugging difficult at scale</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Log Sources & Volume:</p>
          {logSources.map((source, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <div>
                <p className="text-sm font-medium">{source.source}</p>
                <p className="text-xs text-slate-600 mt-1">Retention: {source.retention}</p>
              </div>
              <Badge variant="outline">{source.volume}</Badge>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
            <Code className="h-3 w-3" />
            ELK Stack Setup & Integration
          </p>
          <pre className="text-xs text-slate-600 overflow-x-auto max-h-96">{elasticsearchConfig}</pre>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs font-medium text-blue-800 mb-2">Option 1: ELK Stack</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Elasticsearch for storage & search</li>
              <li>• Logstash for log processing</li>
              <li>• Kibana for visualization</li>
              <li>• Self-hosted or AWS OpenSearch</li>
              <li>• Cost: ~$200-500/month</li>
            </ul>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-xs font-medium text-purple-800 mb-2">Option 2: Datadog</p>
            <ul className="text-xs text-purple-700 space-y-1">
              <li>• Fully managed SaaS</li>
              <li>• APM + Logs + Metrics unified</li>
              <li>• Advanced alerting & dashboards</li>
              <li>• Easy integration</li>
              <li>• Cost: ~$15/host/month + data</li>
            </ul>
          </div>
        </div>

        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-medium">Implementation Steps:</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-amber-600" />
              <span>Deploy logging infrastructure</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-amber-600" />
              <span>Integrate Winston/Bunyan logger</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-amber-600" />
              <span>Configure log levels & formats</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-amber-600" />
              <span>Set up retention policies</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-amber-600" />
              <span>Create Kibana dashboards</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-amber-600" />
              <span>Configure alerts for errors</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

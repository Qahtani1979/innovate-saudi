/**
 * System Integration Prompts
 * AI prompts for integration planning and data synchronization
 * @module prompts/integration/systemIntegration
 */

export const INTEGRATION_PLANNING_PROMPT = {
  id: 'integration_planning',
  version: '1.0.0',
  category: 'integration',
  system: `You are a systems integration architect specializing in government digital transformation.
Design robust integration strategies that ensure data consistency and security.
Consider Saudi Arabian e-government standards and interoperability requirements.`,
  template: `Plan system integration:

Source Systems: {{sourceSystems}}
Target System: {{targetSystem}}
Data Types: {{dataTypes}}
Integration Requirements: {{requirements}}
Security Constraints: {{security}}
Timeline: {{timeline}}

Design comprehensive integration architecture.`,
  schema: {
    type: 'object',
    properties: {
      integrationArchitecture: {
        type: 'object',
        properties: {
          pattern: { type: 'string', enum: ['point_to_point', 'hub_spoke', 'bus', 'microservices'] },
          dataFlow: { type: 'string' },
          syncType: { type: 'string', enum: ['real_time', 'batch', 'hybrid'] }
        }
      },
      dataMapping: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            sourceField: { type: 'string' },
            targetField: { type: 'string' },
            transformation: { type: 'string' },
            validation: { type: 'string' }
          }
        }
      },
      apiDesign: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            endpoint: { type: 'string' },
            method: { type: 'string' },
            purpose: { type: 'string' },
            authentication: { type: 'string' }
          }
        }
      },
      securityMeasures: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            measure: { type: 'string' },
            implementation: { type: 'string' },
            compliance: { type: 'string' }
          }
        }
      },
      implementationPlan: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            phase: { type: 'number' },
            tasks: { type: 'array', items: { type: 'string' } },
            duration: { type: 'string' },
            dependencies: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      riskMitigation: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            risk: { type: 'string' },
            impact: { type: 'string' },
            mitigation: { type: 'string' }
          }
        }
      }
    },
    required: ['integrationArchitecture', 'dataMapping', 'implementationPlan']
  }
};

export const DATA_SYNC_PROMPT = {
  id: 'data_sync',
  version: '1.0.0',
  category: 'integration',
  system: `You are a data synchronization specialist.
Design reliable data sync strategies that maintain consistency across systems.
Handle conflict resolution and error recovery gracefully.`,
  template: `Design data synchronization:

Systems Involved: {{systems}}
Data Entities: {{entities}}
Sync Frequency: {{frequency}}
Conflict Resolution: {{conflictStrategy}}
Volume: {{volume}}

Create data sync strategy with error handling.`,
  schema: {
    type: 'object',
    properties: {
      syncStrategy: {
        type: 'object',
        properties: {
          approach: { type: 'string', enum: ['full', 'incremental', 'delta'] },
          frequency: { type: 'string' },
          trigger: { type: 'string', enum: ['scheduled', 'event_driven', 'manual'] }
        }
      },
      entityMapping: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            entity: { type: 'string' },
            sourceOfTruth: { type: 'string' },
            syncDirection: { type: 'string', enum: ['unidirectional', 'bidirectional'] },
            keyFields: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      conflictResolution: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            scenario: { type: 'string' },
            resolution: { type: 'string' },
            notification: { type: 'string' }
          }
        }
      },
      errorHandling: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            errorType: { type: 'string' },
            retryStrategy: { type: 'string' },
            fallback: { type: 'string' },
            alerting: { type: 'string' }
          }
        }
      },
      monitoringMetrics: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            metric: { type: 'string' },
            threshold: { type: 'string' },
            alertAction: { type: 'string' }
          }
        }
      }
    },
    required: ['syncStrategy', 'entityMapping', 'conflictResolution']
  }
};

export const API_ANALYSIS_PROMPT = {
  id: 'api_analysis',
  version: '1.0.0',
  category: 'integration',
  system: `You are an API design and analysis expert.
Evaluate API designs for usability, performance, and security.
Recommend improvements based on RESTful best practices.`,
  template: `Analyze API:

API Documentation: {{documentation}}
Current Usage: {{usage}}
Performance Metrics: {{performance}}
Error Rates: {{errors}}
Security Configuration: {{security}}

Provide API assessment and recommendations.`,
  schema: {
    type: 'object',
    properties: {
      overallScore: { type: 'number', minimum: 0, maximum: 100 },
      designAssessment: {
        type: 'object',
        properties: {
          restfulness: { type: 'number' },
          consistency: { type: 'number' },
          documentation: { type: 'number' },
          versioning: { type: 'number' }
        }
      },
      performanceAnalysis: {
        type: 'object',
        properties: {
          avgResponseTime: { type: 'string' },
          errorRate: { type: 'string' },
          throughput: { type: 'string' },
          bottlenecks: { type: 'array', items: { type: 'string' } }
        }
      },
      securityAudit: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            area: { type: 'string' },
            status: { type: 'string', enum: ['secure', 'at_risk', 'vulnerable'] },
            finding: { type: 'string' },
            recommendation: { type: 'string' }
          }
        }
      },
      recommendations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            recommendation: { type: 'string' },
            priority: { type: 'string' },
            effort: { type: 'string' }
          }
        }
      }
    },
    required: ['overallScore', 'designAssessment', 'recommendations']
  }
};

export default {
  INTEGRATION_PLANNING_PROMPT,
  DATA_SYNC_PROMPT,
  API_ANALYSIS_PROMPT
};

# Analytics & Reporting System Inventory

**Version:** 1.0  
**Last Updated:** 2026-01-03  
**Status:** Active

## Overview

The Analytics & Reporting System provides platform-wide analytics, metrics, and reporting capabilities.

## Directory Structure

```
src/hooks/analytics/
└── index.js                    # Consolidated hook exports
```

## Hooks Reference

### Platform Analytics
| Hook | Purpose |
|------|---------|
| `useAnalytics` | General analytics |
| `useAnalyticsData` | Analytics data |
| `usePlatformAnalytics` | Platform-wide metrics |
| `usePlatformInsights` | AI-driven insights |
| `usePlatformStatistics` | Platform stats |
| `useSystemAnalytics` | System analytics |
| `useSystemMetrics` | System metrics |

### Data Quality
| Hook | Purpose |
|------|---------|
| `useDataQualityMetrics` | Data quality metrics |
| `useSystemValidation` | System validation |

### Domain-Specific Analytics
| Hook | Purpose |
|------|---------|
| `useEventAnalytics` | Event analytics |
| `useExpertAnalytics` | Expert analytics |
| `useOnboardingAnalytics` | Onboarding analytics |
| `useOnboardingStats` | Onboarding stats |
| `useMatchmakerAnalytics` | Matchmaker analytics |
| `useMatchmakerStats` | Matchmaker stats |

## Import Example

```javascript
import { 
  usePlatformAnalytics, 
  useSystemMetrics, 
  useDataQualityMetrics 
} from '@/hooks/analytics';
```

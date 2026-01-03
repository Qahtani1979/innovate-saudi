# Geographic System Inventory

**Version:** 1.0  
**Last Updated:** 2026-01-03  
**Status:** Active

## Overview

The Geographic System manages regional data including regions, cities, and location-based analytics.

## Directory Structure

```
src/hooks/geography/
└── index.js                    # Consolidated hook exports
```

## Hooks Reference

### Region Hooks
| Hook | Purpose |
|------|---------|
| `useRegions` | Fetch all regions |
| `useRegionMutations` | CRUD operations |

### City Hooks
| Hook | Purpose |
|------|---------|
| `useCities` | Fetch cities |
| `useCityAnalytics` | City-level analytics |
| `useCityData` | City data details |
| `useCityManagement` | City management |

### Location Hooks
| Hook | Purpose |
|------|---------|
| `useLocations` | Fetch locations |

## Import Example

```javascript
import { useRegions, useCities, useLocations } from '@/hooks/geography';
```

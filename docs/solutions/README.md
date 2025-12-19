# Solutions System

> **Last Updated:** 2025-12-19  
> **Version:** 2.0.0  
> **Status:** Production Ready

## Overview

The Solutions system manages technology solutions submitted by providers to address municipal challenges. It includes AI-powered matching, quality scoring, workflow management, and provider verification.

## Quick Start

### Viewing Solutions
```jsx
import { useSolutions } from '@/hooks/useSolutions';

const { solutions, isLoading } = useSolutions({ status: 'published' });
```

### Creating a Solution
Navigate to `/solution-create` or use the `SolutionCreateWizard` component.

### Provider Dashboard
Access provider-specific features at `/provider-dashboard`.

## Key Features

| Feature | Description |
|---------|-------------|
| **Solution Registry** | Browse and search all published solutions |
| **AI Matching** | Automatic challenge-solution matching with quality scores |
| **Provider Portal** | Dedicated dashboard for solution providers |
| **Quality Gates** | Multi-stage approval workflow |
| **Version History** | Track all changes with audit trail |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Solutions System                          │
├─────────────────────────────────────────────────────────────┤
│  Pages                                                       │
│  ├── Solutions.jsx (listing)                                │
│  ├── SolutionDetail.jsx (detail view)                       │
│  ├── SolutionCreate.jsx (wizard)                            │
│  └── ProviderDashboard.jsx (provider portal)                │
├─────────────────────────────────────────────────────────────┤
│  Components                                                  │
│  ├── SolutionCard.jsx                                       │
│  ├── SolutionCreateWizard.jsx                               │
│  ├── SolutionFilters.jsx                                    │
│  └── SolutionMatchingPanel.jsx                              │
├─────────────────────────────────────────────────────────────┤
│  Hooks                                                       │
│  ├── useSolutions.js                                        │
│  ├── useSolutionMatching.js                                 │
│  └── useProviderProfile.js                                  │
├─────────────────────────────────────────────────────────────┤
│  Database                                                    │
│  ├── solutions (main table)                                 │
│  ├── solution_version_history                               │
│  ├── challenge_solution_matches                             │
│  └── providers                                              │
└─────────────────────────────────────────────────────────────┘
```

## Routes

| Route | Page | Description |
|-------|------|-------------|
| `/solutions` | Solutions | Public solution listing |
| `/solutions/:id` | SolutionDetail | Solution detail view |
| `/solution-create` | SolutionCreate | Create new solution |
| `/provider-dashboard` | ProviderDashboard | Provider portal |

## Related Documentation

- [API Reference](./API.md)
- [Components](./COMPONENTS.md)
- [Database Schema](./SCHEMA.md)
- [Workflows](./WORKFLOWS.md)
- [Permissions](./PERMISSIONS.md)
- [Bounce Handling](./BOUNCE_HANDLING.md)

## Related Systems

| System | Relationship |
|--------|-------------|
| Challenges | Solutions are matched to challenges |
| Matchmaker | Handles solution-challenge matching |
| Pilots | Solutions can become pilots |
| Providers | Solution ownership |

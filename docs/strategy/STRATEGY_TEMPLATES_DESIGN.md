# Strategy Templates System - Design Document

> **Version**: 2.2  
> **Last Updated**: December 15, 2025  
> **Status**: ✅ Fully Implemented - MoMAH Innovation Focus + Coverage Analysis + Hub Integration

## Recent Changes (v2.2)
- Updated for Strategy Hub 10-tab structure
- Templates Tab now includes Sector Strategy access
- Coverage Analysis with MoMAH taxonomy fully integrated
- All tabs styled consistently with HubTabs pattern
- Distribution shows actual templates per type with names

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture](#architecture)
4. [Data Model](#data-model)
5. [User Workflows](#user-workflows)
6. [Component Design](#component-design)
7. [Coverage Analysis](#coverage-analysis)
8. [Integration with Wizard](#integration-with-wizard)
9. [Hub Integration](#hub-integration)
10. [Implementation Status](#implementation-status)
11. [File Structure](#file-structure)

---

## Executive Summary

The Strategy Templates System enables users to:
- **Browse** pre-built and community templates
- **Create** templates from existing strategic plans
- **Apply** templates to quickly start new plans in the wizard
- **Share** templates publicly or keep them private
- **Manage** personal template library
- **Analyze** template coverage against MoMAH taxonomy
- **Identify** gaps and get AI recommendations for new templates

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage | Use `strategic_plans` table with `is_template = true` | Reuse existing schema, same structure |
| Template Source | Completed plans can become templates | Ensures real-world tested templates |
| Access Control | Public/Private via `is_public` flag | Simple sharing model |
| Integration | Deep integration with wizard | Seamless user experience |
| Coverage Analysis | MoMAH taxonomy alignment | Ensures strategic coverage of all domains |

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Strategy Templates System                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────┐    ┌───────────────┐  │
│  │  Template        │    │  Coverage        │    │  Template     │  │
│  │  Library Page    │    │  Analysis        │    │  Application  │  │
│  │                  │    │                  │    │               │  │
│  │  • Browse        │    │  • Taxonomy      │    │  • Preview    │  │
│  │  • Search        │    │  • Gaps          │    │  • Apply      │  │
│  │  • Filter        │    │  • AI Recs       │    │  • Clone      │  │
│  │  • Categories    │    │  • Distribution  │    │  • Customize  │  │
│  └────────┬─────────┘    └────────┬─────────┘    └───────┬───────┘  │
│           │                       │                      │          │
│           └───────────────────────┼──────────────────────┘          │
│                                   │                                  │
│                    ┌──────────────▼──────────────┐                  │
│                    │      useStrategyTemplates   │                  │
│                    │           Hook              │                  │
│                    └──────────────┬──────────────┘                  │
│                                   │                                  │
│                    ┌──────────────▼──────────────┐                  │
│                    │      Supabase Database      │                  │
│                    │  strategic_plans            │                  │
│                    │  WHERE is_template = true   │                  │
│                    └─────────────────────────────┘                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Coverage Analysis

### New Feature: Template Coverage Analysis

The `TemplateCoverageAnalysis` component provides:

#### 1. Coverage by MoMAH Service Domains
- Housing & Real Estate
- Municipal Services
- Urban Planning
- Environmental Services
- Rural Development
- Digital Government

#### 2. Coverage by Innovation Areas
- Digital Transformation
- Smart City Technologies
- Citizen Experience
- Sustainability & Green Tech
- Data & AI
- Process Automation
- PropTech & Housing Innovation
- GovTech & Digital Permits
- Infrastructure IoT
- Rural Digital Inclusion

#### 3. Coverage by Vision 2030 Programs
- Quality of Life
- Housing Program (Sakani)
- National Transformation
- Digital Government
- Environmental Sustainability
- Regional Development

#### 4. Gap Identification
- Identifies uncovered service domains
- Highlights missing innovation areas
- Shows Vision 2030 program gaps
- Prioritizes gaps by strategic importance

#### 5. AI Recommendations
Pre-defined, context-consistent recommendations for:
- Public Health & Safety Innovation Strategy
- Drones & Robotics in Municipal Services
- Blockchain & Trust Technologies Strategy
- Quality of Life Enhancement Strategy

---

## Official MoMAH Innovation Templates (14 Total)

| Template Name | Type | Rating | MoMAH Domain |
|--------------|------|--------|--------------|
| MoMAH Innovation & R&D Excellence Strategy | `innovation` | 4.4 | Core Innovation |
| Housing Innovation & PropTech Strategy | `innovation` | 4.7 | Housing/Sakani |
| Open Innovation & Crowdsourcing for Saudi Municipalities | `innovation` | 4.7 | Citizen Co-creation |
| Digital Innovation & AI Research for Saudi Municipalities | `digital_transformation` | 4.5 | AI/ML |
| GovTech & Digital Permits Innovation Strategy | `digital_transformation` | 4.6 | Digital Permits |
| Environmental Innovation & CleanTech Strategy | `sustainability` | 4.6 | Waste/Water/Carbon |
| Green Technology R&D for Saudi Sustainable Cities | `sustainability` | 4.7 | Green Tech |
| MoMAH Sector-Specific Innovation Hubs Strategy | `sector_specific` | 4.5 | Industry Sectors |
| Saudi Municipal Innovation Ecosystem Strategy | `municipality` | 4.6 | Municipal Scale |
| Smart City Innovation & IoT Research for Saudi Urban Development | `smart_city` | 4.6 | Smart Cities |
| Urban Planning Innovation & GIS R&D Strategy | `smart_city` | 4.8 | GIS/Digital Twins |
| Infrastructure Innovation & IoT R&D Strategy | `smart_city` | 4.5 | IoT/Infrastructure |
| Citizen Experience Innovation Lab for Saudi Municipal Services | `citizen_services` | 4.8 | Citizen UX |
| Rural Innovation & Digital Inclusion Strategy | `citizen_services` | 4.4 | Rural/Inclusion |

---

## Hub Integration

### Strategy Hub Templates Tab Features

The Templates Tab in Strategy Hub (`/strategy-hub`) provides:

| Tool | Description | Route |
|------|-------------|-------|
| Template Library | Browse and apply templates | `/strategy-templates-page` |
| Coverage Analysis | Analyze against MoMAH taxonomy | In-page component |
| Sector Strategy | Build sector-specific strategies | `/sector-strategy-page` |
| Create from Scratch | Start new plan without template | `/strategic-plan-builder` |

### Tab Style Consistency

All tabs use unified HubTabs styling:
```jsx
<TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-muted/50 p-1">
  <TabsTrigger className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
```

### Quick Actions

| Action | Target | Description |
|--------|--------|-------------|
| "Open Template Library" | `/strategy-templates-page` | Full template browsing |
| "Create from Scratch" | `/strategic-plan-builder` | Blank wizard |
| "Sector Strategy" | `/sector-strategy-page` | Sector-focused creation |

---

## File Structure

```
src/
├── pages/
│   ├── StrategyTemplatesPage.jsx          # Full template library page
│   └── SectorStrategyPage.jsx             # Sector strategy builder
├── components/
│   └── strategy/
│       ├── creation/
│       │   └── StrategyTemplateLibrary.jsx
│       └── templates/
│           └── TemplateCoverageAnalysis.jsx
├── hooks/
│   └── strategy/
│       └── useStrategyTemplates.js
```

---

## Implementation Status

| Feature | Status | Version |
|---------|--------|---------|
| Template Library | ✅ Complete | v1.0 |
| Browse Templates | ✅ Complete | v1.0 |
| Apply Templates | ✅ Complete | v1.0 |
| Create from Plan | ✅ Complete | v1.0 |
| 14 MoMAH Templates | ✅ Complete | v2.0 |
| Coverage Analysis | ✅ Complete | v2.1 |
| Gap Identification | ✅ Complete | v2.1 |
| AI Recommendations | ✅ Complete | v2.1 |
| Hub Integration | ✅ Complete | v2.2 |
| Sector Strategy | ✅ Complete | v2.2 |
| Consistent Tab Styling | ✅ Complete | v2.2 |

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [STRATEGIC_WIZARD_DESIGN.md](./STRATEGIC_WIZARD_DESIGN.md) | Wizard design |
| [strategy-design.md](./strategy-design.md) | Complete 8-phase lifecycle |
| [plan-tracker.md](./plan-tracker.md) | Implementation tracking |

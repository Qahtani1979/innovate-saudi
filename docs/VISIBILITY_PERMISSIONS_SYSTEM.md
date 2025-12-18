# Visibility & Permissions System Documentation

## Overview

This document describes the comprehensive visibility and permissions system for the Municipal Innovation Platform. The system handles both **geographic entities** (municipalities) and **sectoral entities** (national deputyships) with hierarchical data access patterns.

---

## 1. Entity Types

### 1.1 Geographic Entities (Municipalities)
- **Scope**: Local/Regional
- **Identified by**: `region.code != 'NATIONAL'`
- **Data Access**: Own records + national-level records
- **Examples**: Riyadh Municipality, Jeddah Municipality, etc.

### 1.2 Sectoral Entities (National Deputyships)
- **Scope**: National, vertical by sector
- **Identified by**: `region.code = 'NATIONAL'` AND `sector_id IS NOT NULL`
- **Data Access**: All records in their sector across all municipalities
- **Examples**: Deputyship of Infrastructure, Deputyship of Environment, etc.

### 1.3 Full-Visibility Users
- **Scope**: Platform-wide
- **Identified by**: Has `visibility_all_municipalities` or `visibility_all_sectors` permission
- **Data Access**: All records across all municipalities and sectors
- **Examples**: Platform Admin, Executive Leadership, Ministry Representatives, GDISB Strategy Lead

---

## 2. Database Schema

### 2.1 Key Tables

#### `regions`
```sql
- id: uuid
- name_en: text
- name_ar: text
- code: text  -- 'NATIONAL' for national-level entities
- is_active: boolean
```

#### `municipalities`
```sql
- id: uuid
- name_en: text
- name_ar: text
- region_id: uuid  -- References regions
- sector_id: uuid  -- For national deputyships
- focus_sectors: uuid[]  -- Multiple sector coverage
- city_type: text  -- 'metropolitan', 'major', 'medium', 'small', 'national'
- is_active: boolean
```

#### `user_roles`
```sql
- id: uuid
- user_id: uuid
- role_id: uuid  -- FK to roles table
- municipality_id: uuid
- organization_id: uuid
- is_active: boolean
- expires_at: timestamp
- created_at: timestamp
```

#### `roles` table (replaces app_role enum)
Role names stored in `roles.name`:
- `admin` - Platform super admin
- `municipality_admin` - Municipality full access
- `municipality_staff` - Municipality standard access
- `municipality_coordinator` - Municipality coordination
- `deputyship_admin` - National deputyship full access
- `deputyship_staff` - National deputyship standard access
- `provider` - Solution provider/startup
- `researcher` - Research institution
- `expert` - Domain expert
- `citizen` - Public citizen
- `ministry` - Ministry level
- `investor` - Investment entities
- `viewer` - Read-only access

---

## 3. Visibility Rules

### 3.1 Complete Visibility Matrix

| User Type | Challenges | Pilots | Solutions | Programs | R&D Projects |
|-----------|-----------|--------|-----------|----------|--------------|
| **Platform Admin** | All | All | All | All | All |
| **Municipality Admin** | Own + National | Own + National | All published + own | Own + National | Own + National |
| **Municipality Staff** | Own + National | Own + National | All published | Own + National | Own + National |
| **Deputyship Admin** | Sector-wide | Sector-wide | All published | Sector-wide | Sector-wide |
| **Deputyship Staff** | Sector-wide | Sector-wide | All published | Sector-wide | Sector-wide |
| **Provider** | Published | Own (as provider) | Own + published | Applied to | Collaborating |
| **Researcher** | Published + assigned | Involved in | Published | Collaborating | Own + assigned |
| **Expert** | Assigned for review | Assigned | Assigned | Assigned | Assigned |
| **Citizen** | Published (voting) | Enrolled | Published | Public info | Public info |
| **Investor** | Published | Public info | Published | Public info | Public info |

### 3.2 Visibility Logic

```javascript
// Determine if user belongs to national entity
const isNationalEntity = (municipality) => {
  return municipality?.region?.code === 'NATIONAL';
};

// Get visibility filter for queries
const getVisibilityFilter = (user, entityType) => {
  const isNational = isNationalEntity(user.municipality);
  
  if (user.isAdmin) {
    return {}; // No filter - see all
  }
  
  if (isNational) {
    // National deputyship: See all in their sector(s)
    return {
      sector_id: { in: user.municipality.focus_sectors || [user.municipality.sector_id] }
    };
  } else {
    // Geographic municipality: See own + all national
    return {
      or: [
        { municipality_id: user.municipality_id },
        { 'municipality.region.code': 'NATIONAL' }
      ]
    };
  }
};
```

---

## 4. Permission Rules

### 4.1 Permission Categories

#### Challenge Permissions
- `challenge_view` - View challenges
- `challenge_create` - Create new challenges
- `challenge_edit` - Edit challenges
- `challenge_delete` - Delete challenges
- `challenge_publish` - Publish challenges
- `challenge_approve` - Approve challenges
- `challenge_assign` - Assign challenges to tracks

#### Pilot Permissions
- `pilot_view` - View pilots
- `pilot_create` - Create pilots
- `pilot_edit` - Edit pilots
- `pilot_manage` - Full pilot management
- `pilot_approve` - Approve pilot phases

#### Solution Permissions
- `solution_view` - View solutions
- `solution_create` - Create solutions (providers)
- `solution_edit` - Edit own solutions
- `solution_verify` - Verify solutions (experts)

#### Program Permissions
- `program_view` - View programs
- `program_create` - Create programs
- `program_manage` - Manage programs

#### Analytics Permissions
- `analytics_view` - View basic analytics
- `analytics_export` - Export data
- `analytics_advanced` - Advanced analytics

### 4.2 Role-Permission Matrix

| Permission | Admin | Muni Admin | Muni Staff | Deputy Admin | Deputy Staff | Provider | Expert | Citizen |
|------------|-------|------------|------------|--------------|--------------|----------|--------|---------|
| challenge_view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅* | ✅* | ✅* |
| challenge_create | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| challenge_edit | ✅ | ✅ | ✅** | ✅ | ✅** | ❌ | ❌ | ❌ |
| challenge_publish | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| pilot_view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅** | ✅* | ✅* |
| pilot_create | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| solution_create | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| analytics_view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅** | ❌ | ❌ |

*Published only | **Own records only

---

## 5. Write Access Rules

### 5.1 Who Can Create What

| Entity | Who Can Create | Scope |
|--------|---------------|-------|
| Challenge | Municipality Staff/Admin, Deputyship Staff/Admin | Own entity only |
| Pilot | Municipality Staff/Admin, Deputyship Staff/Admin | Own entity only |
| Solution | Provider only | Own organization |
| Program | Municipality Admin, Deputyship Admin | Own entity only |
| R&D Project | Researcher, Municipality/Deputyship Admin | Own entity only |

### 5.2 Who Can Edit/Delete

| Entity | Who Can Edit | Who Can Delete |
|--------|-------------|----------------|
| Challenge | Creator, Entity Admin, Platform Admin | Entity Admin, Platform Admin |
| Pilot | Assigned Manager, Entity Admin | Entity Admin, Platform Admin |
| Solution | Provider Owner, Platform Admin | Provider Owner, Platform Admin |

---

## 6. Implementation Details

### 6.1 Affected Components

#### Hooks to Update/Create
- `usePermissions.jsx` - Add deputyship role checks
- `useEntityVisibility.js` - NEW: Visibility filtering hook
- `useChallenges.js` - NEW: Challenge-specific queries with visibility
- `usePilots.js` - NEW: Pilot-specific queries with visibility

#### Components to Update
- Challenge list pages
- Pilot list pages
- Dashboard widgets
- Analytics pages
- Report generators

#### Components NOT Affected
- Public marketplace pages
- User profile pages
- Provider dashboard (uses own filter)
- Citizen portal (uses published filter)
- Expert panel (uses assignment filter)
- Settings pages

### 6.2 Database Functions

```sql
-- Check if user belongs to national entity
CREATE OR REPLACE FUNCTION is_national_entity(municipality_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM municipalities m
    JOIN regions r ON m.region_id = r.id
    WHERE m.id = municipality_id AND r.code = 'NATIONAL'
  );
$$ LANGUAGE sql STABLE;

-- Get user's visibility scope
CREATE OR REPLACE FUNCTION get_user_visibility_scope(user_id uuid)
RETURNS TABLE (
  scope_type text,
  municipality_id uuid,
  sector_ids uuid[],
  is_national boolean
) AS $$
  SELECT 
    CASE WHEN r.code = 'NATIONAL' THEN 'sectoral' ELSE 'geographic' END,
    ur.municipality_id,
    COALESCE(m.focus_sectors, ARRAY[m.sector_id]),
    r.code = 'NATIONAL'
  FROM user_roles ur
  JOIN municipalities m ON ur.municipality_id = m.id
  JOIN regions r ON m.region_id = r.id
  WHERE ur.user_id = $1
  LIMIT 1;
$$ LANGUAGE sql STABLE;
```

---

## 7. Migration Path

### Phase 1: Database Changes
1. Add `sector_id` and `focus_sectors` to municipalities table
2. Add new roles to `roles` table (deputyship_admin, deputyship_staff)
3. Create helper database functions

### Phase 2: Backend Updates
1. Create `useEntityVisibility` hook
2. Update `usePermissions` hook
3. Create entity-specific query hooks

### Phase 3: Frontend Updates
1. Update challenge/pilot list components
2. Update dashboard widgets
3. Update analytics scoping

---

## 8. Security Considerations

### 8.1 RLS Policies
- All visibility rules should be enforced at both application AND database level
- RLS policies should use the helper functions for consistency
- Never rely solely on frontend filtering

### 8.2 Audit Trail
- All data access should be logged
- Visibility scope changes should trigger audit events
- Cross-entity access (deputyship viewing municipality data) should be tracked

---

## 9. Testing Checklist

- [ ] Municipality staff can only see own + national records
- [ ] Deputyship staff can see all records in their sector
- [ ] Platform admin can see everything
- [ ] Providers can only see/edit own solutions
- [ ] Citizens can only see published content
- [ ] Experts can only see assigned evaluations
- [ ] National records appear for all municipality staff
- [ ] Sector filtering works correctly for deputyships

---

## 10. API Reference

### useEntityVisibility Hook

```javascript
const { 
  visibilityFilter,  // Query filter object
  isNational,        // Boolean
  scopeType,         // 'geographic' | 'sectoral' | 'global'
  sectorIds,         // Array of sector UUIDs (for deputyships)
  canViewEntity,     // (entity) => boolean
  buildQuery         // (baseQuery) => filteredQuery
} = useEntityVisibility();
```

### usePermissions Hook (Extended)

```javascript
const {
  // Existing
  hasPermission,
  hasRole,
  isAdmin,
  // New
  isDeputyship,      // Boolean - user belongs to national deputyship
  isMunicipality,    // Boolean - user belongs to geographic municipality
  visibilityScope,   // Object with scope details
} = usePermissions();
```

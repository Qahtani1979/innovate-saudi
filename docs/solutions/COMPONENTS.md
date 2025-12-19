# Solutions Components Documentation

## Overview

Component reference for the Solutions system.

## Page Components

### Solutions.jsx
Main listing page for solutions.

**Location:** `src/pages/Solutions.jsx`

**Features:**
- Grid/list view toggle
- Sorting (title, date, status)
- Filtering by sector, status
- Search functionality
- Keyboard navigation (Enter/Space on cards)
- Optimistic delete
- Pluralized counts

**Props:** None (route component)

### SolutionDetail.jsx
Detail view for a single solution.

**Location:** `src/pages/SolutionDetail.jsx`

**Features:**
- Full solution information
- Matching panel
- Version history
- Edit/delete actions
- Related challenges

### SolutionCreate.jsx
Protected page for creating solutions.

**Location:** `src/pages/SolutionCreate.jsx`

**Features:**
- Role-protected (provider, admin, municipality_staff, deputyship_staff, solution_provider)
- Multi-step wizard
- Form validation

---

## UI Components

### SolutionCard
Displays solution summary in card format.

**Location:** `src/components/solutions/SolutionCard.jsx`

```jsx
<SolutionCard
  solution={solution}
  onClick={handleClick}
  onEdit={handleEdit}
  onDelete={handleDelete}
  showActions={true}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| solution | object | required | Solution data |
| onClick | function | - | Click handler |
| onEdit | function | - | Edit action handler |
| onDelete | function | - | Delete action handler |
| showActions | boolean | false | Show action buttons |

### SolutionCreateWizard
Multi-step form for creating solutions.

**Location:** `src/components/solutions/SolutionCreateWizard.jsx`

**Features:**
- Required field indicators (*)
- Input length limits (maxLength)
- Embedding generation with retry
- Step validation
- Draft saving

**Steps:**
1. Basic Information
2. Technical Details
3. Capabilities & Features
4. Supporting Documents
5. Review & Submit

### SolutionFilters
Filter panel for solution listing.

**Location:** `src/components/solutions/SolutionFilters.jsx`

```jsx
<SolutionFilters
  filters={filters}
  onChange={setFilters}
  onReset={resetFilters}
/>
```

### SolutionMatchingPanel
Displays AI-powered solution matches.

**Location:** `src/components/solutions/SolutionMatchingPanel.jsx`

```jsx
<SolutionMatchingPanel
  solutionId={solutionId}
  onMatchSelect={handleMatchSelect}
/>
```

### SolutionVersionHistory
Shows version history for a solution.

**Location:** `src/components/solutions/SolutionVersionHistory.jsx`

```jsx
<SolutionVersionHistory solutionId={solutionId} />
```

---

## Form Components

### SolutionBasicInfoForm
Basic information step.

**Fields:**
- name_en (required, max 200)
- name_ar (required, max 200)
- tagline_en (max 150)
- tagline_ar (max 150)
- description_en (required, max 2000)
- description_ar (max 2000)

### SolutionTechnicalForm
Technical details step.

**Fields:**
- technology_stack (multi-select)
- deployment_model (select)
- scalability_info (textarea)
- security_features (textarea)

### SolutionCapabilitiesForm
Capabilities and features step.

**Fields:**
- capabilities (multi-select)
- features (dynamic list)
- integrations (multi-select)

---

## Shared Components

### SolutionStatusBadge
Displays workflow status.

```jsx
<SolutionStatusBadge status="approved" />
```

### SolutionSectorTag
Displays sector association.

```jsx
<SolutionSectorTag sectorId={sectorId} />
```

### SolutionProviderInfo
Displays provider information.

```jsx
<SolutionProviderInfo providerId={providerId} />
```

---

## Accessibility Features

### Keyboard Navigation
- Cards focusable with Tab
- Enter/Space triggers card click
- Focus indicators on interactive elements

### Screen Reader Support
- Semantic HTML structure
- ARIA labels on actions
- Status announcements

### Form Accessibility
- Required field indicators
- Error messages linked to inputs
- Focus management on validation errors

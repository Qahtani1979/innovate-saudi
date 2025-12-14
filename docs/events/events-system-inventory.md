# Events System Inventory

> **Version:** 1.0  
> **Last Updated:** 2025-12-14  
> **Total Assets:** 18 files (8 pages, 8 components, 2 hooks)  
> **Parent System:** Event Management  
> **Hub Page:** `/event-calendar`

---

## Overview

The Events System manages innovation events including conferences, workshops, hackathons, and demo days with registration, attendance tracking, and strategic alignment.

---

## 📄 Pages (8)

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| **Event Calendar** | `EventCalendar.jsx` | `/event-calendar` | `event_view` | Self (Root) |
| Calendar View | `CalendarView.jsx` | `/calendar-view` | `event_view` | Event Calendar |
| Event Create | `EventCreate.jsx` | `/event-create` | `event_create` | Event Calendar |
| Event Detail | `EventDetail.jsx` | `/event-detail` | `event_view` | Event Calendar |
| Event Edit | `EventEdit.jsx` | `/event-edit` | `event_edit` | Event Detail |
| Event Registration | `EventRegistration.jsx` | `/event-registration` | `public` | Event Detail |
| Events Analytics Dashboard | `EventsAnalyticsDashboard.jsx` | `/events-analytics-dashboard` | `event_manage` | Admin |

---

## 🧩 Components (8)

**Location:** `src/components/events/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `EventAttendeeList.jsx` | Attendee list | Event Detail |
| `EventCancelDialog.jsx` | Cancellation dialog | Event Detail |
| `EventCard.jsx` | Event card display | Event Calendar |
| `EventExpertEvaluation.jsx` | Expert evaluation | Event Detail |
| `EventFilters.jsx` | Event filtering | Event Calendar |
| `EventStrategicAlignment.jsx` | Strategic alignment | Event Create |
| `index.js` | Component exports | - |

### AI Components
**Location:** `src/components/ai/`

| Component | Description |
|-----------|-------------|
| `AIAttendancePredictor.jsx` | Attendance prediction |
| `AIEventOptimizer.jsx` | Event optimization |
| `AIProgramEventCorrelator.jsx` | Event correlation |

---

## 🪝 Hooks (2)

| Hook | Description |
|------|-------------|
| `useEvents.js` | Events CRUD operations |
| `useEventRegistrations.js` | Registration management |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `events` | Event data |
| `event_registrations` | Registration records |
| `event_attendees` | Attendance tracking |

---

## 🔐 RBAC Permissions

| Permission | Description |
|------------|-------------|
| `event_view` | View events |
| `event_create` | Create events |
| `event_edit` | Edit events |
| `event_manage` | Manage events |

---

## 🔄 Related Systems

| System | Relationship |
|--------|--------------|
| Strategy | Strategic event generation |
| Programs | Program events |
| Challenges | Challenge events |
| Communications | Event promotion |

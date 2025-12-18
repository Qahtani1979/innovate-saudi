# Shared/Common System Inventory

> **Version:** 1.0  
> **Last Updated:** 2025-12-18  
> **Total Assets:** 15 files (5 pages, 10 components)  
> **Parent System:** Platform-Wide Shared Features  
> **Purpose:** Cross-cutting features available to all personas

---

## 🔗 Navigation

| ⬅️ Previous | ⬆️ Parent | ➡️ Next |
|-------------|-----------|---------|
| - | [Master Index](../SYSTEM_INVENTORIES_INDEX.md) | [Strategy →](../strategy/strategy-system-inventory.md) |

---

## Overview

The Shared System contains platform-wide features that are accessible across all personas and systems. These are foundational components that provide consistent functionality throughout the platform.

---

## 📄 Pages (5)

### Platform-Wide Pages

| Page | File | Route | Permission | Description |
|------|------|-------|------------|-------------|
| **What's New Hub** | `WhatsNewHub.jsx` | `/whats-new-hub` | `authenticated` | Platform updates, announcements, and new features |
| Messaging | `Messaging.jsx` | `/messaging` | `authenticated` | Platform messaging system |
| News | `News.jsx` | `/news` | `public` | Platform news and updates |
| Help Center | `HelpCenter.jsx` | `/help-center` | `public` | Help documentation |
| Feedback | `Feedback.jsx` | `/feedback` | `authenticated` | Platform feedback submission |

---

## 🧩 Components (10)

### Notification Components
**Location:** `src/components/shared/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `PlatformInsightsWidget.jsx` | Platform insights display | All dashboards |
| `WhatsNewNotification.jsx` | New feature notifications | Headers |
| `AnnouncementBanner.jsx` | Global announcements | All pages |

### Common UI Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `LanguageSelector.jsx` | EN/AR language toggle | All pages |
| `ThemeToggle.jsx` | Dark/light mode | All pages |
| `BreadcrumbNav.jsx` | Navigation breadcrumbs | All pages |
| `GlobalSearch.jsx` | Platform-wide search | Headers |

### Messaging Components

| Component | Description | Used By |
|-----------|-------------|---------|
| `MessageThread.jsx` | Message display | Messaging |
| `NotificationCenter.jsx` | Notification hub | Headers |
| `QuickActions.jsx` | Quick action buttons | Dashboards |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `platform_insights` | Platform announcements and insights |
| `notifications` | User notifications |
| `messages` | Platform messages |

---

## 🔐 RBAC Permissions

| Permission | Description |
|------------|-------------|
| `authenticated` | Any logged-in user |
| `public` | Public access |

---

## 🔄 Related Systems

| System | Relationship |
|--------|--------------|
| All Systems | Provides shared functionality |
| Admin | Manages announcements |
| Communications | Messaging integration |

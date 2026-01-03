# Communications System Inventory

> **Version:** 1.1  
> **Last Updated:** 2026-01-03  
> **Total Assets:** 32 files (12 pages, 17 components, 8 hooks)  
> **Parent System:** Communications & Messaging  
> **Hub Page:** `/communications-hub`

---

## 🔗 Navigation

| ⬅️ Previous | ⬆️ Parent | ➡️ Next |
|-------------|-----------|---------|
| [← Admin](../admin/admin-system-inventory.md) | [Master Index](../SYSTEM_INVENTORIES_INDEX.md) | [Knowledge →](../knowledge/knowledge-system-inventory.md) |

---

## Overview

The Communications System manages platform communications including email campaigns, notifications, announcements, messaging, and stakeholder communications.

---

## 📄 Pages (12)

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| **Communications Hub** | `CommunicationsHub.jsx` | `/communications-hub` | `communications_manage` | Self (Root) |
| Strategic Communications Hub | `StrategicCommunicationsHub.jsx` | `/strategic-communications-hub` | `communications_manage` | Communications Hub |
| Campaign Planner | `CampaignPlanner.jsx` | `/campaign-planner` | `communications_manage` | Communications Hub |
| Email Template Manager | `EmailTemplateManager.jsx` | `/email-template-manager` | `communications_manage` | Communications Hub |
| Messaging | `Messaging.jsx` | `/messaging` | `authenticated` | Personal |
| Announcement System | `AnnouncementSystem.jsx` | `/announcement-system` | `communications_manage` | Communications Hub |
| Notification Center | `NotificationCenter.jsx` | `/notification-center` | `authenticated` | Personal |
| Notification Preferences | `NotificationPreferences.jsx` | `/notification-preferences` | `authenticated` | Settings |
| Communications Coverage Report | `CommunicationsCoverageReport.jsx` | `/communications-coverage-report` | `admin` | Admin |

### Strategy Communication Pages

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| Strategy Communication Page | `strategy/StrategyCommunicationPage.jsx` | `/strategy-communication-page` | `strategy_view` | Strategy Hub |
| Public Strategy Dashboard Page | `strategy/PublicStrategyDashboardPage.jsx` | `/public-strategy-dashboard-page` | `strategy_view` | Strategy Hub |
| Strategy Public View Page | `strategy/StrategyPublicViewPage.jsx` | `/strategy-public-view-page` | `strategy_view` | Strategy Hub |

---

## 🧩 Components (17)

**Location:** `src/components/communications/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `AIMessageComposer.jsx` | AI message composition | Messaging |
| `AIMessageComposerWidget.jsx` | Message composer widget | Messaging |
| `AINotificationRouter.jsx` | AI notification routing | Notifications |
| `AINotificationRouterPanel.jsx` | Routing panel | Admin |
| `AnnouncementTargeting.jsx` | Announcement targeting | Announcements |
| `AutomatedStakeholderNotifier.jsx` | Stakeholder notifications | All entities |
| `CampaignAIHelpers.jsx` | Campaign AI helpers | Campaigns |
| `CampaignManager.jsx` | Campaign management | Campaigns |
| `CommunicationAnalytics.jsx` | Communication analytics | Analytics |
| `ConversationIntelligence.jsx` | Conversation intelligence | Messaging |
| `EmailAnalyticsDashboard.jsx` | Email analytics | Email Hub |
| `EmailLogsViewer.jsx` | Email logs | Email Hub |
| `EmailSettingsEditor.jsx` | Email settings | Email Hub |
| `EmailTemplateEditorContent.jsx` | Template editor | Email Hub |
| `MessagingEnhancements.jsx` | Messaging features | Messaging |
| `UpdateDigestGenerator.jsx` | Digest generation | Notifications |
| `UserPreferencesOverview.jsx` | User preferences | Settings |

### Root-Level Components
**Location:** `src/components/`

| Component | Description |
|-----------|-------------|
| `AutoNotification.jsx` | Auto notifications |
| `DeadlineAlerts.jsx` | Deadline alerts |
| `EmailTemplateManager.jsx` | Email templates |
| `NotificationRulesBuilder.jsx` | Notification rules |
| `ScheduledReports.jsx` | Scheduled reports |

---

## 🗄️ Database Tables

| Table | Purpose | Status |
|-------|---------|--------|
| `email_campaigns` | Campaign data | ✅ Verified |
| `campaign_recipients` | Campaign recipients | ✅ Verified |
| `email_logs` | Email logs | ✅ Verified |
| `communication_analytics` | Analytics data | ✅ Verified |
| `communication_notifications` | Notifications | ✅ Verified |
| `communication_plans` | Communication plans | ✅ Verified |
| `messages` | Direct messages | ✅ Verified |
| `notifications` | System notifications | ✅ Verified |

---

## 🪝 Hooks (8)

**Location:** `src/hooks/`

| Hook | Purpose |
|------|---------|
| `useCommunicationHub` | Communication hub data |
| `useMessaging` | Direct messaging |
| `useNotifications` | Notification management |
| `useNotificationPreferences` | User preferences |
| `useEmailTemplates` | Email template CRUD |
| `useEmailCampaigns` | Campaign management |
| `useEmailLogs` | Email log viewing |
| `useEmailAnalytics` | Email analytics |

---

## 🔐 RBAC Permissions

| Permission | Description |
|------------|-------------|
| `communications_view` | View communications |
| `communications_manage` | Manage communications |
| `notifications_manage` | Manage notifications |

---

## 🔄 Related Systems

| System | Relationship |
|--------|--------------|
| Strategy | Strategy communications |
| Citizens | Citizen notifications |
| All Entities | Stakeholder notifications |

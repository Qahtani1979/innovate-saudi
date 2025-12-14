# Knowledge & Content System Inventory

> **Version:** 1.0  
> **Last Updated:** 2025-12-14  
> **Total Assets:** 28 files (10 pages, 12 components, 3 hooks)  
> **Parent System:** Knowledge Management  
> **Hub Page:** `/knowledge`

---

## Overview

The Knowledge System manages the platform's knowledge base including documents, case studies, best practices, policy library, and learning resources.

---

## 📄 Pages (10)

| Page | File | Route | Permission | Parent |
|------|------|-------|------------|--------|
| **Knowledge** | `Knowledge.jsx` | `/knowledge` | `knowledge_view` | Self (Root) |
| Knowledge Graph | `KnowledgeGraph.jsx` | `/knowledge-graph` | `knowledge_view` | Knowledge |
| Knowledge Document Create | `KnowledgeDocumentCreate.jsx` | `/knowledge-document-create` | `knowledge_create` | Knowledge |
| Knowledge Document Edit | `KnowledgeDocumentEdit.jsx` | `/knowledge-document-edit` | `knowledge_edit` | Knowledge |
| Case Study Create | `CaseStudyCreate.jsx` | `/case-study-create` | `knowledge_create` | Knowledge |
| Case Study Edit | `CaseStudyEdit.jsx` | `/case-study-edit` | `knowledge_edit` | Knowledge |
| Lessons Learned Repository | `LessonsLearnedRepository.jsx` | `/lessons-learned-repository` | `knowledge_view` | Knowledge |
| Policy Library | `PolicyLibrary.jsx` | `/policy-library` | `knowledge_view` | Knowledge |
| Regulatory Library | `RegulatoryLibrary.jsx` | `/regulatory-library` | `knowledge_view` | Knowledge |
| Knowledge Resources Coverage Report | `KnowledgeResourcesCoverageReport.jsx` | `/knowledge-resources-coverage-report` | `admin` | Admin |

---

## 🧩 Components (12)

**Location:** `src/components/knowledge/`

| Component | Description | Used By |
|-----------|-------------|---------|
| `AIContentAutoTagger.jsx` | AI auto-tagging | Knowledge |
| `AILearningPathGenerator.jsx` | Learning paths | Knowledge |
| `ContextualKnowledgeWidget.jsx` | Contextual knowledge | All entities |
| `KnowledgeGamification.jsx` | Gamification | Knowledge |
| `KnowledgeGapDetector.jsx` | Gap detection | Knowledge |
| `KnowledgeImpactTracker.jsx` | Impact tracking | Knowledge |
| `KnowledgeQualityAuditor.jsx` | Quality auditing | Admin |
| `PolicyLibraryWidget.jsx` | Policy library widget | Policy |

### Root-Level Components
**Location:** `src/components/`

| Component | Description |
|-----------|-------------|
| `LLMPromptsLibrary.jsx` | LLM prompts library |
| `SemanticSearch.jsx` | Semantic search |

---

## 🪝 Hooks (3)

| Hook | Description |
|------|-------------|
| `useKnowledgeWithVisibility.js` | Knowledge with visibility |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `knowledge_documents` | Knowledge documents |
| `case_studies` | Case studies |
| `policy_documents` | Policy documents |
| `lessons_learned` | Lessons learned |

---

## 🔐 RBAC Permissions

| Permission | Description |
|------------|-------------|
| `knowledge_view` | View knowledge |
| `knowledge_create` | Create knowledge |
| `knowledge_edit` | Edit knowledge |
| `knowledge_manage` | Manage knowledge |

---

## 🔄 Related Systems

| System | Relationship |
|--------|--------------|
| Challenges | Challenge learnings |
| Pilots | Pilot outcomes |
| Programs | Program knowledge |
| Strategy | Strategic context |

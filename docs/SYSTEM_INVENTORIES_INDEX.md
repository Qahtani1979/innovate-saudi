# System Inventories Master Index

> **Last Updated:** 2025-12-14  
> **Total Systems:** 12 documented  
> **Total Files Tracked:** 500+

---

## 📚 Documented System Inventories

| System | Inventory File | Pages | Components | Hooks | Status |
|--------|----------------|-------|------------|-------|--------|
| **Strategy** | `docs/strategy/strategy-system-inventory.md` | 35 | 65 | 33 | ✅ Complete |
| **Challenges** | `docs/challenges/challenges-system-inventory.md` | 22 | 51 | 5 | ✅ Complete |
| **Pilots** | `docs/pilots/pilots-system-inventory.md` | 20 | 27 | 5 | ✅ Complete |
| **Programs** | `docs/programs/programs-system-inventory.md` | 25 | 40 | 3 | ✅ Complete |
| **R&D** | `docs/rd/rd-system-inventory.md` | 18 | 29 | 3 | ✅ Complete |
| **Solutions** | `docs/solutions/solutions-system-inventory.md` | 15 | 37 | 2 | ✅ Complete |

---

## 🔜 Systems Pending Documentation

| System | Hub Page | Estimated Assets |
|--------|----------|------------------|
| Sandboxes | `/sandboxes` | ~25 files |
| Living Labs | `/living-labs` | ~20 files |
| Partnerships | `/partnership-registry` | ~15 files |
| Municipalities | `/municipality-dashboard` | ~30 files |
| Citizens | `/citizen-dashboard` | ~40 files |
| MII | `/mii` | ~20 files |
| Admin | `/admin-portal` | ~50 files |
| User Management | `/user-management-hub` | ~25 files |
| Communications | `/communications-hub` | ~20 files |
| Knowledge | `/knowledge` | ~15 files |

---

## 🔗 System Relationships

```
Strategy (Root)
├── Challenges ← Strategy Cascade
│   ├── Solutions ← Challenge Matching
│   ├── Pilots ← Challenge Resolution
│   └── R&D ← Research Needs
├── Programs ← Strategy Cascade
│   ├── Pilots ← Program Outputs
│   └── Alumni → Impact Tracking
├── Partnerships ← Strategy Cascade
├── Living Labs ← Strategy Cascade
├── Sandboxes ← Regulatory Innovation
└── Budget ← Resource Allocation

Municipalities
├── Challenges (owns)
├── Pilots (hosts)
├── MII (measured by)
└── Citizens (serves)
```

---

## 📁 Directory Structure

```
docs/
├── strategy/
│   └── strategy-system-inventory.md
├── challenges/
│   └── challenges-system-inventory.md
├── pilots/
│   └── pilots-system-inventory.md
├── programs/
│   └── programs-system-inventory.md
├── rd/
│   └── rd-system-inventory.md
├── solutions/
│   └── solutions-system-inventory.md
└── SYSTEM_INVENTORIES_INDEX.md (this file)
```

---

## 🎯 Inventory Standards

Each inventory document includes:
1. **Overview** - System purpose and scope
2. **Pages** - All pages with routes, permissions, parent relationships
3. **Components** - All components organized by subdirectory
4. **Hooks** - All hooks with descriptions
5. **Database Tables** - Related Supabase tables
6. **RBAC Permissions** - Required permissions
7. **Related Systems** - Cross-system relationships

---

## 🔍 Finding Orphan Files

Files not tracked in any inventory should be added to the appropriate system or marked as orphans for cleanup.

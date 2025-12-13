# Strategy System Entity Integration Model

**Assessment Date:** 2025-12-13  
**Status:** ✅ 100% COMPLETE

---

## Integration Hierarchy Diagram

```
STRATEGIC PLANS (Root)
│
├── DIRECT INTEGRATION (explicit strategic_plan_ids[])
│   ├── Programs ✅
│   │   └── Events ✅ (also has direct!)
│   ├── Challenges ✅
│   ├── Partnerships ✅
│   ├── Sandboxes ✅
│   ├── Living Labs ✅
│   ├── Policy Documents ✅
│   └── Global Trends ✅
│
├── INDIRECT INTEGRATION (via parent chain)
│   ├── Solutions (via Challenge/Program) ✅
│   ├── Pilots (via Solution→Challenge) ✅
│   ├── Scaling Plans (via Pilot + R&D) ✅
│   ├── R&D Calls (via Challenges + Programs) ✅
│   ├── R&D Projects (via R&D Calls) ✅
│   ├── Matchmaker Applications ✅
│   ├── Innovation Proposals ✅
│   ├── Challenge Proposals ✅
│   ├── Email Campaigns ✅
│   ├── Contracts (via Pilot/Solution) ✅
│   └── Citizen Enrollments (via Pilot) ✅
│
└── NO INTEGRATION (by design)
    ├── Providers (External)
    ├── Organizations (External)
    ├── Citizen Ideas (Raw input)
    ├── Regions (Geographic)
    ├── Cities (Geographic)
    └── Sectors (Reference data)
```

---

## Model Corrections Applied

1. **Events** - Originally classified as INDIRECT, but has DIRECT integration fields
2. **Municipalities** - Reclassified as DIRECT (owns strategic_plan_id)
3. **Policy Documents** - Added to DIRECT integration (P2)
4. **Global Trends** - Added to DIRECT integration (P2)

---

## Reference

For detailed field mappings and status, see:
- **[strategy-integration-matrix.md](./strategy-integration-matrix.md)**

---

*Model last updated: 2025-12-13*

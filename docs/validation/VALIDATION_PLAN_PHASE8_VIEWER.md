# Phase 8: Viewer/Public Portal
## Validation Plan

**Version:** 1.0  
**Last Updated:** 2024-12-10  
**Reference:** `docs/personas/VIEWER_PERSONA.md`

---

## 1. PublicPortal Validation

### 1.1 Portal Access (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| V8-001 | Portal loads without auth | No login required | Critical |
| V8-002 | Page loads < 3 seconds | Performance | High |
| V8-003 | No console errors | Clean load | Critical |
| V8-004 | RTL layout correct | Arabic mode | High |
| V8-005 | Responsive on mobile | Layout adapts | High |
| V8-006 | SEO meta tags present | Title, description | High |
| V8-007 | Canonical URL set | SEO | Medium |
| V8-008 | Language toggle works | EN/AR switch | High |

### 1.2 Navigation Bar (10 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| V8-009 | About link works | Navigate | High |
| V8-010 | Challenges link works | PublicChallenges | High |
| V8-011 | Solutions link works | PublicSolutions | High |
| V8-012 | For Municipalities link | Info page | High |
| V8-013 | For Providers link | Info page | High |
| V8-014 | For Innovators link | Info page | High |
| V8-015 | For Researchers link | Info page | High |
| V8-016 | Language toggle | EN/AR button | High |
| V8-017 | Sign In button | Navigate to Auth | Critical |
| V8-018 | Get Started button | Navigate to Auth | Critical |

### 1.3 Hero Section (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| V8-019 | Hero renders correctly | Visual | High |
| V8-020 | Platform branding visible | Logo/name | High |
| V8-021 | Call to action clear | Button text | High |
| V8-022 | "Join Platform" button works | Navigate | High |
| V8-023 | "Explore" button works | Navigate | High |
| V8-024 | Hero responsive | Mobile layout | High |

### 1.4 Platform Statistics (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| V8-025 | Municipalities count | Real count | High |
| V8-026 | Challenges count | Real count | High |
| V8-027 | Solutions count | Real count | High |
| V8-028 | Pilots count | Real count | High |
| V8-029 | Numbers animate | Visual effect | Low |
| V8-030 | Stats accurate | DB counts | Critical |
| V8-031 | Stats refresh on load | Fresh data | Medium |
| V8-032 | Zero handling | If no data | Medium |

### 1.5 How It Works Section (4 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| V8-033 | 4 steps displayed | Process flow | High |
| V8-034 | Step icons visible | Visual | Medium |
| V8-035 | Step descriptions clear | Text | High |
| V8-036 | Section bilingual | EN/AR | High |

### 1.6 Top Municipalities (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| V8-037 | Top 5 municipalities shown | Ranked by MII | High |
| V8-038 | MII score displayed | Numeric | High |
| V8-039 | Municipality names correct | name_en/ar | High |
| V8-040 | Only active municipalities | is_active=true | High |
| V8-041 | Click navigates to detail | If allowed | Medium |
| V8-042 | Empty state handled | If no data | Medium |

### 1.7 Open Programs Section (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| V8-043 | Open programs displayed | status='open' | High |
| V8-044 | Funding indicator shown | Available funding | Medium |
| V8-045 | Application deadline shown | Date | High |
| V8-046 | Only published programs | is_published=true | Critical |
| V8-047 | "View All" link works | Navigate | High |
| V8-048 | Empty state handled | If no programs | Medium |

### 1.8 Featured Challenges (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| V8-049 | Featured challenges shown | is_featured=true | High |
| V8-050 | Challenge cards render | Title, sector | High |
| V8-051 | Only published challenges | is_published=true | Critical |
| V8-052 | Priority indicator | Visual badge | Medium |
| V8-053 | "View All" link works | Navigate | High |
| V8-054 | Empty state handled | If no featured | Medium |

### 1.9 Success Stories (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| V8-055 | Successful pilots shown | Completed/scaled | High |
| V8-056 | Outcome highlighted | Results achieved | High |
| V8-057 | Media gallery if exists | Images | Medium |
| V8-058 | Only published pilots | is_published=true | Critical |
| V8-059 | Municipality credited | Name shown | Medium |
| V8-060 | Empty state handled | If no stories | Medium |

### 1.10 Verified Solutions (6 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| V8-061 | Verified solutions shown | is_verified=true | Critical |
| V8-062 | Solution cards render | Name, provider | High |
| V8-063 | Maturity level shown | TRL/stage | Medium |
| V8-064 | Only published solutions | is_published=true | Critical |
| V8-065 | Rating displayed | If available | Medium |
| V8-066 | Empty state handled | If no solutions | Medium |

---

## 2. Public Pages

### 2.1 PublicChallenges (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| V8-067 | Page loads without auth | Public access | Critical |
| V8-068 | Only published challenges | is_published=true | Critical |
| V8-069 | Search works | Title/description | High |
| V8-070 | Filter by sector works | Dropdown | High |
| V8-071 | Filter by priority works | Dropdown | Medium |
| V8-072 | Pagination works | Page navigation | High |
| V8-073 | Challenge cards link | To detail page | High |
| V8-074 | No confidential data exposed | is_confidential filter | Critical |

### 2.2 PublicSolutions (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| V8-075 | Page loads without auth | Public access | Critical |
| V8-076 | Only verified solutions | is_verified=true | Critical |
| V8-077 | Only published solutions | is_published=true | Critical |
| V8-078 | Search works | Name/description | High |
| V8-079 | Filter by category works | Dropdown | High |
| V8-080 | Provider name shown | Company name | High |
| V8-081 | Deployment count shown | If available | Medium |
| V8-082 | Rating displayed | If available | Medium |

### 2.3 Information Pages (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| V8-083 | ForMunicipalities loads | Page renders | High |
| V8-084 | ForProviders loads | Page renders | High |
| V8-085 | ForInnovators loads | Page renders | High |
| V8-086 | ForResearchers loads | Page renders | High |
| V8-087 | CTA buttons work | Navigate to Auth | High |
| V8-088 | Content bilingual | EN/AR | High |
| V8-089 | SEO optimized | Meta tags | Medium |
| V8-090 | Mobile responsive | Layout | High |

---

## 3. Conversion Paths

### 3.1 Registration Flow (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| V8-091 | "Get Started" leads to Auth | Navigation | Critical |
| V8-092 | "Sign In" leads to Auth | Navigation | Critical |
| V8-093 | Registration works | Account created | Critical |
| V8-094 | Redirect to onboarding | After register | Critical |
| V8-095 | Persona selection available | 6 options | Critical |
| V8-096 | "Stay Viewer" option | Skip Phase 2 | High |
| V8-097 | Viewer gets Home access | After skip | High |
| V8-098 | Login returns to portal | If no onboarding | Medium |

---

## 4. Data Security (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| V8-099 | No draft challenges exposed | RLS enforced | Critical |
| V8-100 | No confidential data exposed | RLS enforced | Critical |
| V8-101 | No internal notes exposed | Field filtering | Critical |
| V8-102 | No user emails exposed | Privacy | Critical |
| V8-103 | No unpublished content | Status checks | Critical |
| V8-104 | API doesn't leak data | Response filtering | Critical |
| V8-105 | Console shows no sensitive data | Debug clean | High |
| V8-106 | Network requests secure | HTTPS only | Critical |

---

## 5. SEO & Analytics (8 checks)
| ID | Check | Expected | Priority |
|----|-------|----------|----------|
| V8-107 | Title tag present | <60 chars | High |
| V8-108 | Meta description present | <160 chars | High |
| V8-109 | Open Graph tags | Social sharing | Medium |
| V8-110 | Canonical URLs | Prevent duplicates | Medium |
| V8-111 | Structured data | JSON-LD | Low |
| V8-112 | Page view tracking | Analytics event | Medium |
| V8-113 | CTA click tracking | Analytics event | Medium |
| V8-114 | Language toggle tracking | Analytics event | Low |

---

## Summary

| Category | Total Checks |
|----------|--------------|
| Portal Access | 8 |
| Navigation Bar | 10 |
| Hero Section | 6 |
| Platform Statistics | 8 |
| How It Works | 4 |
| Top Municipalities | 6 |
| Open Programs | 6 |
| Featured Challenges | 6 |
| Success Stories | 6 |
| Verified Solutions | 6 |
| PublicChallenges Page | 8 |
| PublicSolutions Page | 8 |
| Information Pages | 8 |
| Registration Flow | 8 |
| Data Security | 8 |
| SEO & Analytics | 8 |
| **TOTAL** | **114 checks** |

---

## Files to Validate

| File | Purpose |
|------|---------|
| `src/pages/PublicPortal.jsx` | Main public landing |
| `src/pages/PublicChallenges.jsx` | Challenge browser |
| `src/pages/PublicSolutions.jsx` | Solution marketplace |
| `src/pages/ForMunicipalities.jsx` | Municipality info |
| `src/pages/ForProviders.jsx` | Provider info |
| `src/pages/ForInnovators.jsx` | Innovator info |
| `src/pages/ForResearchers.jsx` | Researcher info |
| `src/pages/Auth.jsx` | Login/Register |

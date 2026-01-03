# Finance & Budget System Inventory

**Version:** 1.0  
**Last Updated:** 2026-01-03  
**Status:** Active

## Overview

The Finance & Budget System manages all financial aspects including budgets, expenses, contracts, and invoices.

## Directory Structure

```
src/hooks/finance/
└── index.js                    # Consolidated hook exports
```

## Hooks Reference

### Budget Hooks
| Hook | Purpose |
|------|---------|
| `useBudgets` | Fetch budgets with filters |
| `useBudget` | Fetch single budget |
| `useBudgetMutations` | CRUD operations |
| `useBudgetsWithVisibility` | Visibility-aware fetch |
| `useBudgetAllocationApproval` | Budget approval gate |
| `useScalingBudgetApproval` | Scaling budget approval |

### Expense Hooks
| Hook | Purpose |
|------|---------|
| `usePilotExpenses` | Fetch pilot expenses |
| `useExpenseMutations` | CRUD operations |

### Contract Hooks
| Hook | Purpose |
|------|---------|
| `useContracts` | Fetch provider contracts |
| `useAllContracts` | Fetch all contracts |
| `useContract` | Fetch single contract |
| `useCreateContract` | Create contract |
| `useUpdateContract` | Update contract |

### Invoice Hooks
| Hook | Purpose |
|------|---------|
| `useInvoices` | Fetch invoices |
| `useInvoice` | Fetch single invoice |
| `useInvoiceMutations` | CRUD operations |
| `usePendingInvoices` | Fetch pending only |

## Import Example

```javascript
import { 
  useBudgets, 
  useExpenseMutations, 
  useContracts 
} from '@/hooks/finance';
```

# Strategy Permissions

## Permission Codes

| Permission | Description |
|------------|-------------|
| `strategy.view` | View strategic plans |
| `strategy.create` | Create new plans |
| `strategy.update` | Update plans |
| `strategy.delete` | Delete plans |
| `strategy.approve` | Approve plans |
| `strategy.manage_all` | Full admin access |

## Role Matrix

| Permission | Admin | Director | Manager | Staff | Viewer |
|------------|-------|----------|---------|-------|--------|
| `strategy.view` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `strategy.create` | ✓ | ✓ | ✓ | - | - |
| `strategy.update` | ✓ | ✓ | Own | - | - |
| `strategy.delete` | ✓ | - | - | - | - |
| `strategy.approve` | ✓ | ✓ | - | - | - |
| `strategy.manage_all` | ✓ | - | - | - | - |

## RLS Policies

- Admins can manage all plans
- Municipality staff can view own municipality plans
- Public can view published plans only

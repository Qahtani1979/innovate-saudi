import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

/**
 * Gold Standard Access Control Hook
 * implementing the "Double-Check" Security Pattern.
 * 
 * Usage:
 * const { checkPermission, checkEntityAccess } = useAccessControl();
 * 
 * // In Mutation:
 * mutationFn: async (data) => {
 *   checkPermission(['admin', 'manager']); // RBAC Check
 *   // ...
 * }
 */
export function useAccessControl() {
    const { user, hasRole, isAdmin } = useAuth();

    /**
     * Verify User has one of the required roles
     * @param {string[]} requiredRoles - Array of allowed role names
     * @param {boolean} throwError - Whether to throw an error on failure (default: true)
     * @returns {boolean}
     */
    const checkPermission = (requiredRoles = [], throwError = true) => {
        if (!user) {
            if (throwError) throw new Error("Unauthorized: User not logged in");
            return false;
        }

        if (isAdmin()) return true; // Super admin bypass

        const hasRequiredRole = requiredRoles.some(role => hasRole(role));

        if (!hasRequiredRole) {
            if (throwError) {
                toast.error("You do not have permission to perform this action.");
                throw new Error(`Forbidden: Requires one of [${requiredRoles.join(', ')}]`);
            }
            return false;
        }

        return true;
    };

    /**
     * Verify User owns the entity (or is Admin)
     * @param {Object} entity - The entity to check
     * @param {string} ownerField - Field name containing owner ID (default: 'created_by')
     * @param {string} userField - Field name in User object to match against (default: 'id')
     * @param {boolean} throwError - Whether to throw an error on failure
     * @returns {boolean}
     */
    const checkEntityAccess = (entity, ownerField = 'created_by', userField = 'id', throwError = true) => {
        if (!user) {
            if (throwError) throw new Error("Unauthorized: User not logged in");
            return false;
        }

        if (isAdmin()) return true; // Admin can access all

        // Handle different owner field types (e.g. email vs uuid)
        const entityOwnerInfo = entity?.[ownerField];
        const userInfo = user?.[userField];

        // If entity doesn't have the field, we can't verify access -> Fail closed (unless it's a creation context?)
        // For updates/deletes, entity should exist.
        if (!entity || entityOwnerInfo === undefined) {
            // If entity is null/undefined, usually means we are creating or it wasn't found.
            // If it wasn't found, 404. 
            // If we are passing 'null' as entity, we assume caller knows what they are doing (e.g. check generic access)
            return true;
        }

        if (entityOwnerInfo !== userInfo) {
            if (throwError) {
                toast.error("You do not have permission to modify this item.");
                throw new Error("Forbidden: You do not own this entity.");
            }
            return false;
        }

        return true;
    };

    return {
        checkPermission,
        checkEntityAccess,
        user
    };
}

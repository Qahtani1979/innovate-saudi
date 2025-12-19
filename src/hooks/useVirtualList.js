import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

/**
 * Custom hook for virtualizing large lists
 * Improves performance for lists with 100+ items
 * 
 * @param {Array} items - The array of items to virtualize
 * @param {Object} options - Configuration options
 * @param {number} options.estimatedSize - Estimated height of each item in pixels (default: 120)
 * @param {number} options.overscan - Number of items to render outside the visible area (default: 5)
 * @returns {Object} - Virtualizer instance and parent ref
 */
export function useVirtualList(items = [], options = {}) {
  const {
    estimatedSize = 120,
    overscan = 5,
    horizontal = false
  } = options;

  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedSize,
    overscan,
    horizontal
  });

  const virtualItems = virtualizer.getVirtualItems();

  const virtualizedItems = useMemo(() => {
    return virtualItems.map(virtualRow => ({
      ...virtualRow,
      item: items[virtualRow.index]
    }));
  }, [virtualItems, items]);

  return {
    parentRef,
    virtualizer,
    virtualItems: virtualizedItems,
    totalSize: virtualizer.getTotalSize(),
    isVirtualized: items.length > 50 // Only virtualize if more than 50 items
  };
}

export default useVirtualList;

import { Suspense, lazy, useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

export function LazyLoadWrapper({ component, fallback }) {
  const LoadingFallback = fallback || (
    <Card className="w-full">
      <CardContent className="flex items-center justify-center p-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Suspense fallback={LoadingFallback}>
      {component}
    </Suspense>
  );
}

// Helper to create lazy-loaded component
export function createLazyComponent(importFn) {
  return lazy(importFn);
}

// Intersection observer for lazy loading on scroll
export function useIntersectionObserver(callback, options = {}) {
  const [node, setNode] = useState(null);

  useEffect(() => {
    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback();
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, [node, callback]);

  return setNode;
}

// Lazy load list items as they come into view
export function LazyList({ items, renderItem, batchSize = 20 }) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  
  const loadMoreRef = useIntersectionObserver(() => {
    if (visibleCount < items.length) {
      setVisibleCount(prev => Math.min(prev + batchSize, items.length));
    }
  });

  return (
    <>
      {items.slice(0, visibleCount).map((item, idx) => renderItem(item, idx))}
      {visibleCount < items.length && (
        <div ref={loadMoreRef} className="py-4 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto" />
        </div>
      )}
    </>
  );
}
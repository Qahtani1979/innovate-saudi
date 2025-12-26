import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { pagesConfig } from '@/pages.config';

export default function NavigationTracker() {
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const { trackPageView } = useAnalytics();
    const { Pages, mainPage } = pagesConfig;
    const mainPageKey = mainPage ?? Object.keys(Pages)[0];

    // Post navigation changes to parent window
    useEffect(() => {
        window.parent?.postMessage({
            type: "app_changed_url",
            url: window.location.href
        }, '*');
    }, [location.pathname]);

    // Log user activity when navigating to a page
    useEffect(() => {
        if (!isAuthenticated || !user?.email) return;

        // Extract page name from pathname
        const pathname = location.pathname;
        let pageName;

        if (pathname === '/' || pathname === '') {
            pageName = mainPageKey;
        } else {
            // Remove leading slash and get the first segment
            const pathSegment = pathname.replace(/^\//, '').split('/')[0];

            // Try case-insensitive lookup in Pages config
            const pageKeys = Object.keys(Pages);
            const matchedKey = pageKeys.find(
                key => key.toLowerCase() === pathSegment.toLowerCase()
            );

            pageName = matchedKey || pathSegment;
        }

        // Log page view activity
        trackPageView(pageName, pathname, {
            search: location.search
        });
    }, [location.pathname, isAuthenticated, user, Pages, mainPageKey, trackPageView]);

    return null;
}

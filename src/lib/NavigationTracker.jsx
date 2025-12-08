import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { pagesConfig } from '@/pages.config';

export default function NavigationTracker() {
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
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
        const logPageView = async () => {
            try {
                await supabase.from('user_activities').insert({
                    user_email: user.email,
                    user_id: user.id,
                    activity_type: 'page_view',
                    page_url: pathname,
                    metadata: {
                        page_name: pageName,
                        search: location.search,
                        timestamp: new Date().toISOString()
                    }
                });
            } catch (error) {
                // Silently fail - logging shouldn't break the app
                console.debug('Failed to log page view:', error);
            }
        };
        
        logPageView();
    }, [location.pathname, isAuthenticated, user, Pages, mainPageKey]);

    return null;
}

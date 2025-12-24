import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';

export const useRLSValidation = () => {
    const { user } = useAuth();
    const [testResults, setTestResults] = useState({});
    const [testing, setTesting] = useState(false);

    const runValidationTest = async (testId, testFn) => {
        try {
            const result = await testFn(supabase, user);
            const resultWithTimestamp = {
                ...result,
                timestamp: new Date().toISOString()
            };
            setTestResults(prev => ({
                ...prev,
                [testId]: resultWithTimestamp
            }));
            return resultWithTimestamp;
        } catch (error) {
            const errorResult = {
                pass: false,
                message: 'Test error: ' + error.message,
                timestamp: new Date().toISOString()
            };
            setTestResults(prev => ({
                ...prev,
                [testId]: errorResult
            }));
            return errorResult;
        }
    };

    const runAllValidationTests = async (tests) => {
        setTesting(true);
        const results = {};
        for (const test of tests) {
            results[test.id] = await runValidationTest(test.id, test.test);
        }
        setTesting(false);
        return results;
    };

    return {
        testResults,
        testing,
        setTesting,
        runValidationTest,
        runAllValidationTests
    };
};

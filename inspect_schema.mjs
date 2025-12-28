import { supabase } from '@/integrations/supabase/client.js';

async function inspectSchema() {
    const tables = ['cities', 'municipalities', 'challenges', 'pilots', 'solutions', 'rd_projects', 'programs', 'policies'];

    console.log("--- Schema Inspection ---");

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);

        if (error) {
            console.error(`Error fetching ${table}:`, error.message);
            continue;
        }

        if (data && data.length > 0) {
            console.log(`\nTable: ${table}`);
            console.log(Object.keys(data[0]).join(', '));
        } else {
            console.log(`\nTable: ${table} (Empty - cannot infer keys from data)`);
        }
    }
}

inspectSchema();

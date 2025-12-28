import fs from 'fs';
import path from 'path';

// Adjust path as needed
const filePath = 'src/pages.config.js';
const absolutePath = path.resolve(process.cwd(), filePath);

console.log(`Analyzing: ${absolutePath}`);

try {
    const content = fs.readFileSync(absolutePath, 'utf8');

    // 1. Gather Imports
    const imports = new Set();
    const importRegex = /import\s+(?:(\w+)|\{\s*([\w\s,]+)\s*\})\s+from/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        if (match[1]) {
            imports.add(match[1]);
        }
        if (match[2]) {
            match[2].split(',').map(s => s.trim()).filter(Boolean).forEach(s => imports.add(s));
        }
    }

    // Add known globals or locally defined if any (none expected usually)
    imports.add('PAGES'); // export const PAGES

    console.log(`Found ${imports.size} imports.`);

    // 2. Parse PAGES object
    // We'll just regex the content inside the dictionary to avoid complex AST parsing for this check
    // Look for "Key": Value
    const pagesStart = content.indexOf('export const PAGES = {');
    if (pagesStart === -1) {
        throw new Error('Could not find export const PAGES = {');
    }

    // Naive extraction of the object block
    const pagesBlock = content.slice(pagesStart);

    const entryRegex = /"([\w]+)"\s*:\s*([\w]+)/g;
    const keys = new Set();
    const duplicates = [];
    const missingRefs = [];
    const definitions = [];

    let entryMatch;
    while ((entryMatch = entryRegex.exec(pagesBlock)) !== null) {
        const key = entryMatch[1];
        const value = entryMatch[2];

        definitions.push({ key, value });

        if (keys.has(key)) {
            duplicates.push(key);
        } else {
            keys.add(key);
        }

        if (!imports.has(value)) {
            missingRefs.push({ key, value });
        }
    }

    console.log('--- ANALYSIS RESULTS ---');

    if (duplicates.length > 0) {
        console.error('❌ DUPLICATE KEYS FOUND:');
        duplicates.forEach(k => console.error(`   - "${k}"`));
    } else {
        console.log('✅ No duplicate keys found.');
    }

    if (missingRefs.length > 0) {
        console.error('❌ UNDEFINED REFERENCES (Missing Import):');
        missingRefs.forEach(ref => console.error(`   - Key: "${ref.key}" refers to value "${ref.value}" which is not imported.`));
    } else {
        console.log('✅ All values appear to be imported.');
    }

} catch (err) {
    console.error('Error reading or parsing file:', err);
}

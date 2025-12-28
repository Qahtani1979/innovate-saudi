import fs from 'fs';
import path from 'path';

const filePath = 'src/pages.config.js';
const absolutePath = path.resolve(process.cwd(), filePath);

console.log(`Analyzing: ${absolutePath}`);

try {
    let content = fs.readFileSync(absolutePath, 'utf8');

    // 1. Strip Comments
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    content = content.replace(/\/\/.*$/gm, '');

    // Extract PAGES object block roughly
    const pagesStart = content.indexOf('export const PAGES = {');
    if (pagesStart === -1) throw new Error('Could not find export const PAGES = {');
    const pagesContent = content.slice(pagesStart);

    // Regex for keys
    const propertyRegex = /(?:["']?([\w]+)["']?)\s*:\s*([\w]+)/g;

    const keysFound = [];
    const duplicates = new Set();

    let match;
    while ((match = propertyRegex.exec(pagesContent)) !== null) {
        const key = match[1];
        // Ignore structural keys
        if (key === 'mainPage' || key === 'Layout' || key === 'Pages') continue;

        if (keysFound.includes(key)) {
            duplicates.add(key);
        }
        keysFound.push(key);
    }

    // Write all keys to a file for manual inspection
    fs.writeFileSync('keys_dump.txt', keysFound.sort().join('\n'));

    console.log(`Scanned ${keysFound.length} keys.`);
    if (duplicates.size > 0) {
        console.error('❌ DUPLICATES:', Array.from(duplicates));
    } else {
        console.log('✅ No duplicate keys found.');
    }

} catch (err) {
    console.error(err);
}

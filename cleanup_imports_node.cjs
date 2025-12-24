const fs = require('fs');
const path = require('path');

const walk = function (dir, done) {
    let results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        let pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function (file) {
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

const srcDir = path.join(__dirname, 'src');

walk(srcDir, function (err, results) {
    if (err) throw err;

    const jsFiles = results.filter(f => f.endsWith('.js') || f.endsWith('.jsx'));
    let cleanedCount = 0;

    jsFiles.forEach(file => {
        try {
            let content = fs.readFileSync(file, 'utf8');
            // Regex matches import { base44 } from ... with various quotes, optional semicolons, and whitespace
            const regex = /^\s*import\s+\{\s*base44\s*\}\s+from\s+['"]@\/api\/base44Client['"];?\s*$/gm;

            if (regex.test(content)) {
                const newContent = content.replace(regex, '');
                // Remove empty lines at the top if any created (heuristic)
                // const trimmedContent = newContent.replace(/^\s*[\r\n]/gm, ''); 

                if (content !== newContent) {
                    fs.writeFileSync(file, newContent, 'utf8');
                    console.log(`Cleaned: ${path.relative(__dirname, file)}`);
                    cleanedCount++;
                }
            }
        } catch (e) {
            console.error(`Error processing ${file}:`, e);
        }
    });

    console.log(`Cleanup complete. Modified ${cleanedCount} files.`);
});

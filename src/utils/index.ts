export function createPageUrl(pageName: string) {
    // Convert camelCase/PascalCase to kebab-case
    // e.g., RemainingGapsReport -> remaining-gaps-report
    return '/' + pageName
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
        .toLowerCase()
        .replace(/ /g, '-');
}

import ReactMarkdown from 'react-markdown';

/**
 * Renders markdown content with proper styling for the copilot chat.
 */
export function MarkdownMessage({ content }) {
    if (!content) return null;

    return (
        <ReactMarkdown
            className="prose prose-sm max-w-none dark:prose-invert 
                prose-p:my-1.5 prose-p:leading-relaxed
                prose-headings:my-2 prose-headings:font-semibold
                prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
                prose-ul:my-1.5 prose-ul:pl-4 prose-ol:my-1.5 prose-ol:pl-4
                prose-li:my-0.5 prose-li:marker:text-muted-foreground
                prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-muted prose-pre:p-3 prose-pre:rounded-md prose-pre:overflow-x-auto
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:font-semibold prose-strong:text-foreground
                prose-blockquote:border-l-2 prose-blockquote:border-primary/30 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-muted-foreground"
            components={{
                // Custom link handling to open in new tab
                a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {children}
                    </a>
                ),
                // Custom code block styling
                code: ({ inline, className, children, ...props }) => {
                    if (inline) {
                        return (
                            <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono" {...props}>
                                {children}
                            </code>
                        );
                    }
                    return (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    );
                }
            }}
        >
            {content}
        </ReactMarkdown>
    );
}

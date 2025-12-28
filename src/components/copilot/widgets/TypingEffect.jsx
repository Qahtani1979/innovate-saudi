import { useState, useEffect } from 'react';

/**
 * Simulates a typing effect for text content.
 * @param {string} text - The full text to display.
 * @param {number} speed - Milliseconds per character (default: 15ms).
 * @param {function} onComplete - Callback when typing finishes.
 */
export function TypingEffect({ text, speed = 15, onComplete }) {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            setDisplayedText(text.substring(0, i + 1));
            i++;
            if (i > text.length) {
                clearInterval(timer);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed, onComplete]);

    return <span>{displayedText}</span>;
}

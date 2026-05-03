import React from 'react';
/**
 * Convert an inline style string into a JS object.
 * @param style
 */
export const parseStyleString = (style: string): React.CSSProperties => {
    return Object.fromEntries(
        style
            .split(';')
            .filter(Boolean)
            .map((rule) => {
                const [key, value] = rule.split(':');
                const camelCaseKey = key
                    .trim()
                    .replace(/-([a-z])/g, (_, char) => char.toUpperCase());

                return [camelCaseKey, value ? value.trim() : ''];
            }),
    );
};

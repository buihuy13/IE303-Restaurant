export function getBlogExcerpt(markdown: string, maxLength = 180) {
    const plainText = markdown
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
        .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
        .replace(/[#>*_~`-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (plainText.length <= maxLength) return plainText;
    return `${plainText.slice(0, maxLength).trimEnd()}...`;
}

export function getReadingTime(markdown: string) {
    const words = getBlogExcerpt(markdown, Number.MAX_SAFE_INTEGER).split(/\s+/).filter(Boolean);
    return Math.max(1, Math.ceil(words.length / 220));
}

export function toMarkdownHeadingId(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

export function getMarkdownHeadings(markdown: string) {
    return markdown
        .split("\n")
        .map((line) => {
            const match = line.match(/^(#{2,3})\s+(.+)$/);
            if (!match) return null;
            const text = match[2].trim();
            return {
                level: match[1].length,
                text,
                id: toMarkdownHeadingId(text),
            };
        })
        .filter((heading): heading is { level: number; text: string; id: string } => !!heading);
}

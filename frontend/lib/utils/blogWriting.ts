import { getMarkdownHeadings } from "@/lib/utils/blogText";

const WORDS_PER_MINUTE = 220;
const TARGET_WORD_COUNT = 300;
const TARGET_SECTION_COUNT = 3;

function getPlainMarkdownText(markdown: string) {
    return markdown
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
        .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/^>\s?/gm, "")
        .replace(/[*_~`-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function getBlogWritingStats(markdown: string, coverImageUrl?: string | null) {
    const plainText = getPlainMarkdownText(markdown);
    const words = plainText ? plainText.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;
    const headings = getMarkdownHeadings(markdown);
    const imageCount = (markdown.match(/!\[[^\]]*]\([^)]*\)/g) ?? []).length;
    const estimatedReadTime = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));

    const checks = [
        {
            id: "intro",
            label: "Strong opening paragraph",
            met: plainText.length >= 120,
        },
        {
            id: "length",
            label: `At least ${TARGET_WORD_COUNT} words`,
            met: wordCount >= TARGET_WORD_COUNT,
        },
        {
            id: "sections",
            label: `At least ${TARGET_SECTION_COUNT} clear sections`,
            met: headings.length >= TARGET_SECTION_COUNT,
        },
        {
            id: "cover",
            label: "Cover image ready",
            met: Boolean(coverImageUrl),
        },
        {
            id: "visuals",
            label: "One supporting image inside the story",
            met: imageCount > 0,
        },
    ];

    const completedChecks = checks.filter((check) => check.met).length;
    const qualityScore = Math.round((completedChecks / checks.length) * 100);
    const qualityLabel = qualityScore >= 80 ? "Ready to polish" : qualityScore >= 50 ? "Good draft" : "Needs structure";

    return {
        wordCount,
        headingCount: headings.length,
        imageCount,
        estimatedReadTime,
        qualityScore,
        qualityLabel,
        checks,
    };
}

export function buildBlogEditorialTemplate(title?: string) {
    const topic = title?.trim() || "this food story";

    return `Open with a short scene that makes readers care about ${topic}. Mention the flavor, the place, the feeling, or the problem this article helps them solve.

## Why This Story Matters

Explain the main idea in 2-3 paragraphs. Give readers the context they need before you move into details. Keep the tone warm, specific, and useful.

## What To Notice

- Point out one concrete detail readers can use right away.
- Add a second detail with a practical example.
- Add a third detail that connects the story back to FoodEats or the restaurant experience.

## Practical Notes

Share the most helpful tips, tradeoffs, or observations. If this is a restaurant story, mention the dish, occasion, timing, budget, or who it is best for.

## A Better Way To Try It

Give readers a simple next step. This can be a food pairing, a visit plan, a cooking tip, or a question to ask before ordering.

## Closing Thought

End with one memorable takeaway. Keep it human and confident so the article feels complete.`;
}

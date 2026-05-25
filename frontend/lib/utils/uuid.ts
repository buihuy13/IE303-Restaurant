/** Matches canonical 8-4-4-4-12 hex ids (includes local seed ids like `...-1000-...`). */
export const CANONICAL_UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isCanonicalUuid(value: string): boolean {
    return CANONICAL_UUID_REGEX.test(value.trim());
}

import { Message } from "@/types";

export const toTimestampMs = (value: unknown) => {
    if (value == null) return 0;
    if (value instanceof Date) {
        const ms = value.getTime();
        return Number.isFinite(ms) ? ms : 0;
    }
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }
    if (Array.isArray(value)) {
        const numericParts = value.map((part) => Number(part));
        if (numericParts.every(Number.isFinite)) {
            if (numericParts.length >= 3) {
                const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = numericParts;
                const milli = nano > 999 ? Math.floor(nano / 1_000_000) : nano;
                const utcMs = Date.UTC(year, month - 1, day, hour, minute, second, milli);
                if (Number.isFinite(utcMs)) {
                    return utcMs;
                }
            }
            if (numericParts.length === 2) {
                const [secondPart, nanoPart] = numericParts;
                if (secondPart > 0) {
                    return secondPart * 1000 + Math.floor(nanoPart / 1_000_000);
                }
            }
        }
    }
    const raw = typeof value === "string" ? value.trim() : String(value).trim();
    if (!raw) return 0;
    if (/^\d+$/.test(raw)) {
        const numeric = Number(raw);
        if (Number.isFinite(numeric)) {
            return raw.length <= 10 ? numeric * 1000 : numeric;
        }
    }
    const normalized = raw
        .replace(" ", "T")
        .replace(/\.(\d{3})\d+/, ".$1");
    const needsTimezone = !/[zZ]$/.test(normalized) && !/[+-]\d{2}:\d{2}$/.test(normalized);
    const withTimezone = needsTimezone ? `${normalized}Z` : normalized;
    const parsed = new Date(withTimezone).getTime();
    if (!Number.isNaN(parsed)) {
        return parsed;
    }

    if (typeof value === "object") {
        const candidate = value as {
            epochMilli?: number;
            epochSecond?: number;
            nano?: number;
            seconds?: number;
            nanos?: number;
            year?: number;
            monthValue?: number;
            month?: number;
            dayOfMonth?: number;
            day?: number;
            hour?: number;
            minute?: number;
            second?: number;
        };
        if (typeof candidate.epochMilli === "number" && Number.isFinite(candidate.epochMilli)) {
            return candidate.epochMilli;
        }
        const secondPart =
            typeof candidate.epochSecond === "number"
                ? candidate.epochSecond
                : typeof candidate.seconds === "number"
                  ? candidate.seconds
                  : null;
        if (secondPart != null && Number.isFinite(secondPart)) {
            const nanoPart =
                typeof candidate.nano === "number"
                    ? candidate.nano
                    : typeof candidate.nanos === "number"
                      ? candidate.nanos
                      : 0;
            return secondPart * 1000 + Math.floor(nanoPart / 1_000_000);
        }

        const year = typeof candidate.year === "number" ? candidate.year : null;
        const monthRaw =
            typeof candidate.monthValue === "number"
                ? candidate.monthValue
                : typeof candidate.month === "number"
                  ? candidate.month
                  : null;
        const day =
            typeof candidate.dayOfMonth === "number"
                ? candidate.dayOfMonth
                : typeof candidate.day === "number"
                  ? candidate.day
                  : null;
        if (year != null && monthRaw != null && day != null) {
            const hour = typeof candidate.hour === "number" ? candidate.hour : 0;
            const minute = typeof candidate.minute === "number" ? candidate.minute : 0;
            const second = typeof candidate.second === "number" ? candidate.second : 0;
            const nano =
                typeof candidate.nano === "number"
                    ? candidate.nano
                    : typeof candidate.nanos === "number"
                      ? candidate.nanos
                      : 0;
            const utcMs = Date.UTC(year, monthRaw - 1, day, hour, minute, second, Math.floor(nano / 1_000_000));
            if (Number.isFinite(utcMs)) {
                return utcMs;
            }
        }
    }

    return 0;
};

export const isPendingLocalMessageId = (id: string) => id.startsWith("temp-") || id.startsWith("live-");

export const messagesLikelyMatch = (
    a: Pick<Message, "id" | "content" | "senderId" | "receiverId" | "timestamp">,
    b: Pick<Message, "id" | "content" | "senderId" | "receiverId" | "timestamp">,
) => {
    if (a.id === b.id && !isPendingLocalMessageId(a.id)) {
        return true;
    }
    const normalizeId = (value: string) => value.trim().toLowerCase();
    return (
        a.content.trim() === b.content.trim() &&
        normalizeId(a.senderId) === normalizeId(b.senderId) &&
        normalizeId(a.receiverId) === normalizeId(b.receiverId) &&
        Math.abs(toTimestampMs(a.timestamp) - toTimestampMs(b.timestamp)) < 30_000
    );
};

/** Stable chronological order; pending local messages stay after persisted ones at the same second. */
export const sortChatMessages = <T extends Pick<Message, "timestamp" | "id">>(messages: T[]): T[] => {
    return [...messages].sort((a, b) => {
        const timeDiff = toTimestampMs(a.timestamp) - toTimestampMs(b.timestamp);
        if (timeDiff !== 0) {
            return timeDiff;
        }
        const aPending = isPendingLocalMessageId(a.id);
        const bPending = isPendingLocalMessageId(b.id);
        if (aPending !== bPending) {
            return aPending ? 1 : -1;
        }
        return a.id.localeCompare(b.id);
    });
};

/** Merge API sync with in-flight optimistic messages without reorder jumps. */
export const mergeChatMessages = (previous: Message[], server: Message[]): Message[] => {
    const merged: Message[] = [...server];
    for (const local of previous) {
        if (!isPendingLocalMessageId(local.id)) {
            continue;
        }
        if (server.some((remote) => messagesLikelyMatch(remote, local))) {
            continue;
        }
        merged.push(local);
    }
    return sortChatMessages(merged);
};

/** Keep optimistic sends at the bottom when server timestamps lag behind the client clock. */
export const reconcileSentMessageTimestamp = (previousTimestamp: unknown, serverTimestamp: unknown) => {
    const previousMs = toTimestampMs(previousTimestamp) || Date.now();
    const serverMs = toTimestampMs(serverTimestamp);
    const resolvedMs = serverMs > 0 ? Math.max(previousMs, serverMs) : previousMs;
    return new Date(resolvedMs).toISOString();
};

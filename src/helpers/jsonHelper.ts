export function parseJsonField<T>(field: T | string | null | undefined, fallback: T): T {
    if (!field) return fallback;
    if (typeof field === "string") {
        try {
            return JSON.parse(field) as T;
        } catch (err) {
            console.warn("Failed to parse JSON field:", err);
            return fallback;
        }
    }
    return field;
}

export function stringifyJsonField<T>(field: T): string {
    try {
        return JSON.stringify(field, null, 2);
    } catch (err) {
        console.warn("Failed to stringify JSON field:", err);
        return "{}";
    }
}
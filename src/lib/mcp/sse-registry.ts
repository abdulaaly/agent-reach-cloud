// In-memory registry for active SSE sessions

export const activeSseSessions = new Map<string, (data: string) => void>();

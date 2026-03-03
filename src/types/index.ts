// tipe-tipe data buat bridge saweria ke roblox

// ─── Environment ───────────────────────────────────────────

// secrets yg disimpen di cloudflare
export interface Env {
    SAWERIA_SECRET: string;
    ROBLOX_UNIVERSE_ID: string;
    ROBLOX_API_KEY: string;
}

// ─── Saweria Webhook ───────────────────────────────────────

// payload yg dikirim saweria pas ada donasi
export interface SaweriaWebhook {
    version: string;
    created_at: string;
    id: string;
    type: string;
    amount_raw: number;
    cut_raw: number;
    donator_name: string;
    donator_email: string;
    message: string;
}

// cek apakah data nya bener format saweria apa cuma sampah
export function isSaweriaWebhook(data: unknown): data is SaweriaWebhook {
    if (typeof data !== 'object' || data === null) return false;

    const obj = data as Record<string, unknown>;

    return (
        typeof obj.id === 'string' &&
        typeof obj.type === 'string' &&
        typeof obj.donator_name === 'string' &&
        typeof obj.message === 'string' &&
        typeof obj.amount_raw === 'number' &&
        typeof obj.cut_raw === 'number'
    );
}

// ─── API Response ──────────────────────────────────────────

// format standar buat bales response
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

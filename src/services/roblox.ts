// kurir — kirim pesan ke roblox open cloud, retry kalo gagal

import type { Env } from '../types';

const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 1000;

export interface RobloxSendResult {
    ok: boolean;
    statusCode: number;
    errorDetail?: string;
}

// tembak messaging service roblox, retry 1x kalo 5xx
export async function publishToMessagingService(
    env: Env,
    topic: string,
    message: string
): Promise<RobloxSendResult> {
    const url = `https://apis.roblox.com/messaging-service/v1/universes/${env.ROBLOX_UNIVERSE_ID}/topics/${encodeURIComponent(topic)}`;

    const headers = {
        'x-api-key': env.ROBLOX_API_KEY,
        'Content-Type': 'application/json',
    };

    const body = JSON.stringify({ message });
    let lastError = '';

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(url, { method: 'POST', headers, body });

            if (response.ok) {
                return { ok: true, statusCode: response.status };
            }

            const errText = await response.text();
            lastError = errText;

            // 5xx / 429 = roblox lagi ngambek atau rate limit, coba lagi
            if ((response.status >= 500 || response.status === 429) && attempt < MAX_RETRIES) {
                console.warn(`[roblox] error ${response.status}, retry ${RETRY_DELAY_MS}ms...`, errText);
                await sleep(RETRY_DELAY_MS);
                continue;
            }

            console.error(`[roblox] gagal (${response.status}):`, errText);
            return { ok: false, statusCode: response.status, errorDetail: errText };
        } catch (err) {
            // network error (dns, timeout, dll)
            lastError = err instanceof Error ? err.message : String(err);
            console.error(`[roblox] network error (attempt ${attempt + 1}):`, lastError);

            if (attempt < MAX_RETRIES) {
                await sleep(RETRY_DELAY_MS);
                continue;
            }

            return { ok: false, statusCode: 0, errorDetail: `Network error: ${lastError}` };
        }
    }

    return { ok: false, statusCode: 0, errorDetail: `Retry habis. Error terakhir: ${lastError}` };
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

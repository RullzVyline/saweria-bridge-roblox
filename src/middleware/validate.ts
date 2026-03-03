// tukang cek — parse json, validasi field, tolak yg sampah

import { isSaweriaWebhook, type SaweriaWebhook } from '../types';
import { errorResponse } from '../utils/response';

const MAX_BODY_SIZE = 10 * 1024;

export interface ValidationResult {
    data: SaweriaWebhook | null;
    error: Response | null;
}

// baca body, parse json, cek format saweria
export async function validateWebhookPayload(
    request: Request
): Promise<ValidationResult> {
    let bodyText: string;

    try {
        bodyText = await request.text();
    } catch {
        return {
            data: null,
            error: errorResponse('Ga bisa baca body nya', 400),
        };
    }

    if (new TextEncoder().encode(bodyText).byteLength > MAX_BODY_SIZE) {
        return {
            data: null,
            error: errorResponse('Kegedean, max 10KB', 413),
        };
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(bodyText);
    } catch {
        return {
            data: null,
            error: errorResponse('JSON nya rusak bro', 400),
        };
    }

    // ga lolos type guard = payload sampah
    if (!isSaweriaWebhook(parsed)) {
        return {
            data: null,
            error: errorResponse('Field nya kurang — butuh id, type, donator_name, message, amount_raw, cut_raw', 400),
        };
    }

    return { data: parsed, error: null };
}

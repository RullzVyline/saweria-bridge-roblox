// otak donasi — auth, validasi, sanitasi, kirim ke roblox

import type { Env } from '../types';
import { authenticateRequest, validateRequestBasics } from '../middleware/auth';
import { validateWebhookPayload } from '../middleware/validate';
import { sanitizeDonationPayload } from '../utils/sanitize';
import { successResponse, errorResponse } from '../utils/response';
import { publishToMessagingService } from '../services/roblox';

const TOPIC = 'SaweriaDonasi';

export async function handleWebhook(
    request: Request,
    env: Env,
    url: URL
): Promise<Response> {
    // 1. cek secret key dari query param
    const authError = await authenticateRequest(url, env);
    if (authError) return authError;

    // 2. cek content-type & ukuran
    const basicError = validateRequestBasics(request);
    if (basicError) return basicError;

    // 3. parse & validasi payload
    const { data, error: validationError } = await validateWebhookPayload(request);
    if (validationError || !data) return validationError!;

    // 4. skip kalo bukan donasi
    if (data.type !== 'donation') {
        return successResponse(`bukan donasi, skip (type: ${data.type})`);
    }

    // 5. bersihin & rakit payload
    const payload = sanitizeDonationPayload(data.donator_name, data.amount_raw, data.message);
    console.log(`[webhook] donasi masuk: ${data.donator_name} — Rp ${data.amount_raw}`);

    // 6. kirim ke roblox
    const result = await publishToMessagingService(env, TOPIC, payload);

    if (!result.ok) {
        console.error(`[webhook] gagal kirim (${result.statusCode}):`, result.errorDetail);
        return errorResponse('Gagal kirim ke game server', 502);
    }

    console.log('[webhook] donasi berhasil diteruskan ✓');
    return successResponse('Donasi berhasil dikirim ke Roblox');
}

// otak donasi — auth, validasi, sanitasi, simpen ke db, kirim ke roblox

import type { Env } from '../types';
import { authenticateRequest, validateRequestBasics } from '../middleware/auth';
import { validateWebhookPayload } from '../middleware/validate';
import { sanitizeDonationPayload } from '../utils/sanitize';
import { successResponse, errorResponse } from '../utils/response';
import { publishToMessagingService } from '../services/roblox';
import { saveDonation } from '../services/database';

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

    console.log(`[webhook] donasi masuk: ${data.donator_name} — Rp ${data.amount_raw}`);

    // 5. simpen ke database (duplikat otomatis di-skip)
    await saveDonation(env, data.id, data.donator_name, data.amount_raw, data.message);

    // 6. bersihin & rakit payload buat roblox
    const payload = sanitizeDonationPayload(data.donator_name, data.amount_raw, data.message);

    // 7. kirim ke roblox
    const result = await publishToMessagingService(env, TOPIC, payload);

    if (!result.ok) {
        console.error(`[webhook] gagal kirim (${result.statusCode}):`, result.errorDetail);
        // donasi tetep kesimpen di db walaupun gagal kirim ke roblox
        return errorResponse('Donasi tersimpan, tapi gagal kirim ke game server', 502);
    }

    console.log('[webhook] donasi berhasil diteruskan ✓');
    return successResponse('Donasi tersimpan dan dikirim ke Roblox');
}

// satpam — cek secret key dari query param + basic request validation

import type { Env } from '../types';
import { timingSafeEqual } from '../utils/crypto';
import { errorResponse } from '../utils/response';

const MAX_BODY_SIZE = 10 * 1024; // 10KB maks

// cek secret key dari url query param ?secret=xxx
export async function authenticateRequest(
    url: URL,
    env: Env
): Promise<Response | null> {
    const secret = url.searchParams.get('secret');

    if (!secret) {
        return errorResponse('Unauthorized: secret nya mana', 403);
    }

    const isValid = await timingSafeEqual(secret, env.SAWERIA_SECRET);

    if (!isValid) {
        return errorResponse('Unauthorized: secret nya salah', 403);
    }

    return null;
}

// cek content-type sama ukuran body
export function validateRequestBasics(request: Request): Response | null {
    const contentType = request.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
        return errorResponse('Content-Type harus application/json', 400);
    }

    const contentLength = request.headers.get('Content-Length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
        return errorResponse('Kegedean cuy, max 10KB', 413);
    }

    return null;
}

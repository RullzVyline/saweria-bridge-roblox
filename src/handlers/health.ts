// cek nadi — buat mastiin worker masih idup

import { jsonResponse } from '../utils/response';

export function handleHealth(): Response {
    return jsonResponse(
        {
            success: true,
            message: 'hidup kok tenang',
            data: {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
            },
        },
        200
    );
}

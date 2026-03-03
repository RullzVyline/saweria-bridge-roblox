// router utama — atur siapa masuk lewat mana

import type { Env } from './types';
import { handleWebhook } from './handlers/webhook';
import { handleHealth } from './handlers/health';
import { errorResponse, corsResponse } from './utils/response';

export default {
    async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);
        const { pathname } = url;
        const method = request.method.toUpperCase();

        if (method === 'OPTIONS') return corsResponse();

        if (pathname === '/health' && method === 'GET') return handleHealth();

        if (pathname === '/webhook' && method === 'POST') return handleWebhook(request, env, url);

        if (pathname === '/' && method === 'GET') {
            return errorResponse('Saweria Bridge — POST /webhook buat nerima donasi', 200);
        }

        if (pathname === '/webhook' && method !== 'POST') {
            return errorResponse('Pake POST bro, bukan ' + method, 405);
        }

        return errorResponse('Nyasar lu, 404', 404);
    },
};

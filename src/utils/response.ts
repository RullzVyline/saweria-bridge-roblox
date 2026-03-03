// tukang bungkus response biar rapi dan aman

import type { ApiResponse } from '../types';

const SECURITY_HEADERS: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Cache-Control': 'no-store',
};

// bales response json + security headers
export function jsonResponse<T>(body: ApiResponse<T>, status: number = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: SECURITY_HEADERS,
    });
}

export function successResponse(message: string, data?: unknown): Response {
    return jsonResponse({ success: true, message, data }, 200);
}

// buat error — ga pernah bocor detail internal
export function errorResponse(message: string, status: number): Response {
    return jsonResponse({ success: false, message }, status);
}

// bales cors preflight biar browser ga ngomel
export function corsResponse(): Response {
    return new Response(null, {
        status: 204,
        headers: {
            ...SECURITY_HEADERS,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400',
        },
    });
}

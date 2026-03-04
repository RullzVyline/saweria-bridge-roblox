// handler leaderboard + histori donasi — public, ga perlu auth

import type { Env } from '../types';
import { getLeaderboard, getRecentDonations } from '../services/database';
import { successResponse, errorResponse } from '../utils/response';

// GET /leaderboard?limit=10
export async function handleLeaderboard(
    env: Env,
    url: URL
): Promise<Response> {
    const limitParam = url.searchParams.get('limit');
    const limit = Math.min(Math.max(parseInt(limitParam || '10', 10) || 10, 1), 50);

    try {
        const leaderboard = await getLeaderboard(env, limit);
        return successResponse('Leaderboard donatur', leaderboard);
    } catch (err) {
        console.error('[leaderboard] error:', err);
        return errorResponse('Gagal ambil leaderboard', 500);
    }
}

// GET /donations?limit=20
export async function handleDonations(
    env: Env,
    url: URL
): Promise<Response> {
    const limitParam = url.searchParams.get('limit');
    const limit = Math.min(Math.max(parseInt(limitParam || '20', 10) || 20, 1), 100);

    try {
        const donations = await getRecentDonations(env, limit);
        return successResponse('Histori donasi terbaru', donations);
    } catch (err) {
        console.error('[donations] error:', err);
        return errorResponse('Gagal ambil histori donasi', 500);
    }
}

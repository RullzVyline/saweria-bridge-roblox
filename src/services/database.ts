// gudang data — simpen dan baca donasi dari D1

import type { Env, DonationRow, LeaderboardEntry } from '../types';

// simpen donasi baru ke database (skip kalo udah ada / duplikat)
export async function saveDonation(
    env: Env,
    saweriaId: string,
    donatorName: string,
    amount: number,
    message: string
): Promise<boolean> {
    try {
        await env.DB.prepare(
            `INSERT OR IGNORE INTO donations (saweria_id, donator_name, amount, message)
             VALUES (?, ?, ?, ?)`
        )
            .bind(saweriaId, donatorName, amount, message)
            .run();
        return true;
    } catch (err) {
        console.error('[db] gagal simpen donasi:', err);
        return false;
    }
}

// ambil leaderboard — top donatur berdasarkan total nominal
export async function getLeaderboard(
    env: Env,
    limit: number = 10
): Promise<LeaderboardEntry[]> {
    const result = await env.DB.prepare(
        `SELECT
            donator_name,
            SUM(amount) as total_amount,
            COUNT(*) as donation_count
         FROM donations
         GROUP BY donator_name
         ORDER BY total_amount DESC
         LIMIT ?`
    )
        .bind(limit)
        .all<{ donator_name: string; total_amount: number; donation_count: number }>();

    return (result.results || []).map((row, i) => ({
        rank: i + 1,
        donator_name: row.donator_name,
        total_amount: row.total_amount,
        donation_count: row.donation_count,
    }));
}

// ambil histori donasi terbaru
export async function getRecentDonations(
    env: Env,
    limit: number = 20
): Promise<DonationRow[]> {
    const result = await env.DB.prepare(
        `SELECT * FROM donations ORDER BY id DESC LIMIT ?`
    )
        .bind(limit)
        .all<DonationRow>();

    return result.results || [];
}

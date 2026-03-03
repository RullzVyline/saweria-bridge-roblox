// bersihin input biar ga ngacauin format payload

const MAX_MESSAGE_BYTES = 1024; // limit roblox messaging service
const WRAPPER_OVERHEAD = 128;

// escape karakter | biar ga rusak format "DONASI|nama|duit|pesan"
export function escapePipe(str: string): string {
    return str.replace(/\|/g, '\\|');
}

// potong string kalo kepanjangan (biar ga ditolak roblox)
export function truncateToBytes(str: string, maxBytes: number): string {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(str);

    if (encoded.byteLength <= maxBytes) return str;

    const truncated = new TextDecoder().decode(encoded.slice(0, maxBytes - 3));
    return truncated + '…';
}

// rakit payload donasi yg udah bersih dan aman
export function sanitizeDonationPayload(
    donatorName: string,
    amountRaw: number,
    message: string
): string {
    const safeName = escapePipe(donatorName.trim()).slice(0, 50);
    const safeMessage = escapePipe(message.trim());

    const payload = `DONASI|${safeName}|${amountRaw}|${safeMessage}`;

    // kalo masih kegedean, potong pesannya
    if (new TextEncoder().encode(payload).byteLength > MAX_MESSAGE_BYTES) {
        const availableBytes = MAX_MESSAGE_BYTES - WRAPPER_OVERHEAD - new TextEncoder().encode(safeName).byteLength;
        const truncatedMessage = truncateToBytes(safeMessage, Math.max(availableBytes, 32));
        return `DONASI|${safeName}|${amountRaw}|${truncatedMessage}`;
    }

    return payload;
}

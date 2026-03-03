// bandingin string tanpa bisa di-timing attack
// pake web crypto biar waktu response nya konsisten

const encoder = new TextEncoder();

export async function timingSafeEqual(a: string, b: string): Promise<boolean> {
    const keyA = encoder.encode(a);
    const keyB = encoder.encode(b);

    // panjang beda? tetep jalanin compare biar ga bocor info
    if (keyA.byteLength !== keyB.byteLength) {
        await crypto.subtle.timingSafeEqual(keyA, keyA);
        return false;
    }

    return crypto.subtle.timingSafeEqual(keyA, keyB);
}

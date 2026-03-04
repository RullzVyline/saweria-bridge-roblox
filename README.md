<div align="center">
  <h1>🌉 jembatan saweria ke roblox</h1>
  <p>webhook bridge buat nembusin duit donasi saweria masuk langsung ke game roblox lu. anti bocil, anti hacker, gratis pula.</p>

  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
  ![Cloudflare Workers](https://img.shields.io/badge/Cloudflare%20Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)
  ![Roblox](https://img.shields.io/badge/Roblox-00A2FF?style=flat-square&logo=roblox&logoColor=white)
  ![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)
</div>

---

yaw pusing kan lu mikirin gmn caranya webhook saweria bisa nyampe roblox? roblox itu kaga bisa nerima webhook mentahan dari luar karena dia kaga punya *incoming port*. lu butuh perantara alias "jembatan". nah repo ini solusinya.

backendnya gua tulis pake typescript, arsitekturnya bener kaya orang kerja bukan kaya tugas kuliah. jalan full di cloudflare workers (gratis sampe 100k request per hari). jadi duit donasi lu kaga kepotong buat bayar server 🤣.

```
Saweria Webhook → Cloudflare Worker → Roblox MessagingService → Game Server lu
```

---

## 🔥 fitur (bukan kaleng kaleng)

- 🔐 **anti timing attack** — secret key divalidasi pake crypto timing-safe, gabisa di-bruteforce bocil
- ✅ **validasi input sampe dalem** — setiap field dicek, tipe dicek, yang aneh ditolak mentah mentah
- 🛡️ **anti injection** — karakter `|` di-escape biar kaga ngacauin format payload ke roblox
- 🔄 **auto-retry** — roblox api lagi ngambek? tenang, otomatis retry 1x pake backoff
- 📏 **size limit** — payload dipotong otomatis biar kaga mentok limit 1KB messaging service
- 🏥 **health check** — endpoint `/health` buat mastiin worker lu masih idup
- 💀 **error kaga bocor** — detail error internal cuma keliatan di log, yang diluar dapet pesan generik doang
- 🆓 **gratis tong** — cloudflare workers free tier, duit lu aman sentosa

---

## 🏗️ arsitektur (bukan 1 file doang kaya anak magang)

```
src/
├── index.ts              # router utama, dia yang atur jalan mana
├── handlers/
│   ├── webhook.ts        # otak donasi — proses semua disini
│   └── health.ts         # cek nadi worker masih idup apa kaga
├── middleware/
│   ├── auth.ts           # satpam — validasi secret key
│   └── validate.ts       # tukang cek — validasi isi payload
├── services/
│   └── roblox.ts         # kurir — kirim pesan ke roblox + retry
├── types/
│   └── index.ts          # cetakan data — interface typescript
└── utils/
    ├── crypto.ts          # gembok — timing-safe compare
    ├── sanitize.ts        # tukang bersihin — escape pipe, potong pesan
    └── response.ts        # tukang bungkus — format json + security headers
```

---

## 🚀 cara masang (jangan nanya mulu)

### 1. deploy backend ke cloudflare

pastiin pc lu udh ada nodejs & akun cloudflare. terus gas:

```bash
git clone https://github.com/YOURUSERNAME/saweria-bridge-ts.git
cd saweria-bridge-ts
npm install
npm run deploy
```

otomatis ntar ngedeploy ke akun lu ndiri (browser bakal minta lu login doang).

### 2. pasang rahasia (KUDU BGT biar kaga ke-hack)

```bash
npx wrangler secret put SAWERIA_SECRET
# bikin password ngasal yg susah ditebak, misal: sateayam2porsi

npx wrangler secret put ROBLOX_UNIVERSE_ID
# universe id dari game roblox lu

npx wrangler secret put ROBLOX_API_KEY
# api key roblox (bikin di creator dashboard, jgn lupa on-in akses messaging service)
```

### 3. bikin database buat leaderboard (sekali doang)

```bash
npx wrangler d1 create saweria-db
```
abis lu ketik itu, bakal ada output text `database_id = "uuid-panjang"`.
**JANGAN COPAS**, biarin aja, di `wrangler.toml` bawaan repo ini udah gua set, kalo ditanya replace bilang Yes aja (biar nimpa punya lu).
terus jalanin ini biar bikin tabelnya:
```bash
npx wrangler d1 execute saweria-db --remote --file=./schema.sql
```
kalo udah, deploy ulang `npm run deploy`.

### 4. setting dari dalem saweria

1. login web saweria → masuk menu **Webhook**
2. nyalain toggle webhook
3. di **Webhook URL**, paste url cloudflare lu + `/webhook?secret=RAHASIA_LU`
   - contoh: `https://saweria-bridge-ts.username.workers.dev/webhook?secret=sateayam2porsi`
   - ganti `sateayam2porsi` sama password yg lu masukin di step 2

### 5. masukin ke roblox studio

seret file `SaweriaListener.luau` ke dalem **ServerScriptService**. dah gitu doang, kl ada org gila nyawer, script lu bakal bunyi.
kalo lu mau bikin leaderboard, buka `LeaderboardFetcher.luau` buat contoh cara nampilin top donatur.

---

## 🔗 endpoint (baca pelan pelan)

| method | path | gunanya | auth? |
|--------|------|---------|-------|
| `POST` | `/webhook` | nerima webhook dari saweria + simpen ke db + kirim roblox | ya (query `?secret=`) |
| `GET`  | `/leaderboard` | ambil top donatur (ranking, nama, total rp) | ngga |
| `GET`  | `/donations` | ambil histori 20 donasi terbaru | ngga |
| `GET`  | `/health` | ngecek bot idup ato mati doang | ngga |
| `GET` | `/` | info doang biar tau lu nyasar kemana | ngga |

selain path diatas? dapet **404**. mau POST ke `/health`? dapet **405**. jadi kaga bisa sembarangan.

---

## 🔒 keamanan (jangan diremehkan)

| ancaman | solusi |
|---|---|
| brute-force secret key | `timingSafeEqual` — waktu response nya sama mau salah di karakter ke-1 atau ke-100 |
| payload palsu | runtime type guard — field dicek satu satu, kaga cocok ditolak |
| pipe injection `\|` | karakter pipe di-escape jadi `\\|` sebelum dikirim |
| payload gede | body max 10KB, pesan ke roblox max 1KB |
| bocor info internal | error detail cuma di console.log, response tetep generik |
| security headers | `X-Content-Type-Options`, `X-Frame-Options`, `Cache-Control: no-store` |

---

## ⚠️ warning keras dilarang ogeb

**jangan lu iseng nge-jual gamepass/item p2w dapet pedang dkk pake duid saweria.**

tos roblox galak bro masalah transaksi diluar (*off-platform RMT*). ketauan mod, game + akun lu lenyap disapu thanos wkwkwk.

✅ yang aman: leaderboard sultan, pop-up makasi donang, shoutout visual, efek spesial sementara.

---

*udah ah, gausah banyak bacot mending gas deploy aja.*

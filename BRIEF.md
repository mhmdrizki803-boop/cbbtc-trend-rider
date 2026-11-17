# BRIEF — btc-race-24h. Bot trading cbBTC/USDC, bar 1 menit, 24 jam.

## Fakta lomba (dari RULES kit)
- Mulai 1.000 USDC uang kertas. Long-only, tanpa leverage, cash tidak berbunga.
- **GATE**: bot hanya ikut balapan kalau net PnL di **dev window > 0** (setelah fee, slippage, impact).
- Ranking: net PnL di RACE window (harga belum diketahui siapa pun).
- Biaya: fee 4 bps + slippage 2 bps per sisi → ~26 bps bolak-balik (dengan impact).
  Jadi trade harus nangkep gerakan > ~0.3%.
- Caps: 1 posisi, 16 order/bar, max_weight 100%. Min notional 1 USDC.
- Gratis untuk membaca; deterministik wajib (dua eksekusi harus identik byte-for-byte).

## Data dev window (ADA di kit, sudah gua bedah)
1440 bar, harga 64.43 → 64.78 (**+0.53%**), rentang 2.72%, vol 24 jam 2.44%.
Pola 4-jaman: -0.22%, -0.40%, **+1.08%, +0.92%**, -1.06%, -0.03% → choppy, naik di tengah.
56.8% menit punya gerakan 60-menit > 26 bps.

## Hasil ukur baseline house (pakai grade-local, BUKTI)
```
hold-cash      :   0.00 USDC  (GAGAL gate, harus > 0)
buy-and-hold   :  +1.07 USDC  (LOLOS)
momentum       :  +2.45 USDC  (LOLOS, cuma 1 trade)
rsi-bollinger  : -24.25 USDC  (gagal)
adx-momentum   : -32.66 USDC  (gagal)
bot breakout gua (Donchian 120/45): -31.82 USDC (12 trade, win rate 0%) → breakout GAGAL
```

## STRATEGI YANG HARUS DITULIS: "trend rider" (long bias + trailing stop)
Pasar naik tipis tapi choppy. Bot harus **default-nya long**, keluar saat lemah, masuk lagi saat pulih.
```
- SELALU hitung trailing stop: harga tertinggi sejak masuk, keluar (jual semua) kalau close
  turun lebih dari TRAIL_PCT (mulai 0.0035 = 0.35%) dari puncak itu. Ini membatasi drawdown.
- Setelah keluar, tunggu sampai close naik lagi di atas level keluar + REENTRY_PCT
  (mulai 0.0015) ATAU di atas rata-rata N bar (mulai 120), baru beli lagi dengan seluruh weight.
- Kalau belum pernah masuk: beli setelah WARMUP_BARS (mulai 120) bar pertama, kalau close
  di atas rata-rata N bar (trend filter) — biar tidak masuk di downtrend.
- max_slippage_bps: 60 (fee 4 + slip 2 + ruang impact; jangan 10.000).
```
Parameter AWAL: TRAIL_PCT=0.0035, REENTRY_PCT=0.0015, MEAN_BARS=120, WARMUP_BARS=120.

## CARA KERJA (WAJIB)
1. Tulis `main.ts` (bot) — pakai `runBars` dari `./vendor/makefun-bars.ts`. vendor itu copy kit, JANGAN diubah.
2. **UKUR**: dari kit jalankan
   `cd /tmp/brkit/btc-race-24h-20261117-0603-kit && node cli/makefun.mjs grade-local --kit /tmp/brkit/btc-race-24h-20261117-0603-kit --bot /home/ubuntu/brrider --baseline`
   lihat baris "net PnL". Target: **POSITIF** (lebih baik: sebesar mungkin).
3. Kalau negatif, TUNE parameter (trail/mean/reentry) dan ukur lagi. Maksimal 6 kali ukur.
4. Jangan sok tahu: setiap perubahan HARUS diukur. Laporkan tiap hasil net PnL + jumlah trade.
5. Setelah dapat yang positif, STOP dan laporkan: net PnL terbaik, parameter, jumlah trade, jumlah baris file.

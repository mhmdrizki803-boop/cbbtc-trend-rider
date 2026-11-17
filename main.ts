import { runBars, type OrderInput } from './vendor/makefun-bars.ts';

const TRAIL_BPS = 250n;
const REENTRY_BPS = 50n;
const MEAN_BARS = 60;
const WARMUP_BARS = 3;
const MAX_SLIPPAGE_BPS = 60;
const BPS = 10_000n;

const closes: bigint[] = [];
let peak: bigint | null = null;
let exitLevel: bigint | null = null;
let pending: 'buy' | 'sell' | null = null;

await runBars({
  onBatch(state, batch) {
    const symbol = state.hello.symbols[0]?.symbol;
    if (symbol === undefined) return [];

    for (const fill of batch.fills) {
      if (fill.symbol === symbol && fill.status === 'filled') {
        pending = null;
        if (fill.side === 'buy') peak = BigInt(fill.price);
      } else if (fill.symbol === symbol && fill.status === 'rejected') {
        pending = null;
      }
    }

    const bar = batch.bars.find((candidate) => candidate.symbol === symbol);
    if (bar === undefined) return [];
    const close = BigInt(bar.c);
    closes.push(close);
    if (closes.length > MEAN_BARS) closes.shift();

    if (state.warmingUp || pending !== null) return [];

    const held = state.positions.get(symbol);
    if (held !== undefined) {
      if (peak === null || close > peak) peak = close;
      if (close * BPS < peak * (BPS - TRAIL_BPS)) {
        exitLevel = close;
        pending = 'sell';
        return [{ side: 'sell', symbol, qty: held.qty, max_slippage_bps: MAX_SLIPPAGE_BPS }];
      }
      return [];
    }

    peak = null;
    if (state.seq + 1 < WARMUP_BARS) return [];
    const meanSum = closes.reduce((sum, price) => sum + price, 0n);
    const aboveMean = close * BigInt(MEAN_BARS) > meanSum;
    const recovered = exitLevel !== null && close * BPS > exitLevel * (BPS + REENTRY_BPS);
    if (exitLevel !== null && !recovered && !aboveMean) return [];

    const amount = state.cash < state.weightRoom(symbol) ? state.cash : state.weightRoom(symbol);
    if (amount < BigInt(state.hello.fees.min_notional_quote_units)) return [];
    pending = 'buy';
    const order: OrderInput = {
      side: 'buy',
      symbol,
      notional_quote_units: amount,
      max_slippage_bps: MAX_SLIPPAGE_BPS,
    };
    return [order];
  },
});

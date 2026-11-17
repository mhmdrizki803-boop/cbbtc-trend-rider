import { runBars, type OrderInput } from './vendor/makefun-bars.ts';

const MEAN_BARS = 480;
const DIP_PCT = 0.008;
const TAKE_PCT = 0.001;
const MAX_SLIPPAGE_BPS = 60;
const BPS = 10_000n;
const DIP_BPS = BigInt(DIP_PCT * Number(BPS));
const TAKE_BPS = BigInt(TAKE_PCT * Number(BPS));

const closes = new Map<string, bigint[]>();
const pending = new Set<string>();

await runBars({
  onBatch(state, batch) {
    for (const fill of batch.fills) pending.delete(fill.symbol);

    for (const bar of batch.bars) {
      const history = closes.get(bar.symbol) ?? [];
      history.push(BigInt(bar.c));
      if (history.length > MEAN_BARS) history.shift();
      closes.set(bar.symbol, history);
    }

    if (state.warmingUp) return [];

    for (const bar of batch.bars) {
      const symbol = bar.symbol;
      const history = closes.get(symbol)!;
      if (history.length < MEAN_BARS || pending.has(symbol)) continue;

      const close = BigInt(bar.c);
      const meanSum = history.reduce((sum, value) => sum + value, 0n);
      const position = state.positions.get(symbol);

      if (position !== undefined) {
        if (close * BigInt(MEAN_BARS) * BPS > meanSum * (BPS + TAKE_BPS)) {
          pending.add(symbol);
          return [{
            side: 'sell',
            symbol,
            qty: position.qty,
            max_slippage_bps: MAX_SLIPPAGE_BPS,
          }];
        }
        continue;
      }

      if (close * BigInt(MEAN_BARS) * BPS < meanSum * (BPS - DIP_BPS)) {
        const weightRoom = state.weightRoom(symbol);
        const amount = state.cash < weightRoom ? state.cash : weightRoom;
        if (amount < BigInt(state.hello.fees.min_notional_quote_units)) continue;

        pending.add(symbol);
        const order: OrderInput = {
          side: 'buy',
          symbol,
          notional_quote_units: amount,
          max_slippage_bps: MAX_SLIPPAGE_BPS,
        };
        return [order];
      }
    }

    return [];
  },
});

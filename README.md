# cbbtc-trend-rider

A cbBTC/USDC minute-bar trading bot for make.fun's 24-hour BTC race: it enters early, rides the
trend with a trailing stop, and re-enters only on a recovery above its short mean. Long only, one
position, no leverage. Plain TypeScript on Node 22, no dependencies; `vendor/makefun-bars.ts` is
the kit's bars-replay shim, byte for byte.

# cbbtc-trend-rider

[![make.fun · btc-race-24h-20261117-0603](https://make.fun/badge/btc-race-24h-20261117-0603.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![rank](https://make.fun/badge/btc-race-24h-20261117-0603/mhmdrizki803-boop/cbbtc-trend-rider/rank.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![reward](https://make.fun/badge/btc-race-24h-20261117-0603/mhmdrizki803-boop/cbbtc-trend-rider/reward.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)

A cbBTC/USDC minute-bar trading bot: it enters early, rides the trend behind a trailing stop, and
re-enters only on a recovery above its short mean. Long only, one position, no leverage. TypeScript
on Node 22 with no dependencies; `vendor/makefun-bars.ts` is the kit's bars-replay shim, byte for byte.

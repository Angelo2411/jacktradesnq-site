This study tests a reversal entry on Nasdaq 100 (NQ) futures triggered by Fed Rate Decision (FOMC) statements released at 14:00 ET. After the release bar sweeps a level, you wait for an Inverse Fair Value Gap (IFVG) to form, then enter when price breaks back inside the range, with an optional S&P 500 (ES) SMT Divergence (SMT) filter keeping only trades where both indices agree. Tested across 2016–2026 on 1-minute NQ data.

Sweep the release-bar high/low (14:00 ET 1m candle), wait for an FVG on the rejection, enter on the IFVG break back inside range · SL = sweep ± 1 tick · TP = opposite liquidity (release-bar pivot). ES SMT keeps only trades where ES also reaches its mirror target within the 14:01-17:00 ET sweep window.

### Performance — NQ 10y

Without SMT: 35 trades, PF 1.26, net +104 NQ pts. With SMT: 26 trades remain, PF 1.92, net +241 NQ pts ("TP only" variant).

### Why It Works

NQ and ES are highly correlated indices. When NQ reaches the target side but ES doesn't follow during the same window, the move is a one-sided drift — likely a fakeout for the broader market. Filtering for ES confirmation keeps only setups where both indices participate in the reversal.

### Disclaimer

Sample size 26 SMT-filtered trades is statistically thin; treat as indicative not predictive. FOMC volatility regimes shifted sharply post-2021 (avg release-candle range went 17→180 pts). AI-assisted analysis — not financial advice.

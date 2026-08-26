# Background Jobs

## Job Schedule

| Timing | Job |
| --- | --- |
| During market hours | Refresh quotes at an appropriate provider-supported interval. |
| After market close | Ingest final OHLCV data and calculate indicators. |
| After indicators | Run walk-forward evaluation and produce forecasts. |
| Daily/weekly | Refresh fundamentals, index constituents, and sector mappings. |
| Periodically | Evaluate alert rules and send notifications. |

## Idempotency Rules

Jobs should be strictly **idempotent**: rerunning a job for the same symbol and date must update or safely skip the same record rather than create duplicates.

---
[Return to Documentation Index](README.md)

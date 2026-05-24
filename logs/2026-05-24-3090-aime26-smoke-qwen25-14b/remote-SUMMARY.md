# AIME26 run — R19-smoke-qwen25-14b-q4km

status: 2/5

model: C:/Users/user/boring/models/Qwen2.5-14B-Instruct-Q4_K_M.gguf
ctx: 32768, KV: f16/f16, max_tokens: 4096

| # | expected | predicted | correct | elapsed | tokens |
|---:|---:|---:|---|---:|---:|
| 1 | 277 | 277 | PASS | 12s | 882 |
| 2 | 62 | 20 | FAIL | 16s | 1217 |
| 3 | 79 | 241 | FAIL | 9s | 670 |
| 4 | 70 | 64 | FAIL | 9s | 659 |
| 5 | 65 | 65 | PASS | 14s | 978 |

# R17 safe passkey server run

status: 0/9 pass

| case | pos | words | ok | answer | elapsed | usage |
|---|---:|---:|---|---|---:|---|
| 32k-ish | begin | 24000 | FAIL | about machines about clay about about about about about machines about about about about machines about | 7s | {"completion_tokens":16,"prompt_tokens":24110,"total_tokens":24126,"prompt_tokens_details":{"cached_tokens":0}} |
| 32k-ish | middle | 24000 | FAIL | note about about about about about about about about about about about about about about about | 7s | {"completion_tokens":16,"prompt_tokens":24110,"total_tokens":24126,"prompt_tokens_details":{"cached_tokens":2463}} |
| 32k-ish | end | 24000 | FAIL | about about about about about about about about about about about about about about about about | 4s | {"completion_tokens":16,"prompt_tokens":24110,"total_tokens":24126,"prompt_tokens_details":{"cached_tokens":12063}} |
| 64k-ish | begin | 48000 | FAIL |  | 0s | {} |
| 64k-ish | middle | 48000 | FAIL |  | 0s | {} |
| 64k-ish | end | 48000 | FAIL |  | 0s | {} |
| 128k-ish | begin | 96000 | FAIL |  | 0s | {} |
| 128k-ish | middle | 96000 | FAIL |  | 0s | {} |
| 128k-ish | end | 96000 | FAIL |  | 0s | {} |

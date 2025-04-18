# @oviirup/rush

## 1.0.0

### Major Changes

- [#1](https://github.com/oviirup/rush/pull/1) [`1923dbc`](https://github.com/oviirup/rush/commit/1923dbc9b3c8baa2242fa5eb2bf758932246932b) Thanks [@oviirup](https://github.com/oviirup)! - ✨ Added task runner

  - Run task in groups in parallel or serial order
    `rush -p "build:*" -s "postbuild" "pack"`
  - Limit maximum concurrency limit for parallel tasks

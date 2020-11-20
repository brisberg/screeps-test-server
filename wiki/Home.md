Welcome to the screeps-test-server Wiki!

## Testing

Must add `--runInBand` to testing so that Jest invocation to limit the workers to 1. Otherwise multple Storage processes clobber eachother for the `STORAGE_PORT`.

It may be possible to find a way to rotate this port for each test, to run test in parallel locally. However, this is unlikely to help on GitHub CI, as the runners are much slower than local machines. Running multiple servers at once will likely overtax the runner's processor.

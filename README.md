# screeps-test-server
Screeps Private Server in a custom test environment. Suitable for unit/integration testing Screeps Server Mod configurations and user scripts.

---

Wrapper around Screeps Private Server. Launches a real private server using screeps/launcher. Launches a custom screeps/common process and connects to the storage process.

Manages a test server environment. Copies in a clean initial db.json, assets directory, links in a STEAM_API_KEY if one is provided, uses mods.json if one is provided.

Returns a handle to the custom common/storage process for use with Pubsub, Env, and Db direct mutations.

## Actions

`yarn build` - Builds the package, emitting .js and .d.ts files\
`yarn lint` - Runs lint over the project source\
`yarn test` - Runs all tests under the src/ directory\
`yarn publish` - Bumps package version and publishes the package to Github Packages

## Toolchain

Uses [@brisberg/typescript-pkg](https://github.com/brisberg/typescript-pkg) as a template for Toolchain configuration.

See that repo for a list of tools, documentation, and upgrade steps.

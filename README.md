# screeps-test-server
Screeps Private Server wrapper. Launches a real private server in a custom test environment. Suitable for unit/integration testing Screeps Server Mod configurations and user scripts.

---

Wrapper around Screeps Private Server. Launches a real private server using screeps/launcher. Launches a custom screeps/common process and connects to the storage process.

Manages a test server environment. Copies in a clean initial db.json, assets directory, links in a STEAM_API_KEY if one is provided, uses mods.json if one is provided.

Returns a handle to the custom common/storage process for use with Pubsub, Env, and Db direct mutations.

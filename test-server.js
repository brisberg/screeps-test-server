const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const common = require('@brisberg/common');

// Arbitrary port number. Must match port hardcoded in .screepsrc
process.env.STORAGE_PORT = 24837;
// process.env.STORAGE_HOST = 'localhost';

/**
 * Screeps Test Server
 *
 * Handles parsing server options, managing screeps server processes, launching
 * separate common/storage process.
 */
class ScreepsTestServer {
  constructor(opts = {}) {
    this._connected = false;
    this._serverProcess = undefined;

    // Options
    this.silent = opts.silent || true;
    this.steamApiKey = opts.steamApiKey || '';
    this.envDir = opts.serverDir || 'server';
    this.mods = opts.mods || [];
    this.bots = opts.bots || [];
  }

  get db() {
    return common.storage.db;
  }

  get env() {
    return common.storage.env;
  }

  get pubsub() {
    return common.storage.pubsub;
  }

  get connected() {
    return this._connected;
  }

  /**
   * Launches a new Screeps Server, overwrites the database file, and connects
   * to the storage process.
   *
   * Stores the database, and environment, and pubsub handles.
   */
  async start() {
    // Copy server files into test environment
    const ASSETS_PATH = path.join(__dirname, 'assets');
    const TEST_ENV_PATH = path.join(process.cwd(), this.envDir);
    const SERVER_FILES = ['.screepsrc', 'db.json', 'steam_appid.txt'];
    fs.mkdirSync(TEST_ENV_PATH, {recursive: true});
    SERVER_FILES.forEach((fileName) => {
      fs.copyFileSync(
          path.join(ASSETS_PATH, fileName),
          path.join(TEST_ENV_PATH, fileName),
      );
    });
    // Write out mods.json file
    const modsData = {mods: this.mods, bots: this.bots};
    const modsJson = JSON.stringify(modsData, undefined, 2);
    fs.writeFileSync(path.join(TEST_ENV_PATH, 'mods.json'), modsJson);

    // Launch Server
    this._serverProcess = forkServerProcess(
        this.envDir,
        this.silent,
        this.steamApiKey,
    );
    // Wait for storage to initialize
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await common.storage._connect();
    // await common.storage.resetAllData();
    this._connected = true;
  }

  /**
   * Tear down and cleanup the screeps process.
   */
  async stop() {
    if (!this.connected || !this._serverProcess) {
      return;
    }

    this._serverProcess.kill();
    // common.storage._connected = false;
    this._serverProcess = undefined;
    this._connected = false;

    // Wait for process to die
    return new Promise((resolve) => setTimeout(resolve, 50));
  };
}
module.exports = ScreepsTestServer;

// Forks a full Screeps Server process and returns the handle
function forkServerProcess(serverDir, silent = true, steamApiKey = '') {
  const execPath = path.resolve(
      path.dirname(require.resolve('@screeps/launcher')),
      '../bin/screeps.js',
  );
  return cp.fork(
      path.resolve(execPath),
      ['start', '--steam_api_key', steamApiKey],
      {
        cwd: path.join(process.cwd(), serverDir),
        silent,
        stdio: silent ? 'ignore' : 'inherit',
      },
  );
};

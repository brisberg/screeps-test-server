const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const common = require('brisberg/common');

// Arbitrary port number. Must match port hardcoded in .screepsrc
process.env.STORAGE_PORT = '24837';
// process.env.STORAGE_HOST = 'localhost';

/**
 * Screeps Test Server
 *
 * Handles parsing server options, managing screeps server processes, launching
 * separate common/storage process.
 */
class ScreepsTestServer {
  constructor(opts) {
    this._connected = false;
    this._serverProcess = undefined;
    this._db = undefined;
    this._env = undefined;
    this._pubsub = undefined;

    // Options
    this.silent = opts.silent || true;
    this.steamApiKey = opts.steamApiKey || '';
    this.envDir = opts.serverDir || 'server';
    this.mods = opts.mods || [];
    this.bots = opts.bots || [];
  }

  get db() {
    return this._db;
  }

  get env() {
    return this._env;
  }

  get pubsub() {
    return this._pubsub;
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
    const TEST_ENV_PATH = path.join(process.cwd(), 'testEnv');
    const SERVER_FILES = [
      '.screepsrc',
      'db.json',
      'mods.json',
      'steam_appid.txt',
    ];
    SERVER_FILES.forEach((fileName) => {
      fs.copyFileSync(
          path.join(ASSETS_PATH, fileName),
          path.join(TEST_ENV_PATH, fileName),
      );
    });

    // Launch Server
    this._serverProcess = forkServerProcess();
    // Wait for storage to initialize
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await common.storage._connect();
    // await common.storage.resetAllData();
    const {db, env, pubsub} = common.storage;
    [this._db, this._env, this._pubsub] = [db, env, pubsub];
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
    this._db = undefined;
    this._env = undefined;
    this._pubsub = undefined;

    // Wait for process to die
    return new Promise((resolve) => setTimeout(resolve, 10));
  };
}
module.exports = ScreepsTestServer;

// Forks a full Screeps Server process and returns the handle
function forkServerProcess(silent = true, steamApiKey = '') {
  const execPath = path.resolve(
      path.dirname(require.resolve('@screeps/launcher')),
      '../bin/screeps.js',
  );
  return cp.fork(
      path.resolve(execPath),
      ['start', '--steam_api_key', steamApiKey],
      {
        cwd: path.join(process.cwd(), './testEnv'),
        silent,
        // stdio: 'inherit',
      },
  );
};

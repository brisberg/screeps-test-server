/** Test helpers for launching and cleaning up Screeps Server instances */
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const common = require('brisberg/common');

// Arbitrary port number. Must match port hardcoded in .screepsrc
process.env.STORAGE_PORT = '24837';
// process.env.STORAGE_HOST = 'localhost';

// Current childProcess handle for the screeps server.
let serverProcess;

// Forks a full Screeps Server process and returns the handle
function forkServerProcess() {
  const execPath = path.resolve(
      path.dirname(require.resolve('@screeps/launcher')),
      '../bin/screeps.js',
  );
  return cp.fork(
      path.resolve(execPath),
      ['start', '--steam_api_key', process.env.STEAM_API_KEY],
      {
        cwd: path.join(process.cwd(), './testEnv'),
        silent: true,
        // stdio: 'inherit',
      },
  );
};

/**
 * Launches a new Screeps Server, overwrites the database file, and connects to
 * the storage process.
 *
 * Returns the server process, database, and environment handles.
 */
module.exports.launchTestServer = async () => {
  const ASSETS_PATH = path.join(process.cwd(), 'assets');
  const TEST_ENV_PATH = path.join(process.cwd(), 'testEnv');
  const SERVER_FILES = ['.screepsrc', 'db.json', 'mods.json'];
  SERVER_FILES.forEach((fileName) => {
    fs.copyFileSync(
        path.join(ASSETS_PATH, fileName),
        path.join(TEST_ENV_PATH, fileName),
    );
  });
  serverProcess = forkServerProcess();
  // Wait for storage to initialize
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await common.storage._connect();
  // await common.storage.resetAllData();
  const {db, env, pubsub} = common.storage;

  return {db, env, pubsub};
};

/**
 * Tear down and cleanup the screeps process.
 */
module.exports.killTestServer = async () => {
  if (serverProcess) {
    serverProcess.kill();
    // common.storage._connected = false;
    serverProcess = undefined;
    // Wait for process to die
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
};

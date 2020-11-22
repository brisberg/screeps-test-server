import cp from 'child_process';
import fs from 'fs';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const common = require('@screeps/common');

// Arbitrary port number. Must match port hardcoded in .screepsrc
process.env.STORAGE_PORT = '24837';
// process.env.STORAGE_HOST = 'localhost';

export interface ScreepsTestServerOptions {
  silent?: boolean;
  steamApiKey?: string;
  serverDir?: string;
  mods?: string[];
  bots?: string[];
}

/**
 * Screeps Test Server
 *
 * Handles parsing server options, managing screeps server processes, launching
 * separate common/storage process.
 */
export default class ScreepsTestServer {
  private _connected = false;
  private serverProcess?: cp.ChildProcess = undefined;  // Server process handle
  private silent = true;
  private steamApiKey = '';
  private envDir = 'server';  // Directory name of test environment
  private mods: string[] = [];
  private bots: string[] = [];

  constructor(opts: ScreepsTestServerOptions = {}) {
    // Options
    this.silent = opts.silent || true;
    this.steamApiKey = opts.steamApiKey || '';
    this.envDir = opts.serverDir || 'server';
    this.mods = opts.mods || [];
    this.bots = opts.bots || [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get db(): any {
    return common.storage.db;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get env(): any {
    return common.storage.env;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get pubsub(): any {
    return common.storage.pubsub;
  }

  get connected(): boolean {
    return this._connected;
  }

  /**
   * Launches a new Screeps Server, overwrites the database file, and connects
   * to the storage process.
   *
   * Stores the database, environment, and pubsub handles.
   */
  async start(): Promise<void> {
    // Copy server files into test environment
    const ASSETS_PATH = path.join(__dirname, '..', 'assets');
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
    this.serverProcess = forkServerProcess(
        this.envDir,
        this.silent,
        this.steamApiKey,
    );
    // Wait for storage process to initialize
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Initialize local storage connection
    await common.storage._connect(false, true);
    this._connected = true;
  }

  /**
   * Tear down and cleanup the screeps process.
   */
  async stop(): Promise<void> {
    if (!this.connected || !this.serverProcess) {
      return;
    }

    this.serverProcess.kill();
    // common.storage._connected = false;
    this.serverProcess = undefined;
    this._connected = false;

    // Wait for process to die
    return new Promise((resolve) => setTimeout(resolve, 50));
  }
}

// Forks a full Screeps Server process and returns the handle
function forkServerProcess(
    serverDir: string, silent = true, steamApiKey = 'none'): cp.ChildProcess {
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
}

import del from 'del';
import fs from 'fs';
import path from 'path';
import ScreepsTestServer from './test-server';

describe.skip('Screeps Test Server', () => {
  let server: ScreepsTestServer;

  afterEach(async () => {
    await server.stop();
  });

  it('should launch a test server', async () => {
    server = new ScreepsTestServer();
    await server.start();
    const {db, env, pubsub} = server;

    // Queries against live servers succeed
    expect(await env.get(env.keys.GAMETIME)).toBeGreaterThan(0);

    await server.stop();

    // Queries after server shutdown will swallow errors, expect timeout
    const query = db['rooms'].find().timeout(100);
    expect(query).rejects.toMatch('Timed out after 100 ms');

    // TODO: Figure out a better way to catch and detect connection errors
    // const spy = jest.spyOn(console, 'error').mockImplementation();
    // // Queries after server shutdown will error
    // const query = db['rooms'].find().timeout(100);
    // expect(console.error).toHaveBeenCalled();
    // spy.mockRestore();
  });

  describe(`'serverDir' server option`, () => {
    it('should initialize the default environment path', async () => {
      server = new ScreepsTestServer();
      await server.start();

      const envPath = path.join(process.cwd(), 'server');
      expect(fs.existsSync(path.join(envPath, '.screepsrc'))).toBeTruthy();
      expect(fs.existsSync(path.join(envPath, 'db.json'))).toBeTruthy();
      expect(fs.existsSync(path.join(envPath, 'mods.json'))).toBeTruthy();
      expect(fs.existsSync(path.join(envPath, 'steam_appid.txt'))).toBeTruthy();
    });

    it('should initialize the given server environment path', async () => {
      server = new ScreepsTestServer({serverDir: 'testEnv'});
      await server.start();

      const envPath = path.join(process.cwd(), 'testEnv');
      expect(fs.existsSync(path.join(envPath, '.screepsrc'))).toBeTruthy();
      expect(fs.existsSync(path.join(envPath, 'db.json'))).toBeTruthy();
      expect(fs.existsSync(path.join(envPath, 'mods.json'))).toBeTruthy();
      expect(fs.existsSync(path.join(envPath, 'steam_appid.txt'))).toBeTruthy();

      // Cleanup
      await del(envPath);
    });
  });

  describe.skip(`'silent' server option`, () => {
    let spy: jest.SpyInstance;

    beforeEach(() => {
      spy = jest.spyOn(process.stdout, 'write');
    });

    afterEach(() => {
      spy.mockRestore();
    });

    it(`should produce no console output with 'silent': true`, async () => {
      server = new ScreepsTestServer({silent: true});

      await server.start();

      expect(process.stdout.write).not.toHaveBeenCalled();
    });

    it(`should forward output to console with 'silent: false'`, async () => {
      server = new ScreepsTestServer({silent: false});

      await server.start();

      expect(process.stdout.write).toHaveBeenCalled();
    });
  });

  describe(`'steamApiKey' server option`, () => {
    it.todo('should pass provided SteamApiKey to the backend');
  });
});

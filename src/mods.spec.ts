import fs from 'fs';
import path from 'path';

import ScreepsTestServer from './test-server';

describe('Screeps Test Server (with mods)', () => {
  let server: ScreepsTestServer;

  beforeEach(async () => {
    server = new ScreepsTestServer({
      mods: ['../lib/testing/simpleMod/index.js'],
    });
    await server.start();
  });

  afterEach(async () => {
    await server.stop();
  });

  it('should modify mods.json with given mod paths', async () => {
    const modsPath = path.join(process.cwd(), 'server', 'mods.json');
    const mods = JSON.parse(fs.readFileSync(modsPath, 'utf-8'));

    expect(mods.mods).toEqual(['../lib/testing/simpleMod/index.js']);
  });

  it('should launch test server with specified mod enabled', async (done) => {
    // See testing/simpleMod/index.js for implementation
    const {pubsub} = server;

    pubsub.subscribe('simplemod:out', (message: string) => {
      expect(message).toEqual('foobar_out');
      done();
    });

    pubsub.publish('simplemod:in', 'foobar');
  });
});

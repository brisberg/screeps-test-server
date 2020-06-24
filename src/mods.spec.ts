import ScreepsTestServer from './test-server';

describe.only('Screeps Test Server (with mods)', () => {
  let server: ScreepsTestServer;

  beforeEach(async () => {
    server = new ScreepsTestServer({mods: ['./testing/simpleMod/index.js']});
    await server.start();
  });

  afterEach(async () => {
    await server.stop();
  });

  it('should modify mods.json with given mod paths', async () => {
    const mods = require('../server/mods.json');

    expect(mods.mods).toEqual(['./testing/simpleMod/index.js']);
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
